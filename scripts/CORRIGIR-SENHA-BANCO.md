# 🔧 Corrigir Senha do Banco na DATABASE_URL

## ⚠️ PROBLEMA:

A senha do PostgreSQL é: `Embarcacoes2024!@#`

O caractere `@` na senha está sendo interpretado como separador de host na URL, causando o erro "empty host in database URL".

---

## ✅ SOLUÇÃO: Codificar a senha na URL

A senha precisa ser codificada (URL encoding):
- `!` = `%21`
- `@` = `%40`
- `#` = `%23`

Senha codificada: `Embarcacoes2024%21%40%23`

---

## 🔧 OPÇÃO 1: Definir DATABASE_URL completa no .env

No servidor, edite o `.env` e adicione:

```bash
cd /opt/embarcacoes
nano .env
```

Adicione ou modifique a linha:
```
DATABASE_URL=postgresql://embarcacoes:Embarcacoes2024%21%40%23@postgres:5432/embarcacoes_db?schema=public
```

**OU** sem codificar, mas escapando:
```
DATABASE_URL=postgresql://embarcacoes:Embarcacoes2024\!@\#@postgres:5432/embarcacoes_db?schema=public
```

---

## 🔧 OPÇÃO 2: Mudar senha (mais simples)

Se preferir, pode mudar a senha para uma sem caracteres especiais problemáticos:

```bash
cd /opt/embarcacoes
nano .env
```

Mude:
```
POSTGRES_PASSWORD='Embarcacoes2024Novo'
```

Depois precisa atualizar a senha no PostgreSQL também.

---

## 🎯 RECOMENDAÇÃO:

**Opção 1** é mais rápida - apenas adicionar DATABASE_URL completa no .env.

---

## 📋 EXECUTAR:

```bash
cd /opt/embarcacoes
nano .env
```

Adicione esta linha (no final do arquivo):
```
DATABASE_URL=postgresql://embarcacoes:Embarcacoes2024%21%40%23@postgres:5432/embarcacoes_db?schema=public
```

Salve (Ctrl+X, Y, Enter).

Depois, modifique o docker-compose.prod.yml para usar a variável ao invés de construir:

```yaml
DATABASE_URL: ${DATABASE_URL}
```

Ao invés de:
```yaml
DATABASE_URL: postgresql://${POSTGRES_USER}...
```

