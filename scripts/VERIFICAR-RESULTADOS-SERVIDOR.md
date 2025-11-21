# ✅ Guia: Verificar Resultados da Atualização do Servidor

## 📋 O que esperar em cada etapa:

### **1. Status atual:**
```
d7e7ef0 Deploy do SAAS de embarcações
```
Ou um commit mais recente.

### **2. Git status:**
Pode mostrar arquivos modificados se houver alterações locais no servidor.

---

### **3. Git pull:**
```
Updating d7e7ef0..1d068cb
Fast-forward
 backend/prisma/schema.prisma | 90 ++++++++++++++++++++++++++++++
 1 file changed, 90 insertions(+)
```

**✅ Sucesso:** Mostra atualização do commit `d7e7ef0` para `1d068cb`

---

### **4. Verificar atualização:**
```
1d068cb feat: adiciona campos de integração Mercado Pago nos models de pagamento
```

**✅ Sucesso:** Deve mostrar o commit `1d068cb`

---

### **5. Status migrations (antes):**
```
Database schema is up to date.

No pending migrations to apply.
```

**OU** se houver migrations pendentes:
```
X migrations found in prisma/migrations
X applied | 1 pending
```

---

### **6. Aplicar migrations:**
```
Prisma Migrate has detected schema drift:
  - Added `paymentProvider` field to Installment
  - Added `providerPaymentId` field to Installment
  ... (lista de campos adicionados)

Applying migration `20251121120000_add_mercado_pago_fields`

✔ Migration applied successfully
```

**✅ Sucesso:** Mostra "Migration applied successfully"

**❌ Possíveis erros:**
- Se der erro de permissão: Verificar se container backend tem acesso ao banco
- Se der erro de conexão: Verificar se banco está rodando

---

### **7. Status migrations (depois):**
```
Database schema is up to date.

All migrations have been successfully applied.
```

**✅ Sucesso:** Mostra "All migrations have been successfully applied"

---

### **8. Reiniciar backend:**
```
Restarting embarcacoes_backend_prod ... done
```

**✅ Sucesso:** Mostra "Restarting ... done"

---

### **9. Status containers:**
```
NAME                          STATUS
embarcacoes_backend_prod      Up (healthy)
embarcacoes_frontend_prod     Up
embarcacoes_db_prod           Up (healthy)
```

**✅ Sucesso:** Todos mostram "Up" ou "Up (healthy)"

---

### **10. Logs do backend:**
```
🚀 Servidor rodando na porta 3001
🌍 Ambiente: production
🔗 Frontend: https://seudominio.com
✅ Prisma client connected
```

**✅ Sucesso:** Não mostra erros, apenas mensagens normais de inicialização

**❌ Possíveis erros:**
- `Error connecting to database` → Problema de conexão
- `Migration failed` → Problema com migrations
- `Cannot find module` → Problema com dependências

---

## 🚨 Problemas Comuns e Soluções:

### **Problema 1: Git pull falha**

**Erro:** `Permission denied` ou `Authentication failed`

**Solução:**
```bash
# Verificar configuração do Git no servidor
git config --list

# Se necessário, configurar usuário
git config --global user.name "Danilobrandaossa"
git config --global user.email "daniillobrandao@gmail.com"
```

---

### **Problema 2: Migration falha**

**Erro:** `Migration failed` ou erro de permissão no banco

**Solução:**
```bash
# Verificar conexão com banco
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull

# Se falhar, verificar variáveis de ambiente
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE

# Tentar aplicar manualmente
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

---

### **Problema 3: Backend não inicia**

**Erro:** Backend mostra erro nos logs

**Solução:**
```bash
# Ver logs completos
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Verificar se banco está acessível
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull

# Rebuild do backend
docker-compose -f docker-compose.prod.yml up -d --build backend
```

---

### **Problema 4: Container não responde**

**Erro:** Container mostra `unhealthy` ou não inicia

**Solução:**
```bash
# Ver status detalhado
docker inspect embarcacoes_backend_prod | grep -A 10 Health

# Ver logs de health check
docker-compose -f docker-compose.prod.yml logs backend | grep -i health

# Reiniciar todos os containers
docker-compose -f docker-compose.prod.yml restart
```

---

## ✅ Checklist Final:

Após executar todos os comandos, verifique:

- [ ] ✅ Git pull funcionou e mostra commit `1d068cb`
- [ ] ✅ Schema.prisma foi atualizado (90 linhas a mais)
- [ ] ✅ Migrations foram aplicadas com sucesso
- [ ] ✅ Backend reiniciou sem erros
- [ ] ✅ Todos os containers estão "Up" ou "Up (healthy)"
- [ ] ✅ Logs do backend não mostram erros
- [ ] ✅ Health check do backend responde OK

---

## 🔍 Verificação Final:

Execute estes comandos para confirmar que tudo está OK:

```bash
# Ver commit atual
git log -1 --oneline

# Verificar schema foi atualizado
grep -c "paymentProvider" backend/prisma/schema.prisma
# Deve retornar um número (quantidade de ocorrências)

# Verificar migrations aplicadas
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Verificar se backend está respondendo
curl http://localhost:3001/health || docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3001/health

# Ver status final de todos os containers
docker-compose -f docker-compose.prod.yml ps
```

---

**Após executar os comandos, copie os resultados aqui para eu verificar se está tudo OK!** 🚀

