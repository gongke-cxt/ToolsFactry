#!/bin/bash
# GKDataToolsFactry Server Setup Script
# Supports: Debian/Ubuntu (apt) and RHEL/CentOS/AlibabaLinux (yum/dnf)

set -e

REMOTE_DIR="/opt/GKDataToolsFactry"
ARCHIVE="/tmp/GKDataToolsFactry-deploy.tar.gz"

echo "========================================"
echo "  GKDataToolsFactry 服务器环境配置"
echo "========================================"

# Detect package manager
if command -v apt-get &> /dev/null; then
    PKG_MGR="apt"
elif command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
elif command -v yum &> /dev/null; then
    PKG_MGR="yum"
else
    echo "ERROR: Cannot detect package manager"
    exit 1
fi
echo "Package manager: ${PKG_MGR}"

# Extract files (skip if already extracted)
if [ -f ${ARCHIVE} ]; then
    echo "[1/5] 解压项目文件..."
    mkdir -p ${REMOTE_DIR}
    cd /
    tar -xzf ${ARCHIVE} -C ${REMOTE_DIR}/
    rm -f ${ARCHIVE}
    echo "解压完成"
else
    echo "[1/5] 项目文件已存在，跳过解压"
fi

# Install Node.js if not present
echo "[2/5] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "正在安装 Node.js 20.x..."
    if [ "$PKG_MGR" = "apt" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    else
        # RHEL/CentOS/AlibabaLinux
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        ${PKG_MGR} install -y nodejs
    fi
fi
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"

# Install yt-dlp
echo "[3/5] 检查 yt-dlp..."
if ! command -v yt-dlp &> /dev/null; then
    echo "正在安装 yt-dlp..."
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
    chmod +x /usr/local/bin/yt-dlp
    # Also install python3 if needed (yt-dlp requires python3)
    if ! command -v python3 &> /dev/null; then
        echo "正在安装 Python3..."
        ${PKG_MGR} install -y python3 2>/dev/null || true
    fi
fi
echo "yt-dlp: $(yt-dlp --version 2>/dev/null || echo 'installed')"

# Install project dependencies
echo "[4/5] 安装项目依赖..."
cd ${REMOTE_DIR}
npm install
npm install -g tsx pm2

# Create downloads directory
mkdir -p ${REMOTE_DIR}/downloads

# Stop existing service and start
echo "[5/5] 启动服务..."
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true

pm2 delete gkdatatoolsfactry 2>/dev/null || true
cd ${REMOTE_DIR}
pm2 start tsx --name gkdatatoolsfactry -- server/index.ts
pm2 save

echo ""
echo "========================================"
echo "  GKDataToolsFactry 部署完成!"
echo "  访问地址: http://$(hostname -I 2>/dev/null | awk '{print \$1}' || echo '123.57.183.98'):3001"
echo ""
echo "  常用命令:"
echo "    pm2 status                   查看服务状态"
echo "    pm2 logs gkdatatoolsfactry   查看日志"
echo "    pm2 restart gkdatatoolsfactry 重启服务"
echo "========================================"
