# Script PowerShell para descobrir onde está o projeto no servidor
# Uso: .\scripts\find-server-path.ps1

# Configurações do servidor
$SERVER_IP = "145.223.93.235"
$SERVER_USER = "root"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 PROCURANDO PROJETO NO SERVIDOR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor: ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Blue
Write-Host ""

# Verificar se SSH está disponível
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH não encontrado. Instale OpenSSH:" -ForegroundColor Red
    Write-Host "   Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
    exit 1
}

# Verificar conectividade
Write-Host "1. Verificando conectividade..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $SERVER_IP -Count 1 -Quiet -ErrorAction SilentlyContinue
if (-not $pingResult) {
    Write-Host "❌ Não foi possível conectar ao servidor" -ForegroundColor Red
    Write-Host "   Verifique se o IP está correto: $SERVER_IP" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Servidor alcançável" -ForegroundColor Green
Write-Host ""

# Procurar em locais comuns
Write-Host "2. Procurando projeto em locais comuns..." -ForegroundColor Yellow
Write-Host ""

$pathsToCheck = @(
    "/opt/embarcacoes",
    "/home/root/embarcacoes",
    "/home/root/Inffinity",
    "/var/www/embarcacoes",
    "/var/www/html",
    "/root/embarcacoes",
    "/root/Inffinity",
    "/opt/inffinity"
)

$foundPaths = @()

foreach ($path in $pathsToCheck) {
    Write-Host -NoNewline "   Verificando $path... "
    $result = ssh -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_IP}" "test -d $path 2>/dev/null && test -f $path/backend/package.json" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ENCONTRADO!" -ForegroundColor Green
        $foundPaths += $path
    } else {
        Write-Host "❌" -ForegroundColor Red
    }
}

Write-Host ""

# Se não encontrou, procurar por arquivos específicos
if ($foundPaths.Count -eq 0) {
    Write-Host "3. Procurando em outros locais..." -ForegroundColor Yellow
    Write-Host "   (Pode levar alguns segundos...)" -ForegroundColor Gray
    Write-Host ""
    
    # Procurar por package.json do backend
    $searchResult = ssh -o ConnectTimeout=10 "${SERVER_USER}@${SERVER_IP}" "find /opt /home /var/www /root -name 'package.json' -path '*/backend/*' 2>/dev/null | head -5" 2>&1
    
    if ($searchResult -and $searchResult -notmatch "Permission denied|No such file") {
        Write-Host "Possíveis localizações encontradas:" -ForegroundColor Green
        $searchResult | ForEach-Object {
            if ($_ -match "^(/.*)/backend/package\.json$") {
                $dir = $matches[1]
                Write-Host "   → $dir" -ForegroundColor Blue
                $foundPaths += $dir
            }
        }
    } else {
        Write-Host "⚠️  Não encontrado nos locais padrão" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Mostrar resultados
if ($foundPaths.Count -gt 0) {
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ PROJETO ENCONTRADO!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    # Usar o primeiro caminho encontrado
    $projectPath = $foundPaths[0]
    Write-Host "Caminho principal: $projectPath" -ForegroundColor Blue
    Write-Host ""
    
    # Verificar estrutura
    Write-Host "Verificando estrutura do projeto..." -ForegroundColor Yellow
    Write-Host ""
    
    $structure = ssh "${SERVER_USER}@${SERVER_IP}" "cd $projectPath && echo '📁 Estrutura:' && ls -la 2>/dev/null | Select-String -Pattern 'backend|frontend|docker-compose' && echo '' && echo '📦 Backend:' && if (Test-Path backend) { Write-Host '  ✅ backend/' } else { Write-Host '  ❌ backend/ não encontrado' } && if (Test-Path backend/package.json) { Write-Host '  ✅ backend/package.json' } else { Write-Host '  ❌ backend/package.json não encontrado' }" 2>&1
    
    if ($structure) {
        $structure
    } else {
        # Fallback: verificar manualmente
        $hasBackend = ssh "${SERVER_USER}@${SERVER_IP}" "test -d $projectPath/backend && echo 'yes' || echo 'no'" 2>&1
        $hasFrontend = ssh "${SERVER_USER}@${SERVER_IP}" "test -d $projectPath/frontend && echo 'yes' || echo 'no'" 2>&1
        
        Write-Host "📦 Backend:" -ForegroundColor Green
        if ($hasBackend -eq "yes") {
            Write-Host "  ✅ backend/" -ForegroundColor Green
        } else {
            Write-Host "  ❌ backend/ não encontrado" -ForegroundColor Red
        }
        
        Write-Host "📦 Frontend:" -ForegroundColor Green
        if ($hasFrontend -eq "yes") {
            Write-Host "  ✅ frontend/" -ForegroundColor Green
        } else {
            Write-Host "  ❌ frontend/ não encontrado" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  📋 COMANDOS PRONTOS PARA USAR" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Overview do servidor:" -ForegroundColor Blue
    Write-Host "ssh ${SERVER_USER}@${SERVER_IP} 'cd $projectPath && [ -f ./scripts/compare-versions.sh ] && ./scripts/compare-versions.sh --server || echo \"Script não encontrado\"'"
    Write-Host ""
    Write-Host "Ver Git:" -ForegroundColor Blue
    Write-Host "ssh ${SERVER_USER}@${SERVER_IP} 'cd $projectPath && git log -1 --oneline'"
    Write-Host ""
    Write-Host "Ver containers Docker:" -ForegroundColor Blue
    Write-Host "ssh ${SERVER_USER}@${SERVER_IP} 'cd $projectPath && docker-compose -f docker-compose.prod.yml ps 2>/dev/null || docker-compose ps'"
    Write-Host ""
    
    # Salvar o caminho encontrado
    $projectPath | Out-File -FilePath ".server-path.txt" -Encoding UTF8 -NoNewline
    Write-Host "✅ Caminho salvo em .server-path.txt" -ForegroundColor Green
    Write-Host ""
    
    # Atualizar scripts com o caminho encontrado
    Write-Host "💡 Dica: O caminho '$projectPath' foi salvo e pode ser usado pelos outros scripts" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ❌ PROJETO NÃO ENCONTRADO" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verificar se o projeto está no servidor"
    Write-Host "2. Verificar permissões de acesso SSH"
    Write-Host "3. Conectar manualmente e procurar:"
    Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}"
    Write-Host "   find / -name 'package.json' -path '*/backend/*' 2>/dev/null"
    Write-Host ""
}

