import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreditsBannerProps {
  visible: boolean;
  message?: string;
}

export function CreditsBanner({ visible, message }: CreditsBannerProps) {
  if (!visible) return null;

  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Créditos Insuficientes</AlertTitle>
      <AlertDescription className="text-sm">
        {message || "Os créditos do workspace foram esgotados. Ferramentas que dependem de IA estão temporariamente indisponíveis. Adicione créditos para continuar usando."}
      </AlertDescription>
    </Alert>
  );
}
