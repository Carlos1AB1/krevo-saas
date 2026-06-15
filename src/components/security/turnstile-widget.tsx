import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;
type TurnstileStatus = "idle" | "loading" | "ready" | "error";

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  action: "contact" | "login" | "register";
  className?: string;
  onTokenChange: (token: string | null) => void;
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ action, className, onTokenChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenChangeRef = useRef(onTokenChange);
    const [status, setStatus] = useState<TurnstileStatus>("idle");
    const [errorCode, setErrorCode] = useState<string | null>(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

    useEffect(() => {
      onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

    useImperativeHandle(ref, () => ({
      reset: resetWidget,
    }));

    useEffect(() => {
      let cancelled = false;

      onTokenChangeRef.current(null);
      setErrorCode(null);

      if (!siteKey) {
        setErrorCode("missing-sitekey");
        setStatus("error");
        return undefined;
      }

      setStatus("loading");

      void loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) {
            return;
          }

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme: "auto",
            size: "normal",
            retry: "auto",
            "refresh-expired": "manual",
            "response-field": false,
            callback: (token) => {
              onTokenChangeRef.current(token);
              setErrorCode(null);
              setStatus("ready");
            },
            "expired-callback": () => {
              onTokenChangeRef.current(null);
              resetWidget();
            },
            "error-callback": (code) => {
              onTokenChangeRef.current(null);
              setErrorCode(String(code ?? "unknown"));
              setStatus("error");
              return true;
            },
            "timeout-callback": () => {
              onTokenChangeRef.current(null);
              resetWidget();
            },
          });
          setStatus("ready");
        })
        .catch(() => {
          if (!cancelled) {
            onTokenChangeRef.current(null);
            setErrorCode("script-load");
            setStatus("error");
          }
        });

      return () => {
        cancelled = true;
        onTokenChangeRef.current(null);

        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [action, siteKey]);

    function resetWidget(): void {
      onTokenChangeRef.current(null);
      setErrorCode(null);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setStatus("ready");
      }
    }

    return (
      <div className={cn("min-h-[65px] w-full max-w-[300px]", className)}>
        <div ref={containerRef} />
        {status === "loading" ? (
          <div
            aria-hidden="true"
            className="h-[65px] w-full rounded-md border border-border bg-muted/40"
          />
        ) : null}
        {status === "error" ? (
          <p className="text-xs text-destructive" role="alert">
            {getTurnstileErrorMessage(errorCode)}
          </p>
        ) : null}
      </div>
    );
  },
);

TurnstileWidget.displayName = "TurnstileWidget";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile can only load in the browser."));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Turnstile failed to load.")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load."));
    };

    document.head.appendChild(script);
  });

  return scriptPromise;
}

function getTurnstileErrorMessage(errorCode: string | null): string {
  if (errorCode === "missing-sitekey") {
    return "Falta configurar la sitekey de Turnstile.";
  }

  if (errorCode === "110200") {
    return "El dominio actual no está autorizado para esta sitekey de Turnstile.";
  }

  return "No se pudo cargar la verificación. Recarga la página.";
}
