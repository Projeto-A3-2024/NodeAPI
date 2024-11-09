# Projeto de Agendamento de Consultas

Este é um sistema de agendamento de consultas para profissionais de saúde e pacientes. O projeto permite que os profissionais definam horários disponíveis e os pacientes agendem consultas.

## Funcionalidades

- **Autenticação e Autorização**: O sistema oferece controle de acesso com três tipos de usuários: **Admin**, **Profissional** e **Paciente**.
- **Gerenciamento de Horários**: Profissionais podem definir horários de disponibilidade.
- **Agendamento de Consultas**: Pacientes podem agendar consultas nos horários disponíveis.
- **Visualização de Disponibilidade**: Pacientes podem visualizar os horários disponíveis para agendamento com base no profissional selecionado.

## Tecnologias Utilizadas

- **Frontend**:  
  - React
  - Next.js
  - TailwindCSS para estilização
  - TypeScript
  - Toast para notificações

- **Backend**:  
  - Node.js
  - Prisma ORM para interação com o banco de dados
  - Prisma Client (para banco de dados relacional)
  - API RESTful com Next.js API routes
  - Autenticação via tokens JWT

## Instalação

### Requisitos

- [Node.js](https://nodejs.org/) >= 16.x.x
- [Prisma](https://www.prisma.io/) para gerenciamento de banco de dados

### Passos para Inicialização

1. **Clone o repositório**

   ```bash
   git clone https://github.com/usuario/agendamento-consultas.git
   cd agendamento-consultas
   
2. **Instale as dependências**

   ```bash
   npm install

3. **Crie um arquivo de configuração (.env) e adicione essa configuração para o banco de dados**

   ```bash
   DATABASE_URL="url_do_seu_banco_de_dados"

4. **Realize a migração do banco de dados**

   ```bash
   npx prisma migrate dev

5. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev

## Estrutura do Projeto

- **`app/`**: Contém as rotas principais do Next.js. As APIs são configuradas aqui.  
  Exemplos de arquivos:
  - `app/api/`: Endpoints de API do Next.js.
  - `app/login/`: Página inicial do projeto.

- **`prisma/`**: Contém o arquivo de esquema Prisma e as migrações de banco de dados.  
  Exemplos de arquivos:
  - `schema.prisma`: Esquema de banco de dados usado pelo Prisma.
  - `migrations/`: Diretório contendo as migrações de banco de dados.
