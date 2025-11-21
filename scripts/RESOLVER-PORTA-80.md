# 🔧 Resolver Porta 80 em Uso

## ⚠️ PROBLEMA:

A porta 80 já está em uso por outro processo/container.

---

## ✅ SOLUÇÃO: Verificar e Liberar Porta 80

```bash
cd /opt/embarcacoes

# Ver o que está usando a porta 80
sudo lsof -i :80
# OU
sudo netstat -tulpn | grep :80
# OU
docker ps | grep 80

# Ver todos os containers rodando
docker ps -a

# Se houver outro nginx ou container usando porta 80, parar
# Exemplo:
# docker stop [ID_DO_CONTAINER]
# docker rm [ID_DO_CONTAINER]

# Depois tentar subir novamente
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
sudo lsof -i :80
docker ps -a | grep 80
```

Me mostre o resultado para identificar o que está usando a porta 80!

