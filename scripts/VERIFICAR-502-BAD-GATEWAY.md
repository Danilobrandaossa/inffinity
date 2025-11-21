# 🔧 Resolver 502 Bad Gateway

## ⚠️ PROBLEMA:

Nginx está funcionando, mas retorna 502 Bad Gateway. Isso significa que não consegue conectar ao frontend.

---

## ✅ VERIFICAR:

```bash
cd /opt/embarcacoes

# Ver logs do frontend
docker logs embarcacoes_frontend_prod --tail=50

# Verificar se frontend está respondendo
docker exec embarcacoes_frontend_prod curl -I http://localhost

# Verificar se nginx consegue acessar o frontend
docker exec embarcacoes_nginx_prod ping -c 2 embarcacoes_frontend_prod

# Verificar configuração do nginx (upstream frontend)
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf | grep -A 3 "upstream frontend"
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker logs embarcacoes_frontend_prod --tail=50
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf | grep -A 3 "upstream frontend"
```

