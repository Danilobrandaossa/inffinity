# 🔧 Verificar Erro do Nginx

## ⚠️ PROBLEMA:

O nginx está reiniciando constantemente (Restarting (1) 5 seconds ago).

---

## ✅ VERIFICAR LOGS DE ERRO:

```bash
cd /opt/embarcacoes

# Ver logs de erro do nginx
docker logs embarcacoes_nginx_prod --tail=50

# Ver se há erro na configuração
docker exec embarcacoes_nginx_prod nginx -t

# Verificar se o arquivo de configuração existe
docker exec embarcacoes_nginx_prod ls -la /etc/nginx/nginx.conf
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker logs embarcacoes_nginx_prod --tail=50
docker exec embarcacoes_nginx_prod nginx -t
```

