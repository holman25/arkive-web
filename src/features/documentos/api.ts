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
