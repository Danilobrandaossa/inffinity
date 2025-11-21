# 🔍 Verificar Por Que Frontend Não Mostra Dados

## ✅ STATUS:

- ✅ Dados existem no banco: 6 usuários, 8 embarcações, 8 reservas
- ⚠️ Frontend não está mostrando

---

## ✅ VERIFICAR:

```bash
cd /opt/embarcacoes

# Ver dados específicos no banco
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT id, name, email, role FROM users;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT id, name FROM vessels LIMIT 5;"

# Ver logs do backend (pode mostrar erros)
docker logs embarcacoes_backend_prod --tail=50 | grep -i error

# Ver logs do frontend
docker logs embarcacoes_frontend_prod --tail=30

# Testar API diretamente
curl -k https://app.infinitynautica.com.br/api/vessels 2>&1 | head -20
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT id, name, email, role FROM users;"
docker logs embarcacoes_backend_prod --tail=30 | grep -i error
```

