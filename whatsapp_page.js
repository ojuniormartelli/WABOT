"use client";

import { useState, useEffect, useCallback } from "react";

export default function WhatsAppPage() {
  const [qrCode, setQrCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("desconectado");
  const [services, setServices] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState({});

  const loadServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services/actions");
      const data = await res.json();
      if (data.success) setServices(data.processes);
    } catch (e) {
      console.error("Erro ao carregar serviços", e);
    }
  }, []);

  useEffect(() => {
    loadServices();
    const interval = setInterval(loadServices, 5000);
    return () => clearInterval(interval);
  }, [loadServices]);

  const handleAction = async (service, action) => {
    setLoading((prev) => ({ ...prev, [`${service}-${action}`]: true }));
    try {
      const res = await fetch("/api/services/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, action }),
      });
      const data = await res.json();
      if (action === "logs") {
        setLogs((prev) => ({ ...prev, [service]: data.logs }));
      }
      await loadServices();
    } catch (e) {
      console.error("Erro na ação", e);
    }
    setLoading((prev) => ({ ...prev, [`${service}-${action}`]: false }));
  };

  const statusColor = (status) => {
    if (status === "online") return "bg-green-500";
    if (status === "running") return "bg-green-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">WhatsApp</h1>

      {/* QR Code */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Conexão</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-3 h-3 rounded-full ${statusColor(connectionStatus)}`} />
          <span className="capitalize">{connectionStatus}</span>
        </div>
        {qrCode ? (
          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
        ) : (
          <p className="text-gray-500">
            {connectionStatus === "desconectado"
              ? "Inicie a Evolution API ao lado para gerar o QR Code"
              : "Conectado"}
          </p>
        )}
      </div>

      {/* Serviços */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Serviços</h2>
        <div className="space-y-4">
          {services.map((svc) => (
            <div key={svc.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${statusColor(svc.status)}`} />
                  <span className="font-medium">{svc.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    svc.status === "online" || svc.status === "running"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {svc.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["start", "stop", "restart", "logs"].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleAction(svc.name, action)}
                    disabled={loading[`${svc.name}-${action}`]}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      action === "start"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : action === "stop"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : action === "restart"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loading[`${svc.name}-${action}`]
                      ? "..."
                      : action === "start"
                      ? "▶ Iniciar"
                      : action === "stop"
                      ? "⏹ Parar"
                      : action === "restart"
                      ? "🔄 Reiniciar"
                      : "📋 Logs"}
                  </button>
                ))}
              </div>
              {logs[svc.name] && (
                <pre className="mt-3 bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-auto max-h-40">
                  {logs[svc.name]}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
