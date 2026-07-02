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

- `start-wabot.bat` → Inicia tudo e abre o navegador
- `stop-wabot.bat` → Para serviços Docker e Node.js

### Rodar automaticamente ao ligar o PC

1. Abra o **Agendador de Tarefas** do Windows
2. Clique em "Criar tarefa básica..."
3. Nome: `WaBot`, acionador: "Ao iniciar o computador"
4. Ação: "Iniciar um programa", programa: `start-wabot.bat`
5. Marque "Executar com privilégios mais altos"
6. Pronto — toda vez que ligar o PC, o WaBot sobe sozinho

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
