# 🔧 Atualizar Nginx com Domínio Correto

## ✅ SOLUÇÃO:

O repositório local já tem a configuração correta, mas o servidor precisa atualizar.

---

## ✅ COMANDOS PARA SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código do repositório
git pull origin main

# Verificar se arquivo foi atualizado
grep "app.infinitynautica.com.br" nginx/nginx.conf

# Recarregar configuração do nginx (sem restart completo)
docker compose -f docker-compose.prod.yml exec nginx nginx -t
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# OU reiniciar nginx
docker compose -f docker-compose.prod.yml restart nginx

# Testar acesso
curl -I https://app.infinitynautica.com.br
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
git pull origin main
grep "app.infinitynautica.com.br" nginx/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
sleep 5
curl -k -I https://app.infinitynautica.com.br
```

