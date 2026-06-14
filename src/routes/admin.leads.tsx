import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MoreHorizontal,
  Search,
  Send,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  fetchContactRequests,
  replyToContactRequest,
  updateContactRequestStatus,
  type ContactRequestResponse,
} from "@/features/contact/contact.api";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [{ title: "Leads · SuperAdmin Krevo" }],
  }),
  component: LeadsPage,
});

type StatusFilter = "ALL" | "PENDING" | "CONTACTED";

const replySchema = z.object({
  subject: z.string().min(2, "El asunto debe tener al menos 2 caracteres").max(200),
  body: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(5000),
});
type ReplyFormValues = z.infer<typeof replySchema>;

function LeadsPage() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<ContactRequestResponse | null>(null);
  const [replyTarget, setReplyTarget] = useState<ContactRequestResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const leadsQuery = useQuery({
    queryFn: () => fetchContactRequests({ limit: 100 }),
    queryKey: ["admin-leads"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "CONTACTED" }) =>
      updateContactRequestStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSelectedLead(updated);
      toast.success(`Lead marcado como ${updated.status === "CONTACTED" ? "contactado" : "pendiente"}`);
    },
    onError: () => {
      toast.error("No se pudo actualizar el estado del lead");
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplyFormValues }) =>
      replyToContactRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setReplyTarget(null);
      toast.success("Respuesta enviada al correo del lead");
    },
    onError: () => {
      toast.error("No se pudo enviar la respuesta");
    },
  });

  const leads = leadsQuery.data?.data ?? [];
  const total = leadsQuery.data?.total ?? 0;

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "ALL" && lead.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.fullName.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.companyName?.toLowerCase().includes(q) ?? false)
    );
  });

  const pendingCount = leads.filter((l) => l.status === "PENDING").length;
  const contactedCount = leads.filter((l) => l.status === "CONTACTED").length;

  return (
    <>
      <AdminTopbar
        title="Leads"
        description="Solicitudes de contacto y demos recibidas desde el sitio web."
        searchAriaLabel="Buscar leads"
        searchPlaceholder="Buscar por nombre, email o empresa..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            <SummaryTile label="Total leads" value={total.toString()} />
            <SummaryTile label="Pendientes" value={pendingCount.toString()} tone="warning" />
            <SummaryTile label="Contactados" value={contactedCount.toString()} tone="success" />
          </section>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <label htmlFor="lead-search" className="sr-only">
                    Buscar lead
                  </label>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lead-search"
                    placeholder="Buscar por nombre, email o empresa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    className="h-10 bg-background pl-9 pr-9"
                  />
                  {searchQuery.trim() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                      aria-label="Limpiar búsqueda"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    {searchQuery.trim() || statusFilter !== "ALL"
                      ? `${filteredLeads.length} de ${total} leads`
                      : `${total} leads recibidos`}
                  </p>
                  <div className="flex gap-1.5">
                    {(["ALL", "PENDING", "CONTACTED"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setStatusFilter(status)}
                      >
                        {status === "ALL" ? "Todos" : status === "PENDING" ? "Pendientes" : "Contactados"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {leadsQuery.isLoading ? (
                <LeadsLoadingState />
              ) : leadsQuery.isError ? (
                <LeadsErrorState onRetry={() => leadsQuery.refetch()} />
              ) : filteredLeads.length > 0 ? (
                <>
                  {/* Mobile cards */}
                  <div className="mt-4 grid gap-3 md:hidden">
                    {filteredLeads.map((lead) => (
                      <article
                        key={lead.id}
                        className="rounded-lg border border-border bg-background/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{lead.fullName}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {lead.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <LeadStatusBadge status={lead.status} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-muted-foreground"
                              aria-label={`Ver detalles de ${lead.fullName}`}
                              onClick={() => setSelectedLead(lead)}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </div>
                        </div>
                        {lead.companyName && (
                          <p className="mt-2 truncate text-xs text-muted-foreground">
                            <Building2 className="mr-1 inline size-3" />
                            {lead.companyName}
                          </p>
                        )}
                        <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                          {lead.message}
                        </p>
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          {formatDate(lead.createdAt)}
                        </p>
                      </article>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="mt-4 hidden overflow-hidden rounded-lg border border-border md:block">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="px-4">Contacto</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Mensaje</TableHead>
                          <TableHead>Fuente</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => (
                          <TableRow key={lead.id} className="bg-card/40">
                            <TableCell className="px-4 py-4">
                              <div className="min-w-[180px]">
                                <p className="font-semibold text-foreground">{lead.fullName}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{lead.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {lead.companyName || (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[240px]">
                              <p className="line-clamp-2 text-sm text-foreground/80">
                                {lead.message}
                              </p>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {lead.source || "—"}
                            </TableCell>
                            <TableCell>
                              <LeadStatusBadge status={lead.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(lead.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground"
                                aria-label={`Ver detalles de ${lead.fullName}`}
                                onClick={() => setSelectedLead(lead)}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <EmptyLeadsState
                  hasLeads={leads.length > 0}
                  searchQuery={searchQuery}
                  onClear={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Sheet
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selectedLead && (
            <>
              <div className="border-b border-border p-6 pr-12">
                <SheetHeader>
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="truncate">{selectedLead.fullName}</SheetTitle>
                      <SheetDescription className="mt-1 truncate">
                        {selectedLead.email}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <LeadStatusBadge status={selectedLead.status} />
                  {selectedLead.companyName && (
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                      {selectedLead.companyName}
                    </span>
                  )}
                  {selectedLead.source && (
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {selectedLead.source}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6 p-6">
                <section className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <DetailRow icon={User} label="Nombre" value={selectedLead.fullName} />
                    <DetailRow icon={Mail} label="Email" value={selectedLead.email} />
                    {selectedLead.companyName && (
                      <DetailRow icon={Building2} label="Empresa" value={selectedLead.companyName} />
                    )}
                    <DetailRow icon={Clock} label="Recibido" value={formatDate(selectedLead.createdAt)} />
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mensaje
                  </h2>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="whitespace-pre-wrap text-sm text-foreground/90">
                      {selectedLead.message}
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Acciones
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.status === "PENDING" ? (
                      <Button
                        onClick={() =>
                          updateMutation.mutate({
                            id: selectedLead.id,
                            status: "CONTACTED",
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="gap-2"
                      >
                        <CheckCircle2 className="size-4" />
                        Marcar como contactado
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateMutation.mutate({
                            id: selectedLead.id,
                            status: "PENDING",
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="gap-2"
                      >
                        <Clock className="size-4" />
                        Volver a pendiente
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setReplyTarget(selectedLead);
                      }}
                    >
                      <Mail className="size-4" />
                      Responder por email
                    </Button>
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <ReplyDialog
        lead={replyTarget}
        isPending={replyMutation.isPending}
        onClose={() => setReplyTarget(null)}
        onSend={(data) => {
          if (replyTarget) {
            replyMutation.mutate({ id: replyTarget.id, data });
          }
        }}
      />
    </>
  );
}

function ReplyDialog({
  lead,
  isPending,
  onClose,
  onSend,
}: {
  lead: ContactRequestResponse | null;
  isPending: boolean;
  onClose: () => void;
  onSend: (data: ReplyFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      subject: lead ? `Re: Solicitud de contacto — ${lead.fullName}` : "",
      body: "",
    },
  });

  return (
    <Dialog
      open={Boolean(lead)}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-nuclear" />
            Responder a {lead?.fullName}
          </DialogTitle>
          <DialogDescription>
            Se enviará un correo a <span className="font-medium text-foreground">{lead?.email}</span> y el lead se marcará como contactado.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-2 space-y-4"
          onSubmit={handleSubmit(onSend)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="reply-subject">Asunto</Label>
            <Input
              id="reply-subject"
              {...register("subject")}
              aria-invalid={!!errors.subject}
              className={cn(errors.subject && "border-destructive")}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply-body">Mensaje</Label>
            <Textarea
              id="reply-body"
              rows={6}
              placeholder="Hola, gracias por tu interés en Krevo..."
              {...register("body")}
              aria-invalid={!!errors.body}
              className={cn(errors.body && "border-destructive")}
            />
            {errors.body && (
              <p className="text-xs text-destructive">{errors.body.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Enviar respuesta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SummaryTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-semibold tracking-tight text-foreground",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const isPending = status === "PENDING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isPending
          ? "border border-warning/30 bg-warning/10 text-warning"
          : "border border-success/30 bg-success/10 text-success",
      )}
    >
      {isPending ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
      {isPending ? "Pendiente" : "Contactado"}
    </span>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <p className="truncate text-[10px] font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmptyLeadsState({
  hasLeads,
  searchQuery,
  onClear,
}: {
  hasLeads: boolean;
  searchQuery: string;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-background">
        <Search className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        {hasLeads ? "Sin resultados" : "Sin leads"}
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {hasLeads
          ? `No encontramos leads para "${searchQuery.trim()}". Prueba con otro nombre o email.`
          : "Aún no han llegado solicitudes de contacto desde el sitio web."}
      </p>
      {hasLeads && (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

function LeadsLoadingState() {
  return (
    <div className="mt-4 grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border bg-background/70 p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-6 w-48" />
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

function LeadsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <p className="font-semibold text-foreground">No se pudo cargar los leads</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Revisa sesión, permisos o disponibilidad del servicio.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
