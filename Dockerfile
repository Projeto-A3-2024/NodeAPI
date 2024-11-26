# Etapa 1: Ambiente de desenvolvimento
FROM node:20

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários para instalar as dependências
COPY package.json package-lock.json ./

# Instala as dependências de desenvolvimento
RUN npm install

# Copia todos os arquivos do projeto
COPY . .

# Gera o banco de dados (necessário para Prisma)
RUN npx prisma generate

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Copia o script wait-for-it para o container
COPY wait-for-it.sh /app/wait-for-it.sh

# Comando para esperar o banco de dados e executar o servidor
CMD ["sh", "-c", "./wait-for-it.sh db:5432 -- npx prisma migrate dev && npm run prisma:seed && npm run dev"]
