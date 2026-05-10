import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";

const faqs = [
  {
    q: "¿Mis datos están aislados de otros clientes?",
    a: "Sí. Krevo es multi-tenant con aislamiento estricto por tenant_id en base de datos, RLS y a nivel de aplicación. Nadie ve nada de nadie.",
  },
  {
    q: "¿Funciona offline para los operarios en bodega?",
    a: "La PWA del operario funciona offline para picking y recepción. Las acciones se encolan localmente y se sincronizan al recuperar conexión, sin pérdida.",
  },
  {
    q: "¿Aceptan pagos en pesos colombianos?",
    a: "Sí. Facturación recurrente en COP vía ePayco y Wompi. Manejo de morosidad y bloqueo automático configurable.",
  },
  {
    q: "¿Puedo migrar desde Excel o desde otro WMS?",
    a: "Importación masiva desde Excel/CSV en el onboarding. Para WMS legacy ofrecemos un servicio de migración asistida en planes Pro y Enterprise.",
  },
  {
    q: "¿Cómo funciona el ROP dinámico?",
    a: "Calculamos el punto de reorden con tu lead time real, demanda histórica, nivel de servicio Z y stock de seguridad. Se ajusta automáticamente conforme tus datos evolucionan.",
  },
  {
    q: "¿Tienen API para integrar con mi ERP?",
    a: "Sí. API REST versionada (/v1) con autenticación JWT y webhooks de eventos. Documentación abierta para clientes Pro y Enterprise.",
  },
];

export function FAQ() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Lo que necesitas saber, sin vueltas."
        />

        <Accordion
          type="single"
          collapsible
          className="mt-12 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]"
        >
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="border-b border-border/60 last:border-b-0 px-5"
            >
              <AccordionTrigger className="py-5 text-left font-display text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
