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

function diaAtualTexto() {
  var nomes = { domingo: 'Domingo', segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado' };
  var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return nomes[dias[new Date().getDay()]];
}

function agendamentoHojeTexto(config) {
  if (!config || !config.horarios) return '';
  var dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  var hoje = dias[new Date().getDay()];
  var info = config.horarios[hoje];
  if (!info || info.fechado) return '';
  var periodos = info.agendamento || [];
  if (periodos.length === 0) return '';
  return periodos.filter(function(p) { return p.abertura; }).map(function(p) { return p.abertura + ' às ' + p.fechamento; }).join(', ');
}

function horariosSemanaTexto(config) {
  if (!config || !config.horarios) return '';
  var nomes = { domingo: 'Domingo', segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado' };
  var dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  var textoFechado = configGet(config, 'mensagens.texto_fechado', 'Fechado');
  var linhas = [];
  for (var i = 0; i < dias.length; i++) {
    var dia = dias[i];
    var info = config.horarios[dia];
    var nomeCurto = nomes[dia].substring(0, 3);
    if (!info || info.fechado) {
      linhas.push(nomeCurto + ': ' + textoFechado);
    } else {
      var periodos = info.cozinha || info.periodos || [];
      if (periodos.length > 0 && periodos[0].abertura) {
        linhas.push(nomeCurto + ': ' + periodos[0].abertura + '-' + periodos[0].fechamento);
      } else {
        linhas.push(nomeCurto + ': ' + textoFechado);
      }
    }
  }
  return linhas.join(', ');
}

function substituirVariaveis(texto, config, contexto) {
  if (!texto || !config) return texto;
  contexto = contexto || {};
  var proxTexto = '';
  if (contexto.proxAbertura !== null && contexto.proxAbertura !== undefined) {
    proxTexto = String(Math.floor(contexto.proxAbertura / 60)).padStart(2, '0') + ':' + String(contexto.proxAbertura % 60).padStart(2, '0');
  }
  return texto
    .replace(/\{\{link_pedido_online\}\}/g, config.link_pedido_online || '')
    .replace(/\{\{endereco\}\}/g, config.endereco || '')
    .replace(/\{\{telefone\}\}/g, config.telefone || '')
    .replace(/\{\{nome_negocio\}\}/g, config.nome_negocio || '')
    .replace(/\{\{horario_hoje\}\}/g, horarioHojeTexto(config))
    .replace(/\{\{agendamento_hoje\}\}/g, agendamentoHojeTexto(config))
    .replace(/\{\{dia_atual\}\}/g, diaAtualTexto())
    .replace(/\{\{proxima_abertura\}\}/g, proxTexto)
    .replace(/\{\{horarios_semana\}\}/g, horariosSemanaTexto(config));
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

function montarRespostaHorario(dadosNegocio, config, cozinhaFuncionando, proxApertura) {
  var horarios = config.horarios || dadosNegocio.horarios || {};
  var politicas = dadosNegocio.politicas || {};
  var nomesDias = { domingo: 'Domingo', segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado' };
  var dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  var textoFechado = configGet(config, 'mensagens.texto_fechado', 'Fechado');
  var hoje = new Date();
  var hojeNome = dias[hoje.getDay()];
  var hojeInfo = horarios[hojeNome];
  var txt = '';
  if (cozinhaFuncionando) {
    txt = 'Estamos ABERTOS agora! ';
  } else if (proxApertura !== null) {
    var proxHoras = Math.floor(proxApertura / 60) + ':' + String(proxApertura % 60).padStart(2, '0');
    txt = 'Estamos fechados. Próxima abertura: ' + proxHoras + '. ';
  }
  var hojeTxt = '';
  if (hojeInfo) {
    if (hojeInfo.fechado) {
      hojeTxt = ' Hoje (' + nomesDias[hojeNome] + '): ' + textoFechado + '.';
    } else {
      var periodos = hojeInfo.cozinha || hojeInfo.periodos || [];
      if (periodos.length > 0 && periodos[0].abertura) {
        var partes = [];
        for (var p = 0; p < periodos.length; p++) {
          partes.push(periodos[p].abertura + ' às ' + periodos[p].fechamento);
        }
        hojeTxt = ' Hoje (' + nomesDias[hojeNome] + '): ' + partes.join(' e ') + '.';
      } else if (hojeInfo.abertura) {
        hojeTxt = ' Hoje (' + nomesDias[hojeNome] + '): ' + hojeInfo.abertura + ' às ' + hojeInfo.fechamento + '.';
      }
    }
  }
  var politicaTxt = '';
  if (politicas.encomenda_almoco_desde) {
    politicaTxt += ' Pedidos antecipados (almoço) a partir das ' + politicas.encomenda_almoco_desde + '.';
  }
  if (politicas.encomenda_jantar_desde) {
    politicaTxt += ' Pedidos antecipados (jantar) a partir das ' + politicas.encomenda_jantar_desde + '.';
  }
  return txt + hojeTxt + politicaTxt + ' Horários: ' + horariosSemanaTexto(config);
}

function detectarDataConsulta(mensagem) {
  if (!mensagem) return null;
  var msg = mensagem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  var meses = { 1:'janeiro',2:'fevereiro',3:'marco',4:'abril',5:'maio',6:'junho',7:'julho',8:'agosto',9:'setembro',10:'outubro',11:'novembro',12:'dezembro' };
  var mesesInv = {}; for (var mk in meses) mesesInv[meses[mk]] = parseInt(mk);
  var anoAtual = new Date().getFullYear();
  var m1 = msg.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (m1) {
    var d = parseInt(m1[1]), m = parseInt(m1[2]), a = m1[3] ? parseInt(m1[3]) : anoAtual;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return { data: String(d).padStart(2,'0') + '/' + String(m).padStart(2,'0') + '/' + a };
    }
  }
  var m2 = msg.match(/(?:dia\s+)?(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{4}))?/);
  if (m2) {
    var d = parseInt(m2[1]), nomeMes = m2[2].replace(/[^a-z]/g,''), aNum = m2[3] ? parseInt(m2[3]) : anoAtual;
    var mNum = mesesInv[nomeMes];
    if (d >= 1 && d <= 31 && mNum) {
      return { data: String(d).padStart(2,'0') + '/' + String(mNum).padStart(2,'0') + '/' + aNum };
    }
  }
  return null;
}

function responderFeriadoEspecial(dataConsulta, config) {
  if (!dataConsulta || !config.feriados_especiais) return null;
  for (var i = 0; i < config.feriados_especiais.length; i++) {
    if (config.feriados_especiais[i].data === dataConsulta) return config.feriados_especiais[i];
  }
  var partes = dataConsulta.split('/');
  if (partes.length === 3) {
    var nextYearStr = partes[0] + '/' + partes[1] + '/' + (parseInt(partes[2]) + 1);
    for (var j = 0; j < config.feriados_especiais.length; j++) {
      if (config.feriados_especiais[j].data === nextYearStr) return config.feriados_especiais[j];
    }
  }
  return null;
}

function responderIntencaoOperacional(intencao, dadosNegocio, config, cozinhaFuncionando, proxApertura, mensagem) {
  var respOp = (dadosNegocio.respostas_operacionais || {})[intencao];
  if (respOp && respOp.texto && respOp.texto.trim()) {
    return substituirVariaveis(respOp.texto.trim(), config, { proxAbertura: proxApertura, cozinhaFuncionando: cozinhaFuncionando });
  }
  var resposta = null;
  var politicas = dadosNegocio.politicas || {};
  var link = dadosNegocio.link_pedido_online || config.link_pedido_online || '';
  switch (intencao) {
    case 'horario':
      if (mensagem) {
        var dataDetectada = detectarDataConsulta(mensagem);
        if (dataDetectada) {
          var feriado = responderFeriadoEspecial(dataDetectada.data, config);
          if (feriado) {
            if (feriado.mensagem) { resposta = feriado.mensagem; break; }
            var partes = ['No dia ' + dataDetectada.dataFormatada];
            if (feriado.status === 'aberto') {
              partes.push('estaremos abertos');
              if (feriado.horario) partes.push('das ' + feriado.horario.replace('-', ' às '));
              if (feriado.agendamento_inicio) partes.push('com agendamentos a partir das ' + feriado.agendamento_inicio);
            } else { partes.push('estaremos fechados'); }
            resposta = partes.join(' ') + '.';
            break;
          }
        }
      }
      resposta = montarRespostaHorario(dadosNegocio, config, cozinhaFuncionando, proxApertura);
      break;
    case 'endereco': resposta = config.endereco || dadosNegocio.endereco || ''; break;
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
  { frase: 'qual é o horário de funcionamento?', esperado: 'horario' },
  { frase: 'horário de funcionamento', esperado: 'horario' },
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

  var horarioResp = responderIntencaoOperacional('horario', dadosNegocio, config, false, 660);
  assert('horario: resposta não nula', horarioResp !== null);
  assert('horario: contém horário de hoje (11:00)', horarioResp && horarioResp.indexOf('11:00') >= 0);
  assert('horario: contém "ABERTOS" ou "fechados"', horarioResp && (horarioResp.indexOf('ABERTOS') >= 0 || horarioResp.indexOf('fechados') >= 0));

var retiradaResp = responderIntencaoOperacional('retirada', dadosNegocio, config, false, null);
assert('retirada: resposta não nula', retiradaResp !== null);
assert('retirada: menciona "Retirada" na resposta', retiradaResp && retiradaResp.indexOf('Retirada') >= 0);

var enderecoResp = responderIntencaoOperacional('endereco', dadosNegocio, config, false, null);
assert('endereco: resposta não nula', enderecoResp !== null && enderecoResp !== '');
assert('endereco: contém endereço completo', enderecoResp && enderecoResp.indexOf('Rua 15 de Novembro') >= 0);
assert('endereco: contém cidade/estado', enderecoResp && enderecoResp.indexOf('Itapira/SP') >= 0);

var telefoneResp = responderIntencaoOperacional('telefone', dadosNegocio, config, false, null);
assert('telefone: resposta não nula', telefoneResp !== null && telefoneResp !== '');

var atendenteResp = responderIntencaoOperacional('atendente', dadosNegocio, config, false, null);
assert('atendente: resposta não nula', atendenteResp !== null);
assert('atendente: menciona "atendente"', atendenteResp && atendenteResp.indexOf('atendente') >= 0);

// ═══════════════════════════════════════════════════
// TESTE 3B: FERIADOS / DATAS ESPECIAIS
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 3B: FERIADOS / DATAS ESPECIAIS             ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

// detectarDataConsulta
var d1 = detectarDataConsulta('voces estarao abertos no dia 25/12?');
assert('detectarDataConsulta: 25/12 extraido', d1 !== null && d1.data === '25/12/2026');

var d2 = detectarDataConsulta('no dia 01/01 voces abrem?');
assert('detectarDataConsulta: 01/01 extraido', d2 !== null && d2.data === '01/01/2026');

var d3 = detectarDataConsulta('dia 7 de setembro');
assert('detectarDataConsulta: 7 de setembro extraido', d3 !== null && d3.data === '07/09/2026');

var d4 = detectarDataConsulta('feriado de 25 de dezembro de 2026');
assert('detectarDataConsulta: 25 de dezembro de 2026 extraido', d4 !== null && d4.data === '25/12/2026');

var d5 = detectarDataConsulta('qual o horario normal?');
assert('detectarDataConsulta: sem data retorna null', d5 === null);

// responderFeriadoEspecial
var f1 = responderFeriadoEspecial('25/12/2026', config);
assert('responderFeriadoEspecial: natal encontrado', f1 !== null && f1.status === 'fechado');

var f2 = responderFeriadoEspecial('01/01/2027', config);
assert('responderFeriadoEspecial: ano novo encontrado', f2 !== null && f2.status === 'aberto');
assert('responderFeriadoEspecial: ano novo tem horario', f2 !== null && f2.horario === '18:00-23:00');

var f3 = responderFeriadoEspecial('15/06/2026', config);
assert('responderFeriadoEspecial: data sem feriado retorna null', f3 === null);

// responderIntencaoOperacional com mensagem de feriado
var feriadoResp1 = responderIntencaoOperacional('horario', dadosNegocio, config, false, null, 'voces estarao abertos no dia 25/12?');
assert('feriado: resposta para 25/12 contém mensagem configurada', feriadoResp1 !== null && feriadoResp1.indexOf('25/12') >= 0);
assert('feriado: resposta para 25/12 menciona fechados', feriadoResp1 !== null && feriadoResp1.indexOf('fechados') >= 0);

var feriadoResp2 = responderIntencaoOperacional('horario', dadosNegocio, config, false, null, 'no dia 01/01 voces abrem?');
assert('feriado: resposta para 01/01 (next year) contém 18:00-23:00', feriadoResp2 !== null && feriadoResp2.indexOf('18') >= 0);

// Sem mensagem de feriado, cai no padrão
var feriadoResp3 = responderIntencaoOperacional('horario', dadosNegocio, config, false, 660, 'qual o horario?');
assert('feriado: sem data usa resposta padrao', feriadoResp3 !== null && feriadoResp3.indexOf('11:00') >= 0);

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
// TESTE 6: RESILIÊNCIA DE UPDATE (dados locais preservados)
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   TESTE 6: RESILIÊNCIA DE UPDATE                    ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');

function mergeSchema(template, local) {
  if (!template || typeof template !== 'object') return local;
  if (!local || typeof local !== 'object') return template;
  if (Array.isArray(template) || Array.isArray(local)) return local;
  for (var k in template) {
    if (!(k in local)) {
      local[k] = template[k];
    } else if (typeof template[k] === 'object' && template[k] !== null && !Array.isArray(template[k])) {
      local[k] = mergeSchema(template[k], local[k]);
    }
  }
  return local;
}

// Simular: dados_negocio.json com valores customizados
var localOriginal = {
  nome: "Meu Restaurante Teste",
  endereco: "Rua Exemplo, 123",
  telefone: "11999999999",
  link_pedido_online: "https://meu.link/teste",
  delivery_ativo: true,
  retirada_ativa: false,
  palavras_chave: {
    delivery: { prioridade: 85, frase_exata: [], expressao: [], palavra: ["delivery", "entrega"] }
  },
  respostas_operacionais: {
    delivery: { texto: "Fazemos sim!", curta: "", completa: "" },
    horario: { texto: "Funcionamos de seg a sex.", curta: "", completa: "" }
  },
  politicas: {
    encomenda_almoco_desde: "09:00"
  }
};

// Template novo (simula update que adiciona campo "consumo_local_ativo")
var templateAtualizado = {
  nome: "Meu Negocio",
  endereco: "",
  telefone: "",
  link_pedido_online: "",
  site: "",
  delivery_ativo: false,
  retirada_ativa: true,
  consumo_local_ativo: true,
  politicas: { reserva_mesas: false, encomenda_almoco_desde: "", encomenda_jantar_desde: "" },
  palavras_chave: { delivery: { prioridade: 85, frase_exata: [], expressao: [], palavra: ["delivery"] } },
  respostas_operacionais: {
    delivery: { texto: "", curta: "", completa: "" },
    retirada: { texto: "", curta: "", completa: "" }
  }
};

var merged = mergeSchema(templateAtualizado, JSON.parse(JSON.stringify(localOriginal)));

// Verificar que valores customizados foram preservados
assert('nome preservado após merge', merged.nome === 'Meu Restaurante Teste');
assert('endereco preservado após merge', merged.endereco === 'Rua Exemplo, 123');
assert('telefone preservado após merge', merged.telefone === '11999999999');
assert('link_pedido_online preservado', merged.link_pedido_online === 'https://meu.link/teste');
assert('delivery_ativo preservado', merged.delivery_ativo === true);
assert('retirada_ativa preservado', merged.retirada_ativa === false);

// Verificar que campo NOVO foi adicionado (schema migration)
assert('consumo_local_ativo adicionado do template', merged.consumo_local_ativo === true);

// Verificar merge aninhado: politicas.encomenda_almoco_desde preservado
assert('politicas.encomenda_almoco_desde preservado', merged.politicas.encomenda_almoco_desde === '09:00');
// Verificar merge aninhado: politicas.encomenda_jantar_desde adicionado do template
assert('politicas.encomenda_jantar_desde adicionado', merged.politicas.encomenda_jantar_desde === '');

// Verificar merge aninhado: respostas_operacionais.delivery.texto preservado
assert('respostas_operacionais.delivery.texto preservado', merged.respostas_operacionais.delivery.texto === 'Fazemos sim!');
// Verificar merge aninhado: respostas_operacionais.retirada adicionado do template
assert('respostas_operacionais.retirada adicionado', merged.respostas_operacionais.retirada.texto === '');

// Verificar merge aninhado: palavras_chave.delivery.palavra NÃO foi sobrescrita (local tem ['delivery','entrega'], template tem ['delivery'])
assert('palavras_chave.delivery.palavra preservado', merged.palavras_chave.delivery.palavra.length === 2);

// Simular: config.json com valores customizados
var configOriginal = {
  nome_negocio: "Restaurante Teste",
  endereco: "Av Teste, 456",
  telefone: "11988888888",
  link_pedido_online: "https://pedido.teste.com",
  timezone: "America/Sao_Paulo",
  horarios: {
    segunda: { fechado: false, cozinha: [{ abertura: "11:00", fechamento: "23:00" }], agendamento: [{ abertura: "08:00", fechamento: "23:00" }] }
  },
  mensagens: {
    texto_fechado: "FECHADO HOJE",
    rodape_pedido_link: "📲 Peça aqui: {{link_pedido_online}}"
  }
};

var configTemplate = {
  nome_negocio: "Meu Negocio",
  endereco: "",
  telefone: "",
  link_pedido_online: "",
  timezone: "America/Sao_Paulo",
  horarios: {
    segunda: { fechado: false, cozinha: [{ abertura: "11:00", fechamento: "23:00" }], agendamento: [{ abertura: "08:00", fechamento: "23:00" }] }
  },
  mensagens: {
    chamada_rejeitada: "Não atendemos chamadas.",
    texto_fechado: "FECHADO"
  }
};

var mergedConfig = mergeSchema(configTemplate, JSON.parse(JSON.stringify(configOriginal)));

assert('config.nome_negocio preservado', mergedConfig.nome_negocio === 'Restaurante Teste');
assert('config.endereco preservado', mergedConfig.endereco === 'Av Teste, 456');
assert('config.telefone preservado', mergedConfig.telefone === '11988888888');
assert('config.link_pedido_online preservado', mergedConfig.link_pedido_online === 'https://pedido.teste.com');
assert('config.mensagens.texto_fechado preservado', mergedConfig.mensagens.texto_fechado === 'FECHADO HOJE');
assert('config.mensagens.chamada_rejeitada adicionado do template', mergedConfig.mensagens.chamada_rejeitada === 'Não atendemos chamadas.');
assert('config.mensagens.rodape_pedido_link preservado', mergedConfig.mensagens.rodape_pedido_link === '📲 Peça aqui: {{link_pedido_online}}');

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
