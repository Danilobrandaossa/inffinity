# Script PowerShell para comparar versões local vs servidor
# Uso: .\scripts\compare-versions.ps1

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 OVERVIEW DO PROJETO - COMPARAÇÃO DE VERSÕES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. INFORMAÇÕES DO SISTEMA
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  1. INFORMAÇÕES DO SISTEMA                           ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Write-Host "📍 Localização:" -ForegroundColor Green
Write-Host "   Ambiente: WINDOWS (Local)"
Write-Host "   Hostname: $env:COMPUTERNAME"
Write-Host "   Diretório: $(Get-Location)"
Write-Host ""

Write-Host "📦 Versões do Sistema:" -ForegroundColor Green
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   Node.js: $nodeVersion"
}
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "   npm: $npmVersion"
}
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "   Git: $gitVersion"
}
Write-Host ""

# 2. GIT
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  2. INFORMAÇÕES DO GIT                               ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

if (Test-Path .git) {
    Write-Host "🌿 Branch atual:" -ForegroundColor Green
    try {
        $branch = git branch --show-current 2>$null
        Write-Host "   $branch"
    } catch {
        Write-Host "   N/A"
    }
    Write-Host ""
    
    Write-Host "📝 Último commit:" -ForegroundColor Green
    try {
        $commitHash = git rev-parse HEAD 2>$null
        $commitMsg = git log -1 --pretty=%B 2>$null | Select-Object -First 1
        $commitDate = git log -1 --format=%cd --date=short 2>$null
        Write-Host "   Hash: $($commitHash.Substring(0, 8))"
        Write-Host "   Data: $commitDate"
        Write-Host "   Mensagem: $($commitMsg.Substring(0, [Math]::Min(60, $commitMsg.Length)))..."
    } catch {
        Write-Host "   Erro ao obter informações do Git"
    }
    Write-Host ""
    
    Write-Host "📊 Status:" -ForegroundColor Green
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        Write-Host "   ⚠️  Há alterações não commitadas"
        $gitStatus | Select-Object -First 5 | ForEach-Object { Write-Host "   $_" }
    } else {
        Write-Host "   ✅ Working directory limpo"
    }
} else {
    Write-Host "   ❌ Não é um repositório git ou .git não encontrado" -ForegroundColor Red
}
Write-Host ""

# 3. VERSÕES DOS PACOTES
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  3. VERSÕES DOS PACOTES                              ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

if (Test-Path backend/package.json) {
    Write-Host "📦 Backend:" -ForegroundColor Green
    $backendPkg = Get-Content backend/package.json | ConvertFrom-Json
    Write-Host "   Versão: $($backendPkg.version)"
    Write-Host "   Nome: $($backendPkg.name)"
}
Write-Host ""

if (Test-Path frontend/package.json) {
    Write-Host "📦 Frontend:" -ForegroundColor Green
    $frontendPkg = Get-Content frontend/package.json | ConvertFrom-Json
    Write-Host "   Versão: $($frontendPkg.version)"
    Write-Host "   Nome: $($frontendPkg.name)"
}
Write-Host ""

# 4. PRISMA
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  4. PRISMA & BANCO DE DADOS                          ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

if (Test-Path backend/prisma/schema.prisma) {
    Write-Host "📋 Schema do Prisma:" -ForegroundColor Green
    $schemaContent = Get-Content backend/prisma/schema.prisma -Raw
    $schemaHash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($schemaContent)) | ForEach-Object { $_.ToString("x2") }
    $schemaHashShort = $schemaHash.Substring(0, 16)
    Write-Host "   Hash: $schemaHashShort..."
    
    $modelCount = ([regex]::Matches($schemaContent, '^model ', [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
    Write-Host "   Modelos: $modelCount"
    Write-Host ""
    
    Write-Host "🔄 Migrations:" -ForegroundColor Green
    if (Test-Path backend/prisma/migrations) {
        $migrations = Get-ChildItem backend/prisma/migrations -Directory
        Write-Host "   Total de migrations: $($migrations.Count)"
        if ($migrations.Count -gt 0) {
            $lastMigration = $migrations | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            Write-Host "   Última migration: $($lastMigration.Name)"
        }
    } else {
        Write-Host "   ⚠️  Diretório de migrations não encontrado" -ForegroundColor Yellow
    }
}
Write-Host ""

# 5. ARQUIVOS IMPORTANTES
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  5. ARQUIVOS IMPORTANTES                             ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Write-Host "📄 Arquivos de configuração:" -ForegroundColor Green
@(
    "backend\.env",
    "frontend\.env",
    "docker-compose.yml",
    "docker-compose.prod.yml",
    "backend\prisma\schema.prisma"
) | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "   ✅ $_ existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $_ não encontrado" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "📁 Estrutura de pastas:" -ForegroundColor Green
$checks = @(
    @{Path="backend\src"; Name="backend/src/"},
    @{Path="frontend\src"; Name="frontend/src/"},
    @{Path="backend\src\routes"; Name="backend/src/routes/"},
    @{Path="backend\src\controllers"; Name="backend/src/controllers/"},
    @{Path="frontend\src\pages"; Name="frontend/src/pages/"}
)

foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        if ($check.Path -match "routes|controllers|pages") {
            $fileCount = (Get-ChildItem $check.Path -Filter *.ts* -File).Count
            Write-Host "   ✅ $($check.Name) ($fileCount arquivos)" -ForegroundColor Green
        } else {
            Write-Host "   ✅ $($check.Name)" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ $($check.Name) não encontrado" -ForegroundColor Red
    }
}
Write-Host ""

# Resumo
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📋 RESUMO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Para comparar com servidor:" -ForegroundColor Green
Write-Host "   1. Execute este script localmente: .\scripts\compare-versions.ps1"
Write-Host "   2. No servidor (Linux): ssh user@server './scripts/compare-versions.sh --server'"
Write-Host "   3. Compare os outputs, especialmente:"
Write-Host "      - Hash do commit Git"
Write-Host "      - Versões dos pacotes"
Write-Host "      - Hash do schema Prisma"
Write-Host "      - Migrations aplicadas"
Write-Host ""
Write-Host "📊 Para exportar para arquivo:" -ForegroundColor Green
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "   .\scripts\compare-versions.ps1 | Out-File -FilePath overview-$timestamp.txt"
Write-Host ""

