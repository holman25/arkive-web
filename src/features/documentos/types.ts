export type Documento = {
  id: number
  titulo: string
  autor: string
  tipo: string
  estado: string
  fechaRegistro: string
}

export type PageMeta = {
  pagina: number
  tam: number
  total: number
}

export type DocumentosResponse = {
  data: Documento[]
  meta: PageMeta
}
