

# Music DNA - Plano de Implementacao

## Visao Geral

Nova ferramenta "Music DNA" que recebe um link de musica (YouTube, Spotify, etc.), usa Firecrawl para extrair dados da pagina e IA para analisar a musica, apresentando os resultados em uma interface rica com download em PDF e MP3.

## Arquitetura

```text
[Usuario cola link] → [Frontend] → [Edge Function: music-dna]
                                         │
                                    ┌────┴────┐
                                    │Firecrawl │ → Scrape da pagina do link
                                    └────┬────┘
                                         │ conteudo extraido
                                    ┌────┴─────────┐
                                    │ Gemini 2.5    │ → Analise com tool calling
                                    │ Flash         │   para dados estruturados
                                    └────┬─────────┘
                                         │
                              { title, artist, band, genre,
                                bpm, key, lyrics, albumArt }
                                         │
                                    [Frontend exibe resultados]
                                    [Gera PDF no cliente com jspdf]
                                    [Busca MP3 via API externa]
```

## Pre-requisito: Conectar Firecrawl

O Firecrawl ainda nao esta conectado ao projeto. Sera necessario conectar o conector Firecrawl antes de implementar, para que a chave `FIRECRAWL_API_KEY` esteja disponivel nas edge functions.

## Etapas

### 1. Conectar Firecrawl
Usar o conector Firecrawl para configurar a chave de API automaticamente no projeto.

### 2. Instalar dependencia `jspdf`
Para geracao de PDF no cliente com as informacoes da musica.

### 3. Criar Edge Function `music-dna`

**Arquivo:** `supabase/functions/music-dna/index.ts`

Fluxo:
1. Recebe `{ url }` do frontend
2. Usa Firecrawl API para scrape da URL (extrai markdown da pagina)
3. Envia conteudo extraido para Lovable AI (`google/gemini-2.5-flash`) com tool calling para obter dados estruturados:
   - `title` (nome da musica)
   - `artist` (cantor/artista)
   - `band` (banda, se aplicavel)
   - `genre` (estilo musical)
   - `bpm` (batidas por minuto estimadas)
   - `key` (tom da musica)
   - `lyrics` (letra completa)
4. Retorna JSON estruturado ao frontend

Registrar em `supabase/config.toml` com `verify_jwt = false`.

### 4. Criar `src/lib/musicApi.ts`

Funcao `analyzeMusicLink(url: string)` que chama a edge function `music-dna` via `supabase.functions.invoke`.

### 5. Criar pagina `src/pages/MusicDnaPage.tsx`

Interface com:
- Campo de input para colar o link da musica (YouTube, Spotify, YouTube Music, etc.)
- Botao "Analisar Musica" com icone
- Estado de loading com animacao de pulso
- Card de resultado com layout rico:
  - Titulo e Artista/Banda em destaque
  - Badges visuais para BPM, Tom e Genero
  - Area scrollavel com a letra da musica (preview)
- Botao "Baixar PDF" — gera PDF no cliente usando `jspdf` com todas as informacoes formatadas
- Botao "Baixar MP3" — busca o audio via API de conversao (cobrafreevideodownloader ou servico similar gratuito); caso indisponivel, exibe mensagem informativa

### 6. Atualizar navegacao

**`src/components/AppSidebar.tsx`:**
- Adicionar item "Music DNA" ao array `tools` com icone `Music` do lucide-react
- Descricao: "Identificar musicas por link"
- Cor: `bg-purple-600` / `hover:text-purple-500`

**`src/App.tsx`:**
- Adicionar import de `MusicDnaPage` e rota `/music-dna`

## Detalhes Tecnicos

**Edge function - Tool calling para dados estruturados:**
O Gemini sera instruido a retornar um JSON estruturado com os campos necessarios. O prompt incluira o conteudo scrapeado da pagina e pedira para a IA completar com seu conhecimento proprio (especialmente BPM, tom e letra completa caso nao estejam na pagina).

**Download MP3:**
Sera implementado um mecanismo de busca de audio utilizando APIs publicas de conversao. O botao tera um estado de loading proprio e, caso a conversao falhe, exibira uma mensagem explicativa ao usuario.

**PDF com jspdf:**
O PDF contera: titulo, artista, banda, genero, BPM, tom, e a letra completa formatada. Sera gerado inteiramente no cliente sem necessidade de backend adicional.

