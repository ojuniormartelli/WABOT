// WaBot - Atualizador autônomo (não precisa de Git)
// Uso: node atualizar.js
// Ou: clique duplo (se Node.js estiver associado a .js)

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

var REPO = 'ojuniormartelli/WABOT';
var BRANCH = 'main';
var REPO_DIR = __dirname;

var FILES = [
  'package.json',
  'start-wabot.bat',
  'stop-wabot.bat',
  'iniciar.bat',
  'atualizar.bat',
  'atualizar.js',
  'app/server.js',
  'app/renderer/app.js',
  'app/renderer/api.js',
  'app/renderer/index.html',
  'app/renderer/style.css',
];

function httpsGet(url) {
  return new Promise(function(resolve, reject) {
    var req = https.get(url, { headers: { 'User-Agent': 'WABOT' } }, function(res) {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' - ' + url));
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve(d); });
    });
    req.on('error', reject);
    req.setTimeout(30000, function() { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  console.log('');
  console.log('  WaBot - Atualizador');
  console.log('  ===========================');
  console.log('');

  // 1. Buscar SHA do último commit
  console.log('  Verificando atualizações...');
  var shaData;
  try {
    shaData = await httpsGet('https://api.github.com/repos/' + REPO + '/commits/' + BRANCH);
    var commit = JSON.parse(shaData);
    console.log('  Último commit: ' + commit.sha.substring(0, 7) + ' - ' + commit.commit.message.split('\n')[0]);
  } catch (e) {
    console.log('  Erro ao verificar: ' + e.message);
  }
  console.log('');

  // 2. Baixar arquivos
  var baseUrl = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH;
  var ok = 0, fail = 0;

  for (var i = 0; i < FILES.length; i++) {
    var file = FILES[i];
    try {
      var content = await httpsGet(baseUrl + '/' + file);
      var dest = path.join(REPO_DIR, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content, 'utf8');
      console.log('  \u2713 ' + file);
      ok++;
    } catch (e) {
      console.log('  \u2717 ' + file + ' (' + e.message + ')');
      fail++;
    }
  }

  // 3. Salvar versão local
  if (shaData) {
    try {
      var commit = JSON.parse(shaData);
      fs.writeFileSync(path.join(REPO_DIR, '_version.json'), JSON.stringify({ sha: commit.sha, updatedAt: new Date().toISOString() }, null, 2));
    } catch(e) {}
  }

  console.log('');
  console.log('  Baixados: ' + ok + ' OK, ' + fail + ' falha(s)');

  // 4. npm install
  console.log('');
  console.log('  Instalando dependências (npm install)...');
  try {
    var npmOut = execSync('npm install 2>&1', { cwd: REPO_DIR, timeout: 120000 }).toString();
    console.log('  ' + npmOut.trim().split('\n').pop());
  } catch (e) {
    console.log('  Aviso: ' + e.message);
  }

  // 5. Limpar lixo de restarts anteriores
  try { fs.unlinkSync(path.join(REPO_DIR, '_restart.js')); } catch(e) {}
  try { fs.unlinkSync(path.join(REPO_DIR, '_restart.log')); } catch(e) {}

  console.log('');
  console.log('  \u2713 Atualização concluída!');

  // 6. Iniciar servidor (mata processo antigo primeiro)
  var isWin = process.platform === 'win32';

  if (isWin) {
    try { execSync('taskkill /f /im node.exe >nul 2>&1'); } catch(e) {}
    try {
      execSync('powershell -Command "Start-Process -WindowStyle Hidden -FilePath node -ArgumentList \'' + path.join(REPO_DIR, 'app', 'server.js') + '\'"');
      console.log('  Servidor reiniciado em segundo plano!');
    } catch(e) {
      console.log('  Erro ao iniciar servidor: ' + e.message);
    }
  } else {
    try { execSync('pkill -f "node app/server.js" 2>/dev/null'); } catch(e) {}
    var child = require('child_process').spawn('node', [path.join(REPO_DIR, 'app', 'server.js')], {
      detached: true,
      stdio: 'ignore',
      cwd: REPO_DIR,
    });
    child.unref();
    console.log('  Servidor reiniciado!');
  }

  console.log('');
  console.log('  Acesse: http://localhost:3001');
  console.log('');

  // Pausa no Windows (para duplo clique ver o resultado)
  if (isWin) {
    console.log('  Pressione qualquer tecla para fechar...');
    execSync('pause >nul', { cwd: REPO_DIR });
  }
}

main().catch(function(e) {
  console.error('  Erro fatal: ' + e.message);
  if (process.platform === 'win32') {
    console.log('  Pressione qualquer tecla para fechar...');
    execSync('pause >nul');
  }
  process.exit(1);
});
