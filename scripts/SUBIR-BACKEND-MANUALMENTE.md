# 🚀 Subir Backend Manualmente (Contornar erro docker-compose)

## ⚠️ PROBLEMA:

O container `embarcacoes_backend_prod` não existe porque o docker-compose teve erro ao criá-lo.

---

## ✅ SOLUÇÃO: Subir backend sem recriar dependências

```bash
cd /opt/embarcacoes

# Ver todos os containers
docker ps -a | grep embarcacoes

# Subir backend sem recriar postgres (usar --no-deps)
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# Aguardar iniciar
sleep 20

# Verificar se está rodando
docker ps | grep backend
```

---

## ✅ SOLUÇÃO ALTERNATIVA: Remover container problemático do postgres

O erro pode ser por um container antigo do postgres. Vamos verificar:

```bash
cd /opt/embarcacoes

# Ver containers parados
docker ps -a | grep postgres

# Se houver container com nome estranho, removê-lo
# docker rm a01e7b858445_embarcacoes_db_prod  # (se existir)
```

---

## ✅ SOLUÇÃO MAIS SIMPLES: Subir tudo do zero

```bash
cd /opt/embarcacoes

# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Subir apenas postgres primeiro
docker-compose -f docker-compose.prod.yml up -d postgres

# Aguardar postgres iniciar
sleep 10

# Subir backend
docker-compose -f docker-compose.prod.yml up -d backend
```

---

## 🎯 EXECUTAR AGORA:

Primeiro, verifique o que existe:

```bash
cd /opt/embarcacoes
docker ps -a | grep embarcacoes
docker-compose -f docker-compose.prod.yml ps
```

Me mostre o resultado para decidir a melhor abordagem.

