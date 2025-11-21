# 🚀 Atualizar Servidor - Próximos Passos

## ✅ COMMIT FEITO COM SUCESSO!

**Commit:** `1d068cb`  
**Mensagem:** "feat: adiciona campos de integração Mercado Pago nos models de pagamento"  
**Alterações:** +90 linhas no schema.prisma  
**Status:** ✅ Push realizado com sucesso

---

## 📋 PRÓXIMOS PASSOS NO SERVIDOR

### **1. Conectar ao servidor e atualizar código**

```bash
# Conectar ao servidor
ssh root@145.223.93.235

# Ir para o diretório do projeto
cd /opt/embarcacoes

# Ver status atual (antes de atualizar)
git status
git log -1 --oneline

# Atualizar código do GitHub
git pull origin main

# Verificar que foi atualizado
git log -1 --oneline
# Deve mostrar: 1d068cb feat: adiciona campos de integração Mercado Pago...
```

---

### **2. Aplicar migrations no banco de dados**

```bash
# No servidor (já conectado)
cd /opt/embarcacoes

# Verificar migrations pendentes
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Aplicar migrations (criar migration e aplicar)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields

# OU apenas aplicar migrations existentes (se já tiverem sido criadas)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

### **3. Verificar se aplicou corretamente**

```bash
# Verificar status das migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Verificar schema do banco
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull

# Ver logs do backend (para verificar erros)
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
```

---

### **4. Reiniciar containers (se necessário)**

```bash
# Reiniciar backend para aplicar mudanças
docker-compose -f docker-compose.prod.yml restart backend

# Verificar status dos containers
docker-compose -f docker-compose.prod.yml ps

# Verificar health do backend
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3001/health
```

---

## ⚠️ TRATAR OUTROS ARQUIVOS MODIFICADOS NO SERVIDOR

Lembre-se que no servidor há outros arquivos modificados:

```
modified:   backend/Dockerfile.prod
modified:   docker-compose.prod.yml
modified:   frontend/Dockerfile.prod
modified:   frontend/package.json
modified:   nginx/nginx.conf
```

### **Opção A: Descartar alterações (se não forem importantes)**

```bash
# No servidor
cd /opt/embarcacoes

# Ver o que foi modificado
git diff backend/Dockerfile.prod
git diff docker-compose.prod.yml
git diff frontend/package.json

# Se decidir descartar:
git restore backend/Dockerfile.prod
git restore docker-compose.prod.yml
git restore frontend/Dockerfile.prod
git restore frontend/package.json
git restore nginx/nginx.conf
```

### **Opção B: Commitar alterações (se forem importantes)**

```bash
# No servidor (precisa configurar Git lá também)
cd /opt/embarcacoes

# Ver todas as alterações
git status
git diff

# Se decidir commitar:
git add .
git commit -m "feat: atualiza configurações Docker e nginx no servidor"
git push origin main
```

---

## 🔧 COMANDOS ÚTEIS

### **Ver logs em tempo real:**

```bash
# Logs do backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Logs de todos os containers
docker-compose -f docker-compose.prod.yml logs -f
```

### **Verificar se tudo está funcionando:**

```bash
# Health check do backend
curl http://localhost:3001/health

# Ou dentro do container
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3001/health
```

### **Prisma Studio (para visualizar banco):**

```bash
# Abrir Prisma Studio (não recomendado em produção)
docker-compose -f docker-compose.prod.yml exec backend npx prisma studio
# Acesse: http://localhost:5555
```

---

## ✅ CHECKLIST

- [x] ✅ Commit feito localmente
- [x] ✅ Push realizado para GitHub
- [ ] ⏳ Conectar ao servidor
- [ ] ⏳ Atualizar código: `git pull origin main`
- [ ] ⏳ Aplicar migrations: `npx prisma migrate deploy`
- [ ] ⏳ Verificar status das migrations
- [ ] ⏳ Reiniciar backend (se necessário)
- [ ] ⏳ Verificar health do backend
- [ ] ⏳ Tratar outros arquivos modificados no servidor

---

## 🚨 PROBLEMAS COMUNS

### **Se `git pull` der conflito:**

```bash
# Ver conflitos
git status

# Se quiser manter versão do servidor:
git stash
git pull origin main

# Se quiser manter versão local:
git add .
git commit -m "Merge local changes"
git pull origin main --no-rebase
```

### **Se migration falhar:**

```bash
# Ver logs de erro
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Resetar migrations (CUIDADO - apenas se necessário)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate reset

# Ou aplicar manualmente
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

---

**Próximo passo:** Execute os comandos no servidor para atualizar e aplicar migrations!

