# 🔧 Verificar Dashboard Filtros

## ⚠️ PROBLEMA:

Dashboard não tem os filtros (grep retornou 0).

---

## ✅ VERIFICAR:

```bash
cd /opt/embarcacoes

# Ver commits recentes (deve ter commit sobre filtros)
git log --oneline -10 | grep -i filtro

# Ver conteúdo do arquivo Dashboard
grep -n "Embarcação" frontend/src/pages/DashboardPage.tsx | head -5

# Ver se tem useState no arquivo
grep -n "useState" frontend/src/pages/DashboardPage.tsx | head -5

# Ver linha por linha procurando "filters"
grep -n "filters" frontend/src/pages/DashboardPage.tsx

# Ver último commit com filtros
git log --all --oneline --grep="filtro" -5
```

---

## ✅ SE NÃO TIVER, VERIFICAR COMMITS:

```bash
cd /opt/embarcacoes

# Ver todos os commits recentes
git log --oneline -20

# Ver se commit de filtros existe no repositório remoto
git log origin/main --oneline -20 | grep -i filtro

# Ver diferença entre local e remoto
git log HEAD..origin/main --oneline
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
git log --oneline -10
grep -n "useState" frontend/src/pages/DashboardPage.tsx | head -5
git log origin/main --oneline -10
```

