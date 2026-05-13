@echo off
chcp 65001 >nul
echo ========================================
echo  Sistema ANTT - Produtos Perigosos
echo  Pantanal Agrícola Ltda
echo  Ref.: Resolução ANTT 5.998/2022
echo ========================================
echo.
echo Iniciando servidor (backend)...
start "ANTT Backend" cmd /k "cd /d "%~dp0backend" && npm start"

echo Aguardando servidor inicializar...
timeout /t 3 /nobreak >nul

echo Iniciando interface (frontend)...
start "ANTT Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Aguardando interface carregar...
timeout /t 4 /nobreak >nul

echo Abrindo no navegador...
start "" "http://localhost:5173"

echo.
echo ========================================
echo  Sistema iniciado!
echo  Acesse: http://localhost:5173
echo  Para encerrar: feche as janelas do terminal
echo ========================================
