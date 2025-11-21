# 🔧 Verificar Servidor e Repositório

## ⚠️ OBSERVAÇÕES:

1. Servidor diferente: `srv1095801` (antes era `srv1071525`)
2. Repositório Git diferente: `pj-nautica` (deveria ser `inffinity`)
3. Nginx redirecionando HTTP → HTTPS (301)

---

## ✅ VERIFICAR:

```bash
cd /opt/embarcacoes

# Ver repositório Git atual
git remote -v

# Testar acesso HTTP sem seguir redirect
curl -L http://localhost

# OU testar diretamente o IP do servidor
curl -I http://145.223.93.235

# Ver status dos containers
docker ps | grep embarcacoes
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
git remote -v
curl -L http://localhost 2>&1 | head -20
docker ps | grep embarcacoes
```

