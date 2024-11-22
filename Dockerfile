# Etapa 1: Construção da aplicação
FROM node:20 AS builder

# Configura o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários para instalar as dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copiar o diretório prisma
COPY prisma ./prisma
RUN npx prisma generate

# Copia o restante dos arquivos da aplicação
COPY . .

# Cria a build de produção
RUN npm run build

# Instala as dependências de produção
RUN npm prune --production

# Etapa 2: Configuração para produção
FROM node:20 AS runner

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários da etapa anterior
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]