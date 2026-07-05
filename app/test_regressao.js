const fs = require('fs');
const path = require('path');

var DATA_DIR = path.join(__dirname, 'data');
var FAILURES = 0;

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')); } catch (e) { return null; }
}

function assert(label, cond) {
  if (!cond) { console.log('  ❌ FALHA: ' + label); FAILURES++; }
  else { console.log('  ✅ ' + label); }
}

// ─── Helpers (cópia do server.js) ──
function configGet(config, path, fallback) {
  var parts = path.split('.');
  var cur = config;
  for (var i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object') return fallback;
    cur = cur[parts[i]];
  }
  return cur !== undefined ? cur : fallback;
}

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
    case 'telefone': resposta = formatarTelefone(dadosNegocio.telefone || config.telefone || ''); break;
    case 'pedido':
      if (dadosNegocio.retirada_ativa || dadosNegocio.delivery_ativo) { resposta = link; }
      else if (link) { resposta = 'No momento não estamos trabalhando com delivery ou retirada.'; }
      break;
    case 'retirada':
      if (dadosNegocio.retirada_ativa) { resposta = link ? 'Sim! Retirada disponível. ' + link : 'Retirada disponível.'; }
      else { resposta = 'No momento não estamos trabalhando com retirada.'; }
      break;
    case 'delivery':
      if (dadosNegocio.delivery_ativo) { resposta = link ? 'Sim! Delivery disponível! Faça seu pedido pelo link: ' + link : 'Sim! Delivery disponível!'; }
      else {
        resposta = 'No momento não trabalhamos com delivery.';
        if (dadosNegocio.retirada_ativa) { resposta += ' Se preferir, você pode fazer seu pedido para retirada.'; if (link) resposta += ' Link: ' + link; }
      }
      break;
    case 'reserva':
      if (politicas.reserva_mesas === false) { resposta = 'Não trabalhamos com reserva de mesas.'; }
      break;
    case 'atendente': resposta = 'Claro! Vou chamar um atendente para te ajudar.'; break;
  }
  return resposta;
}

function detectarSaudacao(texto, config) {
  if (!texto) return false;
  var t = texto.toLowerCase().trim();
  var saudacoes = (config.deteccao && config.deteccao.saudacao) || ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eae', 'iae', 'hello', 'hi', 'hey', 'fala', 'salve', 'e aí', 'e ai'];
  var palavras = t.split(/\s+/).filter(function(p) { return p.length > 0; });
  if (palavras.length <= 6) { return saudacoes.some(function(s) { return t.indexOf(s) >= 0; }); }
  return saudacoes.some(function(s) { return t.indexOf(s) === 0; });
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

// ═══════════════════════════════════════════════════
// TESTE 0: VALIDAÇÃO DOS ARQUIVOS DE DADOS
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 0: VALIDAÇÃO DOS ARQUIVOS DE DADOS         ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var config = readJson('config.json');
var dadosNegocio = readJson('dados_negocio.json');
var credentials = readJson('credentials.json');

assert('config.json existe e é válido', config !== null);
assert('config.json.nome_negocio é string', config && typeof config.nome_negocio === 'string');
assert('config.json.horarios é objeto', config && typeof config.horarios === 'object');
assert('config.json.mensagem_saudacao existe', config && typeof config.mensagem_saudacao === 'string');
assert('config.json.mensagem_nao_entendi existe', config && typeof config.mensagem_nao_entendi === 'string');

assert('dados_negocio.json existe e é válido', dadosNegocio !== null);
assert('dados_negocio.json.nome é string', dadosNegocio && typeof dadosNegocio.nome === 'string');
assert('dados_negocio.json.palavras_chave é objeto', dadosNegocio && typeof dadosNegocio.palavras_chave === 'object');
assert('dados_negocio.json tem todos os 8 tipos de intenção',
  dadosNegocio && ['atendente','horario','delivery','retirada','pedido','reserva','endereco','telefone']
    .every(function(t) { return dadosNegocio.palavras_chave[t]; })
);

assert('credentials.json existe e é válido', credentials !== null);
assert('credentials.json.evolution.api_key existe', credentials && credentials.evolution && credentials.evolution.api_key);

// ═══════════════════════════════════════════════════
// TESTE 1: DETECÇÃO DE TODAS AS INTENÇÕES
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 1: DETECÇÃO DE TODAS AS INTENÇÕES          ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var testesIntencao = [
  { frase: 'quero falar com um atendente', esperado: 'atendente' },
  { frase: 'preciso de ajuda de um atendente', esperado: 'atendente' },
  { frase: 'atendente humano', esperado: 'atendente' },

  { frase: 'qual o horário de funcionamento?', esperado: 'horario' },
  { frase: 'que horas vocês abrem?', esperado: 'horario' },
  { frase: 'estão funcionando hoje?', esperado: 'horario' },
  { frase: 'vocês estão abertos agora?', esperado: 'horario' },
  { frase: 'horário', esperado: 'horario' },

  { frase: 'vocês fazem delivery?', esperado: 'delivery' },
  { frase: 'tem delivery?', esperado: 'delivery' },
  { frase: 'tem entrega?', esperado: 'delivery' },
  { frase: 'faz entrega?', esperado: 'delivery' },
  { frase: 'vocês entregam?', esperado: 'delivery' },
  { frase: 'entrega em casa?', esperado: 'delivery' },
  { frase: 'tem entrega em domicílio?', esperado: 'delivery' },
  { frase: 'posso pedir em casa?', esperado: 'delivery' },
  { frase: 'leva em casa?', esperado: 'delivery' },
  { frase: 'ifood?', esperado: 'delivery' },
  { frase: 'tem ifood?', esperado: 'delivery' },

  { frase: 'quero fazer uma retirada', esperado: 'retirada' },
  { frase: 'posso retirar no local?', esperado: 'retirada' },
  { frase: 'vou buscar aí', esperado: 'retirada' },
  { frase: 'retirada', esperado: 'retirada' },

  { frase: 'quero fazer um pedido', esperado: 'pedido' },
  { frase: 'gostaria de pedir', esperado: 'pedido' },
  { frase: 'queria encomendar', esperado: 'pedido' },
  { frase: 'fazer um pedido', esperado: 'pedido' },

  { frase: 'qual o endereço?', esperado: 'endereco' },
  { frase: 'onde vocês ficam?', esperado: 'endereco' },
  { frase: 'qual a localização?', esperado: 'endereco' },
  { frase: 'endereço', esperado: 'endereco' },

  { frase: 'qual o telefone?', esperado: 'telefone' },
  { frase: 'qual o whatsapp?', esperado: 'telefone' },
  { frase: 'telefone', esperado: 'telefone' },

  { frase: 'faz reserva de mesa?', esperado: 'reserva' },
  { frase: 'reserva de mesas', esperado: 'reserva' },
];

for (var i = 0; i < testesIntencao.length; i++) {
  var t = testesIntencao[i];
  var intencao = detectarIntencaoOperacional(t.frase, dadosNegocio);
  var passou = intencao === t.esperado;
  if (!passou) { FAILURES++; }
  console.log(
    (passou ? '  ✅' : '  ❌') +
    ' "' + t.frase + '"' +
    '\n     → esperado: ' + t.esperado + ', recebido: ' + (intencao || 'null')
  );
}

// ═══════════════════════════════════════════════════
// TESTE 2: PRIORIDADE DELIVERY > PEDIDO
// ═══════════════════════════════════════════════════
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
  var intencao = detectarIntencaoOperacional(frasesConflito[i], dadosNegocio);
  var passou = intencao === 'delivery';
  if (!passou) { FAILURES++; }
  console.log(
    (passou ? '  ✅' : '  ❌') +
    ' "' + frasesConflito[i] + '" → ' + (intencao || 'null') + ' (esperado: delivery)'
  );
}

// ═══════════════════════════════════════════════════
// TESTE 3: RESPOSTAS OPERACIONAIS
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 3: RESPOSTAS OPERACIONAIS                   ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var deliveryResp = responderIntencaoOperacional('delivery', dadosNegocio, config, false, null);
assert('delivery: resposta não nula', deliveryResp !== null);
assert('delivery: menciona "delivery" na resposta', deliveryResp && deliveryResp.indexOf('delivery') >= 0);

var retiradaResp = responderIntencaoOperacional('retirada', dadosNegocio, config, false, null);
assert('retirada: resposta não nula', retiradaResp !== null);
assert('retirada: menciona "Retirada" na resposta', retiradaResp && retiradaResp.indexOf('Retirada') >= 0);

var enderecoResp = responderIntencaoOperacional('endereco', dadosNegocio, config, false, null);
assert('endereco: resposta não nula', enderecoResp !== null && enderecoResp !== '');

var telefoneResp = responderIntencaoOperacional('telefone', dadosNegocio, config, false, null);
assert('telefone: resposta não nula', telefoneResp !== null && telefoneResp !== '');

var atendenteResp = responderIntencaoOperacional('atendente', dadosNegocio, config, false, null);
assert('atendente: resposta não nula', atendenteResp !== null);
assert('atendente: menciona "atendente"', atendenteResp && atendenteResp.indexOf('atendente') >= 0);

// ═══════════════════════════════════════════════════
// TESTE 4: LÓGICA DE SAUDAÇÃO
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 4: LÓGICA DE SAUDAÇÃO                       ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

assert('isApenasSaudacao("boa noite") = true', isApenasSaudacao('boa noite', config));
assert('isApenasSaudacao("olá") = true', isApenasSaudacao('olá', config));
assert('isApenasSaudacao("tem delivery") = false', !isApenasSaudacao('tem delivery', config));

assert('detectarSaudacao("oi") = true', detectarSaudacao('oi', config));
assert('detectarSaudacao("tem delivery") = false', !detectarSaudacao('tem delivery', config));
assert('detectarSaudacao("oi, tem delivery") = true', detectarSaudacao('oi, tem delivery', config));

assert('isApenasAgradecimento("obrigado") = true', isApenasAgradecimento('obrigado', config));
assert('isApenasAgradecimento("obrigada") = true', isApenasAgradecimento('obrigada', config));
assert('isApenasAgradecimento("tem delivery") = false', !isApenasAgradecimento('tem delivery', config));

// ═══════════════════════════════════════════════════
// TESTE 5: SIMULAÇÃO DE CONVERSA
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 5: SIMULAÇÃO DE CONVERSA                    ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

var saudacaoTexto = substituirVariaveis(config.mensagem_saudacao, config);
var passos = [
  // Passo 1: só saudação → resposta = saudação, sem prefixar
  { msg: 'boa noite', esperado_intencao: null, ehApenasSaudacao: true },
  // Passo 2-4: operacionais sem saudação (já teve msg)
  { msg: 'estão funcionando?', esperado_intencao: 'horario', ehApenasSaudacao: false },
  { msg: 'tem delivery?', esperado_intencao: 'delivery', ehApenasSaudacao: false },
  { msg: 'tem entrega?', esperado_intencao: 'delivery', ehApenasSaudacao: false },
];

var jaTeveMsg = false;
for (var i = 0; i < passos.length; i++) {
  var p = passos[i];
  var isSaud = detectarSaudacao(p.msg, config);
  var int = detectarIntencaoOperacional(p.msg, dadosNegocio);

  var intOk = int === p.esperado_intencao;
  var resp, textoFinal, deveSaudar;

  // Simula o fluxo real do webhook (server.js ~linha 1430)
  if (p.ehApenasSaudacao && !int) {
    resp = saudacaoTexto;
    deveSaudar = false; // resposta JÁ é a saudação
  } else {
    resp = responderIntencaoOperacional(int, dadosNegocio, config, false, null) || '[IA]';
    // Só prefixa saudação se: é primeira msg OU usuário saudou
    deveSaudar = false;
    if (config.mensagem_saudacao) {
      if (!jaTeveMsg) deveSaudar = true;
      if (isSaud) deveSaudar = true;
    }
  }

  var saudOk = deveSaudar === (p.ehApenasSaudacao ? false : !jaTeveMsg || isSaud);
  var textoFinal = deveSaudar ? saudacaoTexto + '\n\n' + resp : resp;
  var respOk = textoFinal !== null && textoFinal !== '';

  if (!intOk || !saudOk || !respOk) { FAILURES++; }

  console.log(
    ((intOk && saudOk && respOk) ? '  ✅' : '  ❌') +
    ' Passo ' + (i + 1) + ': "' + p.msg + '"' +
    '\n     intenção: ' + (int || 'null') + ' (esperado: ' + (p.esperado_intencao || 'null') + ')' +
    '\n     saudação: ' + (deveSaudar ? 'SIM' : 'não')
  );

  jaTeveMsg = true;
}

// ═══════════════════════════════════════════════════
// RESUMO
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   RESUMO                                             ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

if (FAILURES > 0) {
  console.log('  ❌ FALHA: ' + FAILURES + ' teste(s) falharam!');
  process.exit(1);
} else {
  console.log('  ✅ Todos os testes passaram!');
  process.exit(0);
}
