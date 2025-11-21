FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    openssl \
    ca-certificates

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Criar diretório de logs
RUN mkdir -p logs

# Expor porta
EXPOSE 3002

# Comando padrão
CMD ["npm", "run", "dev"]