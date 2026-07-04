const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const { DockerManager } = require('./docker/manager');

const PORT = process.env.PORT || 3001;
const app = express();
let dockerManager;

// ─── Timezone: usar do config.json se disponível ──
try {
  var cfgTz = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/config.json'), 'utf-8'));
  if (cfgTz && cfgTz.timezone) {
    process.env.TZ = cfgTz.timezone;
    console.log('[timezone] Configurado:', cfgTz.timezone);
  }
} catch(e) {
  // Se não conseguir ler, mantém TZ atual
}

// ─── SSE: clientes conectados ──
var sseClients = [];

function sseBroadcast(event, data) {
  var payload = 'event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n';
  sseClients = sseClients.filter(function(c) {
    try {
      c.res.write(payload);
      return true;
    } catch(e) {
      return false;
    }
  });
}

app.get('/api/events', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  var client = { id: Date.now(), res: res };
  sseClients.push(client);
  req.on('close', function() { sseClients = sseClients.filter(function(c) { return c.id !== client.id; }); });
});

app.use(express.json({ limit: '50mb' }));

// ─── Renderer: serve local ──
var RENDERER_DIR = path.join(__dirname, 'renderer');

var RENDERER_FILES = {
  'api.js': 'application/javascript',
  'app.js': 'application/javascript',
  'style.css': 'text/css',
};

for (var fileName in RENDERER_FILES) {
  (function(file, mime) {
    app.get('/' + file, function(req, res) {
      res.sendFile(path.join(RENDERER_DIR, file), {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    });
  })(fileName, RENDERER_FILES[fileName]);
}

app.get('/', function(req, res) {
  res.sendFile(path.join(RENDERER_DIR, 'index.html'), {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  });
});

// CORS para Landing Page na Vercel
app.use(function(req, res, next) {
  var origin = req.headers.origin;
  if (origin && (origin.indexOf('.vercel.app') >= 0 || origin.indexOf('localhost') >= 0)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ─── Helpers ───────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data');
const MSG_DIR = path.join(DATA_DIR, 'mensagens');

// Garantir que pastas existam
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MSG_DIR)) fs.mkdirSync(MSG_DIR, { recursive: true });

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  } catch (e) { return null; }
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

function salvarMensagemLocal(telefone, texto, deBot, origem) {
  if (!telefone || !texto) return;
  try {
    var arquivo = path.join(MSG_DIR, telefone + '.json');
    var msgs = [];
    try { msgs = JSON.parse(fs.readFileSync(arquivo, 'utf-8') || '[]'); } catch(e) {}
    if (!Array.isArray(msgs)) msgs = [];
    // Dedup: se a última mensagem for igual e tiver menos de 10s, ignora
    var ultima = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    if (ultima && ultima.texto === texto && ultima.de_bot === (deBot || false) && (Date.now() - (ultima.timestamp || 0)) < 10000) {
      return;
    }
    msgs.push({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
      texto: texto,
      de_bot: deBot || false,
      origem: origem || (deBot ? 'bot' : 'cliente'),
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    });
    fs.writeFileSync(arquivo, JSON.stringify(msgs, null, 2), 'utf-8');
  } catch(e) {
    console.error('[salvarMensagemLocal] erro:', e.message);
  }
}

function getCreds() {
  return readJson('credentials.json') || { evolution: {}, gemini: {} };
}

function limparJid(jid) {
  if (!jid || typeof jid !== 'string') return '';
  return jid.replace(/@s\.whatsapp\.net/g, '').replace(/@c\.us/g, '').split('@')[0];
}

function formatTelefone(numero) {
  if (!numero || numero.length < 2) return numero || 'Contato';
  var digits = numero.replace(/\D/g, '');
  if (digits.length === 13) return '+55 (' + digits.substring(2, 4) + ') ' + digits.substring(4, 9) + '-' + digits.substring(9);
  if (digits.length === 12) return '+55 (' + digits.substring(2, 4) + ') ' + digits.substring(4, 8) + '-' + digits.substring(8);
  if (digits.length === 11) return '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 7) + '-' + digits.substring(7);
  if (digits.length === 10) return '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 6) + '-' + digits.substring(6);
  return numero;
}

function ehNumeroTelefone(valor) {
  if (!valor || typeof valor !== 'string') return false;
  // Remove apenas caracteres de formatação comuns de telefone
  var limpo = valor.replace(/[\s\+\(\)\-\.]/g, '');
  // Se sobrou algo que não é dígito, não é telefone de verdade
  if (/[^\d]/.test(limpo)) return false;
  var digits = valor.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function evolutionRequest(method, pathUrl, bodyData) {
  return new Promise((resolve) => {
    const creds = getCreds();
    const evoKey = creds.evolution?.api_key || 'wabot_evokey_2026';
    const evoBase = creds.evolution?.base_url || 'http://localhost:8081';
    let urlObj;
    try { urlObj = new URL(evoBase); } catch (e) {
      return resolve({ error: 'URL inválida: ' + evoBase });
    }

    const opts = {
      hostname: urlObj.hostname,
      port: urlObj.port || 8080,
      path: pathUrl,
      method: method,
      headers: { 'apikey': evoKey, 'Content-Type': 'application/json' },
      timeout: 15000,
    };

    const req = http.request(opts, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, data: JSON.parse(d) }); }
        catch (e) { resolve({ status: r.statusCode, data: d }); }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'Timeout ao conectar na Evolution API' }); });
    if (bodyData) req.write(JSON.stringify(bodyData));
    req.end();
  });
}

function marcarConversaIntervencao(telefone) {
  try {
    const conversas = readJson('conversas.json') || [];
    const existente = conversas.find(c => c.telefone === telefone);
    if (existente) {
      existente.status = 'intervencao';
      existente.nao_lidas = (existente.nao_lidas || 0) + 1;
      writeJson('conversas.json', conversas);
    }
  } catch(e) {
    console.error('[marcarConversaIntervencao] erro:', e.message);
  }
}

function sendEvolutionMessage(to, text, origem) {
  salvarMensagemLocal(to, text, true, origem || 'bot');
  try {
    const conversas = readJson('conversas.json') || [];
    const existente = conversas.find(c => c.telefone === to);
    const horario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (existente) {
      existente.ultima_msg = text;
      existente.horario = horario;
      existente.ultimo_timestamp = Date.now();
      existente.nao_lidas = 0;
    } else {
      conversas.push({
        telefone: to,
        nome: to,
        ultima_msg: text,
        status: 'bot',
        horario,
        nao_lidas: 0,
        ultimo_timestamp: Date.now(),
      });
    }
    writeJson('conversas.json', conversas);
    sseBroadcast('conversation_update', { telefone: to, ultima_msg: text, horario: horario, ultimo_timestamp: Date.now() });
  } catch(e) {
    console.error('[sendEvolutionMessage] erro ao atualizar conversas.json:', e.message);
  }
  const creds = getCreds();
  const instance = creds.evolution?.instance_name || 'test';
  return evolutionRequest('POST', `/message/sendText/${encodeURIComponent(instance)}`, {
    number: to,
    text: text,
  });
}

// ─── System ───────────────────────────────────────

function marcarMensagemComoLida(remoteJid, messageId) {
  const creds = getCreds();
  const instance = creds.evolution?.instance_name;
  if (!instance || !remoteJid) return;
  var keys = [];
  if (messageId) {
    keys.push({ remoteJid: remoteJid, id: messageId, fromMe: false });
  }
  if (keys.length === 0) return;
  evolutionRequest('POST', `/chat/markMessageAsRead/${encodeURIComponent(instance)}`, { readMessages: keys })
    .catch(function() {});
}

function marcarTodasMensagensComoLida(remoteJid) {
  var evoInstance = '';
  try {
    const creds = getCreds();
    evoInstance = creds.evolution?.instance_name;
  } catch(e) {}
  if (!evoInstance || !remoteJid) return;
  evolutionRequest('POST', '/chat/findMessages/' + encodeURIComponent(evoInstance), {
    where: { key: { remoteJid: remoteJid } },
    limit: 100, offset: 0,
  }).then(function(resp) {
    var registros = resp?.data || [];
    if (!Array.isArray(registros) || registros.length === 0) return;
    var keys = registros
      .filter(function(m) { return !m.key?.fromMe; })
      .map(function(m) { return { remoteJid: remoteJid, id: m.key?.id, fromMe: false }; })
      .filter(function(k) { return k.id; });
    if (keys.length > 0) {
      evolutionRequest('POST', '/chat/markMessageAsRead/' + encodeURIComponent(evoInstance), { readMessages: keys })
        .catch(function() {});
    }
  }).catch(function() {});
}

// ─── Sistema de Aprendizado Contínuo ─────────────

function carregarKnowledge() {
  var data = readJson('knowledge.json');
  return data && data.respostas ? data : { respostas: [] };
}

function salvarKnowledge(data) {
  writeJson('knowledge.json', data);
}

function carregarLearn() {
  var data = readJson('learn.json');
  return data && data.perguntas ? data : { perguntas: [] };
}

function salvarLearn(data) {
  writeJson('learn.json', data);
}

function buscarRespostaConhecida(mensagem, knowledge) {
  if (!mensagem || !knowledge || !knowledge.respostas || knowledge.respostas.length === 0) return null;
  var msg = mensagem.toLowerCase().trim();
  var melhor = null;
  var maiorScore = 0;
  for (var i = 0; i < knowledge.respostas.length; i++) {
    var r = knowledge.respostas[i];
    if (!r.palavras_chave || r.palavras_chave.length === 0) continue;
    var score = 0;
    for (var j = 0; j < r.palavras_chave.length; j++) {
      var kw = r.palavras_chave[j].toLowerCase().trim();
      if (msg.indexOf(kw) >= 0) {
        score += kw.length;
      }
    }
    if (score > maiorScore) {
      maiorScore = score;
      melhor = r;
    }
  }
  return maiorScore > 0 ? melhor : null;
}

function salvarPerguntaNaoRespondida(telefone, mensagem) {
  var learn = carregarLearn();
  // Evitar duplicatas (mesma pergunta do mesmo telefone)
  for (var i = 0; i < learn.perguntas.length; i++) {
    var p = learn.perguntas[i];
    if (!p.respondida && p.telefone === telefone && p.mensagem === mensagem) return;
  }
  learn.perguntas.push({
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    telefone: telefone,
    mensagem: mensagem,
    data: new Date().toISOString(),
    respondida: false,
    resposta: null,
  });
  salvarLearn(learn);
  console.log('[learn] Pergunta salva para aprendizado:', mensagem.substring(0, 80));
}

// ─── Health Check e Versão (para Landing Page Vercel) ──

app.get('/api/health', async (req, res) => {
  var config = readJson('config.json') || {};
  var creds = getCreds();
  var whatsappConnected = false;
  try {
    var evoInstance = creds.evolution?.instance_name;
    if (evoInstance) {
      var stateResp = await evolutionRequest('GET', '/instance/connectionState/' + encodeURIComponent(evoInstance));
      whatsappConnected = stateResp?.data?.instance?.state === 'open';
    }
  } catch(e) {}
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: Date.now(),
    nome_negocio: config.nome_negocio || '',
    whatsapp_conectado: whatsappConnected,
  });
});

app.get('/api/versao', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'WaBot',
    description: 'WhatsApp Bot Manager',
  });
});

// ─── Docker ────────────────────────────────────────

app.get('/api/docker/status', async (req, res) => {
  try {
    if (!dockerManager) dockerManager = new DockerManager();
    const status = await dockerManager.getStatus();
    res.json(status);
  } catch (error) {
    res.json({ dockerInstalled: false, evolutionRunning: false, whatsappConnected: false, error: error.message });
  }
});

app.post('/api/docker/start', async (req, res) => {
  try {
    if (!dockerManager) dockerManager = new DockerManager();
    const result = await dockerManager.startServices();
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/docker/stop', async (req, res) => {
  try {
    if (!dockerManager) dockerManager = new DockerManager();
    const result = await dockerManager.stopServices();
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/docker/logs', async (req, res) => {
  try {
    if (!dockerManager) dockerManager = new DockerManager();
    const result = await dockerManager.getLogs();
    res.json(result);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// ─── Config files (CRUD) ───────────────────────────

app.get('/api/config/:filename', (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.filename);
  // Security: prevent directory traversal
  if (filePath.indexOf(DATA_DIR) !== 0) {
    return res.json({ success: false, error: 'Invalid path' });
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/config/:filename', (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.filename);
  if (filePath.indexOf(DATA_DIR) !== 0) {
    return res.json({ success: false, error: 'Invalid path' });
  }
  try {
    writeJson(req.params.filename, req.body);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ─── Config: Limpar encomendas corrompidas ─────────

app.post('/api/config/limpar-encomendas', (req, res) => {
  try {
    var config = readJson('config.json');
    if (!config) return res.json({ success: false, error: 'config.json não encontrado' });
    if (!config.horarios) return res.json({ success: true, msg: 'Nenhum horário' });
    var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    var limpou = false;
    for (var d = 0; d < dias.length; d++) {
      if (config.horarios[dias[d]] && Array.isArray(config.horarios[dias[d]].encomendas)) {
        delete config.horarios[dias[d]].encomendas;
        limpou = true;
      }
    }
    if (limpou) {
      writeJson('config.json', config);
      res.json({ success: true, msg: 'Encomendas removidas!' });
    } else {
      res.json({ success: true, msg: 'Nenhuma encomenda encontrada' });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ─── Evolution: Status ─────────────────────────────

app.get('/api/evolution/status', async (req, res) => {
  try {
    const creds = getCreds();
    const evoKey = creds.evolution?.api_key || 'wabot_evokey_2026';
    const evoBase = creds.evolution?.base_url || 'http://localhost:8081';
    const evoInstance = creds.evolution?.instance_name || 'test';

    const apiStatus = await new Promise((resolve) => {
      const req = http.get(evoBase + '/', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => resolve({ ok: r.statusCode === 200, data: d }));
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.setTimeout(8000, () => { req.destroy(); resolve({ ok: false, error: 'Evolution API timeout' }); });
    });

    if (!apiStatus.ok) {
      return res.json({ connected: false, error: 'Evolution API offline' });
    }

    const instStatus = await evolutionRequest('GET', '/instance/connectionState/' + encodeURIComponent(evoInstance));
    const state = instStatus?.data?.instance?.state || 'unknown';
    let qrcode = null;

    if (state === 'connecting' || state === 'qrcode' || state === 'disconnected') {
      const qrResp = await evolutionRequest('GET', '/instance/connect/' + encodeURIComponent(evoInstance));
      if (qrResp.status === 200) {
        if (qrResp.data?.base64) qrcode = qrResp.data;
        else if (qrResp.data?.qrcode?.base64) qrcode = qrResp.data.qrcode;
        else if (qrResp.data?.instance?.qrcode?.base64) qrcode = qrResp.data.instance.qrcode;
      }
    }

    res.json({
      connected: state === 'open',
      instanceName: evoInstance,
      state: state,
      qrcode: qrcode,
    });
  } catch (error) {
    res.json({ connected: false, error: error.message });
  }
});

// ─── Evolution: Conectar ───────────────────────────

app.post('/api/evolution/connect', async (req, res) => {
  try {
    const creds = getCreds();
    const evoKey = creds.evolution?.api_key || 'wabot_evokey_2026';
    const evoBase = creds.evolution?.base_url || 'http://localhost:8081';
    let evoInstance = req.body?.instanceName || creds.evolution?.instance_name || 'wabot-' + Date.now();

    // Ler config para saber se deve rejeitar chamadas
    const cfgCall = readJson('config.json') || {};
    const receberChamadas = cfgCall.receber_chamadas === true;

    // Verificar se já está conectado
    var stateResp = await evolutionRequest('GET', '/instance/connectionState/' + encodeURIComponent(evoInstance));
    var state = stateResp?.data?.instance?.state;
    if (state === 'open') {
      try {
        await evolutionRequest('POST', '/settings/set/' + encodeURIComponent(evoInstance), {
          rejectCall: !receberChamadas,
          msgCall: '',
        });
      } catch(e) {}
      return res.json({ success: true, instanceName: evoInstance, connected: true });
    }

    // Só criar instância se não existir
    var result = await evolutionRequest('POST', '/instance/create', {
      instanceName: evoInstance,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      rejectCall: !receberChamadas,
      msgCall: '',
      webhook: {
        url: 'http://host.docker.internal:3001/webhook/evolution',
        enabled: true,
        webhookByEvents: false,
        webhookBase64: false,
        events: [],
      },
    });

    // Se falhar (instância já existe), tentar conectar normalmente
    if (result.error || result.data?.response?.message) {
      console.log('[connect] instância já existe, tentando conectar...');
      var qrResp = await evolutionRequest('GET', '/instance/connect/' + encodeURIComponent(evoInstance));
      if (qrResp.status === 200 && qrResp.data?.base64) {
        result = { data: { instance: { instanceName: evoInstance } } };
      } else {
        // Se ainda falhar, criar com nome novo
        evoInstance = 'wabot-' + Date.now();
        result = await evolutionRequest('POST', '/instance/create', {
          instanceName: evoInstance,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          rejectCall: !receberChamadas,
          msgCall: '',
          webhook: {
            url: 'http://host.docker.internal:3001/webhook/evolution',
            enabled: true,
            webhookByEvents: false,
            webhookBase64: false,
            events: [],
          },
        });
      }
    }

    if (result.error) {
      return res.json({ success: false, error: result.error, debug: 'create_failed' });
    }

    var instanceName = result.data?.instance?.instanceName || evoInstance;

    // Salvar instance_name nas credenciais
    var newCreds = { ...creds };
    newCreds.evolution = newCreds.evolution || {};
    newCreds.evolution.instance_name = instanceName;
    writeJson('credentials.json', newCreds);

    var errMsg = result.data?.response?.message;
    var errorText = Array.isArray(errMsg) ? errMsg.join(', ') : typeof errMsg === 'string' ? errMsg : null;

    // Disparar connect depois de criar (Evolution API v2 gera QR sob demanda)
    var qrAfter = null;
    var debugCreate = result.data;
    var debugConnect = null;

    // 1 - Tentar extrair QR do response do create (qualquer nivel do objeto)
    function extrairQR(obj) {
      if (!obj || typeof obj !== 'object') return null;
      if (obj.base64 && typeof obj.base64 === 'string') return obj;
      if (obj.qrcode) return extrairQR(obj.qrcode);
      if (obj.instance) return extrairQR(obj.instance);
      for (var k in obj) {
        var v = extrairQR(obj[k]);
        if (v) return v;
      }
      return null;
    }
    qrAfter = extrairQR(result.data);

    // 2 - Se nao veio no create, chamar /instance/connect/ com retry
    if (!qrAfter) {
      for (var tentativa = 0; tentativa < 8; tentativa++) {
        await new Promise(r => setTimeout(r, 1500));
        var qrResp = await evolutionRequest('GET', '/instance/connect/' + encodeURIComponent(instanceName));
        debugConnect = qrResp;
        if (qrResp.status === 200) {
          qrAfter = extrairQR(qrResp.data);
          if (qrAfter) break;
        }
      }
    }

    res.json({
      success: !errorText,
      instanceName: instanceName,
      qrcode: qrAfter,
      hash: result.data?.hash || null,
      error: errorText,
      _debug: { create: debugCreate, connect: debugConnect },
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ─── Evolution: Desconectar ────────────────────────

app.post('/api/evolution/disconnect', async (req, res) => {
  try {
    const creds = getCreds();
    const evoInstance = creds.evolution?.instance_name;
    if (!evoInstance) {
      return res.json({ success: false, error: 'Nenhuma instância configurada' });
    }
    const result = await evolutionRequest('DELETE', '/instance/logout/' + encodeURIComponent(evoInstance));
    res.json({ success: result.status < 400, error: result.data?.response?.message || null });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ─── Conversa: Alterar status ─────────────────────

app.post('/api/conversa/:telefone/status', (req, res) => {
  try {
    var tel = req.params.telefone;
    var status = req.body.status;
    if (!status) return res.json({ success: false, error: 'status obrigatório' });
    var conversas = readJson('conversas.json') || [];
    if (!Array.isArray(conversas)) conversas = [];
    var achou = false;
    for (var i = 0; i < conversas.length; i++) {
      if (conversas[i].telefone === tel) {
        conversas[i].status = status;
        conversas[i].ultimo_timestamp = Date.now();
        achou = true;
        break;
      }
    }
    if (!achou) {
      conversas.push({ telefone: tel, status: status, ultima_msg: '', horario: '', ultimo_timestamp: Date.now(), nao_lidas: 0, nome: tel });
    }
    writeJson('conversas.json', conversas);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ─── Iniciar atendimento (saudação + link) ────

app.post('/api/conversa/:telefone/iniciar', async (req, res) => {
  try {
    var tel = req.params.telefone;
    var config = readJson('config.json') || {};
    var nomeNegocio = config.nome_negocio || 'Restaurante';
    var linkPedido = config.link_pedido_online || '';
    var saudacao = (config.mensagem_saudacao || 'Olá! Bem-vindo ao {{nome_negocio}}! Faça seu pedido pelo link: {{link_pedido_online}}. Como podemos ajudar?')
      .replace(/\{\{nome_negocio\}\}/g, nomeNegocio);
    var mensagem = saudacao;
    if (linkPedido) {
      mensagem += '\n\n📲 Faça seu pedido pelo link:\n' + linkPedido;
    }
    await sendEvolutionMessage(tel, mensagem, 'bot');
    return res.json({ success: true, message: 'Mensagem enviada' });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ─── Reiniciar servidor ─────────────────────────

app.post('/api/restart', async (req, res) => {
  console.log('[restart] Reinicializando servidor (soft restart)');
  res.json({ success: true, message: 'Servidor reinicializado' });
});

// ─── Evolution: Listar conversas ───────────────────

app.get('/api/evolution/conversations', async (req, res) => {
  try {
    const creds = getCreds();
    const evoInstance = creds.evolution?.instance_name;
    var convs = [];
    var local = readJson('conversas.json') || [];

    // SEMPRE usar dados locais como base (números reais do webhook)
    if (Array.isArray(local)) {
      convs = local.map(function(l) { return JSON.parse(JSON.stringify(l)); });
    }

    // Tentar enriquecer com Evolution API (só não-lidas, sem sobrescrever contatos)
    if (evoInstance) {
      try {
        const result = await evolutionRequest('POST', '/chat/findChats/' + encodeURIComponent(evoInstance), {
          take: 50, orderBy: { t: 'desc' },
        });

        if (result.status === 200 && Array.isArray(result.data)) {
          var evoPorTelefone = {};
          for (var i = 0; i < result.data.length; i++) {
            var c = result.data[i];
            var jid = c.jid || c.key?.remoteJid || c.id || '';
            var phone = typeof jid === 'string' ? jid.split('@')[0] : '';
            if (!phone || !ehNumeroTelefone(phone)) continue;
            evoPorTelefone[phone] = c;
          }

          // Enriquecer locais com dados da Evolution
          for (var j = 0; j < convs.length; j++) {
            var ec = evoPorTelefone[convs[j].telefone];
            if (ec) {
              if (ec.unreadCount > 0 && convs[j].nao_lidas > 0) convs[j].nao_lidas = ec.unreadCount;
              // Atualizar nome se estiver vazio (só pushName, não ec.name que pode vir errado)
              if (!convs[j].nome || convs[j].nome === convs[j].telefone) {
                convs[j].nome = ec.pushName || convs[j].nome;
              }
            }
          }
        }
      } catch(e) {}
    }

    // Safety: se a última mensagem no histórico local foi do bot, zerar nao_lidas
    // (cobre race condition entre webhook incrementar e sendEvolutionMessage zerar)
    // Exceção: status 'intervencao' (bot pediu ajuda humana) mantém nao_lidas
    for (var j = 0; j < convs.length; j++) {
      if (convs[j].nao_lidas > 0 && convs[j].status !== 'intervencao') {
        try {
          var msgFile = path.join(MSG_DIR, convs[j].telefone + '.json');
          if (fs.existsSync(msgFile)) {
            var msgs = JSON.parse(fs.readFileSync(msgFile, 'utf-8') || '[]');
            if (Array.isArray(msgs) && msgs.length > 0) {
              var ultima = msgs[msgs.length - 1];
              if (ultima.de_bot) {
                convs[j].nao_lidas = 0;
              }
            }
          }
        } catch(e) {}
      }
    }

    // Marcar ignorados (expira_em no passado = reativar automaticamente)
    var ignoradosTmp = readJson('ignorados.json');
    const ignorados = Array.isArray(ignoradosTmp) ? ignoradosTmp : [];
    var now = new Date();
    for (var k = 0; k < convs.length; k++) {
      var ignItem = null;
      for (var ig = 0; ig < ignorados.length; ig++) {
        if (ignorados[ig].telefone === convs[k].telefone) { ignItem = ignorados[ig]; break; }
      }
      if (!ignItem) continue;
      // Se tem expira_em e já passou, não marca como ignorado
      if (ignItem.expira_em && new Date(ignItem.expira_em) <= now) continue;
      if (convs[k].status !== 'intervencao') convs[k].status = 'ignorado';
    }

    // Ordenar por mais recente primeiro
    convs.sort(function(a, b) {
      var ta = a.ultimo_timestamp || 0;
      var tb = b.ultimo_timestamp || 0;
      return tb - ta;
    });

    return res.json({ success: true, mock: false, data: convs });
  } catch (error) {
    const local = readJson('conversas.json');
    return res.json({ success: true, mock: true, data: Array.isArray(local) ? local : [] });
  }
});

// ─── Evolution: Histórico de mensagens ──────────────

app.post('/api/evolution/history', async (req, res) => {
  try {
    const { telefone } = req.body || {};
    if (!telefone) return res.json({ success: false, error: 'telefone é obrigatório' });

    // Ler mensagens locais primeiro
    var historico = [];
    try {
      var arquivoLocal = path.join(MSG_DIR, telefone + '.json');
      if (fs.existsSync(arquivoLocal)) {
        historico = JSON.parse(fs.readFileSync(arquivoLocal, 'utf-8') || '[]');
        if (!Array.isArray(historico)) historico = [];
      }
    } catch(e) {
      historico = [];
    }

    // Tentar complementar com Evolution API (se disponível)
    const creds = getCreds();
    const evoInstance = creds.evolution?.instance_name;
    if (evoInstance) {
      try {
        const result = await evolutionRequest('POST', '/chat/findMessages/' + encodeURIComponent(evoInstance), {
          where: { key: { remoteJid: telefone + '@s.whatsapp.net' } },
          limit: 200, offset: 0,
        });

        if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
          var evoMsgs = result.data
            .filter(m => m.message)
            .map(m => {
              const msg = m.message;
              var texto = msg.conversation ||
                msg.extendedTextMessage?.text ||
                msg.imageMessage?.caption ||
                msg.videoMessage?.caption ||
                msg.documentMessage?.caption ||
                msg.listResponseMessage?.title ||
                msg.buttonsResponseMessage?.selectedButtonId ||
                m.text || '';
              if (!texto) {
                if (msg.audioMessage) texto = '🎤 Áudio';
                else if (msg.imageMessage) texto = '🖼️ Imagem';
                else if (msg.videoMessage) texto = '🎬 Vídeo';
                else if (msg.documentMessage) texto = '📄 Documento';
                else if (msg.stickerMessage) texto = '🔖 Sticker';
                else if (msg.ptvMessage) texto = '🎥 Vídeo';
                else if (msg.locationMessage) texto = '📍 Localização';
                else if (msg.contactMessage) texto = '👤 Contato';
                else return null;
              }
              const deBot = m.key?.fromMe === true;
              const ts = m.messageTimestamp || 0;
              return {
                id: m.key?.id || 'evo-' + Date.now() + Math.random(),
                texto,
                de_bot: deBot,
                origem: deBot ? 'bot' : 'cliente',
                horario: ts ? new Date(ts * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                timestamp: ts ? ts * 1000 : Date.now(),
              };
            })
            .filter(Boolean);

          // Mesclar: preferir Evolution (tem timestamp real), mas manter locais que não existem no Evolution
          var idsEvo = {};
          evoMsgs.forEach(function(m) { idsEvo[m.texto + '_' + m.horario] = true; });
          historico = historico.filter(function(m) { return !idsEvo[m.texto + '_' + m.horario]; });
          historico = historico.concat(evoMsgs);

          // Persistir localmente mensagens do Evolution (inclui fromMe enviadas por fora)
          try {
            fs.writeFileSync(arquivoLocal, JSON.stringify(historico, null, 2), 'utf-8');
          } catch(e) {}
        }
      } catch(e) {}
    }

    // Ordenar por timestamp (mais antigo primeiro)
    historico.sort(function(a, b) {
      return (a.timestamp || 0) - (b.timestamp || 0);
    });

    // Fallback: se não achou nada, tentar extrair do conversas.json
    if (historico.length === 0) {
      var convs = readJson('conversas.json') || [];
      var encontrada = convs.find(function(c) { return c.telefone === telefone; });
      if (encontrada && encontrada.ultima_msg) {
        historico.push({
          id: 'conv-' + telefone,
          texto: encontrada.ultima_msg,
          de_bot: false,
          origem: 'cliente',
          horario: encontrada.horario || '',
          timestamp: 0,
        });
      }
    }

    res.json({ success: true, data: historico });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// ─── Evolution: Enviar mensagem (admin) ──────────

app.post('/api/evolution/send', async (req, res) => {
  try {
    const { telefone, mensagem } = req.body || {};
    if (!telefone || !mensagem) return res.json({ success: false, error: 'telefone e mensagem são obrigatórios' });

    marcarMensagemComoLida(telefone + '@s.whatsapp.net');
    const result = await sendEvolutionMessage(telefone, mensagem);
    res.json({ success: result.status < 400, error: result.data?.response?.message || result.error || null });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ─── Webhook Evolution (receber msgs direto) ──

function configGet(obj, path, defaultValue) {
  var parts = path.split('.');
  var current = obj || {};
  for (var i = 0; i < parts.length; i++) {
    if (current == null || typeof current !== 'object') return defaultValue;
    current = current[parts[i]];
  }
  return current !== undefined && current !== null ? current : defaultValue;
}

function horarioHojeTexto(config) {
  if (!config || !config.horarios) return '';
  var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  var hoje = dias[new Date().getDay()];
  var info = config.horarios[hoje];
  if (!info) return '';
  if (info.fechado) return configGet(config, 'mensagens.texto_fechado', 'FECHADO');
  var periodos = info.periodos || info.cozinha || [];
  if (periodos.length === 0) return '';
  return periodos.map(function(p) { return p.abertura + ' às ' + p.fechamento; }).join(', ');
}

function substituirVariaveis(texto, config) {
  if (!texto || !config) return texto;
  return texto
    .replace(/\{\{link_pedido_online\}\}/g, config.link_pedido_online || '')
    .replace(/\{\{endereco\}\}/g, config.endereco || '')
    .replace(/\{\{telefone\}\}/g, config.telefone || '')
    .replace(/\{\{nome_negocio\}\}/g, config.nome_negocio || '')
    .replace(/\{\{horario_hoje\}\}/g, horarioHojeTexto(config));
}

function responderHorarios(config) {
  if (!config || !config.horarios) return null;
  var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  var nomesDias = { 'domingo': 'Domingo', 'segunda': 'Segunda', 'terca': 'Terça', 'quarta': 'Quarta', 'quinta': 'Quinta', 'sexta': 'Sexta', 'sabado': 'Sábado' };
  var textoFechado = configGet(config, 'mensagens.texto_fechado', 'FECHADO');
  var cabecalho = configGet(config, 'mensagens.horarios_cabecalho', 'Aqui estão nossos horários de funcionamento:');
  var pedidoAntecipado = configGet(config, 'mensagens.pedido_antecipado', '📦 Pedidos para viagem podem ser feitos a partir das {{pedidos_aceitos_desde}} (pedido antecipado).');
  var rodapeLink = configGet(config, 'mensagens.rodape_pedido_link', '📲 Faça seu pedido pelo link: {{link_pedido_online}}');
  var linhas = [];
  for (var d = 0; d < dias.length; d++) {
    var info = config.horarios[dias[d]];
    if (!info) continue;
    if (info.fechado) {
      linhas.push(nomesDias[dias[d]] + ': ' + textoFechado);
      continue;
    }
    var periodos = info.periodos || info.cozinha || [];
    if (periodos.length > 0) {
      var hrs = periodos.map(function(p) { return p.abertura + ' às ' + p.fechamento; }).join(', ');
      linhas.push(nomesDias[dias[d]] + ': ' + hrs);
    }
  }
  if (linhas.length === 0) return null;
  var resposta = cabecalho + '\n\n' + linhas.join('\n');
  if (config.pedidos_aceitos_desde) {
    resposta += '\n\n' + substituirVariaveis(pedidoAntecipado, config);
  }
  resposta += '\n\n' + substituirVariaveis(rodapeLink, config);
  return resposta;
}



function detectarSaudacao(texto, config) {
  if (!texto) return false;
  var t = texto.toLowerCase().trim();
  var saudacoes = configGet(config, 'deteccao.saudacao', ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eae', 'iae', 'hello', 'hi', 'hey', 'fala', 'salve', 'e aí', 'e ai']);
  var palavras = t.split(/\s+/).filter(function(p) { return p.length > 0; });
  if (palavras.length <= 6) {
    return saudacoes.some(function(s) { return t.indexOf(s) >= 0; });
  }
  return saudacoes.some(function(s) { return t.indexOf(s) === 0; });
}

function detectarAgradecimento(texto, config) {
  if (!texto) return false;
  var t = texto.toLowerCase().trim();
  var palavras = configGet(config, 'deteccao.agradecimento', ['obrigado', 'obrigada', 'valeu', 'brigado', 'brigada', 'agradeço', 'agradeco', 'thanks', 'thank', 'tks', 'mt obg', 'muito obrigado', 'muito obrigada', 'obg', 'agradecido', 'agradecida']);
  var tokens = t.split(/\s+/).filter(function(p) { return p.length > 0; });
  if (tokens.length <= 8) {
    return palavras.some(function(p) { return t.indexOf(p) >= 0; });
  }
  return false;
}

function isApenasSaudacao(texto, config) {
  if (!texto) return false;
  var lista = configGet(config, 'deteccao.saudacao', ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eae', 'iae', 'hello', 'hi', 'hey', 'opa', 'fala']);
  var pattern = '^(' + lista.map(function(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')[\\s!.,;:?]*$';
  return new RegExp(pattern, 'i').test(texto.trim());
}

function isApenasAgradecimento(texto, config) {
  if (!texto) return false;
  var lista = configGet(config, 'deteccao.agradecimento', ['obrigado', 'obrigada', 'valeu', 'brigado', 'brigada', 'thanks', 'thank you', 'muito obrigado', 'agradecido']);
  var pattern = '^(' + lista.map(function(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')[\\s!.,]*$';
  return new RegExp(pattern, 'i').test(texto.trim());
}

function detectarIncerteza(texto, config) {
  if (!texto) return false;
  var t = texto.toLowerCase().trim();
  var padroes = configGet(config, 'deteccao.incerteza', [
    'não sei', 'nao sei', 'não tenho essa informaç', 'nao tenho essa informaç',
    'não tenho certeza', 'nao tenho certeza', 'vou verificar com um atendente',
    'vou verificar com o atendente', 'não encontrei', 'nao encontrei',
    'infelizmente não', 'infelizmente nao', 'não consigo informar', 'nao consigo informar',
    'atendente humano', 'vou passar para', 'não posso informar', 'nao posso informar',
  ]);
  for (var i = 0; i < padroes.length; i++) {
    if (t.indexOf(padroes[i]) >= 0) return true;
  }
  return false;
}

function buscarAprendizado(mensagem, aprendizadoLista) {
  if (!mensagem || !aprendizadoLista || !Array.isArray(aprendizadoLista)) return null;
  var msg = mensagem.toLowerCase().trim();
  var melhor = null;
  var maiorMatches = 0;
  for (var i = 0; i < aprendizadoLista.length; i++) {
    var item = aprendizadoLista[i];
    if (!item.ativo) continue;
    var palavras = item.palavras_chave || [];
    if (palavras.length === 0) continue;
    var matches = 0;
    for (var j = 0; j < palavras.length; j++) {
      var p = (palavras[j] || '').toLowerCase().trim();
      if (p && msg.indexOf(p) >= 0) {
        matches++;
      }
    }
    if (matches > maiorMatches) {
      maiorMatches = matches;
      melhor = item;
    }
  }
  return maiorMatches > 0 ? melhor : null;
}

function registrarNaoSei(pergunta, telefone, contexto) {
  try {
    var naoSei = readJson('nao_sei.json') || [];
    if (!Array.isArray(naoSei)) naoSei = [];
    // Evitar duplicatas recentes do mesmo número
    var jaExiste = false;
    var cincoMin = 5 * 60 * 1000;
    for (var i = 0; i < naoSei.length; i++) {
      if (naoSei[i].telefone === telefone &&
          naoSei[i].pergunta.toLowerCase().trim() === pergunta.toLowerCase().trim() &&
          !naoSei[i].respondida &&
          (Date.now() - new Date(naoSei[i].data).getTime()) < cincoMin) {
        jaExiste = true; break;
      }
    }
    if (jaExiste) return false;

    var nome = telefone;
    var convs = readJson('conversas.json') || [];
    if (Array.isArray(convs)) {
      for (var j = 0; j < convs.length; j++) {
        if (convs[j].telefone === telefone) { nome = convs[j].nome || telefone; break; }
      }
    }
    naoSei.push({
      id: 'ns-' + Date.now() + Math.random().toString(36).substring(2, 6),
      pergunta: pergunta,
      contexto: contexto || '',
      telefone: telefone,
      nome: nome,
      data: new Date().toISOString(),
      respondida: false,
    });
    writeJson('nao_sei.json', naoSei);
    return true;
  } catch(e) {
    console.error('[registrarNaoSei] erro:', e.message);
    return false;
  }
}

function extrairPalavrasChave(texto) {
  if (!texto) return [];
  var stopwords = {a:1,o:1,e:1,de:1,da:1,do:1,em:1,para:1,com:1,um:1,uma:1,uns:1,umas:1,
    na:1,no:1,nas:1,nos:1,por:1,pra:1,pro:1,se:1,que:1,é:1,tem:1,são:1,está:1,como:1,
    você:1,voce:1,meu:1,minha:1,seu:1,sua:1,teu:1,tua:1,isso:1,isto:1,aquilo:1,qual:1,
    quem:1,quando:1,onde:1,porque:1,pode:1,vai:1,vão:1,ter:1,mais:1,mas:1,muito:1,bem:1,
    ainda:1,já:1,ja:1,só:1,so:1,sim:1,não:1,nao:1,tudo:1,todo:1,toda:1,todos:1,todas:1,
    algum:1,alguns:1,alguma:1,algumas:1,esses:1,essas:1,esse:1,essa:1,este:1,esta:1,
    estes:1,estas:1,aquele:1,aquela:1,aqueles:1,aquelas:1};
  var palavras = texto.toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/g, ' ')
    .split(/\s+/)
    .filter(function(p) { return p.length > 2 && !stopwords[p]; });
  var unicas = [];
  for (var i = 0; i < palavras.length; i++) {
    if (unicas.indexOf(palavras[i]) < 0 && unicas.length < 10) {
      unicas.push(palavras[i]);
    }
  }
  return unicas;
}

app.post('/webhook/evolution', async (req, res) => {
  try {
    const body = req.body;
    const messageData = body?.data || body;

    // Extrair dados da mensagem
    const telefone = limparJid(messageData?.key?.remoteJid) ||
                     limparJid(messageData?.from) ||
                     limparJid(messageData?.sender) || '';
    let mensagem = messageData?.message?.conversation ||
                   messageData?.message?.extendedTextMessage?.text ||
                   messageData?.message?.imageMessage?.caption ||
                   messageData?.message?.videoMessage?.caption ||
                   messageData?.message?.documentMessage?.caption ||
                   messageData?.message?.listResponseMessage?.title ||
                   messageData?.message?.buttonsResponseMessage?.selectedButtonId ||
                   messageData?.text ||
                   '';
    // Fallback para mídia sem legenda (áudio, sticker, etc.)
    if (!mensagem) {
      const msg = messageData?.message;
      if (msg?.audioMessage) mensagem = '🎤 Áudio';
      else if (msg?.imageMessage) mensagem = '🖼️ Imagem';
      else if (msg?.videoMessage) mensagem = '🎬 Vídeo';
      else if (msg?.documentMessage) mensagem = '📄 Documento';
      else if (msg?.stickerMessage) mensagem = '🔖 Sticker';
      else if (msg?.ptvMessage) mensagem = '🎥 Vídeo';
      else if (msg?.locationMessage) mensagem = '📍 Localização';
      else if (msg?.contactMessage) mensagem = '👤 Contato';
    }

    // Mensagens do próprio bot (enviadas por fora — Evolution API, n8n, etc.)
    if (messageData?.key?.fromMe) {
      if (mensagem && telefone) {
        salvarMensagemLocal(telefone, mensagem, true, 'bot');
        const conversas = readJson('conversas.json') || [];
        const existente = conversas.find(c => c.telefone === telefone);
        const horario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        var agora = Date.now();
        if (existente) {
          existente.ultima_msg = mensagem;
          existente.horario = horario;
          existente.ultimo_timestamp = agora;
        } else {
          conversas.push({
            telefone,
            nome: telefone,
            ultima_msg: mensagem,
            status: 'bot',
            horario,
            nao_lidas: 0,
            ultimo_timestamp: agora,
          });
        }
    writeJson('conversas.json', conversas);
        sseBroadcast('new_message', { telefone: telefone, message: { texto: mensagem, de_bot: true, origem: 'bot', horario: horario, timestamp: agora }, conversation: { nome: telefone, ultima_msg: mensagem, horario: horario, ultimo_timestamp: agora } });
      }
      return res.json({ success: true, ignored: true });
    }

    // ─── Chamada de voz ───────────────────────────
    if (messageData?.callStatus) {
      if (telefone) {
        salvarMensagemLocal(telefone, '📞 Chamada de voz', false, 'cliente');
        const convs = readJson('conversas.json') || [];
        const existe = convs.find(c => c.telefone === telefone);
        const horarioCall = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (existe) {
          existe.ultima_msg = '📞 Chamada de voz';
          existe.horario = horarioCall;
          existe.nao_lidas = (existe.nao_lidas || 0) + 1;
          existe.ultimo_timestamp = Date.now();
        } else {
          convs.push({ telefone, nome: telefone, ultima_msg: '📞 Chamada de voz', status: 'bot', horario: horarioCall, nao_lidas: 1, ultimo_timestamp: Date.now() });
        }
        writeJson('conversas.json', convs);
        sseBroadcast('conversation_update', { telefone: telefone, ultima_msg: '📞 Chamada de voz', horario: horarioCall, ultimo_timestamp: Date.now() });
        const callCfg = readJson('config.json') || {};
        if (!callCfg.receber_chamadas) {
          await sendEvolutionMessage(telefone, configGet(callCfg, 'mensagens.chamada_rejeitada', 'Infelizmente não conseguimos atender chamadas de voz pelo WhatsApp. Por favor, envie uma mensagem de texto.'));
        }
      }
      return res.json({ success: true, call: true });
    }

    if (!mensagem || !telefone) {
      return res.json({ success: true, ignored: true });
    }

    var remoteJid = messageData?.key?.remoteJid || telefone + '@s.whatsapp.net';
    var msgId = messageData?.key?.id;

    // Salvar mensagem localmente (histórico)
    salvarMensagemLocal(telefone, mensagem, false, 'cliente');

    // Salvar no log de conversas
    const conversas = readJson('conversas.json') || [];
    const existente = conversas.find(c => c.telefone === telefone);
    const horario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    var agora = Date.now();
    if (existente) {
      existente.ultima_msg = mensagem;
      existente.horario = horario;
      existente.nao_lidas = (existente.nao_lidas || 0) + 1;
      existente.ultimo_timestamp = agora;
      if (messageData?.pushName && messageData.pushName !== existente.nome && messageData.pushName !== existente.telefone) {
        existente.nome = messageData.pushName;
      }
    } else {
      conversas.push({
        telefone,
        nome: messageData?.pushName || telefone,
        ultima_msg: mensagem,
        status: 'bot',
        horario,
        nao_lidas: 1,
        ultimo_timestamp: agora,
      });
    }
    writeJson('conversas.json', conversas);

    // ─── Auto-resposta para áudio (antes do check de ignorados) ─
    if (messageData?.message?.audioMessage) {
      await sendEvolutionMessage(telefone, configGet(config, 'mensagens.audio_rejeitado', 'Infelizmente não consigo ouvir mensagens de áudio. Por favor, digite sua mensagem.'));
      return res.json({ success: true, audio: true });
    }

    // Verificar ignorados (expira_em no passado = reativa automaticamente)
    var ignorados = readJson('ignorados.json') || [];
    var now = new Date();
    var isIgnorado = false;
    var precisaSalvar = false;
    if (telefone) {
      var debugIgn = 'ignorados.json: ' + (Array.isArray(ignorados) ? ignorados.length + ' entries' : typeof ignorados) + ' | buscando: ' + telefone;
      for (var ig = 0; ig < (Array.isArray(ignorados) ? ignorados.length : 0); ig++) {
        if (ignorados[ig] && ignorados[ig].telefone === telefone) {
          debugIgn += ' | ENCONTRADO';
          if (ignorados[ig].expira_em && new Date(ignorados[ig].expira_em) <= now) {
            ignorados.splice(ig, 1);
            precisaSalvar = true;
            debugIgn += ' (expirado, removido)';
          } else {
            isIgnorado = true;
            debugIgn += ' (ativo)';
          }
          break;
        }
      }
      console.log('[webhook] ' + debugIgn);
    }
    if (precisaSalvar) writeJson('ignorados.json', ignorados);

    if (isIgnorado) {
      return res.json({ success: true, ignored: true });
    }

    // Marcar mensagem como lida (só para não-ignorados)
    marcarMensagemComoLida(remoteJid, msgId);
    marcarTodasMensagensComoLida(remoteJid);

    // Verificar horário de funcionamento
    const config = readJson('config.json') || {};
    var foraHorario = false;
    var proxAbertura = null;
    if (config.horarios) {
      var diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      var hoje = diasSemana[new Date().getDay()];
      var configDia = config.horarios[hoje];
      if (configDia) {
        if (configDia.fechado) {
          foraHorario = true;
        } else {
          var agora = new Date();
          var minAgora = agora.getHours() * 60 + agora.getMinutes();
          var periodos = configDia.periodos || configDia.cozinha || [];
          var minPedido = parseInt((config.pedidos_aceitos_desde || '08:00').split(':')[0]) * 60 + parseInt((config.pedidos_aceitos_desde || '08:00').split(':')[1] || '0');
          var dentro = false;
          var ultimoFechamento = 0;
          for (var p = 0; p < periodos.length; p++) {
            var hab = periodos[p].abertura || '00:00';
            var hfe = periodos[p].fechamento || '23:59';
            var pAbb = parseInt(hab.split(':')[0]) * 60 + parseInt(hab.split(':')[1] || '0');
            var pFee = parseInt(hfe.split(':')[0]) * 60 + parseInt(hfe.split(':')[1] || '0');
            if (pFee > ultimoFechamento) ultimoFechamento = pFee;
            if (minAgora >= pAbb && minAgora < pFee) { dentro = true; break; }
            if (minAgora < pAbb && (!proxAbertura || pAbb < proxAbertura)) proxAbertura = pAbb;
          }
          // Se está fora do horário da cozinha mas dentro do horário de pedidos, não trava
          if (!dentro && minAgora >= minPedido && minAgora < ultimoFechamento) {
            dentro = true;
            if (proxAbertura === null || minPedido < proxAbertura) proxAbertura = minPedido;
          }
          if (!dentro) foraHorario = true;
        }
      }
    }

    const regras = readJson('regras.json') || [];
    const creds = getCreds();
    const provider = creds.llm?.provider || 'gemini';
    const apiKey = provider === 'groq' ? creds.llm?.api_key : creds.gemini?.api_key;

    if (!apiKey) {
      return res.json({ success: true, msg: 'Nenhuma chave de IA configurada' });
    }

    var respostaIA = null;
    var isSaudacao = detectarSaudacao(mensagem, config);
    var isAgradecimento = detectarAgradecimento(mensagem, config);

    // 1. SAUDAÇÃO: responder direto, sem consumir IA
    if (isSaudacao) {
      respostaIA = substituirVariaveis(config.mensagem_saudacao, config);
      if (config.link_pedido_online && respostaIA.indexOf(config.link_pedido_online) < 0) {
        respostaIA += '\n\n📲 Faça seu pedido pelo link:\n' + config.link_pedido_online;
      }
    }

    // 2. AGRADECIMENTO: responder direto, sem consumir IA
    if (!respostaIA && isAgradecimento) {
      if (config.mensagem_agradecimento) {
        respostaIA = substituirVariaveis(config.mensagem_agradecimento, config);
      } else {
        var msgsAgradecimento = configGet(config, 'mensagens.agradecimento_variacoes', [
          'Por nada! Fico à disposição.',
          'Disponha! Quando precisar, é só chamar.',
          'Imagina! Estamos aqui para ajudar.',
          'Por nada! Tenha um ótimo dia!',
        ]);
        respostaIA = msgsAgradecimento[Math.floor(Math.random() * msgsAgradecimento.length)];
      }
    }

    // 3. RESPOSTAS APRENDIDAS: buscar conhecimento (agora usado como contexto, não resposta direta)
    var conhecimentoEncontrado = null;
    if (!respostaIA) {
      var knowledge = carregarKnowledge();
      var respostaConhecida = buscarRespostaConhecida(mensagem, knowledge);
      if (respostaConhecida) {
        conhecimentoEncontrado = respostaConhecida;
        respostaConhecida.usos = (respostaConhecida.usos || 0) + 1;
        salvarKnowledge(knowledge);
      }
    }

    var precisaIntervencao = false;

    // 4. IA: consultar LLM (com conhecimento encontrado como contexto)
    if (!respostaIA) {
      try {
        if (provider === 'groq') {
          respostaIA = await consultarGroq(mensagem, config, regras, creds, conhecimentoEncontrado);
        } else {
          respostaIA = await consultarGemini(mensagem, config, regras, creds, conhecimentoEncontrado);
        }
        if (respostaIA && respostaIA.indexOf('[NAO_SEI]') === 0) {
          respostaIA = respostaIA.replace('[NAO_SEI]', '').trim();
          if (respostaIA.length === 0) respostaIA = null;
          salvarPerguntaNaoRespondida(telefone, mensagem);
          precisaIntervencao = true;
        }
      } catch (iaErr) {
        console.error('[webhook] erro IA:', iaErr.message);
        respostaIA = null;
      }
    }

    // 5. FALLBACK: mensagem genérica
    if (!respostaIA) {
      respostaIA = substituirVariaveis(config.mensagem_regra_nao_encontrada, config) || 'Vou verificar com um atendente humano.';
      precisaIntervencao = true;
    }

    if (respostaIA) {
      // Fora do horário: detectar se o cliente quer fazer pedido
      var msgNormalizada = (mensagem || '').toLowerCase().trim();
      var palavrasPedido = configGet(config, 'deteccao.pedido', ['quero pedir', 'fazer um pedido', 'queria pedir', 'gostaria de pedir', 'quero fazer', 'quero comprar', 'pedido', 'encomenda', 'encomendar', 'pedir agora', 'pode anotar', 'vou querer', 'eu quero']);
      var ehPedido = palavrasPedido.some(function(p) { return msgNormalizada.indexOf(p) >= 0; });
      if (foraHorario && ehPedido) {
        var msgPedidoFora = config.mensagem_ausencia || 'Olá! 😊 No momento estamos fora do horário de funcionamento.';
        var horariosTexto = responderHorarios(config);
        if (horariosTexto) msgPedidoFora += '\n\n' + horariosTexto;
        await sendEvolutionMessage(telefone, msgPedidoFora);
      } else {
        if (!isSaudacao && !isAgradecimento) {
          var saudacoesStrip = configGet(config, 'deteccao.prefixos_saudacao_para_remover', ['olá', 'olá,', 'oi,', 'oi ', 'bom dia,', 'bom dia!', 'boa tarde,', 'boa tarde!', 'boa noite,', 'boa noite!']);
          var respTrim = respostaIA.trim();
          for (var s = 0; s < saudacoesStrip.length; s++) {
            if (respTrim.toLowerCase().startsWith(saudacoesStrip[s])) {
              respTrim = respTrim.substring(respTrim.indexOf(' ') + 1).trim();
              if (respTrim.length > 0) respTrim = respTrim.charAt(0).toUpperCase() + respTrim.slice(1);
              respostaIA = respTrim;
              break;
            }
          }
          var tempoLimite = 2 * 60 * 60 * 1000;
          var ultimoTs = typeof existente?.ultimo_timestamp === 'number' ? existente.ultimo_timestamp : 0;
          if (config.mensagem_saudacao && (!existente || (Date.now() - ultimoTs) > tempoLimite)) {
            respostaIA = substituirVariaveis(config.mensagem_saudacao, config) + ' ' + respostaIA.charAt(0).toLowerCase() + respostaIA.slice(1);
          }
        }
        await sendEvolutionMessage(telefone, respostaIA);
        if (precisaIntervencao) {
          marcarConversaIntervencao(telefone);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[webhook] erro:', error.message);
    res.json({ success: true, error: error.message });
  }
});

// ─── Montar prompt com informações + horários ──────

function montarPromptIA(mensagem, config, regras, conhecimento) {
  const regrasAtivas = (regras || []).filter(r => r.ativo);
  var regrasCabecalho = configGet(config, 'rotulos.regras_cabecalho', 'REGRAS DO ESTABELECIMENTO (siga estas instruções quando aplicável):');
  const regrasTexto = regrasAtivas.length > 0
    ? regrasCabecalho + '\n' +
      regrasAtivas.map((r, i) => {
        const instrucaoComVariaveis = substituirVariaveis(r.instrucao, config);
        return `${i + 1}. ${instrucaoComVariaveis}`;
      }).join('\n')
    : '';

  const redesHtml = [];
  if (config.site) redesHtml.push('Site: ' + config.site);
  if (config.redes_sociais?.instagram) redesHtml.push('Instagram: ' + config.redes_sociais.instagram);
  if (config.redes_sociais?.facebook) redesHtml.push('Facebook: ' + config.redes_sociais.facebook);
  if (config.redes_sociais?.ifood) redesHtml.push('Ifood: ' + config.redes_sociais.ifood);
  const redesTexto = redesHtml.length > 0 ? '- Redes sociais: ' + redesHtml.join(' | ') : '';

  // Formatar horários
  var horariosTexto = '';
  if (config.horarios) {
    var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    var nomesDias = { 'domingo': 'Domingo', 'segunda': 'Segunda', 'terca': 'Terça', 'quarta': 'Quarta', 'quinta': 'Quinta', 'sexta': 'Sexta', 'sabado': 'Sábado' };
    var textoFechado = configGet(config, 'mensagens.texto_fechado', 'FECHADO');
    var linhas = [];
    for (var d = 0; d < dias.length; d++) {
      var dia = dias[d];
      var info = config.horarios[dia];
      if (!info) continue;
      if (info.fechado) {
        linhas.push('- ' + (nomesDias[dia] || dia) + ': ' + textoFechado);
        continue;
      }
      var partesCozinha = [];
      var partesEncomendas = [];
      var periodos = info.periodos || info.cozinha || [];
      if (periodos.length > 0) {
        for (var p = 0; p < periodos.length; p++) {
          if (periodos[p].abertura) {
            partesCozinha.push(periodos[p].abertura + ' às ' + periodos[p].fechamento);
          }
        }
      }
      if (info.encomendas && info.encomendas.length > 0) {
        for (var p2 = 0; p2 < info.encomendas.length; p2++) {
          if (info.encomendas[p2].abertura) {
            partesEncomendas.push(info.encomendas[p2].abertura + ' às ' + info.encomendas[p2].fechamento);
          }
        }
      }
      var linha = '';
      if (partesCozinha.length > 0) linha += 'Funcionamento: ' + partesCozinha.join(', ');
      if (partesEncomendas.length > 0) {
        if (linha) linha += ' | ';
        linha += 'Encomendas: ' + partesEncomendas.join(', ');
      }
      if (linha) linhas.push('- ' + (nomesDias[dia] || dia) + ': ' + linha);
    }
    if (linhas.length > 0) {
      horariosTexto = '\n' + (configGet(config, 'rotulos.horarios', 'HORÁRIOS DE FUNCIONAMENTO (cozinha):')) + '\n' + linhas.join('\n');
    }
  }

  var aceitaPedidosDesde = config.pedidos_aceitos_desde || '08:00';
  var rotulosRefeicoes = configGet(config, 'rotulos.refeicoes', { almoco: 'Almoço', jantar: 'Jantar', jantar_inicio: '17:00' });
  var janelasPedido = '';
  var hojeIdx = new Date().getDay();
  var diasSemana2 = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  var configHoje = config.horarios?.[diasSemana2[hojeIdx]];
  if (configHoje && !configHoje.fechado) {
    var periodosHoje = configHoje.periodos || configHoje.cozinha || [];
    if (periodosHoje.length > 0) {
      janelasPedido = '\n' + configGet(config, 'rotulos.janelas_pedido', 'JANELAS DE PEDIDO (para hoje):') + '\n';
      for (var pp = 0; pp < periodosHoje.length; pp++) {
        if (periodosHoje[pp].abertura && periodosHoje[pp].fechamento) {
          var aberturaPeriodo = periodosHoje[pp].abertura;
          var fechamentoPeriodo = periodosHoje[pp].fechamento;
          var horaAbertura = parseInt(aberturaPeriodo.split(':')[0]);
          var nomeRefeicao = horaAbertura < 16 ? rotulosRefeicoes.almoco : rotulosRefeicoes.jantar;
          var inicioPedido = nomeRefeicao === rotulosRefeicoes.almoco ? aceitaPedidosDesde : (rotulosRefeicoes.jantar_inicio || '17:00');
          janelasPedido += '- ' + nomeRefeicao + ': pedidos a partir das ' + inicioPedido + ' até as ' + fechamentoPeriodo + ' (cozinha funciona das ' + aberturaPeriodo + ' às ' + fechamentoPeriodo + ')\n';
        }
      }
    }
  }
  if (!janelasPedido) {
    janelasPedido = '\n' + substituirVariaveis(configGet(config, 'rotulos.aceitacao_pedidos_fallback', 'ACEITAÇÃO DE PEDIDOS: Pedidos podem ser feitos a partir das {{pedidos_aceitos_desde}} da manhã.'), config) + '\n';
  }
  var pedidoTexto = janelasPedido;

  var rotulosAtendimento = configGet(config, 'rotulos.tipos_atendimento', { consumo_local: 'consumo no local', retirada: 'retirada', delivery: 'delivery' });
  var tiposTexto = Array.isArray(config.tipos_atendimento) ? config.tipos_atendimento.map(function(t) { return rotulosAtendimento[t] || t; }).join(', ') : '';

  var prompt = 'Você é o assistente virtual do ' + (config.nome_negocio || 'restaurante') + '. Responda em português, de forma natural, amigável e objetiva.\n\n' +
    'INFORMAÇÕES DO RESTAURANTE:\n' +
    '- Nome: ' + (config.nome_negocio || '') + '\n' +
    '- Endereço: ' + (config.endereco || '') + '\n' +
    '- Telefone: ' + (config.telefone || '') +
    (redesTexto || '') + '\n' +
    '- Tipos de atendimento: ' + tiposTexto + '\n' +
    '- Pedidos online: ' + (config.link_pedido_online || '') + '\n' +
    '- Observações: ' + (config.observacoes_gerais || '') +
    horariosTexto;

  if (regrasTexto) {
    prompt += '\n\n' + regrasTexto;
  }

  // Conhecimento encontrado (usado como contexto, não resposta literal)
  if (conhecimento && conhecimento.pergunta && conhecimento.resposta) {
    prompt += '\n\nINFORMAÇÃO ENCONTRADA NA BASE DE CONHECIMENTO:\n' +
      '- Pergunta similar: "' + conhecimento.pergunta + '"\n' +
      '- Informação disponível: ' + conhecimento.resposta;
  }

  prompt += pedidoTexto +
    '\n\nDATA/HORA ATUAL: ' + new Date().toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false }) +
    '\n\nMENSAGEM DO CLIENTE: "' + mensagem + '"\n\n' +
    'Siga todas as REGRAS DO ESTABELECIMENTO e use as INFORMAÇÕES ENCONTRADAS NA BASE DE CONHECIMENTO (se houver) para responder. Interprete e responda de forma natural, como um atendente humano faria — não copie textos literalmente.';

  return prompt;
}

// ─── Gemini: Consultar IA ──────────────────────────

async function consultarGemini(mensagem, config, regras, creds, conhecimento) {
  return new Promise((resolve) => {
    const prompt = montarPromptIA(mensagem, config, regras, conhecimento);

    const model = creds.gemini?.model || 'gemini-2.0-flash-lite';
    const apiKey = creds.gemini?.api_key;

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const req = https.request(options, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try {
          const json = JSON.parse(data);
          const resposta = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
          if (!resposta) {
            console.error('[gemini] resposta vazia, erro:', json?.error?.message || JSON.stringify(json).substring(0, 300));
          }
          resolve(resposta);
        } catch (e) {
          console.error('[gemini] parse error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('[gemini] request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// ─── Groq: Consultar IA ───────────────────────────

function consultarGroq(mensagem, config, regras, creds, conhecimento) {
  return new Promise((resolve) => {
    const model = creds.llm?.model || 'llama-3.3-70b-versatile';
    const apiKey = creds.llm?.api_key;
    const prompt = montarPromptIA(mensagem, config, regras, conhecimento);

    const postData = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'Você é o assistente virtual do ' + (config.nome_negocio || 'restaurante') + '. Responda em português, de forma natural e amigável.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const opts = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      timeout: 20000,
    };

    const req = https.request(opts, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try {
          const json = JSON.parse(data);
          const resposta = json?.choices?.[0]?.message?.content || null;
          if (!resposta) {
            console.error('[groq] resposta vazia, erro:', json?.error?.message || JSON.stringify(json).substring(0, 300));
          }
          resolve(resposta);
        } catch (e) {
          console.error('[groq] parse error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('[groq] request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// ─── LLM: Testar conexão (funciona pra Groq ou Gemini) ─

app.post('/api/llm/test', async (req, res) => {
  try {
    const creds = getCreds();
    const provider = creds.llm?.provider || 'gemini';

    if (provider === 'groq') {
      const apiKey = creds.llm?.api_key;
      if (!apiKey) return res.json({ success: false, error: 'Chave Groq não configurada' });

      const model = creds.llm?.model || 'llama-3.3-70b-versatile';
      const postData = JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Diga apenas: OK' }],
        max_tokens: 10,
      });

      return new Promise((resolve) => {
        const opts = {
          hostname: 'api.groq.com',
          path: '/openai/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
          },
          timeout: 20000,
        };
        const req = https.request(opts, (r) => {
          let data = '';
          r.on('data', c => data += c);
          r.on('end', () => {
            try {
              const json = JSON.parse(data);
              const texto = json?.choices?.[0]?.message?.content;
              if (texto) {
                resolve(res.json({ success: true, resposta: texto }));
              } else {
                resolve(res.json({ success: false, error: json?.error?.message || JSON.stringify(json).substring(0, 300) }));
              }
            } catch (e) {
              resolve(res.json({ success: false, error: 'Erro ao parsear: ' + e.message }));
            }
          });
        });
        req.on('error', (e) => resolve(res.json({ success: false, error: 'Erro de conexão: ' + e.message })));
        req.on('timeout', () => { req.destroy(); resolve(res.json({ success: false, error: 'Timeout (20s)' })); });
        req.write(postData);
        req.end();
      });
    } else {
      // Testar Gemini
      const apiKey = creds.gemini?.api_key;
      if (!apiKey) return res.json({ success: false, error: 'Chave Gemini não configurada' });

      const model = creds.gemini?.model || 'gemini-2.0-flash-lite';
      const postData = JSON.stringify({ contents: [{ parts: [{ text: 'Diga apenas: OK' }] }] });

      return new Promise((resolve) => {
        const opts = {
          hostname: 'generativelanguage.googleapis.com',
          path: `/v1/models/${model}:generateContent?key=${apiKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        };
        const req = https.request(opts, (r) => {
          let data = '';
          r.on('data', c => data += c);
          r.on('end', () => {
            try {
              const json = JSON.parse(data);
              const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (texto) {
                resolve(res.json({ success: true, resposta: texto }));
              } else {
                resolve(res.json({ success: false, error: json?.error?.message || JSON.stringify(json).substring(0, 300) }));
              }
            } catch (e) {
              resolve(res.json({ success: false, error: 'Erro ao parsear: ' + e.message }));
            }
          });
        });
        req.on('error', (e) => resolve(res.json({ success: false, error: 'Erro de conexão: ' + e.message })));
        req.on('timeout', () => { req.destroy(); resolve(res.json({ success: false, error: 'Timeout (15s)' })); });
        req.write(postData);
        req.end();
      });
    }
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── Evolution: Testar Conexão com a IA (legado) ─

app.post('/api/evolution/test-ia', async (req, res) => {
  try {
    const config = readJson('config.json') || {};
    const regras = readJson('regras.json') || [];
    const creds = getCreds();
    const provider = creds.llm?.provider || 'gemini';
    const apiKey = provider === 'groq' ? creds.llm?.api_key : creds.gemini?.api_key;
    if (!apiKey) return res.json({ success: false, error: 'Nenhuma chave configurada' });

    const resposta = provider === 'groq'
      ? await consultarGroq(req.body?.mensagem || 'Ola', config, regras, creds)
      : await consultarGemini(req.body?.mensagem || 'Ola', config, regras, creds);
    res.json({ success: true, resposta });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── Gemini: Testar chave direto (deprecated, use /api/llm/test) ─

// ─── Gemini: Testar chave direto (exibe erro real) ─

app.post('/api/gemini/test', async (req, res) => {
  try {
    const creds = getCreds();
    const apiKey = creds.gemini?.api_key;
    if (!apiKey) return res.json({ success: false, error: 'Nenhuma chave configurada' });

    const model = creds.gemini?.model || 'gemini-2.0-flash-lite';
    const postData = JSON.stringify({ contents: [{ parts: [{ text: 'Diga apenas: OK' }] }] });

    return new Promise((resolve) => {
      const opts = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      };
      const req = https.request(opts, (r) => {
        let data = '';
        r.on('data', c => data += c);
        r.on('end', () => {
          try {
            const json = JSON.parse(data);
            const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (texto) {
              resolve(res.json({ success: true, resposta: texto }));
            } else {
              resolve(res.json({ success: false, error: json?.error?.message || JSON.stringify(json).substring(0, 300) }));
            }
          } catch (e) {
            resolve(res.json({ success: false, error: 'Erro ao parsear resposta: ' + e.message, raw: data.substring(0, 300) }));
          }
        });
      });
      req.on('error', (e) => resolve(res.json({ success: false, error: 'Erro de conexão: ' + e.message })));
      req.on('timeout', () => { req.destroy(); resolve(res.json({ success: false, error: 'Timeout (15s)' })); });
      req.write(postData);
      req.end();
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── Knowledge helpers ──────────────────────────────

function carregarLearn() {
  var dados = readJson('nao_sei.json');
  if (!Array.isArray(dados)) { writeJson('nao_sei.json', []); dados = []; }
  return { perguntas: dados };
}

function salvarLearn(learn) {
  writeJson('nao_sei.json', learn.perguntas || []);
}

function carregarKnowledge() {
  var dados = readJson('aprendizados.json');
  if (!Array.isArray(dados)) { writeJson('aprendizados.json', []); dados = []; }
  return { respostas: dados };
}

function salvarKnowledge(knowledge) {
  writeJson('aprendizados.json', knowledge.respostas || []);
}

function normalizeText(t) {
  if (!t) return '';
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function extrairTokens(t) {
  if (!t) return [];
  var stopwords = {a:1,o:1,e:1,de:1,da:1,do:1,em:1,para:1,com:1,um:1,uma:1,uns:1,umas:1,
    na:1,no:1,nas:1,nos:1,por:1,pra:1,pro:1,se:1,que:1,é:1,tem:1,sao:1,são:1,esta:1,está:1,como:1,
    voce:1,você:1,meu:1,minha:1,seu:1,sua:1,teu:1,tua:1,isso:1,isto:1,aquilo:1,qual:1,
    quem:1,quando:1,onde:1,porque:1,porque:1,pode:1,vai:1,vao:1,vão:1,ter:1,mais:1,mas:1,muito:1,bem:1,
    ainda:1,ja:1,já:1,so:1,só:1,sim:1,nao:1,não:1,tudo:1,todo:1,toda:1,todos:1,todas:1,
    algum:1,alguns:1,alguma:1,algumas:1,esses:1,essas:1,esse:1,essa:1,este:1,esta:1,
    estes:1,estas:1,aquele:1,aquela:1,aqueles:1,aquelas:1,sobre:1,sem:1,entre:1,ate:1,até:1};
  var palavras = normalizeText(t).split(/\s+/).filter(function(p) { return p.length > 2 && !stopwords[p]; });
  var unicas = [];
  for (var i = 0; i < palavras.length; i++) {
    if (unicas.indexOf(palavras[i]) < 0) unicas.push(palavras[i]);
  }
  return unicas;
}

function calcularSimilaridade(tokensMsg, tokensPergunta) {
  if (!tokensMsg || !tokensPergunta || tokensMsg.length === 0 || tokensPergunta.length === 0) return { jaccard: 0, contidos: 0 };
  var perguntaSet = {};
  for (var i = 0; i < tokensPergunta.length; i++) perguntaSet[tokensPergunta[i]] = true;
  var interseccao = 0;
  for (var i = 0; i < tokensMsg.length; i++) {
    if (perguntaSet[tokensMsg[i]]) interseccao++;
  }
  var uniaoSet = {};
  for (var i = 0; i < tokensPergunta.length; i++) uniaoSet[tokensPergunta[i]] = true;
  for (var i = 0; i < tokensMsg.length; i++) uniaoSet[tokensMsg[i]] = true;
  var uniaoCount = 0;
  for (var k in uniaoSet) uniaoCount++;
  var jaccard = uniaoCount > 0 ? interseccao / uniaoCount : 0;
  var contidos = 0;
  for (var i = 0; i < tokensMsg.length; i++) {
    for (var j = 0; j < tokensPergunta.length; j++) {
      if (tokensPergunta[j].indexOf(tokensMsg[i]) >= 0 || tokensMsg[i].indexOf(tokensPergunta[j]) >= 0) { contidos++; break; }
    }
  }
  return { jaccard: jaccard, contidos: tokensMsg.length > 0 ? contidos / tokensMsg.length : 0 };
}

function buscarRespostaConhecida(mensagem, knowledge) {
  if (!mensagem || !knowledge || !Array.isArray(knowledge.respostas)) return null;
  var msgNorm = normalizeText(mensagem);
  var tokensMsg = extrairTokens(mensagem);
  var melhor = null;
  var maiorScore = 0;
  for (var i = 0; i < knowledge.respostas.length; i++) {
    var item = knowledge.respostas[i];
    // Score de palavras-chave
    var scoreKW = 0;
    var palavras = item.palavras_chave;
    if (palavras && Array.isArray(palavras) && palavras.length > 0) {
      var achados = 0;
      for (var j = 0; j < palavras.length; j++) {
        var kw = (palavras[j] || '').toLowerCase().trim();
        if (kw && msgNorm.indexOf(kw) >= 0) achados++;
      }
      scoreKW = achados / palavras.length;
    }
    // Score de similaridade com a pergunta
    var scorePerg = 0;
    if (item.pergunta) {
      var tokensPerg = extrairTokens(item.pergunta);
      var sim = calcularSimilaridade(tokensMsg, tokensPerg);
      scorePerg = Math.max(sim.jaccard, sim.contidos * 0.8);
    }
    // Score combinado (pesos: 40% keywords, 60% similaridade pergunta)
    var score = scoreKW * 0.4 + scorePerg * 0.6;
    if (score > maiorScore) { maiorScore = score; melhor = item; }
  }
  return maiorScore >= 0.1 ? melhor : null;
}

function salvarPerguntaNaoRespondida(telefone, mensagem) {
  try {
    var naoSei = readJson('nao_sei.json') || [];
    if (!Array.isArray(naoSei)) naoSei = [];
    // Evitar duplicatas
    var cincoMin = 5 * 60 * 1000;
    for (var i = 0; i < naoSei.length; i++) {
      if (naoSei[i].telefone === telefone &&
          naoSei[i].pergunta === mensagem &&
          !naoSei[i].respondida &&
          (Date.now() - new Date(naoSei[i].data).getTime()) < cincoMin) return;
    }
    var nome = telefone;
    var convs = readJson('conversas.json') || [];
    if (Array.isArray(convs)) {
      for (var j = 0; j < convs.length; j++) {
        if (convs[j].telefone === telefone) { nome = convs[j].nome || telefone; break; }
      }
    }
    naoSei.push({
      id: 'ns-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      mensagem: mensagem,
      pergunta: mensagem,
      contexto: 'IA não soube responder',
      telefone: telefone,
      nome: nome,
      data: new Date().toISOString(),
      respondida: false,
    });
    writeJson('nao_sei.json', naoSei);
  } catch(e) { console.error('[salvarPerguntaNaoRespondida] erro:', e.message); }
}

// ─── Aprendizado: Perguntas pendentes e respostas aprendidas ──

app.get('/api/aprendizado/pendencias', (req, res) => {
  var learn = carregarLearn();
  res.json({ success: true, data: learn.perguntas || [] });
});

app.post('/api/aprendizado/pendencias/:id/responder', (req, res) => {
  try {
    var body = req.body || {};
    var resposta = body.resposta;
    var palavrasChave = body.palavras_chave;
    if (!resposta) return res.json({ success: false, error: 'Resposta é obrigatória' });

    var learn = carregarLearn();
    var pergunta = null;
    for (var i = 0; i < learn.perguntas.length; i++) {
      if (learn.perguntas[i].id === req.params.id) {
        pergunta = learn.perguntas[i];
        break;
      }
    }
    if (!pergunta) return res.json({ success: false, error: 'Pergunta não encontrada' });

    pergunta.respondida = true;
    pergunta.resposta = resposta;
    salvarLearn(learn);

    var keywords = palavrasChave;
    if (!keywords || keywords.length === 0) {
      keywords = [];
      var words = pergunta.mensagem.toLowerCase().split(/\s+/);
      var stopWords = ['que', 'para', 'como', 'pelo', 'pela', 'com', 'dos', 'das', 'tem', 'você', 'voce', 'mais', 'mas', 'era', 'são', 'sao'];
      for (var w = 0; w < words.length; w++) {
        if (words[w].length > 3 && stopWords.indexOf(words[w]) < 0) {
          keywords.push(words[w]);
        }
      }
    }

    var knowledge = carregarKnowledge();
    knowledge.respostas.push({
      id: 'know-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      pergunta: pergunta.mensagem,
      resposta: resposta,
      palavras_chave: keywords,
      criado_em: new Date().toISOString(),
      usos: 0,
    });
    salvarKnowledge(knowledge);

    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.delete('/api/aprendizado/pendencias/:id', (req, res) => {
  try {
    var learn = carregarLearn();
    var novas = [];
    for (var i = 0; i < learn.perguntas.length; i++) {
      if (learn.perguntas[i].id !== req.params.id) novas.push(learn.perguntas[i]);
    }
    learn.perguntas = novas;
    salvarLearn(learn);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.get('/api/aprendizado/respostas', (req, res) => {
  var knowledge = carregarKnowledge();
  res.json({ success: true, data: knowledge.respostas || [] });
});

app.post('/api/aprendizado/respostas', (req, res) => {
  try {
    var body = req.body || {};
    var pergunta = body.pergunta;
    var resposta = body.resposta;
    var palavrasChave = body.palavras_chave;
    if (!pergunta || !resposta) return res.json({ success: false, error: 'Pergunta e resposta são obrigatórias' });

    var keywords = palavrasChave;
    if (!keywords || keywords.length === 0) {
      keywords = [];
      var words = pergunta.toLowerCase().split(/\s+/);
      var stopWords = ['que', 'para', 'como', 'pelo', 'pela', 'com', 'dos', 'das', 'tem', 'você', 'voce', 'mais', 'mas', 'era', 'são', 'sao'];
      for (var w = 0; w < words.length; w++) {
        if (words[w].length > 3 && stopWords.indexOf(words[w]) < 0) {
          keywords.push(words[w]);
        }
      }
    }

    var knowledge = carregarKnowledge();
    knowledge.respostas.push({
      id: 'know-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      pergunta: pergunta,
      resposta: resposta,
      palavras_chave: keywords,
      criado_em: new Date().toISOString(),
      usos: 0,
    });
    salvarKnowledge(knowledge);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.put('/api/aprendizado/respostas/:id', (req, res) => {
  try {
    var knowledge = carregarKnowledge();
    for (var i = 0; i < knowledge.respostas.length; i++) {
      if (knowledge.respostas[i].id === req.params.id) {
        if (req.body.resposta) knowledge.respostas[i].resposta = req.body.resposta;
        if (req.body.palavras_chave) knowledge.respostas[i].palavras_chave = req.body.palavras_chave;
        if (req.body.pergunta) knowledge.respostas[i].pergunta = req.body.pergunta;
        break;
      }
    }
    salvarKnowledge(knowledge);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.delete('/api/aprendizado/respostas/:id', (req, res) => {
  try {
    var knowledge = carregarKnowledge();
    var novas = [];
    for (var i = 0; i < knowledge.respostas.length; i++) {
      if (knowledge.respostas[i].id !== req.params.id) novas.push(knowledge.respostas[i]);
    }
    knowledge.respostas = novas;
    salvarKnowledge(knowledge);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── Debug: log de erros do frontend ────────────

app.post('/api/dbg/error', (req, res) => {
  console.error('[FRONTEND ERROR]', req.body?.msg);
  res.json({ ok: true });
});

// ─── Iniciar servidor ────────────────────────────

async function init() {
  dockerManager = new DockerManager();

  // Garantir que o diretório de dados exista
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Limpar dados de encomendas antigos/corrompidos do config.json
  try {
    var cfg = readJson('config.json');
    if (cfg && cfg.horarios) {
      var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      var limpou = false;
      for (var d = 0; d < dias.length; d++) {
        if (cfg.horarios[dias[d]] && Array.isArray(cfg.horarios[dias[d]].encomendas)) {
          delete cfg.horarios[dias[d]].encomendas;
          limpou = true;
        }
      }
      if (limpou) {
        writeJson('config.json', cfg);
        console.log('[init] Encomendas antigas removidas do config.json');
      }
    }
  } catch(e) {}

  // ─── Update via GitHub API (sem git) ──────────────────

  const REPO_DIR = path.resolve(__dirname, '..');

  function httpsGet(url) {
    return new Promise(function(resolve, reject) {
      var req = https.get(url, { headers: { 'User-Agent': 'WABOT' } }, function(res) {
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' para ' + url));
        var d = '';
        res.on('data', function(c) { d += c; });
        res.on('end', function() { resolve(d); });
      });
      req.on('error', reject);
      req.setTimeout(20000, function() { req.destroy(); reject(new Error('Timeout')); });
    });
  }

  var FILES_TO_UPDATE = [
    'package.json',
    'start-wabot.bat', 'stop-wabot.bat', 'iniciar.bat', 'atualizar.bat',
    'app/server.js',
    'app/renderer/app.js', 'app/renderer/api.js', 'app/renderer/index.html', 'app/renderer/style.css',
  ];
  var GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/ojuniormartelli/WABOT/main';

  app.get('/api/update/check', async function(req, res) {
    try {
      var data = await httpsGet('https://api.github.com/repos/ojuniormartelli/WABOT/commits/main');
      var commit = JSON.parse(data);
      var latestSha = commit.sha;
      var localVersion = {};
      try { localVersion = JSON.parse(fs.readFileSync(path.join(REPO_DIR, '_version.json'), 'utf8')); } catch(e) {}
      var hasUpdates = localVersion.sha !== latestSha;

      // Buscar changelog (últimos 10 commits)
      var changelog = '';
      try {
        var logData = await httpsGet('https://api.github.com/repos/ojuniormartelli/WABOT/commits?per_page=10');
        var commits = JSON.parse(logData);
        changelog = commits.map(function(c) { return c.sha.substring(0,7) + ' ' + c.commit.message.split('\n')[0]; }).join('\n');
      } catch(e) {}

      res.json({ success: true, hasUpdates, latestSha: latestSha.substring(0,7), localSha: (localVersion.sha || '').substring(0,7), changelog });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  app.post('/api/update/apply', async function(req, res) {
    try {
      // Pega SHA do ultimo commit (para salvar versão)
      var data = await httpsGet('https://api.github.com/repos/ojuniormartelli/WABOT/commits/main');
      var commit = JSON.parse(data);
      var latestSha = commit.sha;

      // Baixar cada arquivo do raw.githubusercontent.com e salvar localmente
      var results = [];
      for (var fi = 0; fi < FILES_TO_UPDATE.length; fi++) {
        var file = FILES_TO_UPDATE[fi];
        try {
          var content = await httpsGet(GITHUB_RAW_BASE + '/' + file);
          var dest = path.join(REPO_DIR, file);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, content, 'utf8');
          results.push(file + ': OK');
        } catch (e) {
          results.push(file + ': ' + e.message);
        }
      }

      // Salvar versão local
      fs.writeFileSync(path.join(REPO_DIR, '_version.json'), JSON.stringify({ sha: latestSha, updatedAt: new Date().toISOString() }, null, 2));

      // npm install
      var npmOut = '';
      try { npmOut = require('child_process').execSync('npm install 2>&1', { cwd: REPO_DIR, timeout: 60000 }).toString(); } catch(e) { npmOut = e.message; }

      res.json({ success: true, files: results, npm: npmOut });

      // Agendar restart
      var restartFile = path.join(REPO_DIR, '_restart.js');
      var serverEntry = path.join(__dirname, 'server.js');
      var isWin = process.platform === 'win32';
      var startCmd;
      if (isWin) {
        startCmd = 'powershell -Command "Start-Process -WindowStyle Hidden -FilePath node -ArgumentList \'' + serverEntry.replace(/\\/g, '\\\\') + '\'"';
      } else {
        startCmd = 'node ' + serverEntry;
      }
      fs.writeFileSync(restartFile,
        'var exec=require("child_process").exec;\n' +
        'setTimeout(function(){\n' +
        '  exec(' + JSON.stringify(startCmd) + ');\n' +
        '},3000);\n'
      );

      var child = require('child_process').spawn('node', [restartFile], {
        detached: true,
        stdio: 'ignore',
        cwd: REPO_DIR,
      });
      child.unref();

      setTimeout(function() {
        console.log('[update] Atualização concluída. Reiniciando servidor...');
        process.exit(0);
      }, 1500);
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║         WaBot - WhatsApp Bot             ║');
    console.log('  ║                                          ║');
    console.log(`  ║  Rodando em: http://localhost:${PORT}        ║`);
    console.log('  ║                                          ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    // Tentar reconectar Evolution automaticamente
    setTimeout(async () => {
      try {
        const creds = getCreds();
        const evoInstance = creds.evolution?.instance_name;
        if (!evoInstance) return;
        const stateResp = await evolutionRequest('GET', '/instance/connectionState/' + encodeURIComponent(evoInstance));
        const state = stateResp?.data?.instance?.state;
        if (state === 'open') {
          console.log('[auto] WhatsApp já conectado');
        } else if (state === 'close' || !state) {
          console.log('[auto] instância não encontrada, ignorando reconexão');
        } else {
          console.log('[auto] estado:', state, '- aguardando conexão manual na página');
        }
      } catch(e) {
        console.log('[auto] Evolution API não disponível');
      }
    }, 5000);
  });
}

init();