# Controle de Alunos - Requisitos e Funcionalidades

Este documento detalha os requisitos, campos e regras de negócio para a página de gerenciamento de alunos (Cadastro, Edição, Busca e Aulas Recorrentes).

---

## 1. Tela de Cadastro e Edição ("Novo Aluno" / "Editar")

O formulário de cadastro e edição de alunos deve conter os seguintes campos:

### Informações do Aluno
*   **Nome Completo**: Nome completo do estudante (campo obrigatório).
*   **Idade**: Idade do aluno em anos (campo numérico).
*   **E-mail do Aluno**: Endereço de e-mail para contato direto com o estudante.
*   **Escola**: Nome da instituição de ensino onde o aluno estuda.
*   **Série / Ano**: Ano escolar atual do aluno (ex: "9º Ano Ensino Fundamental", "3º Ano Ensino Médio").
*   **Contato do Aluno**: Número de telefone/WhatsApp do próprio aluno para comunicações diretas.

### Informações do Responsável
*   **Responsável**: Nome completo do responsável legal (pai, mãe, tutor, etc.).
*   **Contato do Responsável**: Número de telefone/WhatsApp para contato e envio de relatórios/cobranças para o responsável.

### Informações Adicionais
*   **Observações Gerais**: Campo de texto livre para anotações extras relevantes sobre o aluno (dificuldades de aprendizado, preferências pedagógicas, objetivos, histórico, etc.).

---

## 2. Aulas Recorrentes (Horário Fixo)

A funcionalidade de **Aula Recorrente** permite planejar a agenda do professor e automatizar o faturamento das aulas recorrentes de forma previsível.

*   **Configuração de Horário Fixo**:
    *   O professor poderá definir dias da semana e horários de preferência/contrato para o aluno (ex: toda terça-feira das 15:00 às 16:30).
*   **Preço Fixo da Aula**:
    *   Definição de um valor padrão por aula para aquele aluno.
*   **Integração com Relatórios**:
    *   O sistema utilizará essas informações para projetar a receita recorrente futura.
    *   O faturamento e a soma dessas horas são integrados diretamente nos relatórios de fluxo de caixa e balanço financeiro semanal/mensal.

---

## 3. Mecanismo de Busca ("Tela de Busca")

Para agilizar o atendimento diário do professor, o filtro de pesquisa na listagem de alunos deve realizar a busca em tempo real com suporte a múltiplos campos:

*   **Por Nome**: Deve retornar resultados se houver correspondência com o nome do aluno ou nome do responsável.
*   **Por Telefone**: Deve filtrar pelo contato/telefone do aluno ou contato/telefone do responsável.
*   **Por E-mail**: Deve buscar correspondências com o e-mail cadastrado do aluno.
