export interface HistoryItem {
  id: string;
  tool: string;
  prompt: string;
  inputImage?: string;
  outputImage: string;
  model: string;
  timestamp: number;
}

const STORAGE_KEY = "capivara-studio-history";

function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToHistory(item: Omit<HistoryItem, "id" | "timestamp">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const history = getHistory();
  history.unshift(newItem);
  saveHistory(history);
  return newItem;
}

export function getToolHistory(tool: string): HistoryItem[] {
  return getHistory().filter((i) => i.tool === tool);
}

export function getAllHistory(): HistoryItem[] {
  return getHistory();
}

export function removeFromHistory(id: string) {
  const history = getHistory().filter((item) => item.id !== id);
  saveHistory(history);
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
