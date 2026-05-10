import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.85 3.4 14.66 2.4 12 2.4 6.97 2.4 2.9 6.47 2.9 11.5S6.97 20.6 12 20.6c6.92 0 9.5-4.86 9.5-7.36 0-.49-.05-.86-.12-1.24H12z"
      />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M16.37 12.84c.02 2.55 2.25 3.4 2.27 3.4-.02.06-.36 1.22-1.18 2.42-.71 1.04-1.45 2.07-2.62 2.09-1.14.02-1.51-.67-2.82-.67s-1.71.65-2.79.7c-1.13.04-1.99-1.12-2.71-2.16-1.47-2.13-2.6-6.02-1.08-8.65.75-1.31 2.09-2.13 3.55-2.16 1.1-.02 2.13.74 2.81.74.67 0 1.93-.92 3.25-.78.55.02 2.1.22 3.1 1.69-.08.05-1.85 1.08-1.83 3.22zM14.4 5.62c.6-.74 1.02-1.76.9-2.78-.87.04-1.93.58-2.56 1.31-.55.65-1.04 1.69-.91 2.69.97.07 1.96-.5 2.57-1.22z" />
    </svg>
  );
}

export function SsoButtons({ mode = "login" }: { mode?: "login" | "register" }) {
  const verb = mode === "login" ? "Continuar" : "Registrarme";
  const handle = (provider: string) =>
    toast.info(`${provider} estará disponible al activar Lovable Cloud`, {
      description: "Por ahora puedes usar email y contraseña.",
    });
  return (
    <div className="grid grid-cols-1 gap-2.5">
      <Button
        variant="outline"
        type="button"
        onClick={() => handle("Google")}
        className="w-full gap-2.5 justify-center py-6"
      >
        <GoogleIcon /> {verb} con Google
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={() => handle("Microsoft")}
        className="w-full gap-2.5 justify-center py-6"
      >
        <MicrosoftIcon /> {verb} con Microsoft
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={() => handle("Apple")}
        className="w-full gap-2.5 justify-center py-6"
      >
        <AppleIcon /> {verb} con Apple
      </Button>
    </div>
  );
}

export function OrSeparator({ children = "o continúa con email" }: { children?: React.ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
