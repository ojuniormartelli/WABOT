// WaBot - Atualizador autônomo v2 (inclui dados + backup + testes)
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
  'start-wabot.bat', 'stop-wabot.bat', 'iniciar.bat', 'atualizar.bat', 'atualizar.js',
  'app/server.js',
  'app/renderer/app.js', 'app/renderer/api.js', 'app/renderer/index.html', 'app/renderer/style.css',
  'app/test_regressao.js',
  'app/data/config.example.json', 'app/data/dados_negocio.example.json', 'app/data/credentials.example.json',
  'scripts/install.sh', 'scripts/update.sh', 'scripts/rollback.sh',
];

var DATA_FILES = [
  'app/data/config.json',
  'app/data/dados_negocio.json',
  'app/data/credentials.json',
  'app/data/conversas.json',
  'app/data/aprendizados.json',
  'app/data/regras.json',
  'app/data/ignorados.json',
  'app/data/nao_sei.json',
];

function mergeNovosCampos(template, local) {
  if (!template || typeof template !== 'object') return local;
  if (!local || typeof local !== 'object') return template;
  if (Array.isArray(template) || Array.isArray(local)) return local;
  for (var k in template) {
    if (!(k in local)) {
      local[k] = template[k];
    } else if (typeof template[k] === 'object' && template[k] !== null && !Array.isArray(template[k])) {
      local[k] = mergeNovosCampos(template[k], local[k]);
    }
  }
  return local;
}

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
  console.log('  WaBot - Atualizador v2');
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

  // 2. Backup dos dados existentes
  console.log('  Fazendo backup dos dados...');
  var backupDir = path.join(REPO_DIR, 'backups', new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(backupDir, { recursive: true });
  for (var bf = 0; bf < DATA_FILES.length; bf++) {
    var src = path.join(REPO_DIR, DATA_FILES[bf]);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(backupDir, path.basename(DATA_FILES[bf])));
    }
  }
  console.log('  Backup: backups/' + path.basename(backupDir) + '/');
  console.log('');

  // 3. Baixar arquivos
  var baseUrl = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH;
  var ok = 0, fail = 0;
  var jsonErrors = [];

  for (var i = 0; i < FILES.length; i++) {
    var file = FILES[i];
    try {
      var content = await httpsGet(baseUrl + '/' + file);
      var dest = path.join(REPO_DIR, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });

      // Validar JSON antes de sobrescrever dados
      if (file.indexOf('app/data/') === 0 && file !== 'app/data/credentials.example.json' && file.indexOf('.json') > 0) {
        try { JSON.parse(content); } catch (je) {
          jsonErrors.push(file);
          console.log('  \u2717 ' + file + ' (JSON inválido no repositório)');
          fail++;
          continue;
        }
      }

      fs.writeFileSync(dest, content, 'utf8');
      console.log('  \u2713 ' + file);
      ok++;
    } catch (e) {
      console.log('  \u2717 ' + file + ' (' + e.message + ')');
      fail++;
    }
  }

  // 4. Mesclar campos novos dos templates nos arquivos locais
  var mergePairs = [
    { templ: 'app/data/config.example.json', local: 'app/data/config.json' },
    { templ: 'app/data/dados_negocio.example.json', local: 'app/data/dados_negocio.json' },
  ];
  for (var mi = 0; mi < mergePairs.length; mi++) {
    var templPath = path.join(REPO_DIR, mergePairs[mi].templ);
    var localPath = path.join(REPO_DIR, mergePairs[mi].local);
    if (fs.existsSync(templPath) && fs.existsSync(localPath)) {
      try {
        var templObj = JSON.parse(fs.readFileSync(templPath, 'utf8'));
        var localObj = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        var merged = mergeNovosCampos(templObj, localObj);
        fs.writeFileSync(localPath, JSON.stringify(merged, null, 2), 'utf8');
        console.log('  \u2713 ' + mergePairs[mi].local + ' (campos novos mesclados)');
      } catch (me) {
        console.log('  \u2717 ' + mergePairs[mi].local + ' (erro na mesclagem: ' + me.message + ')');
      }
    }
  }

  if (jsonErrors.length > 0) {
    console.log('');
    console.log('  AVISO: JSON inválido no repositório para: ' + jsonErrors.join(', '));
  }

  // 5. Salvar versão local
  if (shaData) {
    try {
      var commit = JSON.parse(shaData);
      fs.writeFileSync(path.join(REPO_DIR, '_version.json'), JSON.stringify({ sha: commit.sha, updatedAt: new Date().toISOString() }, null, 2));
    } catch(e) {}
  }

  console.log('');
  console.log('  Baixados: ' + ok + ' OK, ' + fail + ' falha(s)');

  // 6. npm install
  console.log('');
  console.log('  Instalando dependências (npm install)...');
  try {
    var npmOut = execSync('npm install 2>&1', { cwd: REPO_DIR, timeout: 120000 }).toString();
    console.log('  ' + npmOut.trim().split('\n').pop());
  } catch (e) {
    console.log('  Aviso: ' + e.message);
  }

  // 7. Validar arquivos JSON de dados
  console.log('');
  console.log('  Validando arquivos de dados...');
  var validacaoOk = true;
  var jsonsParaValidar = ['app/data/config.json', 'app/data/dados_negocio.json', 'app/data/credentials.json'];
  for (var vf = 0; vf < jsonsParaValidar.length; vf++) {
    var jsonPath = path.join(REPO_DIR, jsonsParaValidar[vf]);
    if (fs.existsSync(jsonPath)) {
      try {
        JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (e) {
        console.log('  \u2717 ' + jsonsParaValidar[vf] + ' — JSON inválido!');
        validacaoOk = false;
      }
    }
  }
  if (validacaoOk) {
    console.log('  \u2713 Todos os JSONs válidos');
  } else {
    console.log('  \u2717 Erro: dados corrompidos! Restaure com: cp backups/' + path.basename(backupDir) + '/*.json app/data/');
    console.log('  O servidor NÃO será reiniciado devido a dados inválidos.');
    process.exit(1);
  }

  // 8. Rodar testes de regressão
  console.log('');
  console.log('  Rodando testes de regressão...');
  var testOk = true;
  try {
    var testOut = execSync('node app/test_regressao.js 2>&1', { cwd: REPO_DIR, timeout: 30000 }).toString();
    console.log(testOut.trim().split('\n').slice(-2).join('\n'));
    testOk = testOut.indexOf('FALHA') === -1;
  } catch (e) {
    testOk = false;
    console.log('  Erro nos testes: ' + e.message);
  }

  if (!testOk) {
    console.log('');
    console.log('  \u2717 Testes falharam! Restaurando backup...');
    for (var rf = 0; rf < DATA_FILES.length; rf++) {
      var backupFile = path.join(backupDir, path.basename(DATA_FILES[rf]));
      var origFile = path.join(REPO_DIR, DATA_FILES[rf]);
      if (fs.existsSync(backupFile)) {
        fs.copyFileSync(backupFile, origFile);
      }
    }
    console.log('  Backup restaurado. O servidor NÃO será reiniciado.');
    console.log('  Execute: node app/test_regressao.js para diagnóstico.');
    process.exit(1);
  }

  // 9. Limpar lixo de restarts anteriores
  try { fs.unlinkSync(path.join(REPO_DIR, '_restart.js')); } catch(e) {}
  try { fs.unlinkSync(path.join(REPO_DIR, '_restart.log')); } catch(e) {}

  console.log('');
  console.log('  \u2713 Atualização concluída!');

  // 10. Iniciar servidor (mata processo antigo primeiro)
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
