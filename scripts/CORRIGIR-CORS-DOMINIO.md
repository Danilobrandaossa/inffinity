# 🔧 Corrigir CORS - Adicionar Domínio

## ⚠️ PROBLEMA:

Backend está bloqueando requisições com erro: "Origin é obrigatório em produção"
O domínio `https://app.infinitynautica.com.br` não está na lista de origens permitidas.

---

## ✅ VERIFICAR E CORRIGIR:

```bash
cd /opt/embarcacoes

# Ver variável FRONTEND_URL no .env
cat .env | grep FRONTEND_URL
cat .env | grep CORS_ORIGIN

# Adicionar/Corrigir variável no .env
# Editar .env e adicionar:
# FRONTEND_URL=https://app.infinitynautica.com.br
# OU
# CORS_ORIGIN=https://app.infinitynautica.com.br

# Depois reiniciar backend para aplicar
docker compose -f docker-compose.prod.yml restart backend

# Verificar logs
docker logs embarcacoes_backend_prod --tail=30
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
cat .env | grep FRONTEND_URL
cat .env | grep CORS_ORIGIN
```

Me mostre o resultado para saber se precisa adicionar a variável!

