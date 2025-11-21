# 🔧 Corrigir DATABASE_URL

## ⚠️ PROBLEMA:

**Erro:** `empty host in database URL`

A `DATABASE_URL` está sendo construída incorretamente no docker-compose.prod.yml, provavelmente por causa de caracteres especiais na senha do PostgreSQL.

---

## ✅ SOLUÇÃO:

### **1. Verificar o .env no servidor:**

```bash
cd /opt/embarcacoes
cat .env | grep POSTGRES
```

### **2. Verificar a senha atual:**

```bash
cd /opt/embarcacoes
cat .env | grep POSTGRES_PASSWORD
```

A senha provavelmente tem caracteres especiais como `!@#` que precisam ser codificados na URL.

### **3. Corrigir o .env:**

Se a senha for algo como `Embarcacoes2024!@#`, precisamos:

**Opção A:** Escapar os caracteres especiais na URL
**Opção B:** Usar uma senha sem caracteres especiais
**Opção C:** Construir a DATABASE_URL manualmente no .env

---

## 🎯 PRÓXIMO PASSO:

Execute primeiro:

```bash
cd /opt/embarcacoes
cat .env | grep POSTGRES
```

Me mostre o resultado para corrigir!

