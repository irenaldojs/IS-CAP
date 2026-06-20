# Controle de Agenda e Agendamentos - Requisitos e Plano de Implementação

Este documento detalha o plano de arquitetura, banco de dados, fluxo de usuário e interface para o sistema de agendamento de aulas do **IS-CAP**, com suporte a agendamentos avulsos, semanais recorrentes (com regras de exceção por semana) e um painel de controle (dashboard) semanal interativo.

---

## 1. Visão Geral do Fluxo de Agendamento

O sistema de agenda permitirá que o professor gerencie o seu tempo e o dos seus alunos de duas formas principais:

1.  **Agendamento Avulso (Single Appointment)**:
    *   Destinado a aulas extras, reposições ou demandas pontuais.
    *   O usuário seleciona uma data e horário específicos.
    *   É cobrado um "valor avulso" definido na hora do agendamento.
    *   Gera um único registro de aula (`Lesson`) e um faturamento (`Payment`) associado.

2.  **Agendamento Semanal (Recurring Appointment)**:
    *   Destinado a contratos de aulas fixas recorrentes (fluxo principal de alunos regulares).
    *   O usuário define um horário recorrente na semana (ex: toda terça-feira às 14:00).
    *   O sistema reserva permanentemente esse espaço na agenda do aluno e do professor.
    *   **Flexibilidade por Semana**:
        *   **Cancelamento excepcional (da semana)**: O professor pode cancelar a aula de um dia específico sem afetar a recorrência geral das semanas seguintes (a aula selecionada muda de status para `CANCELADA`).
        *   **Alteração de horário excepcional (naquela semana)**: O professor pode adiar ou adiantar o horário da aula em uma semana específica (ex: mover a aula de terça para quinta apenas nesta semana), mantendo o padrão intocado para as próximas semanas.
        *   **Alteração da recorrência principal**: O professor pode editar o horário fixo global, o que atualiza as futuras aulas agendadas que ainda não foram concluídas.

---

## 2. Modelagem do Banco de Dados (Prisma Schema)

Para suportar múltiplos agendamentos recorrentes de forma flexível (um aluno pode ter mais de uma aula recorrente na semana, ex: Matemática na segunda e Física na quarta) e gerenciar as exceções semanais de forma limpa, propomos a criação de um modelo de recorrência chamado `RecurringSchedule` e a extensão do modelo `Lesson` existente.

### Proposta de Alteração no `prisma/schema.prisma`

```prisma
// Nova tabela para gerenciar os horários fixos semanais (recorrência)
model RecurringSchedule {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  user          User     @relation(fields: [userId], references: [id])
  studentId     String   @map("student_id")
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  subjectId     String   @map("subject_id")
  subject       Subject  @relation(fields: [subjectId], references: [id])
  
  dayOfWeek     Int      // 0 = Domingo, 1 = Segunda, 2 = Terça, etc.
  startTime     String   // Formato "HH:MM" (ex: "14:00")
  durationHours Float    @map("duration_hours") @default(1.5)
  value         Float    // Preço acordado para a recorrência
  modality      String   // PRESENCIAL, ONLINE
  active        Boolean  @default(true)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  lessons       Lesson[] // Relacionamento com as instâncias de aulas geradas

  @@map("recurring_schedules")
}

// Extensão do modelo Lesson para suportar o vínculo de recorrência
model Lesson {
  id                 String             @id @default(uuid())
  userId             String             @map("user_id")
  user               User               @relation(fields: [userId], references: [id])
  studentId          String             @map("student_id")
  student            Student            @relation(fields: [studentId], references: [id])
  subjectId          String             @map("subject_id")
  subject            Subject            @relation(fields: [subjectId], references: [id])
  packageId          String?            @map("package_id")
  package            Package?           @relation(fields: [packageId], references: [id])
  
  date               DateTime           // Dia específico da aula (ex: 2026-06-23)
  startTime          DateTime           @map("start_time") // Data e hora exatas de início
  durationHours      Float              @map("duration_hours")
  value              Float              // Valor cobrado por esta aula específica
  modality           String             // PRESENCIAL, ONLINE
  status             String             @default("AGENDADA") // AGENDADA, CONCLUIDA, CANCELADA
  recurrence         String?            // "AVULSA" ou "SEMANAL"
  
  // Vínculo opcional com a recorrência original (exceções semanais)
  recurringScheduleId String?           @map("recurring_schedule_id")
  recurringSchedule   RecurringSchedule? @relation(fields: [recurringScheduleId], references: [id], onDelete: SetNull)
  
  notes              String?
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")

  payment            Payment?

  @@index([date])
  @@index([status])
  @@index([recurringScheduleId])
  @@map("lessons")
}
```

> [!NOTE]
> **Compatibilidade**: Os campos de agenda fixa legados no modelo `Student` (`fixedScheduleActive`, `fixedScheduleDay`, `fixedScheduleTime`, etc.) poderão ser depreciados gradualmente e substituídos pelo modelo `RecurringSchedule`, que permite N agendas recorrentes por aluno.

---

## 3. Lógica de Negócio e Geração de Aulas

### A. Fluxo de Criação:
1.  **Criar Aula Avulsa**:
    *   Cria uma única linha no modelo `Lesson` com `recurrence: "AVULSA"`, `recurringScheduleId: null`.
    *   Cria o registro correspondente em `Payment` associado.
2.  **Criar Agendamento Semanal (Recorrência)**:
    *   Cria o registro em `RecurringSchedule`.
    *   **Pré-Geração de Aulas (Instanciação)**: Para que as aulas apareçam no calendário de forma individualizada e permitam cancelamentos/edições pontuais, o sistema executa um script gerador ao criar ou editar a recorrência.
    *   **Janela de Geração**: O sistema gera as instâncias de `Lesson` e `Payment` para as próximas **8 semanas** de forma automática.
    *   **Job Automático**: Uma rotina de segundo plano (ou trigger semanal/mensal) estende essa geração de tempos em tempos, garantindo que sempre haja aulas projetadas no calendário para as próximas semanas.

### B. Edição e Cancelamento (Regras de Exceção):
*   **Cancelar aula desta semana**:
    *   O usuário clica na aula específica do calendário e seleciona "Cancelar aula desta semana".
    *   O sistema simplesmente atualiza o `status` do registro da `Lesson` daquele dia para `CANCELADA`.
    *   O faturamento (`Payment`) associado também é cancelado ou atualizado.
    *   As outras semanas da recorrência continuam inalteradas com o status `AGENDADA`.
*   **Alterar horário desta semana**:
    *   O usuário edita o horário da `Lesson` daquele dia (ex: arrasta no calendário ou usa o formulário).
    *   O sistema atualiza a `date` e `startTime` daquele registro específico de `Lesson`.
    *   O link `recurringScheduleId` é mantido para sabermos que a aula pertence àquela recorrência, mas as coordenadas temporais mudam somente para aquela instância.
    *   As outras semanas continuam nos dias/horários padrão definidos no `RecurringSchedule`.
*   **Alterar recorrência global**:
    *   O usuário seleciona a opção "Editar Agendamento Semanal" na aula ou no perfil do aluno.
    *   Ao alterar as definições principais (ex: mudou de terça às 14:00 para quarta às 16:00), o sistema atualiza o `RecurringSchedule`.
    *   O sistema localiza todas as instâncias futuras de `Lesson` vinculadas àquela recorrência que ainda estão com status `AGENDADA` e as atualiza para o novo dia/hora. Aulas já `CONCLUIDAS` ou `CANCELADAS` no passado são preservadas por razões de integridade histórica e financeira.

---

## 4. Dashboard Semanal Interativo (Calendário)

A visualização principal da agenda passará de um calendário mensal estático com lista lateral para um **Dashboard Semanal Interativo do Calendário** de alto impacto visual e de fácil interação para o professor no dia a dia.

### Layout e Interface Visual
O painel semanal utilizará a identidade premium do aplicativo (tons escuros, azul/indigo, bordas arredondadas e efeito de glassmorphism):

*   **Grade Semanal Estilo Agenda**:
    *   **Colunas**: Representam os dias da semana (Segunda a Sábado ou Domingo a Domingo, configurável).
    *   **Linhas**: Divisões por hora em intervalos de 30 minutos ou 1 hora (ex: 07:00 às 22:00).
    *   **Indicador de Linha de Tempo Atual**: Uma linha vermelha horizontal sutil com efeito luminoso que se move em tempo real indicando a hora atual.
*   **Cards de Aulas Altamente Informativos**:
    *   As aulas são desenhadas como blocos posicionados de acordo com o horário de início e duração na grade.
    *   **Cores do Card**: O fundo sutil do bloco adota a cor da matéria (`Subject.color` com transparência/opacity de 15% para manter a elegibilidade da UI escura) com uma borda lateral grossa na cor cheia.
    *   **Status**: Badges discretas ou ícones indicam se a aula está `AGENDADA` (azul), `CONCLUIDA` (verde) ou `CANCELADA` (vermelho riscado).
    *   **Modalidade**: Um pequeno ícone de câmera (Video/Sky) para ONLINE ou pin de localização (MapPin/Amber) para PRESENCIAL.
    *   **Valor**: Exibição discreta do preço da aula no canto inferior.

### Interações Visuais (UX/UI)
1.  **Arrastar e Soltar (Drag & Drop)**:
    *   Permite mover um card de aula para outro horário ou dia da semana na mesma grade.
    *   Ao soltar o card, um modal de confirmação aparece perguntando:
        > ℹ️ *Esta aula faz parte de um agendamento semanal recorrente.*
        > *   **[Alterar Apenas Esta Semana]** - Altera o dia/horário somente da aula deste dia específico.
        > *   **[Alterar Toda a Recorrência]** - Altera o horário de todas as futuras aulas deste horário fixo.
2.  **Clique Rápido (Menu de Contexto / Popover)**:
    *   Ao dar um único clique em uma aula, abre-se um popover flutuante rápido contendo ações rápidas sem precisar abrir o formulário completo:
        *   ✅ **Concluir Aula**: Altera o status para `CONCLUIDA` instantaneamente.
        *   ❌ **Cancelar Esta Semana**: Cancela a aula selecionada mantendo a série.
        *   🕒 **Reagendar Esta Semana**: Abre um painel rápido para alterar a hora/data apenas daquela instância.
        *   ✏️ **Editar Detalhes**: Abre o modal completo para alterar observações, valores ou alunos.
3.  **Clique em Slot Vazio**:
    *   Ao clicar em qualquer espaço vazio no calendário semanal (ex: Quinta-feira às 15:00), o modal "Agendar Nova Aula" abre automaticamente preenchido com a data e horário clicados, acelerando o fluxo de trabalho do professor.
4.  **Resumo Financeiro e de Horas do Topo**:
    *   No cabeçalho do calendário semanal, exibe-se um resumo rápido da semana selecionada:
        *   **Total de Aulas Planejadas**: Ex. 15 aulas.
        *   **Receita Projetada**: Soma de todas as aulas `AGENDADA` e `CONCLUIDA`.
        *   **Horas de Aula**: Total de horas de aula reservadas na semana.

---

## 5. Mockup / Estrutura Visual do Dashboard Semanal

```
+---------------------------------------------------------------------------------------------------------+
|                                           AGENDA DE AULAS                                               |
|  [ < Anterior ]  Semana de 22 a 28 de Junho, 2026  [ Próxima > ]             [ + Agendar Aula (Avulsa/Sem) ]|
|  Filtros: [ Todos ] [ Online ] [ Presencial ]   |   Resumo: 12 Aulas (18h) • R$ 960,00 Projetados       |
+---------------------------------------------------------------------------------------------------------+
| HORA  | SEG (22)       | TER (23)       | QUA (24)       | QUI (25)       | SEX (26)       | SÁB (27)       |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| 08:00 |                |                |                |                |                |                |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| 09:00 | [Matemática]   |                | [Matemática]   |                |                |                |
|       | Aluno: João    |                | Aluno: João    |                |                |                |
|       | 09:00 - 10:30  |                | 09:00 - 10:30  |                |                |                |
|       | (Semanal)      |                | (Semanal)      |                |                |                |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| 10:00 |                |                |                |                |                |                |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| 11:00 |                | [Física]       |                |                | [Física]       |                |
|       |                | Aluna: Maria   |                |                | Aluna: Maria   |                |
|       |                | 11:00 - 12:30  |                |                | (CANCELADA)    |                |
|       |                | (Exceção-Muda) |                |                | (Semanal)      |                |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| 12:00 |                |                |                |                |                |                |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| ...   |                |                |                |                |                |                |
+-------+----------------+----------------+----------------+----------------+----------------+----------------+
| 15:00 |                |                |                | [História]     |                |                |
|       |                |                |                | Aluna: Ana     |                |                |
|       |                |                |                | 15:00 - 16:30  |                |                |
|       |                |                |                | (Avulso)       |                |                |
+---------------------------------------------------------------------------------------------------------+
```

---

## 6. Passos para Implementação Técnica

### Fase 1: Atualização da Modelagem de Dados
1.  Criar a tabela `RecurringSchedule` no Prisma Schema.
2.  Relacionar `Lesson` com `RecurringSchedule` por meio de `recurringScheduleId`.
3.  Executar `prisma migrate dev` para atualizar a estrutura na base PostgreSQL.

### Fase 2: Desenvolvimento das Server Actions (Lógica de Negócio)
1.  Desenvolver as ações de criação e atualização de recorrência (`createRecurringSchedule`, `updateRecurringSchedule`).
2.  Criar rotina para instanciar/gerar aulas futuras com base na recorrência (para preencher o banco de dados).
3.  Adaptar o formulário existente de cadastro de aula para incluir a opção "Recorrência" (Avulso vs Semanal).
4.  Garantir que ao criar/editar uma aula individual vinculada a uma recorrência, seja possível alterar apenas aquela aula (`date`, `startTime`, `status`) ou toda a série.

### Fase 3: Construção do Dashboard Semanal (UI/UX)
1.  Criar o componente de calendário semanal com grid de horários (utilizando CSS Grid ou Flexbox para layout responsivo premium).
2.  Desenvolver lógica de posicionamento absoluto/CSS Grid dos blocos de aulas baseado em frações de hora e dia.
3.  Implementar micro-interações: popover com clique rápido, cores dinâmicas e badges de status.
4.  (Opcional avançado) Adicionar suporte a Drag and Drop (utilizando bibliotecas nativas de React como `@hello-pangea/dnd`, `@dnd-kit` ou API HTML5 standard).

### Fase 4: Integração de Relatórios e Auditoria
1.  Garantir que as estimativas e fluxos de caixa levem em consideração as aulas futuras com status `AGENDADA` e ignorem as aulas `CANCELADA`.
2.  Testar se as aulas canceladas não adicionam pagamentos pendentes no fluxo de faturamento.
