# 🔧 Recriar Nginx com Nova Configuração

## ⚠️ PROBLEMA:

O nginx ainda está tentando carregar configurações SSL antigas. Precisa recriar o container.

---

## ✅ SOLUÇÃO: Recriar Container Nginx

```bash
cd /opt/embarcacoes

# Verificar se arquivo foi atualizado
cat nginx/nginx.conf | grep -A 5 "listen 80"

# Parar e remover container nginx
docker-compose -f docker-compose.prod.yml stop nginx
docker-compose -f docker-compose.prod.yml rm -f nginx

# Recriar container nginx
docker-compose -f docker-compose.prod.yml up -d nginx

# Verificar logs
docker logs embarcacoes_nginx_prod --tail=30
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
cat nginx/nginx.conf | head -60
docker-compose -f docker-compose.prod.yml stop nginx
docker-compose -f docker-compose.prod.yml rm -f nginx
docker-compose -f docker-compose.prod.yml up -d nginx
sleep 5
docker logs embarcacoes_nginx_prod --tail=30
```

