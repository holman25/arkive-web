import React, { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useDocumentos } from "./useDocumentos";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Documento } from "./types";

const columnHelper = createColumnHelper<Documento>();
const PAGE_SIZES = [10, 20, 50];

const columns = [
  columnHelper.accessor("id", {
    header: "#",
    cell: (c) => (
      <Link
        to={`/documentos/${c.getValue()}`}
        className="underline hover:opacity-80 transition"
        title="Ver / editar"
      >
        {c.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("titulo", { header: "Título" }),
  columnHelper.accessor("autor", { header: "Autor" }),
  columnHelper.accessor("tipo", { header: "Tipo" }),
  columnHelper.accessor("estado", {
    header: "Estado",
    cell: (c) => (
      <span
        className={
          "px-2 py-0.5 rounded text-xs font-medium " +
          (c.getValue() === "Validado"
            ? "bg-emerald-100 text-emerald-700"
            : c.getValue() === "Pendiente"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-700")
        }
      >
        {c.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("fechaRegistro", {
    header: "Fecha registro",
    cell: (c) => new Date(c.getValue()).toLocaleDateString(),
  }),
];

const ListPage: React.FC = () => {
  const [pagina, setPagina] = useState(1);
  const [tam, setTam] = useState(10);

  const [fAutor, setFAutor] = useState("");
  const [fTipo, setFTipo] = useState<string | undefined>(undefined);
  const [fEstado, setFEstado] = useState("");

  const [autorDraft, setAutorDraft] = useState("");
  const [tipoDraft, setTipoDraft] = useState<string>("");
  const [estadoDraft, setEstadoDraft] = useState<string>("");

  const { data, isLoading, isError, refetch, isFetching } = useDocumentos(
    pagina,
    tam,
    fAutor,
    fEstado
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / tam));

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const aplicarFiltros = () => {
    setPagina(1);
    setFAutor(autorDraft.trim());
    setFTipo(tipoDraft || undefined);
    setFEstado(estadoDraft || undefined);
  };

  const limpiarFiltros = () => {
    setAutorDraft("");
    setTipoDraft("");
    setEstadoDraft("");
    setPagina(1);
    setFAutor("");
    setFEstado("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-900" />
              <span className="text-lg font-semibold tracking-tight">Arkive</span>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Documentos</h1>
            <p className="text-sm text-slate-500 mt-1">
              Búsqueda avanzada por autor, tipo, estado y paginación.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/documentos/nuevo"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
            >
              + Nuevo
            </Link>
            <button
              onClick={() => refetch()}
              className="rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50 shadow-sm transition"
            >
              {isFetching ? "Actualizando…" : "Refrescar"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-12">
          <div className="md:col-span-7">
            <label className="block text-xs text-slate-500 mb-1">Autor</label>
            <input
              value={autorDraft}
              onChange={(e) => setAutorDraft(e.target.value)}
              placeholder="Ej: Holman"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 ring-slate-300 transition"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-slate-500 mb-1">Estado</label>
            <select
              value={estadoDraft}
              onChange={(e) => setEstadoDraft(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Todos</option>
              <option value="Registrado">Registrado</option>
              <option value="Validado">Validado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Archivado">Archivado</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end items-end">
            <button
              onClick={aplicarFiltros}
              className="w-full md:w-auto rounded-lg px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
              title="Aplicar filtros"
            >
              Usar filtros
            </button>
            <button
              onClick={limpiarFiltros}
              className="w-full md:w-auto rounded-lg px-3 py-2 text-sm border bg-white hover:bg-slate-50 shadow-sm transition"
              title="Limpiar filtros"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id} className="text-left px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b last:border-0">
                      {Array.from({ length: columns.length }).map((__, j) => (
                        <td key={`skc-${i}-${j}`} className="px-4 py-3">
                          <div className="h-3 w-[70%] bg-slate-100 animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-10 text-center text-red-600">
                      Error cargando documentos
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50/70 transition">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Total: <strong>{total}</strong> — Página <strong>{pagina}</strong> de{" "}
            <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={tam}
              onChange={(e) => {
                setPagina(1);
                setTam(Number(e.target.value));
              }}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
              title="Tamaño de página"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}/pág
                </option>
              ))}
            </select>
            <button
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 bg-white shadow-sm transition"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              title="Anterior"
            >
              Anterior
            </button>
            <button
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 bg-white shadow-sm transition"
              disabled={pagina >= totalPages}
              onClick={() => setPagina((p) => Math.min(totalPages, p + 1))}
              title="Siguiente"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListPage;
