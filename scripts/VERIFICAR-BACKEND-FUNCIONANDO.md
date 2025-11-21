# ✅ Verificar se Backend Está Funcionando

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Verificar logs (deve mostrar "Servidor rodando")
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find" | head -15

# Testar endpoint de health
curl -I http://localhost:3001/health 2>&1 | head -5

# Verificar se não há mais erros de CORS
docker logs embarcacoes_backend_prod --tail=100 | grep -i "Origin é obrigatório" | wc -l
# Se retornar 0, significa que não há mais erros de CORS!

# Verificar status dos containers
docker ps | grep embarcacoes
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find" | head -15
docker logs embarcacoes_backend_prod --tail=100 | grep -i "Origin é obrigatório" | wc -l
docker ps | grep embarcacoes
```

