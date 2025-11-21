# ✅ Atualizar Frontend - Performance Melhorada

## ✅ CORREÇÕES APLICADAS:

1. **Query Key corrigida**: Agora as mutações invalidam `['my-vessels']` corretamente
2. **Refetch forçado**: Após criar/deletar, faz refetch imediato
3. **staleTime reduzido**: De 5 minutos para 30 segundos (atualizações mais rápidas)

---

## ✅ MUDANÇAS:

### `frontend/src/pages/VesselsPage.tsx`:
- ✅ Mutations agora invalidam `['my-vessels']` (não apenas `['vessels']`)
- ✅ Adicionado `refetchQueries` para forçar atualização imediata

### `frontend/src/main.tsx`:
- ✅ `staleTime` reduzido de 5 minutos para 30 segundos
- ✅ `gcTime` (antigo `cacheTime`) configurado para 5 minutos

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código
git pull origin main

# Rebuild do frontend (aplicar mudanças)
docker compose -f docker-compose.prod.yml up -d --build frontend

# Aguardar iniciar
sleep 20

# Verificar se funcionou
docker logs embarcacoes_frontend_prod --tail=30
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build frontend
sleep 20
docker ps | grep embarcacoes_frontend
```

---

## ✅ RESULTADO ESPERADO:

- ✅ Criar/deletar embarcações atualiza **imediatamente** na lista
- ✅ Não precisa mais esperar 5 minutos para ver mudanças
- ✅ Performance melhorada no dashboard

