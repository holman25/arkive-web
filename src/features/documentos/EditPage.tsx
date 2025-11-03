import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchDocumento, updateDocumento } from "./api";
import { documentoSchema, type DocumentoForm } from "./schema";
import { useNavigate } from "@tanstack/react-router";

type Props = { id: number };

const ESTADOS = ["Registrado", "Pendiente", "Validado", "Archivado"] as const;

const EditPage: React.FC<Props> = ({ id }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["documento", id],
    queryFn: () => fetchDocumento(id),
  });

  const { register, handleSubmit, reset, formState } = useForm<DocumentoForm>({
    resolver: zodResolver(documentoSchema),
    defaultValues: { titulo: "", autor: "", tipo: "", estado: "" },
  });

  React.useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<DocumentoForm>) => updateDocumento(id, payload),
    onSuccess: () => {
      toast.success("Documento actualizado");
      qc.invalidateQueries({ queryKey: ["documentos"] });
      qc.invalidateQueries({ queryKey: ["documento", id] });
    },
    onError: () => toast.error("Error al actualizar"),
  });

  const onSubmit = (values: DocumentoForm) => mutation.mutate(values);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="h-6 w-40 bg-slate-100 rounded mb-6 animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-4 w-24 bg-slate-100 rounded mb-2 animate-pulse" />
              <div className="h-9 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
          <div className="h-9 w-36 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/documentos" })}
              className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-slate-50 transition"
              title="Volver al listado"
            >
              ← Atrás
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-900" />
              <span className="text-lg font-semibold tracking-tight">Arkive</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border rounded-2xl shadow-sm p-6 transition opacity-100 translate-y-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Editar documento #{id}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Actualiza los campos y guarda los cambios.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                {...register("titulo")}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 ring-slate-300 transition"
                placeholder="Ej: Informe de pruebas"
              />
              {formState.errors.titulo && (
                <p className="text-red-600 text-sm mt-1">{formState.errors.titulo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Autor</label>
              <input
                {...register("autor")}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 ring-slate-300 transition"
                placeholder="Ej: Holman Alba"
              />
              {formState.errors.autor && (
                <p className="text-red-600 text-sm mt-1">{formState.errors.autor.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <input
                  {...register("tipo")}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 ring-slate-300 transition"
                  placeholder="Ej: Informe, Contrato, Acta…"
                />
                {formState.errors.tipo && (
                  <p className="text-red-600 text-sm mt-1">{formState.errors.tipo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  {...register("estado")}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 ring-slate-300 transition"
                  defaultValue={data?.estado ?? ""}
                >
                  <option value="" disabled>
                    Selecciona estado…
                  </option>
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                {formState.errors.estado && (
                  <p className="text-red-600 text-sm mt-1">{formState.errors.estado.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm transition"
              >
                {mutation.isPending ? "Guardando…" : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={() => reset(data)}
                className="rounded-lg border px-4 py-2 text-sm bg-white hover:bg-slate-50 shadow-sm transition"
              >
                Revertir cambios
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/documentos" })}
                className="rounded-lg px-4 py-2 text-sm border bg-white hover:bg-slate-50 shadow-sm transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditPage;
