# 🔧 Verificar Frontend na Porta 80

## ⚠️ PROBLEMA:

Nginx está configurado para `embarcacoes_frontend_prod:80`, mas pode não estar respondendo.

---

## ✅ VERIFICAR:

```bash
cd /opt/embarcacoes

# Testar se frontend está respondendo
docker exec embarcacoes_nginx_prod wget -O- http://embarcacoes_frontend_prod:80 2>&1 | head -20

# OU usar curl
docker exec embarcacoes_nginx_prod curl -I http://embarcacoes_frontend_prod:80

# Verificar healthcheck do frontend
docker inspect embarcacoes_frontend_prod | grep -A 10 Healthcheck

# Ver logs de erro do nginx (502)
docker logs embarcacoes_nginx_prod 2>&1 | grep -i "502\|bad gateway\|upstream" | tail -10
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker exec embarcacoes_nginx_prod curl -I http://embarcacoes_frontend_prod:80
docker logs embarcacoes_nginx_prod 2>&1 | grep -i error | tail -10
```

