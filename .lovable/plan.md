

# Plano de Correções: Temas, QR Code Permanente, Music DNA

## 1. Corrigir títulos encobertos no modo escuro

O problema está na classe `.emerald-text` em `src/index.css`. No modo escuro, o gradiente de texto com `-webkit-background-clip: text` funciona, mas no modo claro o gradiente usa cores muito escuras que se confundem com backgrounds. Além disso, a classe `emerald-gradient` / `blue-gradient` aplicada em botões tem `shadow-lg shadow-emerald-500/20` que pode criar barras visuais sobre texto.

**Arquivos afetados:**
- `src/index.css` — Ajustar `.emerald-text` para ter contraste adequado em ambos os temas; revisar `.glass-card` para modo claro
- `src/pages/Index.tsx` — Título "Capivara Stúdio" usa `emerald-text`, garantir visibilidade
- `src/pages/GalleryPage.tsx` — Título usa `emerald-text`
- `src/pages/QrCodePage.tsx` — Título usa `emerald-text`, cards usam `border-white/5` e `bg-black/40` (ilegíveis no modo claro)
- `src/components/AppSidebar.tsx` — `emerald-text` no nome, `hover:bg-white/5` não funciona no claro
- `src/components/Layout.tsx` — Header com `border-white/5` invisível no claro

**Correções específicas:**
- `.emerald-text` no modo claro: usar cores mais vibrantes/escuras que contrastem com fundo branco
- `.glass-card` no modo claro: usar `bg-white/80` com `border` visível em vez de `border-white/5`
- Substituir todas as referências `border-white/5`, `bg-white/5`, `bg-black/40` por variantes que funcionem em ambos os temas usando classes condicionais `dark:`
- `blue-gradient` nos botões: garantir que o texto fique visível

## 2. QR Codes permanentes via Lovable Cloud Storage

Atualmente os arquivos são enviados para `tmpfiles.org` (temporário). Para links permanentes e acessíveis:

**Etapas:**
- Criar um bucket público `qr-files` no Lovable Cloud Storage via migração SQL
- Atualizar `src/pages/QrCodePage.tsx` para fazer upload via `supabase.storage` ao invés de `tmpfiles.org`
- O QR Code apontará para a URL pública permanente do arquivo no storage
- Links/textos continuam funcionando diretamente sem upload

**Migração SQL:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-files', 'qr-files', true);
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'qr-files');
CREATE POLICY "Allow anon upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qr-files');
```

## 3. Music DNA — Correções de tema e funcionalidade

**Problema atual:** `src/lib/musicApi.ts` usa heurísticas locais fake (seed-based) ao invés da edge function `music-dna` que usa Firecrawl + Gemini. A função `analyzeMusicLink` não chama a edge function.

**Correções:**
- `src/lib/musicApi.ts` — Reescrever para chamar a edge function `music-dna` via `supabase.functions.invoke` como fallback principal, mantendo OEmbed apenas como fallback secundário
- `src/pages/MusicDnaPage.tsx` — Corrigir classes hardcoded `dark:bg-[#0a0a0c]`, `dark:bg-[#121215]`, `dark:bg-[#0c0c0e]`, `dark:bg-zinc-*` para usar variáveis do tema (`bg-card`, `bg-secondary`, etc.)
- Garantir que badges de gênero, BPM e tom tenham texto legível no modo claro (trocar `text-purple-400` → `text-purple-600 dark:text-purple-400`)
- Reforçar o botão de download MP3 para abrir `yout.com` de forma mais clara com label explícito

## 4. Revisão global de tema claro/escuro

**Páginas a revisar e corrigir:**

- `src/pages/UpscalePage.tsx` — `blue-gradient` no botão pode ter texto ilegível; `border-white/5` invisível no claro
- `src/pages/GeneratePage.tsx` — Mesmos problemas
- `src/pages/EditPage.tsx` — Mesmos problemas  
- `src/pages/RemoveBgPage.tsx` — Mesmos problemas
- `src/pages/QrCodePage.tsx` — `bg-black/40` nos tabs, `border-white/5` nos cards, `bg-black/5` nos inputs — tudo precisa de variantes `dark:`
- `src/pages/GalleryPage.tsx` — `bg-card/30`, `border-white/5` nos filtros
- `src/components/AppSidebar.tsx` — `hover:bg-white/5`, `border-white/5`

**Padrão de correção:**
- `border-white/5` → `border-border`
- `bg-white/5` → `bg-secondary/50`
- `bg-black/40` → `bg-secondary dark:bg-secondary`
- `hover:bg-white/5` → `hover:bg-secondary/50`
- Textos com cor fixa → usar `text-foreground` / `text-muted-foreground`

## Detalhes Técnicos

**Storage upload no QR Code:**
```typescript
const { data, error } = await supabase.storage
  .from('qr-files')
  .upload(`${Date.now()}-${file.name}`, file, { upsert: false });
const publicUrl = supabase.storage.from('qr-files').getPublicUrl(data.path).data.publicUrl;
setQrValue(publicUrl);
```

**Music API reescrita:**
```typescript
export async function analyzeMusicLink(url: string) {
  const { data, error } = await supabase.functions.invoke("music-dna", { body: { url } });
  if (error) return { error: error.message };
  return { data: data.data };
}
```

