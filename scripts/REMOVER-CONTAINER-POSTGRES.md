# 🔧 Remover Container Postgres Antigo (Contornar Bug docker-compose)

## ⚠️ PROBLEMA:

O docker-compose versão 1.29.2 tem um bug conhecido ao recriar containers antigos.

---

## ✅ SOLUÇÃO: Remover Container Antigo Manualmente

```bash
cd /opt/embarcacoes

# Remover container antigo do postgres
docker rm a01e7b858445_embarcacoes_db_prod

# Agora tentar subir novamente
docker-compose -f docker-compose.prod.yml up -d postgres
```

---

## ✅ OU: Remover com força

```bash
cd /opt/embarcacoes

# Remover container mesmo se estiver rodando (não está, mas para garantir)
docker rm -f a01e7b858445_embarcacoes_db_prod 2>/dev/null || echo "Container já removido"

# Subir postgres
docker-compose -f docker-compose.prod.yml up -d postgres
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
docker rm -f a01e7b858445_embarcacoes_db_prod
docker-compose -f docker-compose.prod.yml up -d postgres
```

