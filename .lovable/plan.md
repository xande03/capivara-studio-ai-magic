

## Plano de Implementacao

### 1. Remover ferramenta "Gerar Video"

**Arquivos afetados:**
- `src/App.tsx` — Remover import do `VideoPage` e a rota `/video`
- `src/components/AppSidebar.tsx` — Remover item "Gerar Video" do array `tools`
- `src/pages/VideoPage.tsx` — Deletar arquivo (ou deixar sem referencia)

### 2. Garantir que a edicao de imagens funcione corretamente

A edge function `image-process` ja tem a logica de `edit` implementada corretamente (linhas 75-95), suportando:
- Uma imagem principal + prompt para adicionar/remover elementos
- Duas imagens combinadas via prompt

O prompt na edge function sera melhorado para ser mais explicito sobre edicoes de adicao e remocao:

**Arquivo:** `supabase/functions/image-process/index.ts` — Melhorar o prompt do action `edit` para:
- Instruir explicitamente que o modelo deve adicionar ou remover elementos conforme solicitado
- Manter a imagem original intacta exceto pelas alteracoes pedidas
- Quando houver segunda imagem, instruir a combinar elementos de ambas

### 3. Melhorar o visual conforme a imagem de referencia

A imagem mostra um layout mais polido com:
- **Sidebar** com subtitulos descritivos sob cada item do menu (ex: "Aumentar resolucao com IA", "Criar imagens com IA", "Modificar e combinar imagens")
- **Label "STUDIO PRO"** sob o nome Capivara
- **Badge "Online"** no header (canto superior direito, verde)
- **Badge "Powered by AI"** no rodape da sidebar
- **Secoes de conteudo** com titulos "Imagem Original" e "Resultado" em cards separados com bordas mais definidas
- **Area de resultado** com padrao xadrez (transparencia) quando vazio
- **Upload area** mais limpa com icone e texto "Arraste ou clique para upload / PNG, JPG ate 10MB"

**Arquivos afetados:**

**`src/components/AppSidebar.tsx`:**
- Adicionar subtitulos descritivos a cada item do menu
- Trocar "AI Image Suite" por "STUDIO PRO"
- Adicionar badge "Powered by AI" no rodape da sidebar
- Renomear grupo "Biblioteca" para "VISUALIZACAO"

**`src/components/Layout.tsx`:**
- Adicionar badge "Online" verde no canto superior direito do header

**`src/components/ImageUploader.tsx`:**
- Melhorar textos: "Arraste ou clique para upload" e "PNG, JPG ate 10MB"

**Paginas de ferramentas (Upscale, Edit, RemoveBg, Generate):**
- Envolver areas de upload e resultado em cards com titulos "Imagem Original" e "Resultado"
- Area de resultado vazia com padrao xadrez (checkered) para indicar transparencia
- Layout mais organizado com cards glass-card

**`src/index.css`:**
- Adicionar classe CSS para padrao xadrez (checkered pattern) na area de resultado vazio
- Ajustar `.glass-card` para suportar melhor o tema claro

### Detalhes Tecnicos

**Padrao xadrez CSS:**
```css
.checkerboard {
  background-image: 
    linear-gradient(45deg, #808080 25%, transparent 25%),
    linear-gradient(-45deg, #808080 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #808080 75%),
    linear-gradient(-45deg, transparent 75%, #808080 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
```

**Subtitulos no menu:** Cada item tera um `description` adicional renderizado como texto menor abaixo do titulo.

**Edge function edit prompt:** Sera atualizado para instrucoes mais claras sobre adicao/remocao de elementos, garantindo que o modelo entenda exatamente o que preservar e o que alterar.

