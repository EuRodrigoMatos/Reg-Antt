@echo off
chcp 65001 >nul
echo ========================================
echo  Sistema ANTT - Instalação de Dependências
echo  Pantanal Agrícola Ltda
echo ========================================
echo.
echo [1/2] Instalando dependências do servidor...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo ERRO ao instalar backend. Verifique se o Node.js está instalado.
    pause
    exit /b 1
)
echo.
echo [2/2] Instalando dependências da interface...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo ERRO ao instalar frontend.
    pause
    exit /b 1
)
echo.
echo ========================================
echo  Instalação concluída com sucesso!
echo  Execute o arquivo 2_INICIAR.bat para usar o sistema.
echo ========================================
pause
