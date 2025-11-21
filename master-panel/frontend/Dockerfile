FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    git

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "dev"]