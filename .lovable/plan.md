

# Fix: PDF text extraction returning "about:blank"

## Root Cause

The current approach sends raw PDF base64 data as a **text message** to the AI model. The model cannot actually parse binary PDF content from a text string — it sees gibberish and returns "about:blank" with empty table placeholders.

## Solution

Extract text from the PDF **client-side** using `pdfjs-dist` (already installed in the project) instead of relying on the AI to decode raw base64. This is far more reliable.

### Changes to `src/pages/SummarizerPage.tsx`

Replace the PDF upload handler:
1. Use `pdfjs-dist` to load the PDF from the ArrayBuffer
2. Iterate through all pages, calling `page.getTextContent()`
3. Concatenate all text items into a single string with proper line breaks
4. Set the extracted text directly into the textarea — no edge function call needed for extraction

This removes the dependency on `document-process` for PDF text extraction in the summarizer, making it faster and more accurate.

### Technical detail

```typescript
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// In handleFileUpload for PDF:
const arrayBuffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
let fullText = "";
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const pageText = content.items.map(item => item.str).join(" ");
  fullText += pageText + "\n\n";
}
setText(fullText);
```

### Files

| File | Action |
|---|---|
| `src/pages/SummarizerPage.tsx` | Edit — replace PDF handler with pdfjs-dist client-side extraction |

