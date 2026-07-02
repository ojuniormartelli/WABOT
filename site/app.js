// ─── WaBot Landing Page ─────────────────────────

var STATE = {
  botOnline: null,
  botStatus: null,
  dockerOnline: null,
  whatsappOnline: null,
  checking: false,
  versaoLocal: null,
  versaoLatest: null,
  pendencias: 0,
};

// ─── Helpers ────────────────────────────────────

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function detectBrowser() {
  var ua = navigator.userAgent;
  if (ua.indexOf('Chrome') >= 0 || ua.indexOf('Edge') >= 0) return 'chrome';
  if (ua.indexOf('Safari') >= 0) return 'safari';
  if (ua.indexOf('Firefox') >= 0) return 'firefox';
  return 'other';
}

// ─── API calls ──────────────────────────────────

function checkLocalBot() {
  return fetch('http://localhost:3001/api/health', { mode: 'cors', signal: AbortSignal.timeout(3000) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      STATE.botOnline = true;
      STATE.botStatus = data;
      STATE.whatsappOnline = data.whatsapp_conectado;
      return data;
    })
    .catch(function() {
      STATE.botOnline = false;
      STATE.botStatus = null;
      STATE.whatsappOnline = false;
      return null;
    });
}

function checkLocalDocker() {
  return fetch('http://localhost:8081/', { mode: 'cors', signal: AbortSignal.timeout(2000) })
    .then(function(r) {
      STATE.dockerOnline = r.status === 200;
      return STATE.dockerOnline;
    })
    .catch(function() {
      STATE.dockerOnline = false;
      return false;
    });
}

function checkLocalVersao() {
  return fetch('http://localhost:3001/api/versao', { mode: 'cors', signal: AbortSignal.timeout(2000) })
    .then(function(r) { return r.json(); })
    .then(function(data) { STATE.versaoLocal = data; return data; })
    .catch(function() { STATE.versaoLocal = null; return null; });
}

function checkLatestVersao() {
  return fetch('/api/versao')
    .then(function(r) { return r.json(); })
    .then(function(data) { STATE.versaoLatest = data; return data; })
    .catch(function() { return null; });
}

function checkPendencias() {
  return fetch('http://localhost:3001/api/aprendizado/pendencias', { mode: 'cors', signal: AbortSignal.timeout(2000) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success && Array.isArray(data.data)) {
        STATE.pendencias = data.data.filter(function(p) { return !p.respondida; }).length;
      }
      return STATE.pendencias;
    })
    .catch(function() { return 0; });
}

// ─── Render ─────────────────────────────────────

function render() {
  var app = qs('#app');
  if (!app) return;

  if (STATE.botOnline === null && !STATE.checking) {
    app.innerHTML = renderLoading();
    checkAll();
    return;
  }

  if (STATE.checking) {
    app.innerHTML = renderChecking();
    return;
  }

  app.innerHTML = renderPage();
}

function renderLoading() {
  return '<div class="min-h-screen flex items-center justify-center bg-gray-50">' +
    '<div class="text-center">' +
      '<div class="w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>' +
      '<p class="text-gray-400 text-sm">Verificando status do WaBot...</p>' +
    '</div></div>';
}

function renderChecking() {
  return '<div class="min-h-screen flex items-center justify-center bg-gray-50">' +
    '<div class="text-center">' +
      '<div class="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>' +
      '<p class="text-gray-400 text-sm">Verificando...</p>' +
    '</div></div>';
}

function renderPage() {
  var isOnline = STATE.botOnline === true;
  var sections = '';

  if (isOnline) {
    sections = renderNav(true) + renderHero(true) + renderDashboard() + renderAprendizadoResumo() + renderFooter();
  } else {
    sections = renderNav(false) + renderHero(false) + renderFeatures() + renderInstalacao() + renderFooter();
  }

  return sections;
}

// ─── Nav ─────────────────────────────────────────

function renderNav(online) {
  var statusClass = online ? 'status-dot--online' : 'status-dot--offline';
  var statusText = online ? (STATE.whatsappOnline ? 'Online' : 'Bot ativo') : 'Offline';
  var statusLabel = online ? (STATE.whatsappOnline ? 'WhatsApp Conectado' : 'Bot ativo, WhatsApp desconectado') : 'Bot não detectado';

  return '<nav class="bg-white border-b border-gray-200 sticky top-0 z-50">' +
    '<div class="max-w-6xl mx-auto px-4 sm:px-6">' +
      '<div class="flex items-center justify-between h-16">' +
        '<div class="flex items-center gap-2.5">' +
          '<div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"/></svg>' +
          '</div>' +
          '<span class="font-bold text-gray-800 text-lg">WaBot</span>' +
        '</div>' +
        '<div class="flex items-center gap-3">' +
          '<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ' + (online ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600') + '">' +
            '<span class="status-dot ' + statusClass + '"></span>' +
            '<span>' + statusText + '</span>' +
          '</div>' +
          (online
            ? '<button onclick="abrirPainelLocal()" class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">Abrir Painel</button>'
            : '') +
          '<button onclick="refrescar()" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Atualizar status">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</nav>';
}

// ─── Hero ────────────────────────────────────────

function renderHero(online) {
  var nome = STATE.botStatus && STATE.botStatus.nome_negocio ? STATE.botStatus.nome_negocio : '';

  if (online) {
    return '<section class="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white">' +
      '<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">' +
        '<div class="flex flex-col sm:flex-row items-center justify-between gap-6">' +
          '<div>' +
            '<h1 class="text-2xl sm:text-3xl font-bold mb-2">' + esc(nome || 'WaBot') + '</h1>' +
            '<p class="text-emerald-100 text-sm sm:text-base">Bot está online e funcionando</p>' +
          '</div>' +
          '<div class="flex items-center gap-4">' +
            '<div class="text-center px-4 py-2 bg-white/10 rounded-xl">' +
              '<div class="text-2xl font-bold">' + formatarUptime(STATE.botStatus.uptime) + '</div>' +
              '<div class="text-xs text-emerald-200">de atividade</div>' +
            '</div>' +
            '<div class="text-center px-4 py-2 bg-white/10 rounded-xl">' +
              '<div class="text-2xl font-bold">' + (STATE.whatsappOnline ? 'Conectado' : 'Desconectado') + '</div>' +
              '<div class="text-xs text-emerald-200">WhatsApp</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  return '<section class="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white">' +
    '<div class="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">' +
      '<div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"/></svg>' +
      '</div>' +
      '<h1 class="text-3xl sm:text-4xl font-bold mb-4">WaBot</h1>' +
      '<p class="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">Atendente inteligente para WhatsApp do seu negócio. Automático, aprendiz e disponível 24h.</p>' +
      '<div class="flex flex-wrap justify-center gap-3">' +
        '<button onclick="scrollPara(\'instalacao\')" class="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition-colors shadow-lg">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
          'Instalar Agora' +
        '</button>' +
        '<button onclick="scrollPara(\'features\')" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-400 transition-colors">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          'Saiba Mais' +
        '</button>' +
      '</div>' +
    '</div>' +
  '</section>';
}

// ─── Features ────────────────────────────────────

function renderFeatures() {
  return '<section id="features" class="py-16 sm:py-20 bg-white">' +
    '<div class="max-w-6xl mx-auto px-4 sm:px-6">' +
      '<h2 class="text-2xl sm:text-3xl font-bold text-center mb-12">Por que usar o WaBot?</h2>' +
      '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">' +
        featureCard(
          '🤖',
          'IA Inteligente',
          'Usa Google Gemini ou Groq (grátis) para entender e responder seus clientes de forma natural.'
        ) +
        featureCard(
          '💬',
          'Automático 24h',
          'Responde automaticamente no WhatsApp mesmo quando você está dormindo ou ocupado.'
        ) +
        featureCard(
          '📚',
          'Aprende com você',
          'Quando não sabe responder, pergunta pra você. Na próxima vez, já sabe a resposta.'
        ) +
        featureCard(
          '🔒',
          '100% Local',
          'Tudo roda na sua máquina. Seus dados e conversas não saem do seu computador.'
        ) +
        featureCard(
          '⚡',
          'Fácil de Instalar',
          'Docker + WaBot. Em 5 minutos já está funcionando. Não precisa de conhecimento técnico.'
        ) +
        featureCard(
          '🆓',
          'Gratuito',
          'Sem mensalidades. Só precisa do seu computador ligado e uma chave de IA gratuita.'
        ) +
      '</div>' +
    '</div>' +
  '</section>';
}

function featureCard(icon, title, desc) {
  return '<div class="feature-card bg-gray-50 rounded-xl p-6 border border-gray-100 transition-all cursor-default">' +
    '<div class="text-3xl mb-4">' + icon + '</div>' +
    '<h3 class="font-semibold text-gray-800 mb-2">' + title + '</h3>' +
    '<p class="text-sm text-gray-500 leading-relaxed">' + desc + '</p>' +
  '</div>';
}

// ─── Instalação (Checklist) ─────────────────────

function renderInstalacao() {
  var dockerOk = STATE.dockerOnline;
  var botOk = STATE.botOnline;

  return '<section id="instalacao" class="py-16 sm:py-20 bg-gray-50">' +
    '<div class="max-w-3xl mx-auto px-4 sm:px-6">' +
      '<h2 class="text-2xl sm:text-3xl font-bold text-center mb-4">Instalação</h2>' +
      '<p class="text-gray-500 text-center mb-10 max-w-lg mx-auto">Siga os passos abaixo para instalar o WaBot no seu computador.</p>' +
      '<div class="space-y-4">' +
        renderPasso(1, 'docker', 'Docker Desktop', 'Necessário para rodar a Evolution API (conexão com WhatsApp).', dockerOk) +
        renderPasso(2, 'wabot', 'WaBot', 'Baixe e extraia o WaBot. Execute o instalador para configurar.', botOk) +
        renderPasso(3, 'whatsapp', 'WhatsApp', 'Conecte seu WhatsApp escaneando o QR Code no painel do WaBot.', STATE.whatsappOnline) +
      '</div>' +
      renderVersaoInfo() +
    '</div>' +
  '</section>';
}

function renderPasso(num, id, titulo, descricao, concluido) {
  var statusClass = concluido === true ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500';
  var statusIcon = concluido === true
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<span>' + num + '</span>';
  var acoesHtml = '';

  if (id === 'docker') {
    acoesHtml = '<div class="flex flex-wrap gap-2">' +
      '<a href="https://www.docker.com/products/docker-desktop/" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        'Baixar Docker' +
      '</a>' +
      '<button onclick="verificarDocker()" class="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
        (concluido === true ? 'OK' : 'Verificar') +
      '</button>' +
    '</div>';
  } else if (id === 'wabot') {
    acoesHtml = '<div class="flex flex-wrap gap-2">' +
      '<a href="https://github.com/ojuniormartelli/lp-casarao-do-gui/releases/latest" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        'Baixar WaBot' +
      '</a>' +
      '<button onclick="verificarBot()" class="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
        (concluido === true ? 'OK' : 'Verificar') +
      '</button>' +
    '</div>';
  } else if (id === 'whatsapp') {
    acoesHtml = '<div class="flex flex-wrap gap-2">' +
      '<button onclick="abrirPainelLocal()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
        'Abrir Painel' +
      '</button>' +
      '<button onclick="verificarWhatsApp()" class="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
        (concluido === true ? 'OK' : 'Verificar') +
      '</button>' +
    '</div>';
  }

  var bgClass = concluido === true ? 'border-emerald-200 bg-emerald-50/50' : 'bg-white border-gray-200';
  var statusBadge = concluido === true
    ? '<span class="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">Concluído</span>'
    : '<span class="text-xs text-gray-400">Pendente</span>';

  return '<div class="step-transition rounded-xl border p-5 ' + bgClass + '">' +
    '<div class="flex items-start gap-4">' +
      '<div class="step-number ' + statusClass + '">' + statusIcon + '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center gap-2 mb-1">' +
          '<h3 class="font-semibold text-gray-800">' + titulo + '</h3>' +
          statusBadge +
        '</div>' +
        '<p class="text-sm text-gray-500 mb-3">' + descricao + '</p>' +
        acoesHtml +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderVersaoInfo() {
  if (!STATE.versaoLocal && !STATE.versaoLatest) return '';

  var local = STATE.versaoLocal ? STATE.versaoLocal.version : '—';
  var latest = STATE.versaoLatest ? STATE.versaoLatest.version : '—';
  var desatualizado = STATE.versaoLocal && STATE.versaoLatest && STATE.versaoLocal.version !== STATE.versaoLatest.version;

  if (desatualizado) {
    return '<div class="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">' +
      '<div class="flex items-start gap-3">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
        '<div>' +
          '<p class="text-sm font-medium text-amber-800">Nova versão disponível!</p>' +
          '<p class="text-xs text-amber-600 mt-1">Local: ' + local + ' · Última: ' + latest + '</p>' +
          '<a href="' + (STATE.versaoLatest.downloadUrl || '#') + '" target="_blank" class="inline-flex items-center gap-1 text-sm text-amber-700 font-medium mt-2 hover:text-amber-800">Baixar atualização →</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  if (STATE.versaoLocal) {
    return '<div class="mt-6 text-center text-xs text-gray-400">Versão ' + local + '</div>';
  }

  return '';
}

// ─── Dashboard ──────────────────────────────────

function renderDashboard() {
  var nome = STATE.botStatus && STATE.botStatus.nome_negocio ? STATE.botStatus.nome_negocio : 'WaBot';

  return '<section class="py-8 bg-white border-b border-gray-200">' +
    '<div class="max-w-6xl mx-auto px-4 sm:px-6">' +
      '<div class="flex items-center justify-between mb-6">' +
        '<h2 class="text-xl font-bold text-gray-800">Dashboard</h2>' +
        '<span class="text-xs text-gray-400">Atualizado há poucos segundos</span>' +
      '</div>' +
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">' +
        dashboardCard('🤝', 'WhatsApp', STATE.whatsappOnline ? 'Conectado' : 'Desconectado', STATE.whatsappOnline ? 'text-emerald-600' : 'text-red-500') +
        dashboardCard('📋', 'Versão', STATE.versaoLocal ? STATE.versaoLocal.version : '—', 'text-gray-600') +
        dashboardCard('📚', 'Aprendizados', String(STATE.pendencias) + ' pendentes', STATE.pendencias > 0 ? 'text-amber-600' : 'text-gray-400') +
        dashboardCard('⏱', 'Ativo há', formatarUptime(STATE.botStatus ? STATE.botStatus.uptime : 0), 'text-gray-600') +
      '</div>' +
    '</div>' +
  '</section>';
}

function dashboardCard(icon, label, value, valueClass) {
  return '<div class="metric-card bg-gray-50 rounded-xl p-4 border border-gray-100">' +
    '<div class="text-lg mb-1">' + icon + '</div>' +
    '<div class="text-xs text-gray-400 mb-0.5">' + label + '</div>' +
    '<div class="text-sm font-semibold ' + valueClass + '">' + value + '</div>' +
  '</div>';
}

// ─── Aprendizado Resumo ─────────────────────────

function renderAprendizadoResumo() {
  if (STATE.pendencias === 0) return '';

  return '<section class="py-6 bg-amber-50 border-b border-amber-100">' +
    '<div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">' +
      '<div class="flex items-center gap-3">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
        '<p class="text-sm text-amber-800 font-medium">' + STATE.pendencias + ' pergunta(s) aguardando resposta no aprendizado</p>' +
      '</div>' +
      '<button onclick="abrirPainelLocal()" class="text-sm text-amber-700 font-medium hover:text-amber-800">Responder →</button>' +
    '</div>' +
  '</section>';
}

// ─── Footer ─────────────────────────────────────

function renderFooter() {
  return '<footer class="bg-white border-t border-gray-200 py-8">' +
    '<div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">' +
      '<div class="flex items-center justify-center gap-2 mb-3">' +
        '<div class="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"/></svg>' +
        '</div>' +
        '<span class="font-semibold text-gray-700">WaBot</span>' +
      '</div>' +
      '<p class="text-xs text-gray-400">Atendente inteligente para WhatsApp</p>' +
      '<p class="text-xs text-gray-400 mt-1">Versão ' + (STATE.versaoLatest ? STATE.versaoLatest.version : '1.0.0') + '</p>' +
    '</div>' +
  '</footer>';
}

// ─── Ações ──────────────────────────────────────

window.verificarDocker = function() {
  STATE.checking = true;
  render();
  checkLocalDocker().then(function() {
    STATE.checking = false;
    render();
    scrollPara('instalacao');
  });
};

window.verificarBot = function() {
  STATE.checking = true;
  render();
  checkLocalBot().then(function() {
    STATE.checking = false;
    render();
    scrollPara('instalacao');
  });
};

window.verificarWhatsApp = function() {
  STATE.checking = true;
  render();
  checkLocalBot().then(function() {
    STATE.checking = false;
    render();
    scrollPara('instalacao');
  });
};

window.abrirPainelLocal = function() {
  window.open('http://localhost:3001', '_blank');
};

window.refrescar = function() {
  STATE.checking = true;
  render();
  checkAll();
};

window.scrollPara = function(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ─── Utilitários ────────────────────────────────

function formatarUptime(segundos) {
  if (!segundos && segundos !== 0) return '—';
  var h = Math.floor(segundos / 3600);
  var m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'min';
}

// ─── Inicialização ──────────────────────────────

function checkAll() {
  STATE.checking = true;

  Promise.all([
    checkLocalBot(),
    checkLocalDocker(),
    checkLocalVersao(),
    checkLatestVersao(),
  ]).then(function() {
    // Se bot online, buscar também pendências
    if (STATE.botOnline) {
      return checkPendencias();
    }
  }).then(function() {
    STATE.checking = false;
    render();
    // Se bot online, atualizar status a cada 30s
    if (STATE.botOnline) {
      setTimeout(checkAll, 30000);
    }
  }).catch(function() {
    STATE.checking = false;
    render();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  render();
});
