import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";
import { AnimatedNumber } from "@/components/nuclear-ui/animated-number";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section ref={heroRef} className="relative z-0 h-[350vh] bg-black -mt-16 dark">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col justify-center items-center pt-16">
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 z-[-15] bg-black/60" />
        {/* Background Scroll Video */}
      <HeroBackgroundVideo targetRef={heroRef} />

      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[120vh]"
        style={{ backgroundImage: "var(--gradient-nuclear)" }}
      />
      <div
        aria-hidden
        className="bg-grid-nuclear pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />
      {/* Conic orbit */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-20%] -z-10 size-[700px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ backgroundImage: "var(--gradient-reactor)", animation: "var(--animate-orbit)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <LiveBadge label="Reactor online · LATAM · COP" tone="success" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mx-auto mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-[5.25rem]"
        >
          El cerebro de tu <span className="text-gradient-nuclear">Centro de Distribución</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-3xl text-balance text-xl text-slate-300 sm:text-2xl font-light"
        >
          WMS multi-tenant con IA logística. FEFO/FIFO, ROP dinámico, Pareto ABC y trazabilidad por
          lote — todo en tiempo real, listo para gerentes y operarios.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild variant="nuclear" size="xl">
            <Link to="/register">
              Empezar gratis
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/contact">
              <Sparkles className="text-nuclear" />
              Ver demo en 2 min
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-mono mt-12 text-xs uppercase tracking-[0.2em] text-slate-400"
        >
          Sin tarjeta · 14 días Pro · Cancela cuando quieras
        </motion.p>
      </div>
      </div>
    </section>
  );
}

function HeroBackgroundVideo({ targetRef }: { targetRef: React.RefObject<HTMLElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"], 
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, 200]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: Record<number, HTMLImageElement> = {};
    const preloadFrame = (index: number) => {
      if (images[index]) return images[index];
      const paddedIndex = index.toString().padStart(3, "0");
      const i = new Image();
      i.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
      images[index] = i;
      return i;
    };

    // Preload all frames immediately
    for (let i = 1; i <= 200; i++) {
        preloadFrame(i);
    }

    // Load first frame immediately to set dimensions
    const firstImage = preloadFrame(1);
    firstImage.onload = () => {
      canvas.width = firstImage.width || 1920;
      canvas.height = firstImage.height || 1080;
      ctx.drawImage(firstImage, 0, 0, canvas.width, canvas.height);
    };

    const render = (latest: number) => {
      const index = Math.min(200, Math.max(1, Math.floor(latest)));
      const imageToDraw = images[index];
      if (imageToDraw && imageToDraw.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageToDraw, 0, 0, canvas.width, canvas.height);
      }
    };

    const unsubscribe = frameIndex.on("change", render);
    
    // Initial render
    render(frameIndex.get());

    return () => unsubscribe();
  }, [frameIndex]);

  return (
    <div className="absolute inset-0 -z-20 w-full h-full overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
}
