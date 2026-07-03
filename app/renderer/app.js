var APP_VERSION = '1.0.2';

// ─── Ícones SVG ─────────────────────────────────────
var I = {};

function ic(path, size, cls) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || '') + '">' + path + '</svg>';
}

I.bot = function(s, c) { return ic('<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2ZM9 12v2m6-2v2m-6 4h6"/>', s, c); };
I.layoutDashboard = function(s, c) { return ic('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>', s, c); };
I.messageSquare = function(s, c) { return ic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', s, c); };
I.settings = function(s, c) { return ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>', s, c); };
I.fileText = function(s, c) { return ic('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>', s, c); };
I.shieldBan = function(s, c) { return ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>', s, c); };
I.clipboardList = function(s, c) { return ic('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="8" y1="8" x2="10" y2="8"/>', s, c); };
I.externalLink = function(s, c) { return ic('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>', s, c); };
I.arrowLeft = function(s, c) { return ic('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>', s, c); };
I.arrowRight = function(s, c) { return ic('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>', s, c); };
I.pause = function(s, c) { return ic('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>', s, c); };
I.moon = function(s, c) { return ic('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', s, c); };
I.play = function(s, c) { return ic('<polygon points="5 3 19 12 5 21 5 3"/>', s, c); };
I.userCircle = function(s, c) { return ic('<path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/>', s, c); };
I.send = function(s, c) { return ic('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>', s, c); };
I.sparkles = function(s, c) { return ic('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>', s, c); };
I.search = function(s, c) { return ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', s, c); };
I.save = function(s, c) { return ic('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>', s, c); };
I.eye = function(s, c) { return ic('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', s, c); };
I.helpCircle = function(s, c) { return ic('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>', s, c); };
I.checkCircle2 = function(s, c) { return ic('<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>', s, c); };
I.circle = function(s, c) { return ic('<circle cx="12" cy="12" r="10"/>', s, c); };
I.plus = function(s, c) { return ic('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', s, c); };
I.trash2 = function(s, c) { return ic('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>', s, c); };
I.toggleRight = function(s, c) { return ic('<rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/>', s, c); };
I.toggleLeft = function(s, c) { return ic('<rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="8" cy="12" r="3"/>', s, c); };
I.activity = function(s, c) { return ic('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', s, c); };
I.square = function(s, c) { return ic('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>', s, c); };
I.refreshCw = function(s, c) { return ic('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>', s, c); };
I.loader2 = function(s, c) { return ic('<path d="M21 12a9 9 0 1 1-6.219-8.56"/>', s, c); };
I.x = function(s, c) { return ic('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', s, c); };
I.info = function(s, c) { return ic('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>', s, c); };
I.globe = function(s, c) { return ic('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', s, c); };
I.download = function(s, c) { return ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', s, c); };
I.camera = function(s, c) { return ic('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>', s, c); };
I.zap = function(s, c) { return ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', s, c); };

var HELP = {
  credenciais: [
    'Aqui você configura as conexões externas do WaBot:',
    ['Provedor de IA', 'Escolha entre Gemini (Google) ou Groq. Ambos são gratuitos. Gere uma chave de API no site do provedor escolhido.'],
    ['Evolution API', 'Gerencia a conexão com o WhatsApp via Docker. Clique em "Conectar WhatsApp" para escanear o QR Code.'],
    ['Instância Evolution', 'Se você já tem uma instância Evolution rodando, pode informar a URL e a chave de API. Caso contrário, mantenha o padrão.'],
  ],
  regras: [
    'Regras definem o COMPORTAMENTO do bot.',
    ['Como funciona', 'Escreva instruções em linguagem natural. A IA lê todas as regras ativas antes de responder cada mensagem.'],
    ['Quando usar', 'Tom de voz, limites do que o bot pode falar, proibições, instruções de atendimento, políticas do negócio.'],
    ['Dica', 'Seja específico. Em vez de "seja educado", prefira "trate o cliente como senhor/senhora e agradeça ao final".'],
  ],
  aprendizado: [
    'Aprendizado é a BASE DE CONHECIMENTO do bot — perguntas e respostas do seu negócio.',
    ['Pendentes', 'Perguntas que o bot recebeu e não soube responder. Você ensina a resposta e ele aprende.'],
    ['Aprendidas', 'Todas as perguntas e respostas que o bot já aprendeu. Pode editar ou excluir.'],
    ['Novo Conhecimento', 'Adicione manualmente perguntas e respostas que o bot deve saber, com palavras-chave para ajudar na busca.'],
  ],
  configuracoes: [
    'Configure os dados do seu negócio para o bot personalizar as respostas.',
    ['Dados Básicos', 'Nome, endereço, telefone e links que o bot usará para informar clientes.'],
    ['Horários', 'Defina os dias e horários de funcionamento. Fora do horário, o bot usa a mensagem de ausência.'],
    ['Mensagens Padrão', 'Personalize as mensagens automáticas: saudação, ausência, quando não sabe responder e agradecimento.'],
  ],
};

var state = {
  currentPage: 'dashboard',
  dockerStatus: null,
  setupCompleto: null,
  pageHelp: false,
  sidebar: { collapsed: false },
  setup: {
    creds: { evolution: { api_key: '', base_url: 'http://localhost:8081', instance_name: '' }, gemini: { api_key: '', model: 'gemini-2.0-flash' } },
    config: { nome_negocio: '', endereco: '', telefone: '', site: '', link_pedido_online: '' },
  },
  credenciais: {
    creds: { evolution: { api_key: '', base_url: 'http://localhost:8081', instance_name: '' }, gemini: { api_key: '', model: 'gemini-2.0-flash-lite' }, llm: { provider: 'groq', api_key: '', model: 'llama-3.3-70b-versatile' } },
    evoStatus: null,
    saving: false,
    saved: false,
  },
  configuracoes: {
    config: { nome_negocio: '', endereco: '', telefone: '', site: '', redes_sociais: { instagram: '', facebook: '', ifood: '' }, link_pedido_online: '', observacoes_gerais: '', tipos_atendimento: [], horarios: {}, mensagem_saudacao: '', mensagem_ausencia: '', mensagem_regra_nao_encontrada: '', mensagem_agradecimento: '' },
    saving: false,
    saved: false,
  },
  conversas: {
    contatos: [],
    busca: '',
    contatoSelecionado: null,
  },
  chat: {
    mensagens: [],
    texto: '',
    status: 'bot',
    sugerindo: false,
    sugestaoIA: '',
    enviando: false,
  },
  regras: [],
  ignorados: [],
  aprendizado: {
    pendencias: [],
    respostas: [],
    tab: 'pendencias',
    respondendoId: null,
    respostaTexto: '',
    novaPergunta: '',
    novaResposta: '',
    novasPalavrasChave: '',
  },
  dashboard: { checklist: [] },
};

// ─── Helpers ───────────────────────────────────────
function el(sel) { return document.querySelector(sel); }
function elId(id) { return document.getElementById(id); }

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function loadingScreen() {
  return '<div class="h-screen flex items-center justify-center bg-gray-50"><div class="text-center"><div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-500">Preparando...</p></div></div>';
}

// ─── Roteador ──────────────────────────────────────
function navegar(page) {
  state.currentPage = page;
  render();
}

// ─── Help ────────────────────────────────────────

function toggleHelp() {
  state.pageHelp = !state.pageHelp;
  if (HELP[state.currentPage]) render();
}

function renderHelp(pageId) {
  if (!state.pageHelp) return '';
  var items = HELP[pageId];
  if (!items) return '';
  var title = items[0];
  var details = items.slice(1);
  var html = '<div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-sm">' +
    '<div class="flex items-start gap-3">' +
      '<div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">' + I.info(18, 'text-blue-600') + '</div>' +
      '<div class="flex-1">' +
        '<p class="text-blue-800 font-medium mb-3">' + esc(title) + '</p>';
  for (var i = 0; i < details.length; i++) {
    var d = details[i];
    html += '<div class="mb-2 last:mb-0">' +
      '<span class="font-medium text-blue-700">' + esc(d[0]) + ':</span> ' +
      '<span class="text-blue-600">' + esc(d[1]) + '</span>' +
    '</div>';
  }
  html += '</div>' +
    '<button onclick="state.pageHelp=false;render()" class="text-blue-400 hover:text-blue-600 p-1 flex-shrink-0">' + I.x(18, '') + '</button>' +
  '</div></div>';
  return html;
}

// ─── Render ─────────────────────────────────────

function render() {
  var app = elId('app');
  if (!app) return;

  // Salvar foco do input de chat antes de recriar o DOM
  var oldInput = document.getElementById('chat-input');
  var restoreFocus = oldInput && document.activeElement === oldInput;
  var cursorPos = restoreFocus ? oldInput.selectionStart : -1;

  // Salvar scroll do chat antes de recriar o DOM
  var chatContainer = document.getElementById('chat-messages');
  var savedScrollTop = chatContainer ? chatContainer.scrollTop : -1;
  var savedScrollHeight = chatContainer ? chatContainer.scrollHeight : -1;
  var savedClientHeight = chatContainer ? chatContainer.clientHeight : -1;

  if (state.setupCompleto === null) {
    app.innerHTML = loadingScreen();
    return;
  }
  var sidebar = elId('sidebar');
  var mainContent = elId('main-content');
  if (sidebar && mainContent) {
    mainContent.innerHTML = renderPage();
    bindCurrentPage();
    updateSidebarActive();
  } else {
    app.innerHTML = '<div class="flex h-screen bg-gray-50">' +
      renderSidebar() +
      '<main class="flex-1 overflow-auto" id="main-content">' + renderPage() + '</main>' +
    '</div>';
    bindSidebar();
    bindCurrentPage();
  }

  // Restaurar foco no input de chat se estava digitando
  if (restoreFocus && state.currentPage === 'conversas' && state.conversas.contatoSelecionado) {
    var newInput = document.getElementById('chat-input');
    if (newInput) {
      newInput.focus();
      if (cursorPos >= 0) {
        try { newInput.setSelectionRange(cursorPos, cursorPos); } catch(e) {}
      }
    }
  }

  // Restaurar scroll do chat, ajustando se novas mensagens chegaram
  if (savedScrollTop >= 0 && state.currentPage === 'conversas' && state.conversas.contatoSelecionado) {
    requestAnimationFrame(function() {
      var n = document.getElementById('chat-messages');
      if (!n) return;
      var addedHeight = n.scrollHeight - savedScrollHeight;
      var wasNearBottom = (savedScrollHeight - savedScrollTop - savedClientHeight) < 80;
      if (wasNearBottom) {
        n.scrollTop = n.scrollHeight;
      } else {
        n.scrollTop = savedScrollTop + Math.max(0, addedHeight);
      }
    });
  }
}

function renderPage() {
  switch (state.currentPage) {
    case 'dashboard': return renderDashboard();
    case 'credenciais': return renderCredenciais();
    case 'configuracoes': return renderConfiguracoes();
    case 'conversas': return renderConversas();
    case 'regras': return renderRegras();
    case 'ignorados': return renderIgnorados();
    case 'aprendizado': return renderAprendizado();
    default: return '';
  }
}

function bindCurrentPage() {
  switch (state.currentPage) {
    case 'dashboard': bindDashboard(); break;
    case 'credenciais': bindCredenciais(); break;
    case 'configuracoes': bindConfiguracoes(); break;
    case 'conversas': bindConversas(); break;
    case 'regras': bindRegras(); break;
    case 'ignorados': bindIgnorados(); break;
    case 'aprendizado': bindAprendizado(); break;
  }
}

// ─── SIDEBAR ───────────────────────────────────────
function renderSidebar() {
  var evoConnected = state.credenciais.evoStatus && state.credenciais.evoStatus.connected;
  var d = state.dockerStatus;
  var evoOnline = d && d.evolutionRunning;
  var carregando = !d && !state.credenciais.evoStatus;
  var statusColor = carregando ? 'bg-gray-300' : (evoConnected ? 'bg-emerald-500' : (evoOnline ? 'bg-yellow-500' : 'bg-red-500'));
  var statusText = carregando ? 'Verificando...' : (evoConnected ? 'Online' : (evoOnline ? 'WA Desconectado' : 'Offline'));
  var collapsed = state.sidebar.collapsed;
  var width = collapsed ? 'w-16' : 'w-64';

  var items = [
    { id: 'dashboard', label: 'Dashboard', icon: I.layoutDashboard(20, '') },
    { id: 'conversas', label: 'Conversas', icon: I.messageSquare(20, '') },
    { id: 'configuracoes', label: 'Configurações', icon: I.settings(20, '') },
    { id: 'regras', label: 'Regras', icon: I.fileText(20, '') },
    { id: 'ignorados', label: 'Ignorados', icon: I.shieldBan(20, '') },
    { id: 'aprendizado', label: 'Aprendizado', icon: I.sparkles(20, '') },
    { id: 'credenciais', label: 'Credenciais', icon: I.clipboardList(20, '') },
  ];

  var navItems = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var active = state.currentPage === item.id;
    navItems += '<button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
      (active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100') +
      '" data-nav="' + item.id + '" title="' + item.label + '">' +
      '<span class="flex-shrink-0">' + item.icon + '</span>' +
      '<span class="sidebar-label truncate' + (collapsed ? ' hidden' : '') + '">' + esc(item.label) + '</span></button>';
  }

  var toggleIcon = collapsed
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  return '<aside class="sidebar ' + width + ' bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-200 overflow-hidden group' + (collapsed ? ' sidebar-collapsed' : '') + '" id="sidebar">' +
    '<div class="p-5 border-b border-gray-200 flex items-center gap-2.5">' +
      '<div class="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">' +
        I.bot(20, 'text-white') +
      '</div>' +
      '<div class="sidebar-label' + (collapsed ? ' hidden' : '') + '">' +
        '<h1 class="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">WaBot</h1>' +
        '<p class="text-xs text-gray-400 whitespace-nowrap">WhatsApp Bot Manager</p>' +
      '</div>' +
      '<button onclick="toggleSidebar()" class="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0">' + toggleIcon + '</button>' +
    '</div>' +
    '<nav class="flex-1 p-3 space-y-1 overflow-hidden">' + navItems + '</nav>' +
    '<div class="p-4 border-t border-gray-200 overflow-hidden">' +
      '<div class="flex items-center gap-2 text-xs">' +
        '<div id="sidebar-status-dot" class="w-2 h-2 rounded-full ' + statusColor + ' flex-shrink-0"></div>' +
        '<span id="sidebar-status-text" class="sidebar-label text-gray-500' + (collapsed ? ' hidden' : '') + '">' + statusText + '</span>' +
      '</div>' +
      '<div class="sidebar-label text-xs text-gray-400' + (collapsed ? ' hidden' : '') + '">v' + APP_VERSION + '</div>' +
    '</div>' +
  '</aside>';
}

function bindSidebar() {
  // Event delegation para navegação na sidebar
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  // Remove listener antigo se existir para evitar duplicatas
  if (sidebar._navListener) {
    sidebar.removeEventListener('click', sidebar._navListener);
  }
  sidebar._navListener = function(e) {
    var btn = e.target.closest('[data-nav]');
    if (btn) {
      var page = btn.getAttribute('data-nav');
      navegar(page);
    }
  };
  sidebar.addEventListener('click', sidebar._navListener);
}

function updateSidebarActive() {
  var sidebar = elId('sidebar');
  if (!sidebar) return;
  var buttons = sidebar.querySelectorAll('[data-nav]');
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var page = btn.getAttribute('data-nav');
    var isActive = page === state.currentPage;
    btn.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
      (isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100');
  }
}

window.toggleSidebar = function() {
  state.sidebar.collapsed = !state.sidebar.collapsed;
  var sidebar = elId('sidebar');
  if (!sidebar) { render(); return; }
  var collapsed = state.sidebar.collapsed;
  sidebar.className = 'sidebar ' + (collapsed ? 'w-16' : 'w-64') + ' bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-200 overflow-hidden group' + (collapsed ? ' sidebar-collapsed' : '');
  var labels = sidebar.querySelectorAll('.sidebar-label');
  for (var i = 0; i < labels.length; i++) {
    labels[i].style.display = collapsed ? 'none' : '';
  }
};

// ─── DASHBOARD ─────────────────────────────────────
function renderDashboard() {
  var d = state.dockerStatus || {};
  var checklist = state.dashboard.checklist;
  var ready = checklist.length > 0 && checklist.every(function(c) { return c.done; });

  var checklistHtml = '';
  for (var i = 0; i < checklist.length; i++) {
    var item = checklist[i];
    checklistHtml += '<div class="flex items-center gap-3">' +
      (item.done ? I.checkCircle2(20, 'text-emerald-500 flex-shrink-0') : I.circle(20, 'text-gray-300 flex-shrink-0')) +
      '<span class="' + (item.done ? 'text-gray-400 line-through text-sm' : 'text-gray-700 text-sm') + '">' + esc(item.label) + '</span></div>';
  }

  var actionBtn = '';
  if (d.evolutionRunning) {
    actionBtn = '<button onclick="dashboardStop()" class="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">' +
      I.square(16, '') + ' Parar Docker</button>';
  } else {
    actionBtn = '<button onclick="dashboardStart()" class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">' +
      I.play(16, '') + ' Iniciar Docker</button>';
  }

  return '<div class="p-8 max-w-5xl mx-auto">' +
    '<div class="flex items-center justify-between mb-8">' +
      '<div>' +
        '<h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>' +
        '<p class="text-sm text-gray-500 mt-1">' + (ready ? 'Sistema pronto para uso' : 'Configure os itens abaixo') + '</p>' +
      '</div>' +
      (ready ? '<div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">' + I.checkCircle2(16, '') + ' Pronto</div>' : '') +
    '</div>' +
    '<div class="grid grid-cols-3 gap-5 mb-8">' +
      '<div class="bg-white rounded-xl border border-gray-200 p-5">' +
        '<div class="text-emerald-600 mb-3">' + I.messageSquare(22, '') + '</div>' +
        '<div class="text-2xl font-bold text-gray-800">' + (state.conversas.contatos ? state.conversas.contatos.length : 0) + '</div>' +
        '<div class="text-sm text-gray-500">Conversas Recentes</div>' +
      '</div>' +
      '<div class="bg-white rounded-xl border border-gray-200 p-5">' +
        '<div class="text-emerald-600 mb-3">' + I.fileText(22, '') + '</div>' +
        '<div class="text-2xl font-bold text-gray-800">' + state.regras.length + '</div>' +
        '<div class="text-sm text-gray-500">Regras Ativas</div>' +
      '</div>' +
      '<div class="bg-white rounded-xl border border-gray-200 p-5">' +
        '<div class="text-emerald-600 mb-3">' + I.bot(22, '') + '</div>' +
        '<div class="text-2xl font-bold text-gray-800">' + (d.evolutionRunning ? 'Sim' : 'Não') + '</div>' +
        '<div class="text-sm text-gray-500">Bot Online</div>' +
      '</div>' +
    '</div>' +
    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">' +
      '<h2 class="text-lg font-semibold text-gray-700 mb-4">Status do Sistema</h2>' +
      '<div class="grid grid-cols-2 gap-4 mb-5">' +
        '<div class="bg-gray-50 rounded-lg p-4 text-center">' +
          '<div class="text-sm text-gray-500 mb-1">Docker</div>' +
          '<div class="font-semibold ' + (d.dockerInstalled ? 'text-emerald-600' : 'text-red-600') + '">' + (d.dockerInstalled ? 'Instalado' : 'Ausente') + '</div></div>' +
        '<div class="bg-gray-50 rounded-lg p-4 text-center">' +
          '<div class="text-sm text-gray-500 mb-1">Evolution API</div>' +
          '<div class="font-semibold ' + (d.evolutionRunning ? 'text-emerald-600' : 'text-yellow-600') + '">' + (d.evolutionRunning ? 'Online' : 'Parado') + '</div></div>' +
        '</div>' +
      '<div class="flex gap-2">' + actionBtn +
        '<button onclick="checkDockerStatus(); render()" class="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">' + I.refreshCw(18, 'text-gray-600') + '</button>' +
      '</div>' +
    '</div>' +
    '<div class="bg-white rounded-xl border border-gray-200 p-6">' +
      '<h2 class="text-lg font-semibold text-gray-700 mb-4">Checklist</h2>' +
      '<div class="space-y-3">' + checklistHtml + '</div>' +
    '</div></div>';
}

function bindDashboard() {
  if (!state.dockerStatus) checkDockerStatus();
  loadChecklist();
}

window.dashboardStart = async function() {
  state.dashboard.installing = true;
  render();
  await wabot.dockerStart();
  setTimeout(function() { checkDockerStatus(); render(); }, 5000);
};

window.dashboardStop = async function() {
  await wabot.dockerStop();
  setTimeout(function() { checkDockerStatus(); render(); }, 3000);
};

async function loadChecklist() {
  try {
    var creds = await wabot.configRead('credentials.json');
    var config = await wabot.configRead('config.json');
    state.dashboard.checklist = [
      { label: 'API Key Gemini configurada', done: creds && creds.data && creds.data.gemini && creds.data.gemini.api_key && creds.data.gemini.api_key.length > 0 },
      { label: 'WhatsApp conectado (Evolution)', done: creds && creds.data && creds.data.evolution && creds.data.evolution.instance_name },
      { label: 'Dados do negócio preenchidos', done: config && config.data && config.data.nome_negocio && config.data.nome_negocio.length > 0 && config.data.nome_negocio !== 'Meu Negócio' },
      { label: 'Evolution API rodando (Docker)', done: state.dockerStatus && state.dockerStatus.evolutionRunning },
    ];
    render();
  } catch(e) {}
}

async function checkDockerStatus() {
  try {
    var status = await wabot.dockerStatus();
    state.dockerStatus = status;
  } catch (e) {
    state.dockerStatus = { dockerInstalled: false, evolutionRunning: false };
  }
  if (!(state.currentPage === 'conversas' && state.conversas.contatoSelecionado)) {
    render();
  }
}

var pollingMsgRodando = false;

async function pollChatMessages() {
  var contato = state.conversas.contatoSelecionado;
  if (!contato || !contato.telefone) return;
  if (pollingMsgRodando) return;
  pollingMsgRodando = true;
  try {
    var result = await wabot.evolutionHistory(contato.telefone);
    if (result.success && Array.isArray(result.data)) {
      var atuais = state.chat.mensagens;
      if (result.data.length > atuais.length) {
        state.chat.mensagens = result.data;
        if (contato) {
          contato.nao_lidas = 0;
          var contatos = state.conversas.contatos || [];
          for (var i = 0; i < contatos.length; i++) {
            if (contatos[i].telefone === contato.telefone) {
              contatos[i].nao_lidas = 0;
              break;
            }
          }
        }
        render();
        bindChat();
      }
    }
  } catch(e) {}
  pollingMsgRodando = false;
}

// ─── CREDENCIAIS ───────────────────────────────────
function renderCredenciais() {
  var c = state.credenciais.creds;
  var evoConnected = state.credenciais.evoStatus && state.credenciais.evoStatus.connected;
  var saudeWhats = evoConnected
    ? '<div class="ml-auto flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1.5 rounded-full">' + I.checkCircle2(14, '') + ' Conectado</div>'
    : '<div class="ml-auto flex items-center gap-1.5 text-gray-400 text-xs font-medium bg-gray-50 px-3 py-1.5 rounded-full">' + I.circle(14, '') + ' Desconectado</div>';

  return '<div class="p-8 max-w-3xl mx-auto">' +
    '<div class="flex items-center justify-between mb-2">' +
      '<h1 class="text-2xl font-bold text-gray-800">Credenciais</h1>' +
      '<button onclick="toggleHelp()" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors" title="Ajuda">' + I.info(18, '') + '</button>' +
    '</div>' +
    '<p class="text-gray-500 mb-8">Configure as chaves de API e conecte seu WhatsApp.</p>' +
    renderHelp('credenciais') +
    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">' +
      '<div class="flex items-center gap-3 mb-4">' +
        '<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">' + I.send(20, 'text-green-600') + '</div>' +
        '<div><h2 class="text-lg font-semibold text-gray-700">WhatsApp (Evolution API)</h2><p class="text-xs text-gray-400">Conexão via QR Code</p></div>' +
        saudeWhats +
      '</div>' +
      '<div id="evo-status-area" class="mb-4">' +
        '<div class="text-sm text-gray-500 text-center py-4">Verificando status...</div>' +
      '</div>' +
      '<div class="flex gap-3">' +
        (evoConnected
          ? '<button onclick="disconnectEvolution()" class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">' + I.x(16, '') + ' Desconectar</button>'
          : '<button onclick="connectEvolution()" class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">' + I.refreshCw(16, '') + ' Conectar WhatsApp</button>') +
        '<button onclick="checkEvolutionStatus()" class="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm">Atualizar</button>' +
      '</div>' +
    '</div>' +

    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">' +
      '<div class="flex items-center gap-3 mb-4">' +
        '<div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">' + I.externalLink(20, 'text-purple-600') + '</div>' +
        '<div><h2 class="text-lg font-semibold text-gray-700">Inteligência Artificial</h2><p class="text-xs text-gray-400">IA que atende seus clientes</p></div>' +
      '</div>' +
      '<div class="space-y-4">' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Provedor</label>' +
          '<select onchange="mudarProvedorIA(this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">' +
            '<option value="groq"' + (c.llm?.provider === 'groq' || !c.llm?.provider ? ' selected' : '') + '>Groq (grátis, Llama 3)</option>' +
            '<option value="gemini"' + (c.llm?.provider === 'gemini' ? ' selected' : '') + '>Gemini (Google)</option>' +
          '</select></div>' +
        '<div id="campos-ia">' +
          renderCamposGroq(c) +
        '</div>' +
        '<div>' +
          '<button onclick="testarGemini()" id="btn-testar-gemini" class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">' + I.zap(16, '') + ' Testar Conexão</button>' +
          '<div id="resultado-teste-gemini" class="mt-2 text-xs"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<button onclick="saveCredenciais()" ' + (state.credenciais.saving ? 'disabled' : '') + ' class="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50 shadow-lg shadow-emerald-200">' +
      I.save(18, '') + ' ' + (state.credenciais.saving ? 'Salvando...' : 'Salvar Credenciais') +
    '</button></div>';
}

window.toggleAjuda = function(btn) {
  var content = btn.nextElementSibling;
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    btn.querySelector('span').textContent = 'Ocultar ajuda';
  } else {
    content.classList.add('hidden');
    btn.querySelector('span').textContent = 'Como conseguir a chave Gemini?';
  }
};

window.updateCredsField = function(path, value) {
  var parts = path.split('.');
  var obj = state.credenciais.creds;
  for (var i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
};

window.saveCredenciais = async function() {
  state.credenciais.saving = true;
  render();
  await wabot.configWrite('credentials.json', state.credenciais.creds);
  state.credenciais.saving = false;
  state.credenciais.saved = true;
  render();
  setTimeout(function() { state.credenciais.saved = false; }, 3000);
};

function renderCamposGroq(c) {
  var prov = c.llm?.provider || 'groq';
  if (prov === 'groq') {
    return '' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">API Key Groq</label>' +
        '<div class="flex gap-2">' +
          '<input type="text" value="' + esc(c.llm?.api_key || '') + '" oninput="updateCredsField(\'llm.api_key\', this.value)" class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm font-mono" placeholder="gsk_..." /></div>' +
        '<div class="mt-2">' +
          '<button onclick="window.open(\'https://console.groq.com/keys\')" class="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">' + I.externalLink(12, '') + ' Criar chave no Groq</button>' +
        '</div></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>' +
        '<select onchange="updateCredsField(\'llm.model\', this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">' +
          '<option value="llama-3.3-70b-versatile"' + (c.llm?.model === 'llama-3.3-70b-versatile' || !c.llm?.model ? ' selected' : '') + '>Llama 3.3 70B (recomendado)</option>' +
          '<option value="llama-3.1-8b-instant"' + (c.llm?.model === 'llama-3.1-8b-instant' ? ' selected' : '') + '>Llama 3.1 8B (rápido)</option>' +
          '<option value="mixtral-8x7b-32768"' + (c.llm?.model === 'mixtral-8x7b-32768' ? ' selected' : '') + '>Mixtral 8x7B</option>' +
        '</select></div>';
  }
  return '' +
    '<div><label class="block text-sm font-medium text-gray-700 mb-1">API Key Gemini</label>' +
      '<input type="text" value="' + esc(c.gemini?.api_key || '') + '" oninput="updateCredsField(\'gemini.api_key\', this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm font-mono" placeholder="AIzaSy..." /></div>' +
    '<div><label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>' +
      '<select onchange="updateCredsField(\'gemini.model\', this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">' +
        '<option value="gemini-2.0-flash-lite"' + (c.gemini?.model === 'gemini-2.0-flash-lite' ? ' selected' : '') + '>Gemini 2.0 Flash Lite</option>' +
        '<option value="gemini-2.0-flash"' + (c.gemini?.model === 'gemini-2.0-flash' ? ' selected' : '') + '>Gemini 2.0 Flash</option>' +
        '<option value="gemini-1.5-flash"' + (c.gemini?.model === 'gemini-1.5-flash' ? ' selected' : '') + '>Gemini 1.5 Flash</option>' +
      '</select></div>';
}

window.mudarProvedorIA = function(provider) {
  if (!state.credenciais.creds.llm) state.credenciais.creds.llm = {};
  state.credenciais.creds.llm.provider = provider;
  render();
};

window.testarGemini = async function() {
  var area = document.getElementById('resultado-teste-gemini');
  var btn = document.getElementById('btn-testar-gemini');
  if (!area || !btn) return;
  btn.disabled = true;
  btn.innerHTML = I.zap(16, 'animate-pulse') + ' Testando...';
  area.innerHTML = '<span class="text-gray-400">Aguardando resposta...</span>';
  try {
    var resp = await fetch('/api/llm/test', { method: 'POST' }).then(r => r.json());
    if (resp.success) {
      area.innerHTML = '<span class="text-emerald-600 font-medium">OK</span><span class="text-gray-500 ml-1">— ' + esc(resp.resposta) + '</span>';
    } else {
      area.innerHTML = '<span class="text-red-600 font-medium">Falha</span><span class="text-gray-500 ml-1">— ' + esc(resp.error) + '</span>';
    }
  } catch(e) {
    area.innerHTML = '<span class="text-red-600 font-medium">Erro</span><span class="text-gray-500 ml-1">— ' + esc(e.message) + '</span>';
  }
  btn.disabled = false;
  btn.innerHTML = I.zap(16, '') + ' Testar Conexão';
};

function bindCredenciais() {
  checkEvolutionStatus();
}

// ─── Evolution: Status e Conexão ──────────────────
window.checkEvolutionStatus = async function() {
  var area = document.getElementById('evo-status-area');
  if (!area) return;
  area.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">Verificando...</div>';
  try {
    var status = await wabot.evolutionStatus();
    state.credenciais.evoStatus = status;
    var connected = status && status.connected;
    var qrImg = status && status.qrcode && status.qrcode.base64;
    if (connected) {
      area.innerHTML = '<div class="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg p-3"><div class="w-3 h-3 bg-emerald-500 rounded-full"></div><span class="text-sm font-medium">WhatsApp conectado</span><span class="text-xs text-emerald-500 ml-auto">' + (status.instanceName || '') + '</span></div>';
    } else if (qrImg) {
      area.innerHTML = '<div class="text-center py-3"><img src="' + qrImg + '" class="mx-auto w-48 h-48 border-2 border-gray-200 rounded-xl" alt="QR Code" /><p class="text-xs text-gray-400 mt-2">Escaneie com o WhatsApp do negócio</p></div>';
      setTimeout(checkEvolutionStatus, 3000);
    } else {
      area.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">WhatsApp desconectado. Clique em "Conectar WhatsApp".</div>';
    }
  } catch (e) {
    area.innerHTML = '<div class="text-sm text-red-500 text-center py-4">Erro: ' + e.message + '</div>';
  }
};

window.connectEvolution = async function() {
  var area = document.getElementById('evo-status-area');
  if (!area) return;

  // Verificar se ja existe QR pendente antes de criar nova instancia
  var statusCheck = await wabot.evolutionStatus();
  if (statusCheck && statusCheck.qrcode && statusCheck.qrcode.base64) {
    state.credenciais.evoStatus = statusCheck;
    area.innerHTML = '<div class="text-center py-4"><img src="' + statusCheck.qrcode.base64 + '" class="mx-auto w-56 h-56 border-2 border-gray-200 rounded-xl" alt="QR Code" /><p class="text-xs text-gray-400 mt-3">Escaneie com o WhatsApp do seu negócio</p></div>';
    return;
  }

  area.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">Conectando...</div>';
  try {
    var result = await wabot.evolutionConnect();
    if (result.success) {
      var newCreds = JSON.parse(JSON.stringify(state.credenciais.creds));
      newCreds.evolution = newCreds.evolution || {};
      if (result.instanceName) newCreds.evolution.instance_name = result.instanceName;
      await wabot.configWrite('credentials.json', newCreds);
      state.credenciais.creds = newCreds;
      if (result.qrcode && result.qrcode.base64) {
        area.innerHTML = '<div class="text-center py-4"><img src="' + result.qrcode.base64 + '" class="mx-auto w-56 h-56 border-2 border-gray-200 rounded-xl" alt="QR Code" /><p class="text-xs text-gray-400 mt-3">Escaneie com o WhatsApp do seu negócio</p></div>';
      } else {
        area.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">QR Code gerado, aguardando...</div>';
      }
      // Poll for connection
      var attempts = 0;
      var poll = setInterval(async function() {
        attempts++;
        var s = await wabot.evolutionStatus();
        if (s && s.connected) {
          clearInterval(poll);
          state.credenciais.evoStatus = s;
          render();
          checkEvolutionStatus();
        } else if (s && s.qrcode && s.qrcode.base64) {
          area.innerHTML = '<div class="text-center py-4"><img src="' + s.qrcode.base64 + '" class="mx-auto w-56 h-56 border-2 border-gray-200 rounded-xl" alt="QR Code" /><p class="text-xs text-gray-400 mt-3">Escaneie com o WhatsApp do seu negócio</p></div>';
        } else if (attempts > 30) {
          clearInterval(poll);
          area.innerHTML = '<div class="text-sm text-orange-500 text-center py-4">Tempo limite. Tente novamente.</div>';
        }
      }, 2000);
    } else {
      area.innerHTML = '<div class="text-sm text-red-500 text-center py-4">Erro: ' + (result.error || 'desconhecido') + '</div>';
    }
  } catch (e) {
    area.innerHTML = '<div class="text-sm text-red-500 text-center py-4">Erro: ' + e.message + '</div>';
  }
};

window.disconnectEvolution = async function() {
  if (!confirm('Desconectar WhatsApp?')) return;
  try { await wabot.evolutionDisconnect(); } catch(e) {}
  state.credenciais.evoStatus = { connected: false };
  render();
};

// ─── CONFIGURAÇÕES ─────────────────────────────────
function renderConfiguracoes() {
  var c = state.configuracoes.config;
  var tipos = c.tipos_atendimento || [];
  var horarios = c.horarios || {};
  var redes = c.redes_sociais || {};

  var tiposHtml = '';
  var TIPOS = [
    { id: 'retirada', label: 'Retirada no Local' },
    { id: 'consumo_local', label: 'Consumo no Local' },
    { id: 'delivery', label: 'Delivery' },
  ];
  for (var i = 0; i < TIPOS.length; i++) {
    var t = TIPOS[i];
    tiposHtml += '<label class="flex items-center gap-2 cursor-pointer">' +
      '<input type="checkbox" ' + (tipos.indexOf(t.id) >= 0 ? 'checked' : '') + ' onchange="toggleTipo(\'' + t.id + '\')" class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />' +
      '<span class="text-sm text-gray-700">' + t.label + '</span></label>';
  }

  var DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
  var LABELS = { 'segunda':'Segunda','terca':'Terça','quarta':'Quarta','quinta':'Quinta','sexta':'Sexta','sabado':'Sábado','domingo':'Domingo' };

  var horariosHtml = '';
  for (var i = 0; i < DIAS.length; i++) {
    var d = DIAS[i];
    var h = horarios[d] || {};
    if (!h.periodos) {
      h.periodos = (h.cozinha && h.cozinha.length) ? h.cozinha : [{ abertura: '11:00', fechamento: '23:00' }];
    }
    var fechado = h.fechado;
    var periodos = h.periodos || [];
    var periodosHtml = '';
    for (var p = 0; p < periodos.length; p++) {
      var per = periodos[p];
      periodosHtml += '<div class="flex items-center gap-2">' +
        '<input type="time" value="' + (per.abertura || '11:00') + '" onchange="updatePeriodo(\'' + d + '\',' + p + ',\'abertura\',this.value)" class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />' +
        '<span class="text-gray-400 text-sm">até</span>' +
        '<input type="time" value="' + (per.fechamento || '23:00') + '" onchange="updatePeriodo(\'' + d + '\',' + p + ',\'fechamento\',this.value)" class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />' +
        (periodos.length > 1 ? '<button onclick="removePeriodo(\'' + d + '\',' + p + ')" class="text-red-400 hover:text-red-600 p-1">' + I.x(14, '') + '</button>' : '') +
      '</div>';
    }

    horariosHtml += '<div class="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">' +
      '<div class="w-24 text-sm font-medium text-gray-700">' + LABELS[d] + '</div>' +
      '<label class="flex items-center gap-2 cursor-pointer">' +
        '<input type="checkbox" ' + (!fechado ? 'checked' : '') + ' onchange="updateHorario(\'' + d + '\',\'fechado\',!this.checked)" class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />' +
        '<span class="text-sm text-gray-600">Aberto</span></label>' +
      (!fechado ? '<div class="flex flex-col gap-1.5">' + periodosHtml +
        '<button onclick="addPeriodo(\'' + d + '\')" class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">' + I.plus(12, '') + ' Novo período</button></div>' : '') +
    '</div>';
  }

  var btnLabel = state.configuracoes.saving ? 'Salvando...' : 'Salvar Configurações';

  return '<div class="p-8 max-w-4xl mx-auto">' +
    '<div class="flex items-center gap-3 mb-8">' +
      '<h1 class="text-2xl font-bold text-gray-800">Configurações do Negócio</h1>' +
      '<button onclick="toggleHelp()" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors" title="Ajuda">' + I.info(18, '') + '</button>' +
    '</div>' +
    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">' +
      '<h2 class="text-lg font-semibold text-gray-700 mb-5">Dados Básicos</h2>' +
      '<div class="grid grid-cols-2 gap-4">' +
        '<div class="col-span-2">' +
          campo('Nome do Negócio', 'configNome', c.nome_negocio, 'Ex: Casarão do Gui', 'updateConfig(\'nome_negocio\',this.value)') +
        '</div>' +
        '<div class="col-span-2">' +
          campo('Endereço', 'configEnd', c.endereco, 'Ex: Rua 15 de Novembro, 184', 'updateConfig(\'endereco\',this.value)') +
        '</div>' +
        '<div>' +
          '<div><label class="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>' +
  '<input type="text" id="configTel" value="' + esc(c.telefone) + '" placeholder="(19) 3843-1778" oninput="updatePhone(this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" /></div>' +
        '</div>' +
        '<div>' +
          campo('Site', 'configSite', c.site, 'https://meusite.com.br', 'updateConfig(\'site\',this.value)') +
        '</div>' +
        '<div>' +
          campo('Link Pedido Online', 'configLink', c.link_pedido_online, 'https://...', 'updateConfig(\'link_pedido_online\',this.value)') +
        '</div>' +
        '<div>' +
          campo('Instagram', 'configInsta', redes.instagram, '@seuinstagram', 'updateRedes(\'instagram\',this.value)') +
        '</div>' +
        '<div>' +
          campo('Facebook', 'configFace', redes.facebook, 'facebook.com/seupagina', 'updateRedes(\'facebook\',this.value)') +
        '</div>' +
        '<div>' +
          campo('iFood', 'configIfood', redes.ifood, 'ifood.com.br/...', 'updateRedes(\'ifood\',this.value)') +
        '</div>' +
        '<div class="col-span-2">' +
          '<label class="block text-sm font-medium text-gray-700 mb-1.5">Observações Gerais</label>' +
          '<textarea rows="3" oninput="updateConfig(\'observacoes_gerais\',this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">' + esc(c.observacoes_gerais) + '</textarea>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">' +
      '<h2 class="text-lg font-semibold text-gray-700 mb-4">Tipos de Atendimento</h2>' +
      '<div class="flex gap-6">' + tiposHtml + '</div>' +
    '</div>' +

    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">' +
      '<h2 class="text-lg font-semibold text-gray-700 mb-4">Horários de Funcionamento</h2>' +
      '<div class="space-y-2">' + horariosHtml + '</div>' +
    '</div>' +

    '<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">' +
      '<h2 class="text-lg font-semibold text-gray-700 mb-4">Mensagens Padrão</h2>' +
      '<div class="space-y-4">' +
        msgField('Mensagem de Saudação', 'mensagem_saudacao', c.mensagem_saudacao) +
        msgField('Mensagem de Ausência (fora do horário)', 'mensagem_ausencia', c.mensagem_ausencia) +
        msgField('Mensagem quando não encontrar resposta', 'mensagem_regra_nao_encontrada', c.mensagem_regra_nao_encontrada) +
        msgField('Mensagem de Agradecimento', 'mensagem_agradecimento', c.mensagem_agradecimento) +
      '</div>' +
    '</div>' +

    '<button onclick="saveConfiguracoes()" ' + (state.configuracoes.saving ? 'disabled' : '') + ' class="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50">' +
      I.save(18, '') + ' ' + btnLabel +
    '</button></div>';
}

function maskPhone(v) {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 2) return '(' + v;
  if (v.length <= 7) return '(' + v.slice(0, 2) + ') ' + v.slice(2);
  return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
}

window.updatePhone = function(v) {
  var masked = maskPhone(v);
  state.configuracoes.config.telefone = masked;
  var el = document.getElementById('configTel');
  if (el) el.value = masked;
};

function campo(label, id, value, placeholder, onchange) {
  return '<div><label class="block text-sm font-medium text-gray-700 mb-1.5">' + label + '</label>' +
    '<input type="text" id="' + id + '" value="' + esc(value) + '" placeholder="' + esc(placeholder || '') + '" oninput="' + onchange + '" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" /></div>';
}

function msgField(label, field, value) {
  return '<div><label class="block text-sm font-medium text-gray-700 mb-1.5">' + label + '</label>' +
    '<textarea rows="2" oninput="updateConfig(\'' + field + '\',this.value)" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">' + esc(value) + '</textarea></div>';
}

window.updateConfig = function(field, value) {
  state.configuracoes.config[field] = value;
};

window.updateRedes = function(rede, value) {
  if (!state.configuracoes.config.redes_sociais) state.configuracoes.config.redes_sociais = {};
  state.configuracoes.config.redes_sociais[rede] = value;
};

window.toggleTipo = function(tipo) {
  var tipos = state.configuracoes.config.tipos_atendimento;
  var idx = tipos.indexOf(tipo);
  if (idx >= 0) tipos.splice(idx, 1);
  else tipos.push(tipo);
};

window.updateHorario = function(dia, campo, valor) {
  if (!state.configuracoes.config.horarios[dia]) {
    state.configuracoes.config.horarios[dia] = { fechado: false, periodos: [{ abertura: '11:00', fechamento: '23:00' }] };
  }
  state.configuracoes.config.horarios[dia][campo] = valor;
};

window.updatePeriodo = function(dia, idx, campo, valor) {
  var h = state.configuracoes.config.horarios[dia];
  if (h && h.periodos && h.periodos[idx]) h.periodos[idx][campo] = valor;
};

window.addPeriodo = function(dia) {
  if (!state.configuracoes.config.horarios[dia]) {
    state.configuracoes.config.horarios[dia] = { fechado: false, periodos: [] };
  }
  var h = state.configuracoes.config.horarios[dia];
  if (!h.periodos) h.periodos = [];
  h.periodos.push({ abertura: '18:00', fechamento: '23:00' });
  render();
  bindConfiguracoes();
};

window.removePeriodo = function(dia, idx) {
  var h = state.configuracoes.config.horarios[dia];
  if (h && h.periodos) {
    h.periodos.splice(idx, 1);
    if (h.periodos.length === 0) h.periodos.push({ abertura: '11:00', fechamento: '23:00' });
    render();
    bindConfiguracoes();
  }
};

window.saveConfiguracoes = async function() {
  state.configuracoes.saving = true;
  render();
  await wabot.configWrite('config.json', state.configuracoes.config);
  state.configuracoes.saving = false;
  render();
};



function bindConfiguracoes() {}

// ─── CONVERSAS ─────────────────────────────────────
function renderConversas() {
  var contatos = state.conversas.contatos || [];
  // Garantir ordem: mais recentes primeiro
  contatos.sort(function(a, b) {
    var ta = a.ultimo_timestamp || 0;
    var tb = b.ultimo_timestamp || 0;
    return tb - ta;
  });
  var busca = state.conversas.busca.toLowerCase();
  var filtrados = contatos.filter(function(c) {
    return c.nome.toLowerCase().indexOf(busca) >= 0 || c.telefone.indexOf(busca) >= 0;
  });

  var listaHtml = '';
  for (var i = 0; i < filtrados.length; i++) {
    var c = filtrados[i];
    var sel = state.conversas.contatoSelecionado && state.conversas.contatoSelecionado.telefone === c.telefone;
    var badgeColor = c.status === 'bot' ? 'bg-blue-100 text-blue-700' : c.status === 'pausado' ? 'bg-yellow-100 text-yellow-700' : c.status === 'ignorado' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700';
    var badgeLabel = c.status === 'ignorado' ? 'Ignorado' : (c.status || 'bot');
    listaHtml += '<button onclick="selectContato(\'' + c.telefone + '\')" class="w-full p-4 flex items-start gap-3 text-left transition-colors border-b border-gray-100 ' + (sel ? 'bg-emerald-50' : 'hover:bg-gray-50') + '">' +
      '<div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">' + I.messageSquare(20, 'text-emerald-600') + '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center justify-between mb-1">' +
          '<span class="font-medium text-gray-800 text-sm truncate">' + esc(c.nome) + '</span>' +
          '<span class="text-xs text-gray-400 flex-shrink-0 ml-2">' + esc(c.horario || '') + '</span>' +
        '</div>' +
        '<p class="text-sm text-gray-500 truncate">' + esc(c.ultima_msg) + '</p>' +
        '<div class="flex items-center gap-2 mt-1.5">' +
          '<span class="text-xs px-2 py-0.5 rounded-full font-medium ' + badgeColor + '">' + esc(badgeLabel) + '</span>' +
          (c.nao_lidas > 0 ? '<span class="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">' + c.nao_lidas + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</button>';
  }

  if (filtrados.length === 0) {
    listaHtml = '<div class="text-center py-12 text-gray-400 text-sm">Nenhuma conversa encontrada</div>';
  }

  var painelDireito = state.conversas.contatoSelecionado
    ? renderChatView(state.conversas.contatoSelecionado)
    : '<div class="flex-1 flex items-center justify-center bg-gray-50">' +
        '<div class="text-center">' +
          '<span class="text-gray-200 inline-block">' + I.messageSquare(64, '') + '</span>' +
          '<p class="text-gray-400 mt-4">Selecione uma conversa</p>' +
        '</div></div>';

  return '<div class="flex h-full">' +
    '<div class="w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">' +
      '<div class="p-4 border-b border-gray-200">' +
        '<h1 class="text-xl font-bold text-gray-800 mb-3">Conversas</h1>' +
        '<div class="relative">' +
          '<span class="absolute left-3 top-2.5 text-gray-400">' + I.search(18, '') + '</span>' +
          '<input type="text" oninput="state.conversas.busca=this.value;render()" placeholder="Buscar..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />' +
        '</div>' +
      '</div>' +
      '<div class="flex-1 overflow-y-auto">' + listaHtml + '</div>' +
    '</div>' + painelDireito + '</div>';
}

window.selectContato = async function(telefone) {
  var contatos = state.conversas.contatos || [];
  for (var i = 0; i < contatos.length; i++) {
    if (contatos[i].telefone === telefone) {
      state.conversas.contatoSelecionado = contatos[i];
      state.chat.status = contatos[i].status || 'bot';
      contatos[i].nao_lidas = 0;
      state.chat.mensagens = [];
      state.chat.texto = '';
      state.chat.sugestaoIA = '';
      render();
      bindChat();
      loadMensagens();
      // Salvar zeração de não lidas
      try {
        await wabot.configWrite('conversas.json', contatos);
      } catch(e) {}
      return;
    }
  }
};

function bindConversas() {
  var container = document.getElementById('chat-messages');
  if (container && state.conversas.contatoSelecionado) {
    container.onscroll = function() {
      chatIsNearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 80;
    };
    scrollChat();
  }
}

// ─── CHAT VIEW ─────────────────────────────────────
function renderChatView(contato) {
  var mensagens = state.chat.mensagens;
  var status = state.chat.status;
  var sugestaoIA = state.chat.sugestaoIA;
  var texto = state.chat.texto;

  var badgeConfig = {
    bot: { label: 'Bot Ativo', color: 'bg-blue-100 text-blue-700' },
    pausado: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700' },
    humano: { label: 'Humano', color: 'bg-purple-100 text-purple-700' },
    ignorado: { label: 'Ignorado', color: 'bg-red-100 text-red-600' },
  };
  var badge = badgeConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

  var msgsHtml = '';
  if (mensagens.length === 0) {
    msgsHtml = '<div class="h-full flex items-center justify-center"><p class="text-gray-400 text-sm">Nenhum histórico disponível</p></div>';
  }
  for (var i = 0; i < mensagens.length; i++) {
    var m = mensagens[i];
    var isBot = m.de_bot;
    var isClient = !isBot;
    msgsHtml += '<div class="flex ' + (isClient ? 'justify-start' : 'justify-end') + ' animate-fade-in">' +
      '<div class="' + (isClient ? 'chat-bubble-bot' : 'chat-bubble-client') + '">';
    if (isBot && m.origem && m.origem !== 'cliente') {
      var origemLabel = m.origem === 'regra' ? 'Regra' : m.origem === 'ia' ? 'IA' : 'Você';
      var origemColor = m.origem === 'regra' ? 'text-blue-600' : m.origem === 'ia' ? 'text-purple-600' : 'text-gray-500';
      msgsHtml += '<div class="flex items-center gap-1 mb-1"><span class="text-xs font-medium ' + origemColor + '">' + origemLabel + '</span></div>';
    }
    msgsHtml += '<p class="text-sm whitespace-pre-wrap">' + esc(m.texto) + '</p>' +
      '<p class="text-xs mt-1 ' + (isClient ? 'text-gray-400' : 'text-emerald-100') + '">' + esc(m.horario || '') + '</p>' +
      '</div></div>';
  }

  var sugestaoHtml = '';
  if (sugestaoIA) {
    sugestaoHtml = '<div class="bg-purple-50 border-t border-purple-200 px-5 py-3 flex-shrink-0">' +
      '<div class="flex items-start gap-3">' +
        I.sparkles(18, 'text-purple-600 mt-0.5 flex-shrink-0') +
        '<div class="flex-1 min-w-0">' +
          '<p class="text-xs font-semibold text-purple-700 mb-1">Sugestão da IA</p>' +
          '<p class="text-sm text-gray-700 whitespace-pre-wrap">' + esc(sugestaoIA) + '</p>' +
        '</div>' +
        '<div class="flex gap-1.5 flex-shrink-0">' +
          '<button onclick="enviarSugestaoIA()" class="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 font-medium">Enviar</button>' +
          '<button onclick="state.chat.sugestaoIA=\'\';render();bindChat()" class="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs rounded-lg hover:bg-purple-100">X</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  return '<div class="flex-1 flex flex-col h-full bg-gray-50">' +
    '<div class="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">' +
      '<div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">' + I.userCircle(24, 'text-emerald-600') + '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<h2 class="font-semibold text-gray-800 text-sm truncate">' + esc(contato.nome) + '</h2>' +
        '<p class="text-xs text-gray-400">' + esc(contato.telefone) + '</p>' +
      '</div>' +
      '<span class="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ' + badge.color + '">' + badge.label + '</span>' +
    '</div>' +

    '<div class="bg-white px-4 py-2 flex items-center gap-1.5 border-b border-gray-200 flex-shrink-0 overflow-x-auto">' +
      '<button onclick="alterarStatus(\'humano\')" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 whitespace-nowrap">' + I.pause(14, '') + ' Modo Humano</button>' +
      '<button onclick="alterarStatus(\'bot\')" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 whitespace-nowrap">' + I.play(14, '') + ' Reativar Bot</button>' +
      '<span class="text-gray-300 mx-0.5">|</span>' +
      '<button onclick="ignorarContato()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 whitespace-nowrap">' + I.shieldBan(14, '') + ' Ignorar</button>' +
    '</div>' +

    '<div class="flex-1 overflow-y-auto p-5 space-y-3" id="chat-messages">' + msgsHtml + '</div>' +
    sugestaoHtml +

    '<div class="bg-white border-t border-gray-200 px-5 py-3 flex-shrink-0">' +
      '<div class="flex items-center gap-2">' +
        '<button onclick="sugerirIA()" class="p-2.5 text-purple-600 hover:bg-purple-50 rounded-lg" title="Sugerir resposta">' + I.sparkles(20, state.chat.sugerindo ? 'animate-pulse' : '') + '</button>' +
        '<input type="text" id="chat-input" value="' + esc(texto) + '" oninput="state.chat.texto=this.value" onkeydown="if(event.key===\'Enter\')enviarMsg()" placeholder="Digite sua resposta..." class="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />' +
        '<button onclick="enviarMsg()" class="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50" id="chat-send-btn">' + I.send(18, '') + '</button>' +
      '</div>' +
    '</div></div>';
}

window.ignorarContato = async function() {
  var contato = state.conversas.contatoSelecionado;
  if (!contato || !contato.telefone) return;
  if (!confirm('Ignorar ' + (contato.nome || contato.telefone) + '? O bot não responderá mais automaticamente.')) return;
  var ignorados = [];
  try {
    var r = await wabot.configRead('ignorados.json');
    if (r.success && Array.isArray(r.data)) ignorados = r.data;
  } catch(e) {}
  // Verificar se já existe
  for (var i = 0; i < ignorados.length; i++) {
    if (ignorados[i].telefone === contato.telefone) return;
  }
  ignorados.push({ id: 'ign-' + Date.now(), telefone: contato.telefone, nome: contato.nome || '' });
  await wabot.configWrite('ignorados.json', ignorados);
  state.ignorados = ignorados;
  if (contato) {
    contato.status = 'ignorado';
    var contatos = state.conversas.contatos || [];
    for (var i = 0; i < contatos.length; i++) {
      if (contatos[i].telefone === contato.telefone) {
        contatos[i].status = 'ignorado';
        break;
      }
    }
  }
  state.chat.status = 'ignorado';
  render();
  bindChat();
};

window.alterarStatus = function(status) {
  state.chat.status = status;
  render();
  bindChat();
};

window.sugerirIA = async function() {
  var contato = state.conversas.contatoSelecionado;
  if (!contato) return;
  var ultimaMsgCliente = '';
  var msgs = state.chat.mensagens || [];
  for (var i = msgs.length - 1; i >= 0; i--) {
    if (!msgs[i].de_bot) { ultimaMsgCliente = msgs[i].texto; break; }
  }
  if (!ultimaMsgCliente) return;
  state.chat.sugerindo = true;
  render();
  bindChat();
  try {
    var result = await wabot.testIA(ultimaMsgCliente);
    if (result.success && result.resposta) {
      state.chat.sugestaoIA = result.resposta;
    } else {
      state.chat.sugestaoIA = 'Não foi possível gerar sugestão.';
    }
  } catch(e) {
    state.chat.sugestaoIA = 'Erro ao consultar IA.';
  }
  state.chat.sugerindo = false;
  render();
  bindChat();
};

window.enviarMsg = async function() {
  var texto = state.chat.texto.trim();
  if (!texto) return;
  var contato = state.conversas.contatoSelecionado;
  if (!contato) return;
  var hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  state.chat.mensagens.push({ id: Date.now().toString(), texto: texto, de_bot: true, origem: 'humano', horario: hora });
  state.chat.texto = '';
  render();
  bindChat();
  await wabot.sendMessage(contato.telefone, texto);
  scrollChat(true);
};

window.enviarSugestaoIA = async function() {
  var texto = state.chat.sugestaoIA.trim();
  if (!texto) return;
  var contato = state.conversas.contatoSelecionado;
  var hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  state.chat.mensagens.push({ id: Date.now().toString(), texto: texto, de_bot: true, origem: 'ia', horario: hora });
  state.chat.sugestaoIA = '';
  render();
  bindChat();
  await wabot.sendMessage(contato.telefone, texto);
  scrollChat(true);
};

var chatIsNearBottom = true;

function scrollChat(force) {
  var container = document.getElementById('chat-messages');
  if (!container) return;
  if (force) {
    requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
    return;
  }
  if (chatIsNearBottom) {
    requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
  }
}

function bindChat() {
  scrollChat();
}

async function loadMensagens() {
  var contato = state.conversas.contatoSelecionado;
  if (!contato) return;
  try {
    var result = await wabot.evolutionHistory(contato.telefone);
    if (result.success && Array.isArray(result.data)) {
      state.chat.mensagens = result.data;
    }
  } catch(e) {}
  render();
  bindChat();
}

// ─── REGRAS ────────────────────────────────────────
function renderRegras() {
  var regras = state.regras;
  var cardsHtml = '';
  for (var i = 0; i < regras.length; i++) {
    var r = regras[i];
    var editando = r.editing;

    if (editando) {
      cardsHtml += '<div class="bg-white rounded-xl border border-emerald-300 border-2 p-5">' +
        '<div class="flex items-start gap-3">' +
          '<div class="flex-1">' +
            '<div><label class="block text-xs font-medium text-gray-500 mb-1.5">Instrução para o bot</label>' +
              '<textarea id="regra-textarea-' + r.id + '" rows="3" class="w-full px-3 py-2 border border-emerald-400 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Explique em linguagem natural como o bot deve agir...">' + esc(r.instrucao || '') + '</textarea></div>' +
            '<div class="flex items-center justify-between mt-3">' +
              '<button onclick="toggleRegraAtivo(\'' + r.id + '\')" class="flex items-center gap-1.5 text-sm ' + (r.ativo ? 'text-emerald-600' : 'text-gray-400') + '">' +
                (r.ativo ? I.toggleRight(20, '') : I.toggleLeft(20, '')) + (r.ativo ? ' Ativo' : ' Inativo') +
              '</button>' +
              '<div class="flex gap-2">' +
                '<button onclick="salvarRegraEdicao(\'' + r.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">' + I.checkCircle2(14, '') + ' Salvar</button>' +
                '<button onclick="cancelarRegraEdicao(\'' + r.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">' + I.x(14, '') + ' Cancelar</button>' +
                '<button onclick="removeRegra(\'' + r.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors">' + I.trash2(14, '') + ' Excluir</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else {
      cardsHtml += '<div class="bg-white rounded-xl border border-gray-200 p-5">' +
        '<div class="flex items-start gap-3">' +
          '<div class="flex-1">' +
            '<div class="flex items-center justify-between mb-1">' +
              '<label class="block text-xs font-medium text-gray-500">Instrução para o bot</label>' +
              '<span class="flex items-center gap-1 text-xs ' + (r.ativo ? 'text-emerald-600' : 'text-gray-400') + '">' +
                (r.ativo ? I.toggleRight(14, '') : I.toggleLeft(14, '')) + (r.ativo ? ' Ativo' : ' Inativo') +
              '</span>' +
            '</div>' +
            '<p class="text-sm text-gray-700 whitespace-pre-wrap">' + esc(r.instrucao || '') + '</p>' +
            '<div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">' +
              '<button onclick="editarRegra(\'' + r.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">' + I.fileText(14, '') + ' Editar</button>' +
              '<button onclick="toggleRegraAtivo(\'' + r.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 transition-colors">' +
                (r.ativo ? I.toggleRight(14, '') + ' Desativar' : I.toggleLeft(14, '') + ' Ativar') +
              '</button>' +
              '<button onclick="removeRegra(\'' + r.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 text-red-400 border border-transparent rounded-lg text-xs hover:text-red-600 hover:bg-red-50 transition-colors ml-auto">' + I.trash2(14, '') + ' Excluir</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
  }
  if (regras.length === 0) {
    cardsHtml = '<div class="text-center py-16 text-gray-400"><p class="text-sm">Nenhuma instrução cadastrada.</p><p class="text-xs mt-1">Clique em "Nova Regra" para ensinar o bot.</p></div>';
  }
  return '<div class="p-8 max-w-4xl mx-auto">' +
    '<div class="flex items-center justify-between mb-6">' +
      '<div class="flex items-center gap-3">' +
        '<h1 class="text-2xl font-bold text-gray-800">Regras do Bot</h1>' +
        '<button onclick="toggleHelp()" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors" title="Ajuda">' + I.info(18, '') + '</button>' +
      '</div>' +
      '<div class="flex gap-2">' +
        '<button onclick="addRegra()" class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">' + I.plus(18, '') + ' Nova Regra</button>' +
      '</div>' +
    '</div>' +
    renderHelp('regras') +
    '<div class="space-y-3">' + cardsHtml + '</div>' +
  '</div>';
}

window.addRegra = async function() {
  var texto = prompt('Digite a instrução da nova regra:');
  if (!texto || !texto.trim()) return;
  state.regras.push({ id: 'reg-' + Date.now(), instrucao: texto.trim(), ativo: true, editing: false });
  if (!await salvarRegras()) return;
  render();
  bindRegras();
};

window.editarRegra = function(id) {
  for (var i = 0; i < state.regras.length; i++) {
    if (state.regras[i].id === id) {
      state.regras[i].editing = true;
      render();
      bindRegras();
      return;
    }
  }
};

window.toggleRegraAtivo = async function(id) {
  for (var i = 0; i < state.regras.length; i++) {
    if (state.regras[i].id === id) {
      state.regras[i].ativo = !state.regras[i].ativo;
      if (!await salvarRegras()) return;
      render();
      bindRegras();
      return;
    }
  }
};

window.salvarRegraEdicao = async function(id) {
  var textarea = document.getElementById('regra-textarea-' + id);
  if (!textarea) return;
  var novoTexto = textarea.value.trim();
  if (!novoTexto) return;
  for (var i = 0; i < state.regras.length; i++) {
    if (state.regras[i].id === id) {
      state.regras[i].instrucao = novoTexto;
      state.regras[i].editing = false;
      break;
    }
  }
  if (!await salvarRegras()) return;
  render();
  bindRegras();
};

window.cancelarRegraEdicao = function(id) {
  for (var i = 0; i < state.regras.length; i++) {
    if (state.regras[i].id === id) {
      state.regras[i].editing = false;
      break;
    }
  }
  render();
  bindRegras();
};

window.removeRegra = async function(id) {
  if (!confirm('Excluir esta regra?')) return;
  var novas = [];
  for (var i = 0; i < state.regras.length; i++) {
    if (state.regras[i].id !== id) novas.push(state.regras[i]);
  }
  state.regras = novas;
  if (!await salvarRegras()) return;
  render();
  bindRegras();
};

async function salvarRegras() {
  var limpas = [];
  for (var i = 0; i < state.regras.length; i++) {
    limpas.push({ id: state.regras[i].id, instrucao: state.regras[i].instrucao, ativo: state.regras[i].ativo });
  }
  try {
    var result = await wabot.configWrite('regras.json', limpas);
    return result && result.success;
  } catch(e) {
    return false;
  }
}

function bindRegras() {}

// ─── IGNORADOS ─────────────────────────────────────
function formatPhone(digits) {
  if (!digits) return '';
  var d = digits.replace(/\D/g, '').substring(0, 13);
  if (d.length <= 2) return '+' + d;
  if (d.length <= 4) return '+' + d.substring(0, 2) + ' (' + d.substring(2);
  if (d.length <= 9) return '+' + d.substring(0, 2) + ' (' + d.substring(2, 4) + ') ' + d.substring(4);
  return '+' + d.substring(0, 2) + ' (' + d.substring(2, 4) + ') ' + d.substring(4, 9) + '-' + d.substring(9);
}

window.formatPhoneInput = function(input) {
  var digits = input.value.replace(/\D/g, '');
  if (digits.length <= 11 && !digits.startsWith('55')) {
    digits = '55' + digits;
  }
  digits = digits.substring(0, 13);
  input.value = formatPhone(digits);
  var id = input.getAttribute('data-id');
  for (var i = 0; i < state.ignorados.length; i++) {
    if (state.ignorados[i].id === id) {
      state.ignorados[i].telefone = digits;
      break;
    }
  }
};

function renderIgnorados() {
  var ignorados = state.ignorados;
  function renderLista(lista) {
    if (lista.length === 0) return '<div class="text-center py-8 text-gray-400 text-sm">Nenhum contato.</div>';
    var h = '';
    for (var j = 0; j < lista.length; j++) {
      var item = lista[j];
      h += '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">' +
        '<div class="flex-1 grid grid-cols-[1fr_1fr] gap-2">' +
          '<div><input type="text" value="' + esc(formatPhone(item.telefone)) + '" oninput="formatPhoneInput(this)" data-id="' + item.id + '" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="+55 (11) 91234-5678" /></div>' +
          '<div><input type="text" value="' + esc(item.nome || '') + '" onchange="updateIgnorado(\'' + item.id + '\',\'nome\',this.value)" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Nome" /></div>' +
        '</div>' +
        '<button onclick="removeIgnorado(\'' + item.id + '\')" class="text-red-400 hover:text-red-600 p-1.5 opacity-0 group-hover:opacity-100">' + I.trash2(14, '') + '</button>' +
      '</div>';
    }
    return h;
  }

  return '<div class="p-8 max-w-4xl mx-auto">' +
    '<div class="flex items-center justify-between mb-6">' +
      '<div>' +
        '<h1 class="text-2xl font-bold text-gray-800">Contatos Ignorados</h1>' +
        '<p class="text-sm text-gray-500 mt-1">Números que o bot não deve atender automaticamente.</p>' +
      '</div>' +
      '<div class="flex gap-2">' +
        '<button onclick="addIgnorado()" class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">' + I.plus(18, '') + ' Novo</button>' +
        '<button onclick="saveIgnorados()" class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">' + I.save(18, '') + ' Salvar</button>' +
      '</div>' +
    '</div>' +
    '<div class="bg-white rounded-xl border border-gray-200 p-5">' +
      '<p class="text-xs text-gray-400 mb-3">Adicione números de fornecedores, contabilidade e outros contatos internos.</p>' +
      '<div class="space-y-2">' + renderLista(ignorados) + '</div>' +
    '</div></div>';
}

window.addIgnorado = function() {
  state.ignorados.push({ id: 'ign-' + Date.now(), telefone: '', nome: '' });
  render();
  bindIgnorados();
};

window.updateIgnorado = function(id, campo, valor) {
  for (var i = 0; i < state.ignorados.length; i++) {
    if (state.ignorados[i].id === id) { state.ignorados[i][campo] = valor; return; }
  }
};

window.removeIgnorado = function(id) {
  var novas = [];
  for (var i = 0; i < state.ignorados.length; i++) {
    if (state.ignorados[i].id !== id) novas.push(state.ignorados[i]);
  }
  state.ignorados = novas;
  render();
  bindIgnorados();
};

window.saveIgnorados = async function() {
  await wabot.configWrite('ignorados.json', state.ignorados);
};

function bindIgnorados() {}

// ─── APRENDIZADO ──────────────────────────────────
function renderAprendizado() {
  var a = state.aprendizado;
  var pendencias = a.pendencias || [];
  var respostas = a.respostas || [];
  var pendentes = pendencias.filter(function(p) { return !p.respondida; });
  var respondidas = pendencias.filter(function(p) { return p.respondida; });

  var pendentesHtml = '';
  if (pendentes.length === 0) {
    pendentesHtml = '<div class="text-center py-12 text-gray-400 text-sm">Nenhuma pergunta pendente. O bot está respondendo tudo! 🎉</div>';
  }
  for (var i = 0; i < pendentes.length; i++) {
    var p = pendentes[i];
    var respondendo = a.respondendoId === p.id;
    pendentesHtml += '<div class="bg-white rounded-xl border border-gray-200 p-5">' +
      '<div class="flex items-start gap-3">' +
        '<div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">' + I.helpCircle(20, 'text-amber-600') + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center gap-2 mb-2">' +
            '<span class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendente</span>' +
            '<span class="text-xs text-gray-400">' + esc(formatarData(p.data)) + '</span>' +
          '</div>' +
          '<p class="text-sm text-gray-700 font-medium mb-1">' + esc(p.mensagem) + '</p>' +
          '<p class="text-xs text-gray-400">' + esc(p.telefone) + '</p>' +
        '</div>' +
      '</div>' +
      (respondendo ? '' :
        '<div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">' +
          '<button onclick="iniciarRespostaAprendizado(\'' + p.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">' + I.checkCircle2(14, '') + ' Responder</button>' +
          '<button onclick="ignorarPerguntaAprendizado(\'' + p.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-600 text-xs border border-gray-300 rounded-lg">' + I.x(14, '') + ' Ignorar</button>' +
        '</div>'
      ) +
      (respondendo ? '' +
        '<div class="mt-3 pt-3 border-t border-gray-100">' +
          '<textarea id="resposta-aprendizado-' + p.id + '" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Digite como o bot deve responder..."></textarea>' +
          '<div class="flex gap-2 mt-2">' +
            '<button onclick="salvarRespostaAprendizado(\'' + p.id + '\')" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium">' + I.save(14, '') + ' Salvar Resposta</button>' +
            '<button onclick="state.aprendizado.respondendoId=null;render();bindAprendizado()" class="px-3 py-1.5 text-gray-500 text-xs border border-gray-300 rounded-lg">Cancelar</button>' +
          '</div>' +
        '</div>'
      : '') +
    '</div>';
  }

  var respostasHtml = '';
  if (respostas.length === 0) {
    respostasHtml = '<div class="text-center py-8 text-gray-400 text-sm">Nenhuma resposta aprendida ainda.</div>';
  }
  for (var i = 0; i < respostas.length; i++) {
    var r = respostas[i];
    respostasHtml += '<div class="bg-white rounded-xl border border-gray-200 p-4 group hover:border-gray-300 transition-colors">' +
      '<div class="flex items-start gap-3">' +
        '<div class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">' + I.checkCircle2(18, 'text-emerald-600') + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<p class="text-xs font-medium text-gray-500 mb-1">Pergunta:</p>' +
          '<p class="text-sm text-gray-700 font-medium mb-2">' + esc(r.pergunta) + '</p>' +
          '<p class="text-xs font-medium text-gray-500 mb-1">Resposta:</p>' +
          '<p class="text-sm text-gray-600 mb-2 whitespace-pre-wrap">' + esc(r.resposta) + '</p>' +
          '<div class="flex items-center gap-3 text-xs text-gray-400">' +
            '<span>Usos: ' + (r.usos || 0) + '</span>' +
            '<span>Palavras-chave: ' + (Array.isArray(r.palavras_chave) ? r.palavras_chave.join(', ') : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<button onclick="removerRespostaAprendizada(\'' + r.id + '\')" class="text-red-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">' + I.trash2(16, '') + '</button>' +
      '</div>' +
    '</div>';
  }

  var tabPendencias = a.tab === 'pendencias' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border';
  var tabRespostas = a.tab === 'respostas' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border';
  var tabNova = a.tab === 'nova' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border';

  var conteudoTab = '';
  if (a.tab === 'pendencias') {
    conteudoTab = '<div class="space-y-3">' + pendentesHtml + '</div>';
  } else if (a.tab === 'respostas') {
    conteudoTab = '<div class="space-y-3">' + respostasHtml + '</div>';
  } else if (a.tab === 'nova') {
    conteudoTab = '<div class="bg-white rounded-xl border border-gray-200 p-6">' +
      '<h3 class="text-sm font-semibold text-gray-700 mb-4">Adicionar conhecimento manualmente</h3>' +
      '<div class="space-y-4">' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Pergunta (exemplo do que o cliente pode perguntar)</label>' +
          '<input type="text" id="nova-pergunta" value="' + esc(a.novaPergunta) + '" oninput="state.aprendizado.novaPergunta=this.value" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Ex: Vocês têm opções sem glúten?" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Resposta que o bot deve dar</label>' +
          '<textarea rows="3" id="nova-resposta" oninput="state.aprendizado.novaResposta=this.value" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Ex: Sim! Temos opções sem glúten no nosso cardápio. Você pode conferir pelo link...">' + esc(a.novaResposta) + '</textarea></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Palavras-chave (separadas por vírgula)</label>' +
          '<input type="text" id="nova-palavras" value="' + esc(a.novasPalavrasChave) + '" oninput="state.aprendizado.novasPalavrasChave=this.value" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Ex: glúten, gluten, sem glúten, celíaco" /></div>' +
        '<div class="flex gap-2">' +
          '<button onclick="adicionarConhecimentoManual()" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">' + I.plus(16, '') + ' Adicionar Conhecimento</button>' +
          '<button onclick="state.aprendizado.tab=\'respostas\';state.aprendizado.novaPergunta=\'\';state.aprendizado.novaResposta=\'\';state.aprendizado.novasPalavrasChave=\'\';render();bindAprendizado();loadAprendizado()" class="px-4 py-2.5 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>' +
        '</div>' +
      '</div></div>';
  }

  return '<div class="p-8 max-w-4xl mx-auto">' +
    '<div class="flex items-center justify-between mb-6">' +
      '<div class="flex items-center gap-3">' +
        '<h1 class="text-2xl font-bold text-gray-800">Aprendizado Contínuo</h1>' +
        '<button onclick="toggleHelp()" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors" title="Ajuda">' + I.info(18, '') + '</button>' +
      '</div>' +
    '</div>' +
    renderHelp('aprendizado') +
    '<div class="flex gap-2 mb-6">' +
      '<button onclick="state.aprendizado.tab=\'pendencias\';render();bindAprendizado();loadAprendizado()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + tabPendencias + '">' +
        I.helpCircle(16, 'inline mr-1') + ' Pendentes (' + pendentes.length + ')' +
      '</button>' +
      '<button onclick="state.aprendizado.tab=\'respostas\';render();bindAprendizado();loadAprendizado()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + tabRespostas + '">' +
        I.checkCircle2(16, 'inline mr-1') + ' Aprendidas (' + respostas.length + ')' +
      '</button>' +
      '<button onclick="state.aprendizado.tab=\'nova\';render();bindAprendizado()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + tabNova + '">' +
        I.plus(16, 'inline mr-1') + ' Novo Conhecimento' +
      '</button>' +
    '</div>' +
    conteudoTab +
  '</div>';
}

window.iniciarRespostaAprendizado = function(id) {
  state.aprendizado.respondendoId = id;
  render();
  bindAprendizado();
};

window.salvarRespostaAprendizado = async function(id) {
  var textarea = document.getElementById('resposta-aprendizado-' + id);
  if (!textarea || !textarea.value.trim()) return;
  var resposta = textarea.value.trim();
  try {
    var result = await fetch('/api/aprendizado/pendencias/' + id + '/responder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta: resposta }),
    }).then(function(r) { return r.json(); });
    if (result.success) {
      state.aprendizado.respondendoId = null;
      await loadAprendizado();
      render();
      bindAprendizado();
    }
  } catch(e) {
    alert('Erro ao salvar: ' + e.message);
  }
};

window.ignorarPerguntaAprendizado = async function(id) {
  if (!confirm('Ignorar esta pergunta?')) return;
  try {
    await fetch('/api/aprendizado/pendencias/' + id, { method: 'DELETE' }).then(function(r) { return r.json(); });
    await loadAprendizado();
    render();
    bindAprendizado();
  } catch(e) {
    alert('Erro: ' + e.message);
  }
};

window.removerRespostaAprendizada = async function(id) {
  if (!confirm('Remover esta resposta aprendida?')) return;
  try {
    await fetch('/api/aprendizado/respostas/' + id, { method: 'DELETE' }).then(function(r) { return r.json(); });
    await loadAprendizado();
    render();
    bindAprendizado();
  } catch(e) {
    alert('Erro: ' + e.message);
  }
};

window.adicionarConhecimentoManual = async function() {
  var pergunta = state.aprendizado.novaPergunta.trim();
  var resposta = state.aprendizado.novaResposta.trim();
  var palavras = state.aprendizado.novasPalavrasChave.split(',').map(function(p) { return p.trim(); }).filter(function(p) { return p.length > 0; });
  if (!pergunta || !resposta) { alert('Preencha pergunta e resposta'); return; }
  try {
    var result = await fetch('/api/aprendizado/respostas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta: pergunta, resposta: resposta, palavras_chave: palavras.length > 0 ? palavras : undefined }),
    }).then(function(r) { return r.json(); });
    if (result.success) {
      state.aprendizado.novaPergunta = '';
      state.aprendizado.novaResposta = '';
      state.aprendizado.novasPalavrasChave = '';
      state.aprendizado.tab = 'respostas';
      await loadAprendizado();
      render();
      bindAprendizado();
    }
  } catch(e) {
    alert('Erro: ' + e.message);
  }
};

function formatarData(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function loadAprendizado() {
  try {
    var p = await fetch('/api/aprendizado/pendencias').then(function(r) { return r.json(); });
    if (p.success && Array.isArray(p.data)) state.aprendizado.pendencias = p.data;
    var r = await fetch('/api/aprendizado/respostas').then(function(r) { return r.json(); });
    if (r.success && Array.isArray(r.data)) state.aprendizado.respostas = r.data;
  } catch(e) {}
}

function bindAprendizado() {}

// (Setup Wizard removido — agora o Dashboard é a tela inicial)

// ─── POLLING: atualizar conversas a cada 5s ──────
var pollingTimer = null;
var pollingRodando = false;
function iniciarPollingConversas() {
  if (pollingTimer) clearInterval(pollingTimer);
  pollingTimer = setInterval(function() {
    if (pollingRodando) return;
    pollingRodando = true;
    loadConversasList().then(function() {
      pollingRodando = false;
      if (state.currentPage === 'conversas') {
        render();
      }
      // Atualizar status a cada ciclo (sem re-render)
      atualizarStatusPolling();
      // Se um contato estiver selecionado, buscar novas mensagens
      if (state.currentPage === 'conversas' && state.conversas.contatoSelecionado) {
        pollChatMessages().then(function() {
          loadConversasList().then(function() {
            if (state.currentPage === 'conversas') {
              render();
            }
          });
        });
      }
    }, function() { pollingRodando = false; });
  }, 5000);
}

function atualizarStatusPolling() {
  wabot.dockerStatus().then(function(status) {
    state.dockerStatus = status;
  }).catch(function() {
    state.dockerStatus = { dockerInstalled: false, evolutionRunning: false };
  });
  wabot.evolutionStatus().then(function(status) {
    state.credenciais.evoStatus = status;
  }).catch(function() {});
  atualizarBadgeSidebar();
}

function atualizarBadgeSidebar() {
  var dot = document.getElementById('sidebar-status-dot');
  var text = document.getElementById('sidebar-status-text');
  if (!dot || !text) return;
  var evoConnected = state.credenciais.evoStatus && state.credenciais.evoStatus.connected;
  var d = state.dockerStatus;
  var evoOnline = d && d.evolutionRunning;
  var carregando = !d && !state.credenciais.evoStatus;
  dot.className = 'w-2 h-2 rounded-full flex-shrink-0 ' + (carregando ? 'bg-gray-300' : (evoConnected ? 'bg-emerald-500' : (evoOnline ? 'bg-yellow-500' : 'bg-red-500')));
  text.textContent = carregando ? 'Verificando...' : (evoConnected ? 'Online' : (evoOnline ? 'WA Desconectado' : 'Offline'));
}

// ─── INICIALIZAÇÃO ────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  await checkSetup();
  render();
});

async function checkSetup() {
  try {
    var creds = await wabot.configRead('credentials.json');
    var config = await wabot.configRead('config.json');
    if (creds && creds.data) {
      state.setup.creds = JSON.parse(JSON.stringify(creds.data));
      state.credenciais.creds = JSON.parse(JSON.stringify(creds.data));
    }
    if (config && config.data) {
      state.setup.config = JSON.parse(JSON.stringify(config.data));
      state.configuracoes.config = JSON.parse(JSON.stringify(config.data));
    }
    if (!state.credenciais.creds.llm) {
      state.credenciais.creds.llm = { provider: 'groq', api_key: '', model: 'llama-3.3-70b-versatile' };
    }
    state.setupCompleto = true;
    wabot.evolutionStatus().then(function(r) { state.credenciais.evoStatus = r; }).catch(function(){});
    await Promise.all([
      loadConversasList(),
      loadRegrasList(),
      loadIgnoradosList(),
      loadAprendizado(),
      checkDockerStatus(),
    ]);
    iniciarPollingConversas();
  } catch (e) {
    state.setupCompleto = true;
  }
}

async function loadConversasList() {
  try {
    var result = await wabot.evolutionConversations();
    if (result.success && Array.isArray(result.data)) {
      state.conversas.contatos = result.data;
      // Sincronizar contato selecionado com dados atualizados (status ignorado, etc.)
      if (state.conversas.contatoSelecionado) {
        var tel = state.conversas.contatoSelecionado.telefone;
        for (var i = 0; i < result.data.length; i++) {
          if (result.data[i].telefone === tel) {
            state.conversas.contatoSelecionado = result.data[i];
            state.chat.status = result.data[i].status || state.chat.status;
            break;
          }
        }
      }
    }
  } catch(e) {}
}

async function loadRegrasList() {
  try {
    var result = await wabot.configRead('regras.json');
    if (result.success && Array.isArray(result.data)) state.regras = result.data;
    else state.regras = [];
  } catch(e) { state.regras = []; }
}

async function loadIgnoradosList() {
  try {
    var result = await wabot.configRead('ignorados.json');
    if (result.success && Array.isArray(result.data)) state.ignorados = result.data;
    else state.ignorados = [];
  } catch(e) { state.ignorados = []; }
}
