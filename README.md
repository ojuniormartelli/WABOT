# WaBot — WhatsApp Bot com IA

Bot de WhatsApp com inteligência artificial (Groq/Llama ou Gemini) para atendimento automatizado.
Tudo roda 100% local no seu computador — **sem custos mensais** (Groq free tier).

## Arquitetura

```
WaBot/
├── app/
│   ├── server.js              # Backend Express (API + webhook + IA)
│   ├── package.json
│   ├── docker/
│   │   ├── docker-compose.yml # Evolution API + PostgreSQL
│   │   └── manager.js         # Gerenciamento Docker (pelo frontend)
│   ├── renderer/
│   │   ├── index.html         # Frontend SPA
│   │   ├── app.js             # ~1800 linhas de UI
│   │   ├── api.js             # Cliente HTTP
│   │   └── style.css
│   ├── data/
│   │   ├── config.json        # Dados do negócio (c/ site e redes sociais)
│   │   ├── regras.json        # Regras customizadas (linguagem natural)
│   │   ├── credentials.json   # Chaves de API
│   │   ├── ignorados.json     # Números ignorados
│   │   └── conversas.json     # Cache de conversas
│   └── workflows-n8n/        # Workflows n8n para importar
├── package.json
├── setup-wabot.bat            # Configurador automático (Windows)
├── start-wabot.bat            # Início rápido diário
├── stop-wabot.bat             # Para os serviços
└── README.md
```

## Como Funciona

1. **WhatsApp** → Cliente envia mensagem
2. **Evolution API** (Docker) → Recebe a mensagem via webhook
3. **Express** → Processa a mensagem
4. **IA (Groq ou Gemini)** → Lê as regras + informações do negócio e gera resposta personalizada
5. **Fallback local** → Se a IA falhar, busca palavras-chave nas regras
6. **Resposta** → Enviada de volta via Evolution API

## Fluxo de Resposta

Quando o cliente pergunta algo, a IA recebe:
- **Informações do negócio** (nome, endereço, telefone, site, redes sociais, link de pedido)
- **Regras ativas** (instruções em linguagem natural cadastradas no dashboard)
- A mensagem do cliente

Ordem de prioridade:
1. **IA (Groq/Gemini)** → Resposta inteligente e personalizada
2. **Regra local** → Casamento por palavras-chave nas regras cadastradas
3. **Saudação** → Se for "oi", "olá", etc.
4. **Mensagem genérica** → Fallback final "Vou verificar com um atendente humano"

## Provedores de IA Suportados

| Provedor | Modelo padrão | Custo | Limites free tier |
|---|---|---|---|
| **Groq** (recomendado) | `llama-3.3-70b-versatile` | Grátis | 30 req/min, 6000 req/dia |
| **Gemini** | `gemini-2.0-flash-lite` | Pago | Google removeu free tier |

## Como Rodar

### Windows (recomendado)

1. **Instale o Docker Desktop** → https://www.docker.com/products/docker-desktop/
2. **Extraia o ZIP** do WaBot
3. **Execute** `setup-wabot.bat` como Administrador

O script vai:
- Verificar arquivos necessários
- Verificar/iniciar o Docker
- Instalar dependências Node.js
- Iniciar a Evolution API (Docker)
- Iniciar o WaBot (Node.js direto)
- Abrir o navegador em http://localhost:3001

### Uso diário

- `start-wabot.bat` → Inicia tudo e abre o navegador. A janela do CMD **se fecha automaticamente** após o início. O bot continua rodando em segundo plano.
- `stop-wabot.bat` → Para serviços Docker e Node.js

### Rodar automaticamente ao ligar o PC

1. Abra o **Agendador de Tarefas** do Windows
2. Clique em "Criar tarefa básica..."
3. Nome: `WaBot`, acionador: "Ao iniciar o computador"
4. Ação: "Iniciar um programa", programa: `start-wabot.bat`
5. Marque "Executar com privilégios mais altos"
6. Pronto — toda vez que ligar o PC, o WaBot sobe sozinho. A janela do CMD abre brevemente e **fecha automaticamente** — o bot fica rodando em segundo plano sem nenhuma janela visível.

### Manual (qualquer OS)

```bash
cd WaBot
npm install
npm start
```

Depois acesse http://localhost:3001.

## Como Configurar

1. **Credenciais** → Escolher provedor (Groq ou Gemini) e colocar API Key
   - Groq: criar chave grátis em https://console.groq.com
   - Gemini: criar chave em https://aistudio.google.com
2. **Dados** → Preencher informações do negócio (endereço, telefone, horários, etc.)
3. **WhatsApp** → Conectar via QR Code (botão em Credenciais)
4. **Regras** → Escrever instruções em linguagem natural para a IA
5. **Testar** → Botão "Testar Conexão" em Credenciais

## Páginas do Frontend

- **Dashboard** — Status do sistema (Docker, Evolution API, WhatsApp)
- **Conversas** — Chat com clientes (lista atualiza a cada 5s)
- **Configurações** — Dados do negócio, horários, mensagens padrão
- **Regras** — Instruções para a IA (linguagem natural)
- **Credenciais** — Provedor IA, chaves, conexão WhatsApp
- **Ignorados** — Números que o bot não deve atender

## Tecnologias

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JS + Tailwind CSS
- **WhatsApp:** Evolution API v2.3.7 (Baileys) via Docker
- **IA:** Groq (Llama 3.3 70B) ou Google Gemini
- **Banco:** PostgreSQL (para Evolution API)
- **Infra:** Docker + WSL2

## Troubleshooting

### Evolution API não gera QR Code

- Atualize a imagem: `image: evoapicloud/evolution-api:v2.3.7`
- Limpe volumes: `docker compose down -v` e `up -d`

### IA não responde (cai no fallback)

1. Vá em **Credenciais** e clique **"Testar Conexão"**
2. Se der erro, verifique a chave e o provedor selecionado
3. Groq: chave começa com `gsk_`
4. Gemini: Google removeu free tier, precisa de conta paga

### Evolution API reinicia toda hora

Verifique se o PostgreSQL está saudável:
```bash
docker logs wabot-postgres
```

### Ver logs do container Evolution API

```bash
docker logs wabot-evolution --tail 50
```

### Porta 3001 ou 8081 já em uso

Feche outros programas ou mude as portas no `docker-compose.yml` e no `server.js`.

### Docker não encontrado

Certifique-se de que:
- Docker Desktop está instalado e rodando (ícone na bandeja do sistema)
- "Add to PATH" foi marcado na instalação
- Ou execute o `setup-wabot.bat` como Administrador

## Deploy & Manutenção

### Arquitetura de diretórios

```
WaBot/
├── app/
│   ├── server.js              # Código do servidor (runtime)
│   ├── test_regressao.js      # Testes de regressão
│   ├── data/                  # ⚠️ Dados do negócio (NÃO versionados)
│   │   ├── config.json        # Configurações, horários, templates
│   │   ├── dados_negocio.json # Palavras-chave e políticas de intenção
│   │   ├── credentials.json   # Chaves de API (gitignored)
│   │   └── ...                # Conversas, regras, aprendizados
│   └── renderer/              # Frontend (admin panel)
├── scripts/
│   ├── install.sh             # Instalação limpa do zero
│   ├── update.sh              # Atualização segura (backup + testes + restart)
│   └── rollback.sh            # Rollback rápido para versão anterior
├── backups/                   # Backups automáticos (gitignored)
├── atualizar.js               # Atualizador autônomo v2 (sem git)
├── start.sh / stop.sh         # Iniciar/parar o servidor
└── package.json
```

Três camadas bem separadas:
- **Código do servidor**: `app/server.js` + `app/renderer/`
- **Configuração e dados**: `app/data/*.json`
- **Scripts de instalação/atualização**: `scripts/`, `atualizar.js`, `*.sh`

### Instalação do zero (máquina nova)

```bash
# 1. Clonar o repositório
git clone https://github.com/ojuniormartelli/WABOT.git
cd WABOT

# 2. Instalar (cria dados padrão, npm install, valida JSON, testes)
bash scripts/install.sh

# 3. Configurar credenciais
#    Edite app/data/credentials.json com suas chaves de API
#    Ou acesse http://localhost:3001 após iniciar

# 4. Iniciar
bash start.sh
```

### Atualização segura (backup + testes + restart)

```bash
# Via script bash (recomendado — faz backup, valida, testa e só reinicia se OK)
bash scripts/update.sh

# Via npm (atalho para o mesmo script)
npm run update

# Via atualizador autônomo (sem git)
node atualizar.js
```

O que o `scripts/update.sh` faz:
1. Verifica o repositório git e salva o commit atual
2. **Faz backup** de todos os arquivos `app/data/*.json` em `backups/YYYY-MM-DD_HH-MM-SS/`
3. Executa `git pull origin main`
4. Roda `npm install` se necessário
5. **Valida** se todos os JSON de dados ainda são parseáveis
6. **Roda os testes de regressão** (`node app/test_regressao.js`)
7. **Só reinicia o servidor** se testes passarem
8. Aguarda o servidor ficar online

Se os testes falharem:
- O script **não reinicia** o servidor
- Restaura automaticamente os dados do backup
- Exibe instruções de diagnóstico

### Rollback rápido

```bash
# Listar commits disponíveis
bash scripts/rollback.sh

# Voltar para um commit específico
bash scripts/rollback.sh <sha-do-commit>

# Voltar 1 commit
bash scripts/rollback.sh HEAD~1
```

O rollback:
1. Faz backup de segurança dos dados atuais
2. Volta `app/server.js` e `app/test_regressao.js` para o commit alvo
3. Restaura os dados do backup mais recente
4. Valida JSON e roda testes
5. Só reinicia se tudo OK

### Segurança dos arquivos de dados

- **`writeJson`** agora escreve em arquivo `.tmp` e depois renomeia (escrita atômica) — evita corrupção se o processo morrer no meio
- **`POST /api/config/:filename`** valida o schema antes de salvar:
  - `config.json`: exige `nome_negocio` (string) e `horarios` (objeto)
  - `dados_negocio.json`: exige `nome` (string) e `palavras_chave` (objeto)
  - `credentials.json`: exige `evolution.api_key`
- **`readJson`** agora loga o erro com nome do arquivo e mensagem — nunca mais silencioso
- **`FILES_TO_UPDATE`** (server.js e atualizar.js) agora inclui `app/data/config.json`, `app/data/dados_negocio.json` e `app/data/credentials.example.json`

### Restaurar arquivo de dados corrompido

```bash
# Se um JSON de dados corromper (parse error):
# 1. Via git (restaura a versão do repositório)
git checkout -- app/data/config.json
git checkout -- app/data/dados_negocio.json

# 2. Via backup
cp backups/2026-07-05_12-00-00/config.json app/data/
cp backups/2026-07-05_12-00-00/dados_negocio.json app/data/

# 3. Depois de restaurar, valide e reinicie
node app/test_regressao.js
pkill -f "node app/server.js" && nohup node app/server.js > wabot.log 2>&1 &
```

### Observabilidade (logs)

O bot loga no arquivo `wabot.log` (mesmo diretório, criado pelo `nohup`):

```bash
# Ver último erro
tail -f wabot.log | grep -E "readJson|ERRO|erro|FALHA"

# Ver logs de debug do webhook
cat wabot.log | grep -E "readJson|webhook_debug"

# Ver todas as intenções detectadas
grep "intencao\]" wabot.log

# Ver erros de JSON
grep "readJson" wabot.log
```

Tags de log padronizadas:
- `[readJson]` — erro ao ler/parsear JSON
- `[webhook_debug]` — debug do fluxo de intenção operacional
- `[intencao]` — intenção detectada pelo matcher
- `[config]` — erro ao salvar config via admin panel
- `[update]` — eventos do update automático

### Testes de regressão

```bash
# Rodar manualmente
node app/test_regressao.js

# Via npm
npm test

# O que testa:
#   - Validação de todos os JSON de dados
#   - Detecção de todas as 8 intenções operacionais
#   - Prioridade delivery > pedido
#   - Respostas operacionais não nulas
#   - Lógica de saudação (isApenasSaudacao, detectarSaudacao)
#   - Detecção de agradecimento
#   - Simulação de conversa (5 passos)
```

## Changelog

### 2026-06-30 (final)

- `server.js`: adicionado `https` module — Gemini/LLM chamadas usam HTTPS (SSL required fix)
- `server.js`: `consultarGemini` retorna `null` em vez de string de erro hardcoded
- `server.js`: `buscarRegraLocal()` — fallback por palavras-chave nas regras quando IA falha
- `server.js`: webhook extrai mais tipos de mensagem (`imageMessage.caption`, `videoMessage.caption`, `listResponseMessage`, `buttonsResponseMessage`)
- `server.js`: adicionado provedor **Groq** (`consultarGroq`) com suporte a Llama 3.3 70B
- `server.js`: API Gemini alterada de `v1beta` para `v1`
- `server.js`: modelo padrão alterado para `gemini-2.0-flash-lite`
- `server.js`: novo endpoint `/api/llm/test` (testa conexão com provedor configurado)
- `server.js`: logs de erro detalhados quando Gemini/Groq retornam vazio
- `renderer/app.js`: polling de conversas a cada 5s (atualização automática)
- `renderer/app.js`: seletor de provedor IA (Groq/Gemini) na página Credenciais
- `renderer/app.js`: botão "Testar Conexão" com resultado visível no dashboard
- `renderer/app.js`: modelos atualizados com indicação de free tier vs pago
- `docker-compose.yml`: imagem atualizada para `evoapicloud/evolution-api:v2.3.7`
- `docker-compose.yml`: adicionado `CHROME_ARGS` e `shm_size: 256m`
- `setup-wabot.bat`: `docker compose down -v` antes de `up -d` (limpa volumes)
- `start-wabot.bat`: browser abre automaticamente, mensagem "fechar janela não afeta"
- `WaBot-Windows-Ready.zip`: ZIP de distribuição atualizado com todas as alterações

### 2026-06-29 (tarde)

- `docker-compose.yml`: removido `DATABASE_ENABLED=true` + `DATABASE_PROVIDER=sqlite`
- `docker-compose.yml`: adicionado PostgreSQL (Evolution API v2.3.7 requer)
- `server.js`: webhook Evolution URL usa `host.docker.internal`
- `server.js`: timeout de 8s no endpoint `/api/evolution/status`
- `app.js`: mensagens de erro mostram texto real
- `setup-wabot.bat`: wait loop mais eficiente, verifica container "Up"
- `start-wabot.bat`: novo — script de início rápido para uso diário
- `stop-wabot.bat`: novo — para os serviços

### 2026-06-29 (manhã)

- Estrutura inicial do projeto
- Docker Compose com Evolution API + webot
- Frontend com dashboard, conversas, configurações, regras
- Integração com Gemini
- Scripts batch para Windows
