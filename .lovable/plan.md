
## Plano de Implementacao

### 1. Aumentar icones do menu lateral
Alterar os icones da sidebar de `h-4 w-4` para `h-5 w-5` para maior destaque visual.

**Arquivo:** `src/components/AppSidebar.tsx`
- Linha 73: `h-4 w-4` -> `h-5 w-5`
- Linha 98: `h-4 w-4` -> `h-5 w-5`

---

### 2. VideoPage com input de prompt e seletor de modelo
Transformar a pagina de video de um placeholder estatico para uma ferramenta funcional com:
- Campo de texto (textarea) para o usuario descrever o video desejado
- Seletor de modelo LLM com botoes de alternancia (similar ao ModelSelector existente, mas com modelos de video)
- Botao "Gerar Video" (ainda como placeholder, sem backend real por enquanto)

**Arquivo:** `src/pages/VideoPage.tsx` - reescrever com:
- Textarea para prompt
- Seletor com opcoes de modelos (ex: "SeedReam", "Veo", "Outro")
- Estado local para prompt e modelo selecionado
- Botao de geracao (mostrando toast de "em desenvolvimento" ao clicar)

---

### 3. Botao de alternancia tema claro/escuro
Adicionar toggle de tema no header do layout.

**Arquivos envolvidos:**

- `src/index.css` - Adicionar variantes de tema claro (`:root` com classe `.light` ou usar a abordagem de `next-themes` que ja esta instalado)
- `src/components/Layout.tsx` - Adicionar botao Sun/Moon no header
- `src/App.tsx` - Envolver com `ThemeProvider` do `next-themes`

Definir cores claras coerentes com a identidade dourada do Capivara Studio:
- Background claro: branco/cinza claro
- Foreground: cinza escuro
- Primary: manter o dourado
- Cards: branco com bordas suaves

### Detalhes Tecnicos

**Tema claro (CSS):** Adicionar bloco `.light` em `index.css` com variaveis HSL claras, e ajustar `.glass-card` para funcionar em ambos os temas.

**ThemeProvider:** Usar `next-themes` (ja instalado) com `attribute="class"` e `defaultTheme="dark"`.

**Toggle no header:** Icone Sun/Moon com `useTheme()` do next-themes para alternar.
