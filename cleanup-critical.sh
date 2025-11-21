#!/bin/bash
# Script de limpeza crítica do projeto

echo "🧹 INICIANDO LIMPEZA CRÍTICA DO PROJETO..."

# 1. Remover rotas master conflitantes do backend principal
echo "❌ Removendo rotas master conflitantes..."
rm -rf backend/src/routes/master/
rm -rf backend/src/controllers/master/
rm -rf backend/src/middleware/master-auth.ts

# 2. Limpar imports quebrados do server.ts
echo "🔧 Corrigindo imports quebrados..."
# (Será feito manualmente)

# 3. Remover arquivos temporários
echo "🗑️ Removendo arquivos temporários..."
rm -f *.sql
rm -f *.js
rm -f *.md
rm -f test-*.json
rm -f create-*.sql
rm -f add-*.js

# 4. Limpar node_modules desnecessários
echo "📦 Limpando dependências..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

echo "✅ LIMPEZA CONCLUÍDA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Corrigir imports no server.ts"
echo "2. Remover modelos Master do schema principal"
echo "3. Testar sistema após limpeza"
echo "4. Deploy apenas do Master Panel separado"





