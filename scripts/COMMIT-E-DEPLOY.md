# 🚀 Commit e Deploy das Atualizações

## ✅ PASSOS PARA SUBIR AS ATUALIZAÇÕES:

### 1️⃣ **LOCAL - Adicionar mudanças ao Git**

```bash
# Ver quais arquivos foram alterados
git status

# Adicionar arquivo modificado
git add frontend/src/pages/DashboardPage.tsx

# OU adicionar todos os arquivos modificados
git add .
```

---

### 2️⃣ **LOCAL - Fazer commit**

```bash
# Fazer commit com mensagem descritiva
git commit -m "feat: adiciona filtros na tabela de reservas do dashboard

- Adiciona filtros por Embarcação, Usuário, Data e Status
- Implementa botão para limpar filtros
- Card de Embarcações agora é clicável e redireciona para /vessels"
```

---

### 3️⃣ **LOCAL - Enviar para o repositório**

```bash
# Enviar para o GitHub
git push origin main
```

---

### 4️⃣ **SERVIDOR - Atualizar código**

```bash
# Conectar no servidor
ssh root@145.223.93.235

# Ir para o diretório do projeto
cd /opt/embarcacoes

# Atualizar código do repositório
git pull origin main

# Rebuild do frontend (se necessário)
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

---

## 🎯 COMANDOS COMPLETOS:

### **LOCAL:**
```bash
cd C:\Users\ueles\OneDrive\Área de Trabalho\Inffinity
git add frontend/src/pages/DashboardPage.tsx
git commit -m "feat: adiciona filtros na tabela de reservas do dashboard e card clicável de embarcações"
git push origin main
```

### **SERVIDOR:**
```bash
ssh root@145.223.93.235
cd /opt/embarcacoes
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

---

## ✅ VERIFICAÇÃO NO SERVIDOR:

```bash
# Ver logs do frontend (verificar se buildou corretamente)
docker logs embarcacoes_frontend_prod --tail=50

# Ver status dos containers
docker-compose -f docker-compose.prod.yml ps
```

---

## ⚠️ OBSERVAÇÃO:

O frontend pode precisar ser rebuildado para aplicar as mudanças. Se usar hot-reload no servidor, pode não ser necessário rebuild.

