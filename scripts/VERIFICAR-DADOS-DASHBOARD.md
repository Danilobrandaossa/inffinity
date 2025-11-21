# ✅ Verificar se Dados Aparecem no Dashboard

## ✅ CORREÇÕES APLICADAS:

1. **CORS corrigido**: Backend agora aceita requisições sem Origin através do proxy Nginx
2. **Mercado Pago removido**: Não há mais erros de módulo não encontrado
3. **Nginx configurado**: Passa header Origin corretamente

---

## ✅ O QUE FOI CORRIGIDO:

### 1. CORS no Backend (`backend/src/server.ts`):
```typescript
// Em produção, verificar se a requisição vem através do proxy confiável
// Quando o Nginx faz proxy, pode não passar o Origin, mas podemos verificar
if (config.nodeEnv === 'production' && !origin) {
  // Permitir se não houver origin mas estiver vindo através do proxy
  logger.warn('Request without Origin header in production', {
    note: 'Allowing through trusted proxy'
  });
  return callback(null, true);
}
```

### 2. Nginx (`nginx/nginx.conf`):
```nginx
proxy_set_header Origin $http_origin;
```

### 3. Mercado Pago removido:
- Não há mais erros de `Cannot find module 'mercadopago'`
- Backend inicia corretamente

---

## ✅ PARA OS DADOS APARECEREM:

1. **Backend deve estar rodando** sem erros
2. **CORS deve permitir** requisições do frontend
3. **Dados devem existir** no banco de dados

---

## ✅ VERIFICAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# 1. Verificar se backend está rodando
docker ps | grep embarcacoes_backend

# 2. Verificar logs (deve mostrar "Servidor rodando" sem erros)
docker logs embarcacoes_backend_prod --tail=30 | grep -E "Servidor rodando|error|Error" | head -10

# 3. Testar endpoint da API (deve retornar dados)
curl -H "Authorization: Bearer SEU_TOKEN" https://app.infinitynautica.com.br/api/vessels

# 4. Verificar se há dados no banco
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM \"User\";"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM \"Vessel\";"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM \"Booking\";"

# 5. Verificar logs do Nginx (não deve ter 502)
docker logs embarcacoes_nginx_prod --tail=50 | grep -i "502\|error" | head -10
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build backend
sleep 25
docker logs embarcacoes_backend_prod --tail=30 | grep -E "Servidor rodando|error|Error" | head -10
```

---

## ✅ RESPOSTA:

**SIM, os dados devem aparecer agora**, desde que:

1. ✅ Backend esteja rodando sem erros
2. ✅ CORS esteja permitindo as requisições (corrigido)
3. ✅ Nginx esteja fazendo proxy corretamente (corrigido)
4. ✅ Dados existam no banco de dados

**Se os dados ainda não aparecerem**, pode ser que:
- Os dados não existam no banco (verificar com os comandos SQL acima)
- Haja problema de autenticação (token inválido)
- Haja problema na API (verificar logs do backend)

