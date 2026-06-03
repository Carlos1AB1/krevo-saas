import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getOrganization,
  updateOrganization,
  type OrganizationResponse,
  type UpdateOrganizationInput,
} from "@/features/organizations/organizations.api";

export function useOrganizationSettings(organizationId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => getOrganization(organizationId),
    enabled: Boolean(organizationId),
  });

  const [form, setForm] = useState<UpdateOrganizationInput>({});

  useEffect(() => {
    if (query.data) {
      const org = query.data;
      setForm({
        name: org.name,
        legalName: org.legalName ?? "",
        taxId: org.taxId ?? "",
        logoUrl: org.logoUrl ?? "",
        currency: org.currency,
        timezone: org.timezone,
      });
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      updateOrganization(organizationId, input),
    onSuccess: (updated: OrganizationResponse) => {
      queryClient.setQueryData(["organizations", organizationId], updated);
      toast.success("Organización actualizada");
    },
    onError: () => {
      toast.error("No se pudo guardar la configuración");
    },
  });

  function updateField<K extends keyof UpdateOrganizationInput>(
    key: K,
    value: UpdateOrganizationInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    mutation.mutate({
      name: form.name,
      legalName: form.legalName || undefined,
      taxId: form.taxId || undefined,
      logoUrl: form.logoUrl || undefined,
      currency: form.currency,
      timezone: form.timezone,
    });
  }

  return {
    organization: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    form,
    updateField,
    save,
    isSaving: mutation.isPending,
  };
}
