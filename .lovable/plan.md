

# Plano: PWA icon, sidebar icons, QR persistência, galeria

## 1. PWA icon da capivara
O PWA já está configurado em `vite.config.ts` com `logo.png` como ícone. O `index.html` já tem `<link rel="icon" href="/logo.png">` e `<link rel="apple-touch-icon" href="/logo.png">`. O ícone já deve funcionar. Vou adicionar `navigateFallbackDenylist` para `/~oauth` conforme guidelines e garantir que o manifest esteja correto.

## 2. Ícones do sidebar ao minimizar
O problema: quando collapsed, o sidebar mostra `w-14` mas os ícones dentro dos NavLinks têm padding `p-3` e container `w-10 h-10` — o texto é escondido com `{!collapsed && ...}` mas o layout do NavLink com `gap-3` e `p-3` pode causar overflow. Vou ajustar para que no modo collapsed os ícones fiquem centralizados corretamente, removendo padding extra e ajustando o layout.

**Arquivo:** `src/components/AppSidebar.tsx`
- Quando collapsed: NavLink com `p-2 justify-center` (sem gap), apenas o ícone visível
- Quando expanded: manter layout atual

## 3. QR Codes persistentes + imagens temporárias no localStorage
Atualmente tudo usa `sessionStorage` (apaga ao fechar). O pedido:
- **QR Codes**: persistir entre sessões (usar `localStorage`)
- **Imagens (generate, edit, upscale, remove-bg)**: usar `localStorage` também, mas como armazenamento local do dispositivo

**Solução**: Mudar `sessionHistory.ts` de `sessionStorage` para `localStorage`. Isso resolve ambos os casos — dados ficam no dispositivo do usuário permanentemente até ele excluir manualmente na galeria. Cada dispositivo terá seus próprios dados.

**Arquivo:** `src/lib/sessionHistory.ts`
- Trocar `sessionStorage` → `localStorage` em `getHistory()` e `saveHistory()`
- Trocar `sessionStorage.removeItem` → `localStorage.removeItem` em `clearHistory()`

## 4. Filtro QR Code na galeria
Já existe o filtro "QR Code" em `GalleryPage.tsx` (linha 24). Já implementado.

## Resumo de arquivos a editar
1. `vite.config.ts` — adicionar `navigateFallbackDenylist`
2. `src/components/AppSidebar.tsx` — corrigir ícones no modo collapsed
3. `src/lib/sessionHistory.ts` — trocar `sessionStorage` → `localStorage`

