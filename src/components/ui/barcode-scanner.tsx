import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

export interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerId = "barcode-scanner-reader";

  useEffect(() => {
    // Evitamos múltiples inicializaciones si React StrictMode hace render doble
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        containerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }, // Aspect ratio tipo código de barras
          supportedFormats: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true, // Botón de flash
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Feedback háptico
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          // Trigger the success callback
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      );
    }

    // Cleanup: detener la cámara al desmontar
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border border-border shadow-sm bg-card p-2">
      <div id={containerId} className="w-full h-full" />
      <style>{`
        /* Sobrescribir los estilos inyectados de html5-qrcode para que se vean modernos */
        #${containerId} { border: none !important; }
        #${containerId} img { display: none !important; } /* Ocultar el logo de HTML5-QRCode */
        
        /* Ocultar advertencias y logs innecesarios que confunden al usuario (ej: NotFoundException) */
        #${containerId}__status_span {
          display: none !important;
        }
        #${containerId} div[style*="background: rgb(255, 243, 205)"],
        #${containerId} div[style*="background-color: rgb(255, 243, 205)"],
        #${containerId} div[style*="background: #fff3cd"] {
          display: none !important;
        }
        
        #${containerId} button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          margin-top: 1rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        #${containerId} button:hover { opacity: 0.9; }
        #${containerId} select {
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          margin-bottom: 1rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
