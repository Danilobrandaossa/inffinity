# Script para fazer commit do schema.prisma
# SSH já configurado e funcionando! ✅

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🚀 COMMITANDO ALTERAÇÕES" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "📊 Status atual:" -ForegroundColor Yellow
git status --short backend/prisma/schema.prisma

Write-Host ""
Write-Host "📋 Ver alterações do schema:" -ForegroundColor Yellow
git diff --stat backend/prisma/schema.prisma

Write-Host ""
Write-Host "⚠️  Deseja ver todas as alterações? (y/n)" -ForegroundColor Cyan
$verTudo = Read-Host

if ($verTudo -eq "y" -or $verTudo -eq "Y") {
    git diff backend/prisma/schema.prisma | less
}

Write-Host ""
Write-Host "✅ Adicionando schema.prisma..." -ForegroundColor Green
git add backend/prisma/schema.prisma

Write-Host ""
Write-Host "📝 Fazendo commit..." -ForegroundColor Green
git commit -m "feat: adiciona campos de integração Mercado Pago nos models de pagamento"

Write-Host ""
Write-Host "📤 Fazendo push para GitHub..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ COMMIT E PUSH REALIZADOS COM SUCESSO!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Atualizar servidor: ssh root@145.223.93.235 'cd /opt/embarcacoes && git pull origin main'"
    Write-Host "2. Aplicar migrations: ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy'"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push" -ForegroundColor Red
    Write-Host "Verifique a mensagem de erro acima" -ForegroundColor Yellow
}

