# Regenerar Prisma Client após remover constraint única

Execute no servidor:

```bash
cd /opt/embarcacoes

# 1. Regenerar Prisma Client (atualiza o cliente com o schema atual)
docker compose -f docker-compose.prod.yml exec backend npx prisma generate

# 2. Reiniciar backend para usar o novo Prisma Client
docker compose -f docker-compose.prod.yml restart backend

# 3. Verificar logs
docker logs embarcacoes_backend_prod --tail=30
```

