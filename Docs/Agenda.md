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
    *   O sistema localiza todas as instâncias futuras de `Lesson` vinculadas àquela recorrência que ainda estão com status `AGENDADA` e as atualiza para o novo dia/## 4. Dashboard Semanal e Fluxo de Funcionamento Atual

A tela de agenda foi simplificada e otimizada para oferecer um fluxo de trabalho rápido e de alta densidade de informação:

### A. Estrutura de Abas (Modos de Visualização)
Substituímos os filtros e botões de alternância antigos por exatamente **3 abas de controle de visualização unificadas**:
1.  **Hoje**: Exibe apenas as aulas do dia atual no formato de lista (`list`). É o modo padrão ao abrir a tela.
2.  **Calendário**: Mostra a grade semanal no formato de calendário (`calendar`). Carrega apenas as aulas da semana selecionada, com suporte a botões de navegação de "Semana Anterior" e "Próxima Semana" (que alteram a data na URL e carregam as aulas correspondentes).
3.  **Próximas**: Exibe uma lista (`list`) com as aulas dos **próximos 7 dias** (inclusive), com um limite máximo de **10 aulas**.

### B. Grade Horária Semanal Compacta
Para garantir que a maior parte da agenda caiba na tela sem rolagem vertical, aplicamos as seguintes regras:
*   **Altura das Horas**: Reduzimos a escala visual de `68px` para **`45px` por hora** (grade das 07:00 às 21:00).
*   **Dimensões de Cabeçalhos**: A altura do cabeçalho dos dias da semana é de `h-10` e a largura da coluna lateral de horas é de `w-12`.
*   **Cards Inteligentes e Adaptativos**: Caso a aula possua duração menor ou o espaço seja curto (altura visual menor que `70px` no grid):
    *   O rodapé (modalidade) e a linha de duração inferior são ocultados.
    *   O horário de início (ex: `15:00`) é embutido diretamente na primeira linha ao lado do nome da matéria.

### C. Integração e Cadastro de Alunos (Sincronização de Agenda Fixa)
Quando um aluno é cadastrado ou editado com a opção de "Agenda Fixa (Aula Recorrente)" ativada:
1.  O sistema executa a Server Action pai (`createStudent` ou `updateStudent`).
2.  O sistema chama internamente as funções diretas de banco de dados (`createRecurringScheduleDb` ou `updateRecurringScheduleDb`), passando o `userId` autenticado. Isso evita erros de escopo de requisição (`headers was called outside a request scope`) que ocorriam ao aninhar Server Actions.
3.  A recorrência master é criada e as instâncias de `Lesson` e `Payment` são geradas automaticamente para as **próximas 8 semanas** no calendário.

---

## 5. Mockup da Estrutura Atual da Agenda

```
+-----------------------------------------------------------------------------+
|                              AGENDA DE AULAS                                |
|  [ Hoje (Lista) ]  [ Calendário (Semana) ]  [ Próximas (7 dias) ]           |
|                                                     [ + Agendar Aula ]      |
+-----------------------------------------------------------------------------+
|  <- Anterior   |  Semana de 22 a 28 de Junho de 2026  |  Próxima ->          |
|  Resumo: 12 Aulas (18h) • R$ 960,00 Projetados                              |
+-----------------------------------------------------------------------------+
| HORA | SEG (22)  | TER (23)  | QUA (24)  | QUI (25)  | SEX (26)  | SÁB (27)     |
+------+-----------+-----------+-----------+-----------+-----------+--------------+
| 08:00|           |           |           |           |           |              |
+------+-----------+-----------+-----------+-----------+-----------+--------------+
| 09:00| [MAT 9:00]|           | [MAT 9:00]|           |           |              |
|      | João      |           | João      |           |           |              |
+------+-----------+-----------+-----------+-----------+-----------+--------------+
| 10:00|           |           |           |           |           |              |
+------+-----------+-----------+-----------+-----------+-----------+--------------+
| 11:00|           | [FIS]     |           |           | [FIS]     |              |
|      |           | Maria     |           |           | (CANCEL.) |              |
|      |           | 11:00(1.5)|           |           | Maria     |              |
+------+-----------+-----------+-----------+-----------+-----------+--------------+
```

---

## 6. Lógica de Interações e Exceções

*   **Clique em Slot Vazio**: Ao clicar em qualquer espaço de hora livre (ex: Quinta-feira às 15:00), o modal "Agendar Nova Aula" abre pré-preenchido com o dia e hora correspondentes.
*   **Edição/Exclusão de Recorrências**: Ao clicar em uma aula recorrente, o professor pode optar por aplicar a alteração:
    *   **Apenas esta semana**: Altera ou exclui somente a instância selecionada (ex: marca como cancelada ou muda o horário pontualmente).
    *   **Toda a recorrência**: Modifica todas as futuras aulas vinculadas àquela recorrência a partir da data da alteração.
*   **Status Rápido**: Ao passar o mouse sobre o card da aula, botões rápidos de ação flutuam na tela para concluir ou cancelar a aula sem precisar abrir o modal de detalhes.

---

## 7. Integração de Relatórios e Auditoria

1.  Garantir que as estimativas e fluxos de caixa levem em consideração as aulas futuras com status `AGENDADA` e ignorem as aulas `CANCELADA`.
2.  Testar se as aulas canceladas não adicionam pagamentos pendentes no fluxo de faturamento.
