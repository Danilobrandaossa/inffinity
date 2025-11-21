# ✅ Verificar Nginx Funcionando

## ✅ Container Recriado!

O nginx foi recriado. Agora vamos verificar se está funcionando corretamente.

---

## 🔍 VERIFICAR LOGS E STATUS:

```bash
cd /opt/embarcacoes

# Ver logs do nginx (não deve mais ter erro de SSL)
docker logs embarcacoes_nginx_prod --tail=30

# Ver status dos containers
docker ps | grep embarcacoes

# Testar se nginx está respondendo
curl -I http://localhost
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker logs embarcacoes_nginx_prod --tail=30
docker ps | grep embarcacoes
```

