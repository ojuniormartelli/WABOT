; WaBot - Inno Setup Installer
; Build with Inno Setup 6+ (https://jrsoftware.org/isinfo.php)

#define MyAppName "WaBot"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "WaBot"
#define MyAppURL "https://github.com/ojuniormartelli/WABOT"
#define MyAppExeName "start-wabot.bat"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\WaBot
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=commandline
OutputDir=..\
OutputBaseFilename=WaBot-Setup-{#MyAppVersion}
SetupIconFile=assets\icon.ico
UninstallDisplayIcon={app}\installer\assets\icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
DisableProgramGroupPage=yes
DisableWelcomePage=no
SetupLogging=yes

[Languages]
Name: "portuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na &Área de Trabalho"; GroupDescription: "Atalhos:"; Flags: checkedonce
Name: "startup"; Description: "Iniciar &automaticamente ao ligar o computador"; GroupDescription: "Inicialização:"; Flags: checkedonce
Name: "openafter"; Description: "Abrir &WaBot após a instalação"; GroupDescription: "Ação pós-instalação:"; Flags: checkedonce

[Files]
; App core
Source: "..\app\server.js"; DestDir: "{app}\app"; Flags: ignoreversion
Source: "..\app\package.json"; DestDir: "{app}\app"; Flags: ignoreversion
Source: "..\app\package-lock.json"; DestDir: "{app}\app"; Flags: ignoreversion
Source: "..\app\Dockerfile"; DestDir: "{app}\app"; Flags: ignoreversion

; App modules
Source: "..\app\node_modules\*"; DestDir: "{app}\app\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs

; Docker
Source: "..\app\docker\*"; DestDir: "{app}\app\docker"; Flags: ignoreversion recursesubdirs createallsubdirs

; Renderer (frontend)
Source: "..\app\renderer\*"; DestDir: "{app}\app\renderer"; Flags: ignoreversion recursesubdirs createallsubdirs

; Site (landing page Vercel)
Source: "..\site\*"; DestDir: "{app}\site"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\site\api\*"; DestDir: "{app}\site\api"; Flags: ignoreversion recursesubdirs createallsubdirs

; Bat scripts
Source: "..\setup-wabot.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\start-wabot.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\stop-wabot.bat"; DestDir: "{app}"; Flags: ignoreversion

; Root package.json
Source: "..\package.json"; DestDir: "{app}"; Flags: ignoreversion

; Instalador assets
Source: "assets\*"; DestDir: "{app}\installer\assets"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\start-wabot.bat"; WorkingDir: "{app}"
Name: "{group}\Painel WaBot"; Filename: "http://localhost:3001"; IconFilename: "{app}\installer\assets\icon.ico"
Name: "{group}\Desinstalar {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\start-wabot.bat"; WorkingDir: "{app}"; Tasks: desktopicon
Name: "{commonstartup}\{#MyAppName}"; Filename: "{app}\start-wabot.bat"; WorkingDir: "{app}"; Tasks: startup

[Run]
Filename: "{app}\setup-wabot.bat"; WorkingDir: "{app}"; StatusMsg: "Executando configuração inicial..."; Flags: runascurrentuser; Tasks: openafter
Filename: "http://localhost:3001"; Flags: shellexec; Description: "Abrir WaBot"; Tasks: openafter

[UninstallRun]
Filename: "{app}\stop-wabot.bat"; WorkingDir: "{app}"; Flags: runascurrentuser runhidden

[UninstallDelete]
Type: filesandordirs; Name: "{app}\app\node_modules"
Type: filesandordirs; Name: "{app}\app\data\mensagens"
Type: files; Name: "{app}\app\data\learn.json"
Type: files; Name: "{app}\app\data\knowledge.json"
Type: files; Name: "{app}\app\data\nao_sei.json"
Type: files; Name: "{app}\app\data\conversas.json"
Type: files; Name: "{app}\npm-debug.log"
Type: files; Name: "{app}\wabot.log"

[Code]
function InitializeSetup: Boolean;
var
  ResultCode: Integer;
begin
  Result := True;

  if not RegKeyExists(HKLM, 'SOFTWARE\Node.js') then
  begin
    if SuppressibleMsgBox(
      'Node.js não foi encontrado no sistema.'#13#13'Deseja continuar mesmo assim?'#13#13
      '(Você precisará instalar Node.js manualmente em: https://nodejs.org)',
      mbConfirmation, MB_YESNO, IDYES) = IDNO then
    begin
      Result := False;
      Exit;
    end;
  end;

  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    if not DirExists(ExpandConstant('{app}\app\data')) then
      CreateDir(ExpandConstant('{app}\app\data'));
  end;
end;
