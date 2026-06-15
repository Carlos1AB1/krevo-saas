import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

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

export function SsoButtons({ mode = "login" }: { mode?: "login" | "register" }) {
  const verb = mode === "login" ? "Continuar" : "Registrarme";
  return (
    <div className="grid grid-cols-1 gap-2.5">
      <Button
        variant="outline"
        type="button"
        onClick={() => { window.location.href = `${API_BASE_URL}/auth/google`; }}
        className="w-full gap-2.5 justify-center py-6"
      >
        <GoogleIcon /> {verb} con Google
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
