// API WaBot
window.wabot = {};

// ─── Docker ───────────────────────────────────────
window.wabot.dockerStatus = () =>
  fetch('/api/docker/status').then(r => r.json());

window.wabot.dockerStart = () =>
  fetch('/api/docker/start', { method: 'POST' }).then(r => r.json());

window.wabot.dockerStop = () =>
  fetch('/api/docker/stop', { method: 'POST' }).then(r => r.json());

window.wabot.dockerLogs = () =>
  fetch('/api/docker/logs').then(r => r.json());

// ─── Config files ─────────────────────────────────
window.wabot.configRead = (filename) =>
  fetch('/api/config/' + filename).then(r => r.json());

window.wabot.configWrite = (filename, content) =>
  fetch('/api/config/' + filename, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  }).then(r => r.json());

// ─── n8n ──────────────────────────────────────────
window.wabot.n8nImportWorkflows = () =>
  fetch('/api/n8n/import-workflows', { method: 'POST' }).then(r => r.json());

window.wabot.n8nWaitReady = () =>
  fetch('/api/n8n/wait-ready').then(r => r.json());

// ─── Evolution API ────────────────────────────────
window.wabot.evolutionStatus = () =>
  fetch('/api/evolution/status').then(r => r.json());

window.wabot.evolutionConnect = (instanceName) =>
  fetch('/api/evolution/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instanceName: instanceName || undefined }),
  }).then(r => r.json());

window.wabot.evolutionDisconnect = () =>
  fetch('/api/evolution/disconnect', { method: 'POST' }).then(r => r.json());

window.wabot.evolutionConversations = () =>
  fetch('/api/evolution/conversations').then(r => r.json());

window.wabot.evolutionHistory = (telefone) =>
  fetch('/api/evolution/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telefone }),
  }).then(r => r.json());

window.wabot.sendMessage = (telefone, mensagem) =>
  fetch('/api/evolution/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telefone, mensagem }),
  }).then(r => r.json());

// ─── IA: Testar ───────────────────────────────────
window.wabot.testIA = (mensagem) =>
  fetch('/api/evolution/test-ia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensagem }),
  }).then(r => r.json());

// ─── Aprendizado Contínuo ────────────────────────
window.wabot.aprendizadoPendencias = () =>
  fetch('/api/aprendizado/pendencias').then(r => r.json());

window.wabot.aprendizadoRespostas = () =>
  fetch('/api/aprendizado/respostas').then(r => r.json());

window.wabot.aprendizadoResponder = (id, resposta) =>
  fetch('/api/aprendizado/pendencias/' + id + '/responder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resposta }),
  }).then(r => r.json());

window.wabot.aprendizadoIgnorar = (id) =>
  fetch('/api/aprendizado/pendencias/' + id, { method: 'DELETE' }).then(r => r.json());

window.wabot.aprendizadoAdicionar = (data) =>
  fetch('/api/aprendizado/respostas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

window.wabot.aprendizadoRemover = (id) =>
  fetch('/api/aprendizado/respostas/' + id, { method: 'DELETE' }).then(r => r.json());
