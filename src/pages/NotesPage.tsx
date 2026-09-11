import { FormEvent, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, NotebookPen, Plus, Save, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const STORAGE_KEY = "capivara-notes";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Note[]) : [];
  } catch {
    return [];
  }
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => loadNotes()[0]?.id ?? null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const selectedNote = notes.find((note) => note.id === selectedNoteId);
    setTitle(selectedNote?.title ?? "");
    setContent(selectedNote?.content ?? "");
  }, [notes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return notes;
    return notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase().includes(query));
  }, [notes, search]);

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setTitle("");
    setContent("");
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const noteTitle = title.trim() || "Sem título";
    const now = new Date().toISOString();

    if (selectedNoteId) {
      setNotes((currentNotes) => currentNotes.map((note) => (
        note.id === selectedNoteId ? { ...note, title: noteTitle, content, updatedAt: now } : note
      )));
    } else {
      const newNote: Note = { id: createId(), title: noteTitle, content, updatedAt: now };
      setNotes((currentNotes) => [newNote, ...currentNotes]);
      setSelectedNoteId(newNote.id);
    }
  };

  const handleDelete = () => {
    if (!selectedNoteId) return;

    const currentIndex = notes.findIndex((note) => note.id === selectedNoteId);
    const remainingNotes = notes.filter((note) => note.id !== selectedNoteId);
    setNotes(remainingNotes);
    setSelectedNoteId(remainingNotes[Math.min(currentIndex, remainingNotes.length - 1)]?.id ?? null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
            <NotebookPen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="red-text text-3xl font-black tracking-tight">Bloco de notas</h1>
            <p className="text-sm text-muted-foreground">Anote ideias, listas e lembretes. Tudo salvo neste dispositivo.</p>
          </div>
        </div>
        <Button onClick={handleNewNote} className="gap-2 bg-red-600 text-white hover:bg-red-700">
          <Plus className="h-4 w-4" /> Nova nota
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="glass-card border-border/60 lg:h-[620px]">
          <CardHeader className="space-y-3 pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Minhas notas</span>
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600">{notes.length}</span>
            </CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar notas..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] space-y-2 overflow-y-auto pt-0 lg:max-h-[500px]">
            {filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs font-semibold text-muted-foreground">Nenhuma nota encontrada</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-all ${selectedNoteId === note.id ? "border-red-500/40 bg-red-500/10 shadow-sm" : "border-transparent hover:border-border hover:bg-secondary/60"}`}
                >
                  <p className="truncate text-sm font-bold text-foreground">{note.title || "Sem título"}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{note.content || "Nota vazia"}</p>
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground/80">
                    {format(parseISO(note.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60 lg:min-h-[620px]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">{selectedNoteId ? "Editar nota" : "Nova nota"}</CardTitle>
            {selectedNoteId && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} className="gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Excluir</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Título da nota"
                className="h-12 border-0 bg-transparent px-0 text-xl font-bold shadow-none focus-visible:ring-0"
              />
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Comece a escrever..."
                className="min-h-[390px] resize-y border-0 bg-transparent px-0 text-base leading-7 shadow-none focus-visible:ring-0"
              />
              <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {content.length.toLocaleString()} caracteres · {content ? content.trim().split(/\s+/).length : 0} palavras
                </p>
                <Button type="submit" className="gap-2 bg-red-600 text-white hover:bg-red-700">
                  <Save className="h-4 w-4" /> Salvar nota
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
