"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pedido } from "@/lib/types";
import { OrderCard } from "./order-card";
import { Link as LinkIcon } from "lucide-react";

interface ConnectionStatus {
  status: "loading" | "connected" | "error";
  message: string;
}

export function OrderList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [connection, setConnection] = useState<ConnectionStatus>({
    status: "loading",
    message: "Conectando...",
  });

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("criadoEm", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pedido[];
        
        setPedidos(data);
        setConnection({
          status: "connected",
          message: "Conectado ao Firebase",
        });
      },
      (error) => {
        console.error("Erro na conexão:", error);
        setConnection({
          status: "error",
          message: "Erro de conexão — verifique as regras do Firestore",
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const ultimos5 = pedidos.slice(0, 5);

  const statusClasses = {
    loading: "bg-secondary text-secondary-foreground border-border",
    connected: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-600 border-red-200",
  };

  const statusIcons = {
    loading: "⏳",
    connected: "✓",
    error: "✕",
  };

  return (
    <div>
      {/* Status Bar */}
      <div
        className={`text-center text-[0.7rem] tracking-wide font-medium py-2 px-4 rounded-full border mb-6 ${statusClasses[connection.status]}`}
      >
        {statusIcons[connection.status]} {connection.message}
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Últimos Pedidos
        </h2>
        <span className="bg-secondary border border-border rounded-full text-secondary-foreground text-[0.65rem] tracking-wide font-medium px-3 py-1">
          {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards */}
      {connection.status === "loading" ? (
        <div className="text-center text-muted-foreground py-8 text-sm tracking-wide">
          Carregando...
        </div>
      ) : ultimos5.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ultimos5.map((pedido) => (
            <OrderCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </div>
  );
}
