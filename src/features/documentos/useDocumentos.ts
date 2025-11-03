import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { fetchDocumentos } from "./api"
import type { DocumentosResponse } from "./types"

export function useDocumentos(pagina: number, tam: number, autor: string, estado: string) {
  return useQuery<DocumentosResponse, Error, DocumentosResponse>({
    queryKey: ["documentos", { pagina, tam, autor, estado}],
    queryFn: () => fetchDocumentos({ pagina, tam, autor: autor || undefined , estado: estado || undefined }),
    placeholderData: keepPreviousData,
  })
}
