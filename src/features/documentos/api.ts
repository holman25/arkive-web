import axiosClient from "@/lib/axiosClient";
import type { Documento, DocumentosResponse } from "./types";

export async function fetchDocumentos(params: { pagina: number; tam: number; autor?: string; estado?: string }) {
  const res = await axiosClient.get<DocumentosResponse>("/documentos/buscar", { params });
  return res.data;
}

export async function fetchDocumento(id: number) {
  const res = await axiosClient.get<Documento>(`/documentos/${id}`);
  return res.data;
}

export async function updateDocumento(id: number, payload: Partial<Documento>) {
  const res = await axiosClient.put<Documento>(`/documentos/${id}`, payload);
  return res.data;
}

export async function createDocumento(payload: Partial<Documento>) {
  const res = await axiosClient.post<Documento>("/documentos", payload);
  return res.data;
}

export async function deleteDocumento(id: number) {
  const res = await axiosClient.delete<Documento>(`/documentos/${id}`);
  return res.data;
}

export async function postWebhookCambiarEstado(payload: { documentoId: number; nuevoEstado: string }) {
  const res = await fetch("http://localhost:8085/api/webhook/validar-documento", {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as {
    ok: boolean;
    id: number;
    estadoAnterior: string;
    estadoNuevo: string;
    rowsAffected: number;
  };
}
