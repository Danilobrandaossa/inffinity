# 🔍 Verificar PostgreSQL

## ✅ PROGRESSO:

- ✅ DATABASE_URL está correta agora!
- ✅ Erro mudou de "empty host" para "Can't reach database"
- ❌ Backend não consegue conectar ao postgres

---

## 🔍 VERIFICAR:

### **1. Ver se postgres está rodando:**

```bash
cd /opt/embarcacoes
docker ps | grep postgres
docker-compose -f docker-compose.prod.yml ps postgres
```

### **2. Ver se estão na mesma rede:**

```bash
cd /opt/embarcacoes

# Ver rede do backend
docker inspect embarcacoes_backend_prod | grep -A 10 Networks

# Ver rede do postgres
docker inspect embarcacoes_db_prod | grep -A 10 Networks
```

### **3. Testar conexão do backend ao postgres:**

```bash
cd /opt/embarcacoes

# Tentar ping do backend para postgres
docker exec embarcacoes_backend_prod ping -c 2 postgres
```

---

## ✅ SOLUÇÃO:

Se o postgres não estiver rodando ou não estiver na mesma rede, precisamos:

1. **Subir o postgres:**
```bash
docker-compose -f docker-compose.prod.yml up -d postgres
```

2. **Verificar rede:**
Ambos devem estar na rede `embarcacoes_network_prod`

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
docker ps | grep postgres
docker-compose -f docker-compose.prod.yml ps
```

Me mostre o resultado!

