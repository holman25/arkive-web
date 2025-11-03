import { z } from "zod";

export const documentoSchema = z.object({
  id: z.number().optional(),
  titulo: z.string().min(3, "El título es obligatorio"),
  autor: z.string().min(3, "El autor es obligatorio"),
  tipo: z.string().min(2, "Seleccione un tipo"),
  estado: z.string().min(2, "Seleccione un estado"),
});

export type DocumentoForm = z.infer<typeof documentoSchema>;
