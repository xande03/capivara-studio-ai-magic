

# Plano: 3 novas funcionalidades

## 1. Ferramenta "Conversor de Documentos" (`/converter`)

**Funcionalidades:**
- **Imagem → PDF**: Usa `jsPDF` (já instalado) para converter JPEG/PNG em PDF com download
- **PDF → Word**: Upload de PDF, usa IA (Gemini via edge function) para extrair texto/estrutura, gera arquivo .docx para download usando a lib `docx` (a ser instalada)
- **Escanear documento**: Upload de imagem de documento, usa IA vision para OCR/transcrição do texto e imagens

**Fluxo UX**: O usuário escolhe a operação via tabs no mesmo painel → faz upload → edita/visualiza resultado inline → clica "Confirmar" → download automático no formato escolhido.

**Arquivos:**
- `src/pages/ConverterPage.tsx` — página principal com 3 tabs
- `supabase/functions/document-process/index.ts` — edge function para PDF→texto (OCR via Gemini vision) e scan
- Instalar pacote `docx` para gerar .docx no client-side

## 2. "Inserir Texto" no Editor de Imagem (`/edit`)

**Fluxo UX:**
1. Usuário faz upload da imagem
2. Clica em "Inserir Texto"
3. Imagem abre em um canvas interativo onde o usuário clica para posicionar o texto
4. Campo de input aparece para digitar o texto, com opções de cor, tamanho e fonte
5. Preview em tempo real do texto sobre a imagem (via canvas)
6. Clica "Confirmar" → canvas renderiza a imagem final com texto embutido
7. Resultado exibido como imagem processada com opção de download

**Implementação:** Tudo client-side usando Canvas API — sem necessidade de IA para isso. O texto é renderizado diretamente no canvas na posição exata que o usuário clicou.

**Arquivos:**
- `src/components/TextOverlayEditor.tsx` — componente canvas interativo para posicionar texto
- `src/pages/EditPage.tsx` — adicionar botão "Inserir Texto" e integrar o componente

## 3. Ferramenta "Chat IA" (`/chat`)

**Implementação com Puter.js** conforme solicitado:
- Carregar `<script src="https://js.puter.com/v2/">` dinamicamente
- Dois modelos disponíveis: Claude 3.7 Sonnet (`claude-3-7-sonnet`) e DeepSeek v3.2 (`deepseek/deepseek-v3.2`)
- Seletor de modelo no topo do chat
- Streaming de respostas token por token
- Interface de chat com histórico de mensagens, markdown rendering
- Histórico temporário (sessão)

**Arquivos:**
- `src/pages/ChatPage.tsx` — página de chat completa
- `src/lib/puterAi.ts` — wrapper para carregar Puter.js e chamar modelos

## Atualizações de navegação

**Todos os arquivos afetados:**
- `src/App.tsx` — rotas `/converter` e `/chat`
- `src/pages/Index.tsx` — cards das novas ferramentas
- `src/components/AppSidebar.tsx` — links no sidebar

## Pacotes a instalar
- `docx` — gerar arquivos .docx no client
- `file-saver` — salvar arquivos gerados
- `react-markdown` — renderizar markdown no chat
- `pdf-lib` — manipular PDFs client-side (ler páginas para enviar ao AI)

## Resumo de arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/ConverterPage.tsx` | Criar |
| `src/pages/ChatPage.tsx` | Criar |
| `src/components/TextOverlayEditor.tsx` | Criar |
| `src/lib/puterAi.ts` | Criar |
| `supabase/functions/document-process/index.ts` | Criar |
| `src/pages/EditPage.tsx` | Editar (adicionar "Inserir Texto") |
| `src/App.tsx` | Editar (novas rotas) |
| `src/pages/Index.tsx` | Editar (novos cards) |
| `src/components/AppSidebar.tsx` | Editar (novos links) |
| `package.json` | Editar (novos pacotes) |

