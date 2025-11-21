# 🔄 Recriar Backend com DATABASE_URL Correta

## ✅ SITUAÇÃO:

- ✅ DATABASE_URL está no .env
- ✅ docker-compose.prod.yml atualizado para usar ${DATABASE_URL}
- ❌ Container precisa ser recriado para pegar a nova variável

---

## 🔧 SOLUÇÃO: Recriar Container

O container em restart precisa ser parado e recriado para ler a nova DATABASE_URL.

---

## 📋 EXECUTAR:

```bash
cd /opt/embarcacoes

# Atualizar docker-compose
git pull origin main

# Parar e remover container atual
docker-compose -f docker-compose.prod.yml stop backend
docker-compose -f docker-compose.prod.yml rm -f backend

# Recriar container (agora vai ler DATABASE_URL do .env)
docker-compose -f docker-compose.prod.yml up -d backend

# Aguardar iniciar
sleep 30

# Verificar logs
docker logs embarcacoes_backend_prod --tail=30
```

---

## ✅ RESULTADO ESPERADO:

Os logs devem mostrar:
- ✅ Prisma conectando ao banco
- ✅ Servidor iniciando na porta 3001
- ✅ Sem erros de DATABASE_URL

---

**Execute os comandos acima!** 🚀

