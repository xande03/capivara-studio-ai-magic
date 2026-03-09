import { Button } from "@/components/ui/button";

export type VideoStyle =
  | "Realista"
  | "Cinematográfico"
  | "Anime"
  | "Pixar 3D"
  | "Cyberpunk"
  | "Fantasia"
  | "Câmera Lenta"
  | "Timelapse"
  | "Film Noir"
  | "Vintage"
  | "Onírico"
  | "Épico";

const styles: VideoStyle[] = [
  "Realista", "Cinematográfico", "Anime", "Pixar 3D", "Cyberpunk", "Fantasia",
  "Câmera Lenta", "Timelapse", "Film Noir", "Vintage", "Onírico", "Épico"
];

interface Props {
  value: VideoStyle;
  onChange: (v: VideoStyle) => void;
}

export function VideoStyleSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">Estilo Visual</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {styles.map((s) => (
          <Button
            key={s}
            type="button"
            variant={value === s ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(s)}
            className={value === s ? "bg-fuchsia-600 text-white hover:bg-fuchsia-700" : ""}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
