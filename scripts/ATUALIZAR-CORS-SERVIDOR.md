# 🔧 Atualizar CORS no Servidor

## ✅ Mudanças:

1. **Nginx**: Adicionado `proxy_set_header Origin $http_origin;` para passar o header Origin
2. **Backend**: Ajustado CORS para permitir requisições sem Origin através do proxy confiável

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código
git pull origin main

# Rebuild do backend (aplicar mudanças no CORS)
docker compose -f docker-compose.prod.yml up -d --build backend

# Reiniciar nginx (aplicar mudança no proxy_set_header)
docker compose -f docker-compose.prod.yml restart nginx

# Aguardar iniciar
sleep 15

# Verificar logs do backend (não deve mais ter erro de Origin)
docker logs embarcacoes_backend_prod --tail=30 | grep -i "CORS\|origin" | head -10

# Verificar se está funcionando
curl -I https://app.infinitynautica.com.br/api/health
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build backend
docker compose -f docker-compose.prod.yml restart nginx
sleep 15
docker logs embarcacoes_backend_prod --tail=30 | grep -i error | head -5
```

