# GKDataToolsFactry 服务器部署脚本
# 目标服务器: 123.57.183.98
# 运行方式: 右键 -> 使用PowerShell运行

$server = "123.57.183.98"
$user = "root"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GKDataToolsFactry 服务器部署" -ForegroundColor Cyan
Write-Host "  目标: ${server}" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "运行时需要输入服务器密码（输入不显示）"
Write-Host ""

# Step 1: Upload files to server
Write-Host "[1/3] 上传部署包到服务器..." -ForegroundColor Yellow
scp GKDataToolsFactry-deploy.tar.gz ${user}@${server}:/tmp/GKDataToolsFactry-deploy.tar.gz
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传失败!" -ForegroundColor Red
    exit 1
}
scp setup.sh ${user}@${server}:/tmp/setup.sh
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传setup.sh失败!" -ForegroundColor Red
    exit 1
}
Write-Host "上传完成" -ForegroundColor Green

# Step 2: Run setup script on server
Write-Host "[2/3] 在服务器上运行安装脚本..." -ForegroundColor Yellow
ssh ${user}@${server} "bash /tmp/setup.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "服务器安装脚本执行失败!" -ForegroundColor Red
    exit 1
}
Write-Host "安装完成" -ForegroundColor Green

# Step 3: Verify deployment
Write-Host "[3/3] 验证部署..." -ForegroundColor Yellow
ssh ${user}@${server} "pm2 status"
if ($LASTEXITCODE -ne 0) {
    Write-Host "pm2状态检查失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  部署完成!" -ForegroundColor Green
Write-Host "  访问地址: http://${server}:3001" -ForegroundColor Green
Write-Host ""
Write-Host "  常用命令:" -ForegroundColor Cyan
Write-Host "    ssh ${user}@${server} pm2 status" -ForegroundColor White
Write-Host "    ssh ${user}@${server} pm2 logs gkdatatoolsfactry" -ForegroundColor White
Write-Host "    ssh ${user}@${server} pm2 restart gkdatatoolsfactry" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
