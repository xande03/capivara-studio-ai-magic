import { FormEvent, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock3, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  notes: string;
}

const STORAGE_KEY = "capivara-calendar-events";
const categories = ["Pessoal", "Trabalho", "Estudo", "Importante"];

function loadEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CalendarEvent[]) : [];
  } catch {
    return [];
  }
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [category, setCategory] = useState(categories[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const eventDates = useMemo(() => events.map((event) => parseISO(event.date)), [events]);
  const selectedEvents = useMemo(
    () => events.filter((event) => event.date === selectedDateKey).sort((a, b) => a.time.localeCompare(b.time)),
    [events, selectedDateKey],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setEvents((currentEvents) => [
      ...currentEvents,
      {
        id: createId(),
        title: trimmedTitle,
        date: selectedDateKey,
        time,
        category,
        notes: notes.trim(),
      },
    ]);
    setTitle("");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="red-text text-3xl font-black tracking-tight">Calendário</h1>
            <p className="text-sm text-muted-foreground">Organize compromissos, tarefas e lembretes em um só lugar.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <Card className="glass-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sua agenda</CardTitle>
            <CardDescription>Escolha um dia para ver ou adicionar eventos.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <DateCalendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: "calendar-event-day" }}
              className="rounded-2xl border border-border/50 bg-background/45"
            />
            <div className="w-full rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Dia selecionado</p>
              <p className="mt-1 text-lg font-bold capitalize text-foreground">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedEvents.length === 0 ? "Nenhum evento agendado" : `${selectedEvents.length} evento${selectedEvents.length > 1 ? "s" : ""} agendado${selectedEvents.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-red-600" />
              Novo evento
            </CardTitle>
            <CardDescription>Adicione um compromisso para {format(selectedDate, "dd/MM/yyyy")}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="event-title" className="text-sm font-semibold">Título</label>
                <Input
                  id="event-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Reunião com a equipe"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="event-time" className="text-sm font-semibold">Horário</label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="event-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="event-category" className="text-sm font-semibold">Categoria</label>
                  <select
                    id="event-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="event-notes" className="text-sm font-semibold">Observações</label>
                <Textarea
                  id="event-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Inclua endereço, links ou detalhes importantes..."
                  className="min-h-28 resize-y"
                />
              </div>

              <Button type="submit" className="w-full gap-2 bg-red-600 text-white hover:bg-red-700">
                <Plus className="h-4 w-4" /> Adicionar ao calendário
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-red-600" />
            Eventos do dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 px-5 py-10 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-semibold text-foreground">Sua agenda está livre neste dia</p>
              <p className="mt-1 text-xs text-muted-foreground">Use o formulário acima para adicionar um novo evento.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="group rounded-2xl border border-border/60 bg-background/45 p-4 transition-colors hover:border-red-500/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">{event.category}</span>
                      <h3 className="mt-2 truncate font-bold text-foreground">{event.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      aria-label={`Excluir evento ${event.title}`}
                      className="rounded-lg p-2 text-muted-foreground opacity-70 transition-colors hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-red-600" /> {event.time}
                  </p>
                  {event.notes && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
