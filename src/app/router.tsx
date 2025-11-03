import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
  useMatch,
} from "@tanstack/react-router";

import HealthPage from "@/features/health";
import DocumentosList from "@/features/documentos/ListPage";
import EditPage from "@/features/documentos/EditPage";
import NewPage from "@/features/documentos/NewPage";


const RootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-white text-slate-900">
      <Outlet />
    </div>
  ),
});

const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: () => <DocumentosList />,
});

const DocumentosRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/documentos",
  component: () => <DocumentosList />,
});

const DocumentoEditRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/documentos/$id",
  component: () => {
    const { params } = useMatch({ from: "/documentos/$id" as const });
    return <EditPage id={Number(params.id)} />;
  },
});

const DocumentosNewRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/documentos/nuevo",
  component: () => <NewPage />,
});

const routeTree = RootRoute.addChildren([IndexRoute, DocumentosRoute, DocumentoEditRoute, DocumentosNewRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const AppRouter = () => <RouterProvider router={router} />;
