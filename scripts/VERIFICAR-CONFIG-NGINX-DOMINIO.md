# 🔧 Verificar Configuração Nginx - Domínio

## ⚠️ PROBLEMA IDENTIFICADO:

- ✅ Nginx rodando (HTTP 200 OK localmente)
- ⚠️ Nginx redirecionando HTTP → HTTPS (301)
- ⚠️ Configuração mostra `server_name _;` (qualquer domínio)
- ⚠️ Domínio `app.infinitynautica.com.br` pode não estar configurado

---

## ✅ VERIFICAR CONFIGURAÇÃO:

```bash
cd /opt/embarcacoes

# Ver configuração completa do nginx
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf

# Ver se tem configuração para o domínio
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf | grep -A 10 "server_name"

# Ver se HTTPS está comentado
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf | grep -A 5 "HTTPS server"

# Testar acesso via HTTPS (pode falhar se certificado não existir)
curl -k -I https://app.infinitynautica.com.br

# Verificar certificado SSL
docker exec embarcacoes_nginx_prod ls -la /etc/letsencrypt/live/
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker exec embarcacoes_nginx_prod cat /etc/nginx/nginx.conf | grep -A 5 "server_name"
docker exec embarcacoes_nginx_prod ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "Sem certificados"
curl -k -I https://app.infinitynautica.com.br 2>&1 | head -10
```

