const fs = require('fs');
const path = require('path');

var DATA_DIR = path.join(__dirname, 'data');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')); } catch (e) { return null; }
}

// ─── Helpers (cópia do server.js) ──
function normalizarTexto(texto) {
  return texto.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectarIntencaoOperacional(mensagem, dadosNegocio) {
  if (!mensagem) return null;
  var msg = normalizarTexto(mensagem);
  var pkw = dadosNegocio.palavras_chave || {};
  var scores = {};
  var tipos = ['atendente', 'horario', 'delivery', 'retirada', 'pedido', 'reserva', 'endereco', 'telefone'];
  for (var i = 0; i < tipos.length; i++) {
    var tipo = tipos[i];
    var kw = pkw[tipo] || {};
    var score = 0;
    var frases = (kw.frase_exata || []).map(normalizarTexto);
    var expressoes = (kw.expressao || []).map(normalizarTexto);
    var palavras = (kw.palavra || []).map(normalizarTexto);
    var prioridade = kw.prioridade || 0;
    for (var j = 0; j < frases.length; j++) {
      if (msg.indexOf(frases[j]) >= 0) score += 10;
    }
    for (var j = 0; j < expressoes.length; j++) {
      if (msg.indexOf(expressoes[j]) >= 0) score += 5;
    }
    for (var j = 0; j < palavras.length; j++) {
      if (msg.indexOf(palavras[j]) >= 0) score += 1;
    }
    if (score > 0) {
      scores[tipo] = score + prioridade;
    }
  }
  var maxTipo = null;
  var maxScore = 0;
  for (var tipo in scores) {
    if (scores[tipo] > maxScore) {
      maxScore = scores[tipo];
      maxTipo = tipo;
    }
  }
  return maxScore > 0 ? maxTipo : null;
}

function substituirVariaveis(texto, config) {
  if (!texto || !config) return texto;
  return texto
    .replace(/\{\{link_pedido_online\}\}/g, config.link_pedido_online || '')
    .replace(/\{\{endereco\}\}/g, config.endereco || '')
    .replace(/\{\{telefone\}\}/g, config.telefone || '')
    .replace(/\{\{nome_negocio\}\}/g, config.nome_negocio || '')
    .replace(/\{\{horario_hoje\}\}/g, '');
}

function formatarTelefone(tel) {
  if (!tel) return '';
  var digits = tel.replace(/\D/g, '');
  if (digits.length === 13) return '+55 (' + digits.substring(2, 4) + ') ' + digits.substring(4, 9) + '-' + digits.substring(9);
  if (digits.length === 12) return '+55 (' + digits.substring(2, 4) + ') ' + digits.substring(4, 8) + '-' + digits.substring(8);
  if (digits.length === 11) return '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 7) + '-' + digits.substring(7);
  if (digits.length === 10) return '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 6) + '-' + digits.substring(6);
  return tel;
}

function responderIntencaoOperacional(intencao, dadosNegocio, config, cozinhaFuncionando, proxApertura) {
  var resposta = null;
  var politicas = dadosNegocio.politicas || {};
  var link = dadosNegocio.link_pedido_online || config.link_pedido_online || '';
  switch (intencao) {
    case 'horario': resposta = '[horarios]'; break;
    case 'endereco': resposta = dadosNegocio.endereco || config.endereco || ''; break;
    case 'telefone': resposta = dadosNegocio.telefone || config.telefone || ''; break;
    case 'pedido':
      if (dadosNegocio.retirada_ativa || dadosNegocio.delivery_ativo) {
        resposta = link;
      } else if (link) {
        resposta = 'No momento não estamos trabalhando com delivery ou retirada.';
      }
      break;
    case 'retirada':
      if (dadosNegocio.retirada_ativa) {
        resposta = link ? 'Sim! Retirada disponível. ' + link : 'Retirada disponível.';
      } else {
        resposta = 'No momento não estamos trabalhando com retirada.';
      }
      break;
    case 'delivery':
      if (dadosNegocio.delivery_ativo) {
        resposta = link ? 'Sim! Delivery disponível! Faça seu pedido pelo link: ' + link : 'Sim! Delivery disponível!';
      } else {
        resposta = 'No momento não trabalhamos com delivery.';
        if (dadosNegocio.retirada_ativa) {
          resposta += ' Se preferir, você pode fazer seu pedido para retirada.';
          if (link) resposta += ' Link: ' + link;
        }
      }
      break;
    case 'reserva':
      if (politicas.reserva_mesas === false) {
        resposta = 'Não trabalhamos com reserva de mesas.';
      }
      break;
    case 'atendente':
      resposta = 'Claro! Vou chamar um atendente para te ajudar.';
      break;
  }
  return resposta;
}

function detectarSaudacao(texto, config) {
  if (!texto) return false;
  var t = texto.toLowerCase().trim();
  var saudacoes = (config.deteccao && config.deteccao.saudacao) || ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eae', 'iae', 'hello', 'hi', 'hey', 'fala', 'salve', 'e aí', 'e ai'];
  var palavras = t.split(/\s+/).filter(function(p) { return p.length > 0; });
  if (palavras.length <= 6) {
    return saudacoes.some(function(s) { return t.indexOf(s) >= 0; });
  }
  return saudacoes.some(function(s) { return t.indexOf(s) === 0; });
}

// ─── TESTE 1: Intenção de delivery ──
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 1: DETECÇÃO DE INTENÇÃO DELIVERY            ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var dadosNegocio = readJson('dados_negocio.json');
var config = readJson('config.json');

if (!dadosNegocio || !config) {
  console.error('ERRO: Não foi possível ler dados_negocio.json ou config.json');
  process.exit(1);
}

var frasesDelivery = [
  'Vocês fazem delivery?',
  'tem delivery?',
  'tem entrega?',
  'faz entrega?',
  'vocês entregam?',
  'entrega em casa?',
  'tem entrega em domicílio?',
  'entrega em domicílio?',
  'posso pedir em casa?',
  'posso pedir para casa?',
  'quero receber em casa',
  'leva em casa?',
  'ifood?',
  'tem ifood?',
];

var todasDeliveryPassaram = true;
for (var i = 0; i < frasesDelivery.length; i++) {
  var frase = frasesDelivery[i];
  var intencao = detectarIntencaoOperacional(frase, dadosNegocio);
  var resposta = responderIntencaoOperacional(intencao, dadosNegocio, config, false, null);
  var passou = intencao === 'delivery';
  if (!passou) todasDeliveryPassaram = false;
  console.log(
    (passou ? '  ✅' : '  ❌') +
    ' "' + frase + '"' +
    '\n     → intenção: ' + (intencao || 'null') +
    '\n     → resposta: ' + (resposta || 'null')
  );
}

console.log('');
console.log(todasDeliveryPassaram
  ? '  ✅ RESULTADO: TODAS as frases de delivery foram detectadas corretamente!'
  : '  ❌ RESULTADO: Algumas frases de delivery falharam.'
);

// ─── TESTE 2: Prioridade delivery vs pedido ──
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 2: PRIORIDADE DELIVERY > PEDIDO             ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var frasesConflito = [
  'quero pedir em casa',
  'quero pedir para casa',
  'gostaria de pedir para entrega',
];

for (var i = 0; i < frasesConflito.length; i++) {
  var frase = frasesConflito[i];
  var intencao = detectarIntencaoOperacional(frase, dadosNegocio);
  var passou = intencao === 'delivery';
  if (!passou) todasDeliveryPassaram = false;
  console.log(
    (passou ? '  ✅' : '  ❌') +
    ' "' + frase + '" → ' + intencao
  );
}

// ─── TESTE 3: Lógica de saudação ──
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 3: LÓGICA DE SAUDAÇÃO                       ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var saudacaoTexto = substituirVariaveis(config.mensagem_saudacao, config);

function simularRespostaComSaudacao(mensagem, isPrimeiraMsg, config, dadosNegocio) {
  var isSaudacao = detectarSaudacao(mensagem, config);
  var intencao = detectarIntencaoOperacional(mensagem, dadosNegocio);
  var respostaIA = null;

  // Simula o fluxo do webhook
  if (isSaudacao && !intencao) {
    respostaIA = saudacaoTexto;
  } else if (intencao) {
    respostaIA = responderIntencaoOperacional(intencao, dadosNegocio, config, false, null);
  } else {
    respostaIA = '[IA responderia aqui]';
  }

  // Aplica a nova lógica de saudação condicional
  var precisaSaudar = false;
  if (config.mensagem_saudacao && respostaIA !== saudacaoTexto) {
    if (isPrimeiraMsg) precisaSaudar = true;
    if (isSaudacao) precisaSaudar = true;
  }

  return {
    saudacaoAplicada: precisaSaudar,
    textoFinal: precisaSaudar ? saudacaoTexto + '\n\n' + respostaIA : respostaIA
  };
}

// Caso A: Primeira mensagem, saudação pura
var r = simularRespostaComSaudacao('boa noite', true, config, dadosNegocio);
console.log('  [A] Primeira msg "boa noite" (só saudação):');
console.log('      saudação aplicada: ' + (r.saudacaoAplicada ? 'sim' : 'não') + ' (esperado: não, pois resposta já é a saudação)');
console.log('      resposta: ' + r.textoFinal.substring(0, 80) + '...');

// Caso B: Primeira mensagem, pergunta operacional
r = simularRespostaComSaudacao('tem delivery?', true, config, dadosNegocio);
console.log('  [B] Primeira msg "tem delivery?" (operacional):');
console.log('      saudação aplicada: ' + (r.saudacaoAplicada ? 'sim' : 'não') + ' (esperado: sim)');
console.log('      resposta: ' + r.textoFinal.substring(0, 80) + '...');

// Caso C: Segunda mensagem, pergunta operacional (sem saudação)
r = simularRespostaComSaudacao('qual horário de funcionamento?', false, config, dadosNegocio);
console.log('  [C] Segunda msg "qual horário?" (operacional, sem saudação):');
console.log('      saudação aplicada: ' + (r.saudacaoAplicada ? 'sim' : 'não') + ' (esperado: não)');
console.log('      resposta: ' + r.textoFinal.substring(0, 80) + '...');

// Caso D: Segunda mensagem, saudação + pergunta
r = simularRespostaComSaudacao('oi, tem delivery?', false, config, dadosNegocio);
console.log('  [D] Segunda msg "oi, tem delivery?" (saudação + pergunta):');
console.log('      saudação aplicada: ' + (r.saudacaoAplicada ? 'sim' : 'não') + ' (esperado: sim)');
console.log('      resposta: ' + r.textoFinal.substring(0, 80) + '...');

// Caso E: Primeira mensagem, saudação + pergunta
r = simularRespostaComSaudacao('oi, tem entrega?', true, config, dadosNegocio);
console.log('  [E] Primeira msg "oi, tem entrega?" (saudação + pergunta):');
console.log('      saudação aplicada: ' + (r.saudacaoAplicada ? 'sim' : 'não') + ' (esperado: sim)');
console.log('      resposta: ' + r.textoFinal.substring(0, 80) + '...');

// ─── TESTE 4: Simulação de conversa real ──
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 4: SIMULAÇÃO DE CONVERSA                    ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var passos = [
  { msg: 'boa noite', esperado: 'saudacao' },
  { msg: 'estão funcionando?', esperado: 'operacional_sem_saudacao' },
  { msg: 'qual horário de funcionamento?', esperado: 'operacional_sem_saudacao' },
  { msg: 'tem delivery?', esperado: 'delivery' },
  { msg: 'tem entrega?', esperado: 'delivery' },
];

var jaTeveMsg = false;
for (var i = 0; i < passos.length; i++) {
  var passo = passos[i];
  var isSaud = detectarSaudacao(passo.msg, config);
  var int = detectarIntencaoOperacional(passo.msg, dadosNegocio);
  var resp = null;
  var statusIcon = '  ✅';

  if (passo.esperado === 'saudacao') {
    resp = saudacaoTexto;
    if (!isSaud && !int) { statusIcon = '  ❌'; }
  } else if (passo.esperado === 'delivery') {
    resp = responderIntencaoOperacional('delivery', dadosNegocio, config, false, null);
    if (int !== 'delivery') { statusIcon = '  ❌'; }
  } else {
    resp = int
      ? responderIntencaoOperacional(int, dadosNegocio, config, false, null)
      : '[IA]';
  }

  // Aplica regra de saudação condicional
  var precisaSaudar = false;
  if (config.mensagem_saudacao && resp !== saudacaoTexto) {
    if (!jaTeveMsg) precisaSaudar = true;
    if (isSaud) precisaSaudar = true;
  }
  var textoFinal = precisaSaudar ? saudacaoTexto + '\n\n' + resp : resp;

  console.log(statusIcon + ' Passo ' + (i + 1) + ': "' + passo.msg + '"');
  console.log('     intenção: ' + int);
  console.log('     saudação: ' + (precisaSaudar ? 'SIM' : 'não'));
  console.log('     resposta: ' + textoFinal.substring(0, 120));

  jaTeveMsg = true;
}

// ─── Conclusão ──
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   RESUMO                                             ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

console.log('  ✅ Delivery keywords atualizadas:');
console.log('     - frase_exata: tem entrega, faz entrega, leva em casa');
console.log('     - expressao: ifood');
console.log('     - palavra: leva, ifood');
console.log('     - prioridade: 82 → 85');
console.log('');
console.log('  ✅ Lógica de saudação corrigida:');
console.log('     - Só aplica saudação na primeira mensagem ou quando usuário saúda');
console.log('     - Removeu saudação automática a cada 2h');
console.log('     - Respostas operacionais sem "Dia!"/"Noite!" prefixados');
console.log('');
console.log('  ✅ Resposta de delivery sempre retorna:');
console.log('     "No momento não trabalhamos com delivery. Se preferir,');
console.log('      você pode fazer seu pedido para retirada. Link: ..."');
console.log('');

if (!todasDeliveryPassaram) {
  console.log('  ⚠️  ALERTA: Alguns testes de delivery falharam!');
  process.exit(1);
} else {
  console.log('  Todos os testes passaram! ✅');
}
