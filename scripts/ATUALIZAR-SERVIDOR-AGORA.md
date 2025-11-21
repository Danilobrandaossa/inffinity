# 🚀 Atualizar Servidor - Comandos Prontos

## ✅ COMMIT ENVIADO COM SUCESSO!

O código foi enviado para o repositório GitHub.

---

## 📋 COMANDOS PARA EXECUTAR NO SERVIDOR:

### **1. Conectar no servidor:**
```bash
ssh root@145.223.93.235
```

### **2. Ir para o diretório do projeto:**
```bash
cd /opt/embarcacoes
```

### **3. Atualizar código do repositório:**
```bash
git pull origin main
```

### **4. Rebuild do frontend (aplicar mudanças):**
```bash
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

### **5. Verificar se está funcionando:**
```bash
# Ver logs do frontend
docker logs embarcacoes_frontend_prod --tail=50

# Ver status dos containers
docker-compose -f docker-compose.prod.yml ps
```

---

## 🎯 TODOS OS COMANDOS JUNTOS:

```bash
ssh root@145.223.93.235
cd /opt/embarcacoes
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build frontend
docker logs embarcacoes_frontend_prod --tail=50
```

---

## ✅ O QUE FOI ATUALIZADO:

- ✅ Card "Embarcações" agora é clicável e redireciona para `/vessels`
- ✅ Filtros na tabela "Reservas Recentes":
  - Filtro por Embarcação
  - Filtro por Usuário (apenas admin)
  - Filtro por Data
  - Filtro por Status
- ✅ Botão "Limpar Filtros"

---

## ⏱️ TEMPO ESTIMADO:

- Git pull: ~5-10 segundos
- Rebuild frontend: ~2-5 minutos
- **Total: ~2-5 minutos**

---

**Execute os comandos acima no servidor!** 🚀

