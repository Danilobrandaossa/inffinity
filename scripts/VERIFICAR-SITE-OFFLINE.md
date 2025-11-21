# 🔧 Verificar Site Offline

## ⚠️ PROBLEMA:

Site `app.infinitynautica.com.br` com erro **ERR_CONNECTION_REFUSED** (conexão recusada).

---

## ✅ VERIFICAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Ver status de todos os containers
docker ps -a | grep embarcacoes

# Ver se nginx está rodando
docker ps | grep nginx

# Ver logs do nginx
docker logs embarcacoes_nginx_prod --tail=50

# Verificar se nginx está escutando na porta 80
sudo lsof -i :80
sudo lsof -i :443

# Testar acesso local
curl -I http://localhost
curl -I http://145.223.93.235

# Ver configuração do nginx (domínio)
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf | grep -i "server_name"

# Verificar DNS do domínio
nslookup app.infinitynautica.com.br
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker ps | grep embarcacoes
docker logs embarcacoes_nginx_prod --tail=30
sudo lsof -i :80
curl -I http://localhost
```

