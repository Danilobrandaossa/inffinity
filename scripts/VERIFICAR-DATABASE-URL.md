# 🔍 Verificar DATABASE_URL

## ⚠️ PROBLEMA:

O erro ainda persiste, significa que a DATABASE_URL não foi adicionada ou não está sendo lida.

---

## 🔍 VERIFICAR:

### **1. Ver se DATABASE_URL está no .env:**

```bash
cd /opt/embarcacoes
cat .env | grep DATABASE_URL
```

### **2. Se não estiver, adicionar:**

```bash
cd /opt/embarcacoes
echo 'DATABASE_URL=postgresql://embarcacoes:Embarcacoes2024%21%40%23@postgres:5432/embarcacoes_db?schema=public' >> .env
```

### **3. Verificar variável dentro do container:**

```bash
cd /opt/embarcacoes
docker exec embarcacoes_backend_prod env | grep DATABASE_URL
```

---

## ✅ SE AINDA NÃO FUNCIONAR:

Podemos tentar com aspas duplas ou usar variável direta:

```bash
cd /opt/embarcacoes
cat .env | grep -E "DATABASE_URL|POSTGRES"
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
cat .env | grep DATABASE_URL
cat .env | grep POSTGRES
```

Me mostre o resultado!

