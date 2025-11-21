# Script PowerShell para obter overview do servidor
# Uso: .\scripts\get-server-overview.ps1 [-Save]

param(
    [switch]$Save
)

# Configurações do servidor
$SERVER_IP = "145.223.93.235"
$SERVER_USER = "root"
$SERVER_PATH = "/opt/embarcacoes"  # ✅ Caminho confirmado

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 OBTENDO OVERVIEW DO SERVIDOR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor: ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Blue
Write-Host "Caminho: ${SERVER_PATH}" -ForegroundColor Blue
Write-Host ""

# Verificar se SSH está disponível
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH não encontrado. Instale OpenSSH:" -ForegroundColor Red
    Write-Host "   Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
    exit 1
}

# Verificar se o script existe no servidor
Write-Host "Verificando se o script existe no servidor..." -ForegroundColor Yellow
$scriptExists = ssh "${SERVER_USER}@${SERVER_IP}" "test -f ${SERVER_PATH}/scripts/compare-versions.sh" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script encontrado no servidor" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executando overview..." -ForegroundColor Green
    Write-Host ""
    
    # Executar o script no servidor
    $output = ssh "${SERVER_USER}@${SERVER_IP}" "cd ${SERVER_PATH} && ./scripts/compare-versions.sh --server" 2>&1
    $output
    
    # Se --Save foi passado, salvar em arquivo
    if ($Save) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $filename = "overview-server-$timestamp.txt"
        Write-Host ""
        Write-Host "Salvando resultado em $filename..." -ForegroundColor Yellow
        $output | Out-File -FilePath $filename -Encoding UTF8
        Write-Host "✅ Salvo em $filename" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Script não encontrado no servidor" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opção 1: Enviar o script primeiro" -ForegroundColor Blue
    Write-Host "   scp scripts/compare-versions.sh ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/scripts/"
    Write-Host "   ssh ${SERVER_USER}@${SERVER_IP} 'chmod +x ${SERVER_PATH}/scripts/compare-versions.sh'"
    Write-Host ""
    Write-Host "Opção 2: Executar comandos diretamente" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "📋 Git:" -ForegroundColor Green
    ssh "${SERVER_USER}@${SERVER_IP}" "cd ${SERVER_PATH} && git log -1 --oneline && echo 'Branch: ' && git branch --show-current" 2>&1
    Write-Host ""
    
    Write-Host "📦 Versões:" -ForegroundColor Green
    ssh "${SERVER_USER}@${SERVER_IP}" "cd ${SERVER_PATH}/backend && grep '\"version\"' package.json" 2>&1
    Write-Host ""
    
    Write-Host "🐳 Docker:" -ForegroundColor Green
    ssh "${SERVER_USER}@${SERVER_IP}" "cd ${SERVER_PATH} && docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo 'Docker não disponível'" 2>&1
}

Write-Host ""

