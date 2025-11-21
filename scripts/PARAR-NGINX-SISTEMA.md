# 🔧 Parar Nginx do Sistema

## ⚠️ PROBLEMA:

Há um nginx rodando diretamente no sistema (não em Docker) usando a porta 80.

---

## ✅ SOLUÇÃO: Parar Nginx do Sistema

```bash
# Verificar status do nginx do sistema
sudo systemctl status nginx

# Parar nginx do sistema
sudo systemctl stop nginx

# Desabilitar para não iniciar automaticamente (opcional)
# sudo systemctl disable nginx

# Verificar se parou
sudo lsof -i :80

# Agora subir os containers
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml up -d
```

---

## ⚠️ ATENÇÃO:

Se o nginx do sistema está sendo usado para outro projeto, você pode:
1. Parar o nginx do sistema apenas temporariamente
2. OU configurar o docker-compose para usar outra porta (ex: 8080)

---

## 🎯 EXECUTAR:

```bash
sudo systemctl stop nginx
sudo lsof -i :80
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml up -d
```

