# 🔧 Verificar Nginx Dentro do Frontend

## ⚠️ PROBLEMA:

O frontend tem os arquivos, mas o nginx interno não está respondendo na porta 80.

---

## ✅ VERIFICAR:

```bash
cd /opt/embarcacoes

# Ver processos rodando no frontend
docker exec embarcacoes_frontend_prod ps aux

# Verificar configuração do nginx interno
docker exec embarcacoes_frontend_prod cat /etc/nginx/conf.d/default.conf

# Tentar acessar diretamente pelo IP
docker inspect embarcacoes_frontend_prod | grep IPAddress
docker exec embarcacoes_nginx_prod curl -I http://172.18.0.5:80

# Ver logs do frontend
docker logs embarcacoes_frontend_prod --tail=50
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker exec embarcacoes_frontend_prod ps aux
docker exec embarcacoes_frontend_prod cat /etc/nginx/conf.d/default.conf
docker logs embarcacoes_frontend_prod --tail=30
```

