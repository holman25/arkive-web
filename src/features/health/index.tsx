import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";

const HealthPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await axiosClient.get("/health")).data,
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Arkive — Health</h1>
      {isLoading && <div className="animate-pulse text-slate-500">Cargando estado…</div>}
      {isError && <div className="text-red-600">Error consultando /health</div>}
      {data && (
        <pre className="bg-slate-50 border rounded p-4 text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default HealthPage;
