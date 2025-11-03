import React, { useMemo, useState} from "react";
import { Link} from "@tanstack/react-router";
import { useDocumentos } from "./useDocumentos";
import { FileText } from 'lucide-react';


import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import type { Documento } from "./types";
import { deleteDocumento, postWebhookCambiarEstado } from "./api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RefreshCw, ChevronUp, ChevronDown, Plus, Filter, X } from "lucide-react";

const PAGE_SIZES = [10, 20, 50];
const ESTADOS = ["Registrado", "Validado", "Pendiente", "Archivado"] as const;
type Estado = typeof ESTADOS[number];

const ListPage: React.FC = () => {
    const [pagina, setPagina] = useState(1);
    const [tam, setTam] = useState(10);

    const [fAutor, setFAutor] = useState("");
    const [fEstado, setFEstado] = useState("");

    const [autorDraft, setAutorDraft] = useState("");
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

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [webhookLoading, setWebhookLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalDocId, setModalDocId] = useState<number | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<Estado>("Validado");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteDocId, setDeleteDocId] = useState<number | null>(null);

    const [sorting, setSorting] = useState<SortingState>([]);

    const aplicarFiltros = () => {
        setPagina(1);
        setFAutor(autorDraft.trim());
        setFEstado(estadoDraft || "");
    };

    const limpiarFiltros = () => {
        setAutorDraft("");
        setEstadoDraft("");
        setPagina(1);
        setFAutor("");
        setFEstado("");
    };

    const openCambiarEstado = (docId: number, estadoActual: string) => {
        setModalDocId(docId);
        setNuevoEstado((ESTADOS.includes(estadoActual as Estado) ? estadoActual : "Validado") as Estado);
        setModalOpen(true);
    };
    const closeModal = () => {
        if (webhookLoading) return;
        setModalOpen(false);
        setModalDocId(null);
    };

    const onDelete = (id: number) => {
        setDeleteDocId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteDocId) return;
        setDeletingId(deleteDocId);
        setDeleteModalOpen(false);
        const t = toast.loading(`Eliminando documento #${deleteDocId}…`);
        try {
            await deleteDocumento(deleteDocId);
            await refetch();
            toast.success(`Documento eliminado correctamente`, { id: t, duration: 2500 });
        } catch (err: any) {
            toast.error(`Error: ${err?.message || "No se pudo eliminar"}`, { id: t });
        } finally {
            setDeletingId(null);
            setDeleteDocId(null);
        }
    };

    const onConfirmCambiarEstado = async () => {
        if (!modalDocId) return;
        setWebhookLoading(true);
        const t = toast.loading(`Actualizando estado del documento #${modalDocId}…`, { id: `upd-${modalDocId}` });
        try {
            const resp = await postWebhookCambiarEstado({ documentoId: modalDocId, nuevoEstado });
            await refetch();
            toast.success(`Estado actualizado: ${resp.estadoAnterior} → ${resp.estadoNuevo}`, { id: t, duration: 2500 });
            setWebhookLoading(false);
            closeModal();
        } catch (err: any) {
            toast.error(`Error: ${err?.message || "No se pudo actualizar"}`, { id: t });
            setWebhookLoading(false);
        }
    };

    const columnHelper = createColumnHelper<Documento>();
    const columns = useMemo(
        () => [
            columnHelper.accessor("id", {
                header: () => <HeaderSort label="#" columnId="id" />,
                cell: (c) => (
                    <Link
                        to="/documentos/$id"
                        params={{ id: String(c.getValue()) }}
                        className="underline hover:opacity-80 transition"
                        title="Ver / editar"
                        >
                        {c.getValue()}
                        </Link>
                ),
            }),
            columnHelper.accessor("titulo", { header: () => <HeaderSort label="Título" columnId="titulo" /> }),
            columnHelper.accessor("autor", { header: () => <HeaderSort label="Autor" columnId="autor" /> }),
            columnHelper.accessor("tipo", { header: () => <HeaderSort label="Tipo" columnId="tipo" /> }),
            columnHelper.accessor("estado", {
                header: () => <HeaderSort label="Estado" columnId="estado" />,
                cell: (c) => (
                    <span
                        className={
                            "px-2 py-0.5 rounded text-xs font-medium " +
                            (c.getValue() === "Validado"
                                ? "bg-emerald-100 text-emerald-700"
                                : c.getValue() === "Pendiente"
                                    ? "bg-amber-100 text-amber-700"
                                    : c.getValue() === "Archivado"
                                        ? "bg-slate-200 text-slate-700"
                                        : "bg-slate-100 text-slate-700")
                        }
                    >
                        {c.getValue()}
                    </span>
                ),
            }),
            columnHelper.accessor("fechaRegistro", {
                header: () => <HeaderSort label="Fecha registro" columnId="fechaRegistro" />,
                cell: (c) => new Date(c.getValue()).toLocaleDateString(),
            }),
            columnHelper.display({
                id: "acciones",
                header: "Acciones",
                cell: (c) => {
                    const row = c.row.original;
                    const isDeleting = deletingId === row.id;
                    return (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openCambiarEstado(row.id, row.estado)}
                                className="px-2.5 py-1 text-xs rounded-lg border bg-white hover:bg-slate-50 transition"
                                title="Cambiar estado (webhook)"
                            >
                                Cambiar estado
                            </button>
                            <button
                                onClick={() => onDelete(row.id)}
                                disabled={isDeleting}
                                className="px-2.5 py-1 text-xs rounded-lg border bg-white hover:bg-slate-50 transition disabled:opacity-50"
                                title="Eliminar documento"
                            >
                                {isDeleting ? (
                                    <span className="inline-flex items-center gap-1">
                                        <Spinner className="h-4 w-4" />
                                        Eliminando…
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                },
            }),
        ],
        [deletingId]
    );

    const table = useReactTable({
        data: items,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-sm"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            />
                            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Arkive
                            </span>
                        </div>

                        <motion.div
                            className="flex items-center gap-2 text-sm text-slate-600"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Sistema de Gestión Documental</span>
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold tracking-tight">Documentos</h1>
                    <p className="text-sm text-slate-500 mt-1">Búsqueda avanzada, ordenamiento y acciones por fila.</p>
                </div>

                <div className="mb-4 rounded-2xl bg-white border shadow-sm">
                    <div className="px-4 py-3  flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">

                            <Filter className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Filtros</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/documentos/nuevo"
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
                                title="Crear documento"
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo
                            </Link>
                            <button
                                onClick={() => refetch()}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border bg-white hover:bg-slate-50 shadow-sm transition"
                                title="Refrescar lista"
                            >
                                {isFetching ? (
                                    <>
                                        <Spinner className="h-4 w-4" />
                                        Refrescando…
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4" />
                                        Refrescar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <label className="block text-xs text-slate-500 mb-1">Autor</label>
                            <input
                                value={autorDraft}
                                onChange={(e) => setAutorDraft(e.target.value)}
                                placeholder="Ej: Holman"
                                className="w-full border rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 ring-slate-300 transition"
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <label className="block text-xs text-slate-500 mb-1">Estado</label>
                            <select
                                value={estadoDraft}
                                onChange={(e) => setEstadoDraft(e.target.value)}
                                className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                            >
                                <option value="">Todos</option>
                                {ESTADOS.map((e) => (
                                    <option key={e} value={e}>
                                        {e}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:col-span-3 flex flex-wrap items-end justify-end gap-2">
                            <button
                                onClick={aplicarFiltros}
                                className="rounded-xl px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
                                title="Aplicar filtros"
                            >
                                Aplicar
                            </button>
                            <button
                                onClick={limpiarFiltros}
                                className="rounded-xl px-3 py-2 text-sm border bg-white hover:bg-slate-50 shadow-sm transition"
                                title="Limpiar filtros"
                            >
                                <span className="inline-flex items-center gap-1">
                                    <X className="h-4 w-4" />
                                    Limpiar
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                {table.getHeaderGroups().map((hg) => (
                                    <tr key={hg.id}>
                                        {hg.headers.map((h) => {
                                            const isSorted = h.column.getIsSorted();
                                            return (
                                                <th key={h.id} className="text-left px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                                    {h.isPlaceholder ? null : (
                                                        <button
                                                            className="inline-flex items-center gap-1 group"
                                                            onClick={h.column.getToggleSortingHandler()}
                                                            title="Ordenar"
                                                        >
                                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                                            <span className="opacity-60 group-hover:opacity-100 transition">
                                                                {isSorted === "asc" ? (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                ) : isSorted === "desc" ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronUp className="h-4 w-4 opacity-20" />
                                                                )}
                                                            </span>
                                                        </button>
                                                    )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={`sk-${i}`} className="border-b last:border-0">
                                            {Array.from({ length: table.getAllColumns().length }).map((__, j) => (
                                                <td key={`skc-${i}-${j}`} className="px-4 py-3">
                                                    <div className="h-3 w-[70%] bg-slate-100 animate-pulse rounded" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError ? (
                                    <tr>
                                        <td
                                            colSpan={table.getAllColumns().length}
                                            className="px-4 py-10 text-center text-red-600"
                                        >
                                            Error cargando documentos
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={table.getAllColumns().length}
                                            className="px-4 py-10 text-center text-slate-500"
                                        >
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
                            className="border rounded-xl px-3 py-2 text-sm bg-white"
                            title="Tamaño de página"
                        >
                            {PAGE_SIZES.map((s) => (
                                <option key={s} value={s}>
                                    {s}/pág
                                </option>
                            ))}
                        </select>
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50 bg-white shadow-sm transition"
                            disabled={pagina <= 1}
                            onClick={() => setPagina((p) => Math.max(1, p - 1))}
                            title="Anterior"
                        >
                            Anterior
                        </button>
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50 bg-white shadow-sm transition"
                            disabled={pagina >= totalPages}
                            onClick={() => setPagina((p) => Math.min(totalPages, p + 1))}
                            title="Siguiente"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="w-full max-w-md rounded-2xl bg-white shadow-lg border"
                            initial={{ y: 24, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 24, opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b">
                                <h3 className="text-base font-semibold">Cambiar estado del documento #{modalDocId}</h3>
                                <p className="text-xs text-slate-500">Esta vista ejecuta el webhook de validación para pruebas.</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <label className="block text-xs text-slate-500 mb-1">Nuevo estado</label>
                                <select
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value as Estado)}
                                    className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                                    disabled={webhookLoading}
                                >
                                    {ESTADOS.map((e) => (
                                        <option key={e} value={e}>
                                            {e}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 border-t flex justify-end gap-2">
                                <button
                                    onClick={closeModal}
                                    disabled={webhookLoading}
                                    className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={onConfirmCambiarEstado}
                                    disabled={webhookLoading}
                                    className="rounded-xl px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {webhookLoading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Spinner className="h-4 w-4" />
                                            Actualizando…
                                        </span>
                                    ) : (
                                        "Aplicar"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteModalOpen(false)}
                    >
                        <motion.div
                            className="w-full max-w-md rounded-2xl bg-white shadow-lg border"
                            initial={{ y: 24, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 24, opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-slate-900">
                                            Eliminar documento #{deleteDocId}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            ¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium bg-white hover:bg-slate-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="rounded-xl px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ListPage;

function HeaderSort({ label }: { label: string; columnId: string }) {
    return <span>{label}</span>;
}

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}
