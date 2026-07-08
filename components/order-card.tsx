"use client";

import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pedido } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, Link as LinkIcon, Scissors, Check } from "lucide-react";

interface OrderCardProps {
  pedido: Pedido;
}

export function OrderCard({ pedido }: OrderCardProps) {
  const handleDelete = async () => {
    if (!confirm("Excluir este pedido?")) return;
    
    try {
      await deleteDoc(doc(db, "pedidos", pedido.id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir o pedido.");
    }
  };

  const handleToggleStatus = async () => {
    const novoStatus = pedido.status === "para_cortar" ? "cortado" : "para_cortar";
    try {
      await updateDoc(doc(db, "pedidos", pedido.id), { status: novoStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar o status.");
    }
  };

  // A LINHA CORRIGIDA ENTRA BEM AQUI:
  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    return timestamp.toDate().toLocaleDateString("pt-BR");
  };

  const totalPecas = pedido.tamanhos?.reduce((acc, t) => acc + t.quantidade, 0) || 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-card-foreground">
            {pedido.nome}
          </h3>
          <p className="text-[0.65rem] text-muted-foreground">
            {pedido.id} - {formatDate(pedido.criadoEm)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1 bg-secondary border border-border rounded-full text-secondary-foreground text-[0.65rem] font-medium tracking-wide px-3 py-0.5">
          <LinkIcon className="w-3 h-3" />
          {pedido.tipo}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full text-[0.65rem] font-medium tracking-wide px-3 py-0.5 ${
          pedido.status === "cortado" 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : "bg-amber-100 text-amber-700 border border-amber-200"
        }`}>
          {pedido.status === "cortado" ? <Check className="w-3 h-3" /> : <Scissors className="w-3 h-3" />}
          {pedido.status === "cortado" ? "Cortado" : "Para Cortar"}
        </span>
      </div>

      <div className="my-3 space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <label className="text-[0.58rem] uppercase tracking-widest text-muted-foreground font-medium">
            Cortado
          </label>
          <span className="text-sm text-card-foreground">{pedido.cortado} cm</span>
        </div>

        {pedido.tamanhos && pedido.tamanhos.length > 0 ? (
          <div className="space-y-1.5">
            <label className="text-[0.58rem] uppercase tracking-widest text-muted-foreground font-medium block">
              Tamanhos
            </label>
            <div className="bg-muted rounded-lg p-2 space-y-1">
              {pedido.tamanhos.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-card-foreground">{t.tamanhoFinal} cm</span>
                  <span className="text-primary font-medium">{t.quantidade} pcs</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm pt-1 border-t border-border/50 mt-1">
                <span className="text-muted-foreground font-medium">Total</span>
                <span className="text-primary font-semibold">{totalPecas} pcs</span>
              </div>
            </div>
          </div>
        ) : (
          // Compatibilidade com pedidos antigos (campo "final" e "quantidade")
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.58rem] uppercase tracking-widest text-muted-foreground font-medium block mb-0.5">
                Final
              </label>
              <span className="text-sm text-card-foreground">{(pedido as unknown as { final?: string }).final || "-"} cm</span>
            </div>
            <div>
              <label className="text-[0.58rem] uppercase tracking-widest text-muted-foreground font-medium block mb-0.5">
                Qtd.
              </label>
              <span className="text-sm text-card-foreground font-medium text-primary">
                {(pedido as unknown as { quantidade?: number }).quantidade || 1}
              </span>
            </div>
          </div>
        )}
      </div>

      {pedido.obs && (
        <p className="text-muted-foreground text-sm border-t border-border pt-3 mt-2">
          {pedido.obs}
        </p>
      )}

      <div className="flex justify-between items-center mt-3">
        <button
          type="button"
          onClick={handleToggleStatus}
          className={`inline-flex items-center gap-1.5 rounded-lg text-xs font-medium px-3 py-1.5 transition-all ${
            pedido.status === "para_cortar"
              ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
              : "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
          }`}
        >
          {pedido.status === "para_cortar" ? (
            <><Scissors className="w-3 h-3" /> Marcar como Cortado</>
          ) : (
            <><Check className="w-3 h-3" /> Marcar Para Cortar</>
          )}
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
