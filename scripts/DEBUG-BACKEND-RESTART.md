# 🔍 Debug: Backend em Loop de Restart

## ⚠️ PROBLEMA:

O container `embarcacoes_backend_prod` está criado mas **restartando continuamente** (crashando).

---

## 🔍 DIAGNÓSTICO:

Precisamos ver os logs para entender por que está crashando:

```bash
cd /opt/embarcacoes

# Ver logs do backend (últimas 50 linhas)
docker logs embarcacoes_backend_prod --tail=50

# Ver logs em tempo real
docker logs embarcacoes_backend_prod -f
```

---

## 🔧 POSSÍVEIS CAUSAS:

1. **Erro ao conectar no banco** - DATABASE_URL incorreta
2. **Erro do Prisma** - Ainda problema com OpenSSL
3. **Erro no código** - Algum erro de sintaxe ou import
4. **Falta de permissões** - Problema com usuário nodejs

---

## ✅ PRÓXIMOS PASSOS:

1. Ver logs para identificar o erro
2. Corrigir o problema
3. Reiniciar o container
4. Aplicar schema

---

**Execute primeiro:**
```bash
docker logs embarcacoes_backend_prod --tail=50
```

Me mostre o resultado para identificar o problema!

