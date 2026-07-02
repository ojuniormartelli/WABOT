# WaBot — Inno Setup Installer

## Pré-requisitos

- [Inno Setup 6+](https://jrsoftware.org/isinfo.php) (Windows)
- Opcional: arquivo `assets/icon.ico` para ícone personalizado

## Como compilar o instalador

1. Abra o Inno Setup
2. File → Open → `installer/wabot-installer.iss`
3. Build → Compile (Ctrl+F9)

O instalador será gerado em `WaBot/WaBot-Setup-1.0.0.exe`.

## Estrutura

```
installer/
├── assets/            # Ícones e recursos visuais
├── wabot-installer.iss  # Script Inno Setup
└── readme.md          # Este arquivo
```

## Gerar ícone .ico (opcional)

No macOS: converta uma imagem 256×256 PNG para ICO:

```sh
sips -s format icns icon_256.png --out icon.icns  # macOS
```

No Windows: use [icoconvert.com](https://icoconvert.com) ou o Resource Hacker.

## O que o instalador faz

1. Copia todos os arquivos do WaBot para `C:\WaBot\`
2. Cria atalhos no Menu Iniciar e na Área de Trabalho
3. Opcional: adiciona à inicialização do Windows
4. Opcional: executa `setup-wabot.bat` ao finalizar
5. Remove arquivos de dados ao desinstalar (mensagens, aprendizado, logs)
