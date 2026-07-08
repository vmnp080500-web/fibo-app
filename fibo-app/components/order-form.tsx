"use client";

import { useState } from "react";
import { collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tamanho, StatusPedido } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Trash2 } from "lucide-react";

async function getNextId(): Promise<string> {
  const pedidosRef = collection(db, "pedidos");
  const q = query(pedidosRef, orderBy("criadoEm", "desc"), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return "PED-001";
  }
  
  const lastDoc = snapshot.docs[0];
  const lastId = lastDoc.id;
  
  const match = lastId.match(/PED-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return `PED-${nextNum.toString().padStart(3, "0")}`;
  }
  
  const allDocs = await getDocs(pedidosRef);
  const nextNum = allDocs.size + 1;
  return `PED-${nextNum.toString().padStart(3, "0")}`;
}

export function OrderForm() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [cortado, setCortado] = useState("");
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([{ tamanhoFinal: "", quantidade: 0 }]);
  const [status, setStatus] = useState<StatusPedido>("para_cortar");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const addTamanho = () => {
    setTamanhos([...tamanhos, { tamanhoFinal: "", quantidade: 0 }]);
  };

  const removeTamanho = (index: number) => {
    if (tamanhos.length > 1) {
      setTamanhos(tamanhos.filter((_, i) => i !== index));
    }
  };

  const updateTamanho = (index: number, field: keyof Tamanho, value: string | number) => {
    const updated = [...tamanhos];
    if (field === "quantidade") {
      updated[index][field] = typeof value === "string" ? parseInt(value) || 0 : value;
    } else {
      updated[index][field] = value as string;
    }
    setTamanhos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tamanhosValidos = tamanhos.filter(t => t.tamanhoFinal.trim() && t.quantidade > 0);
    
    if (!nome.trim() || !tipo.trim() || !cortado || tamanhosValidos.length === 0) {
      alert("Preencha: cliente, tipo da corrente, tamanho cortado e pelo menos um tamanho final com quantidade.");
      return;
    }

    setLoading(true);

    try {
      const newId = await getNextId();
      await setDoc(doc(db, "pedidos", newId), {
        nome: nome.trim(),
        tipo: tipo.trim(),
        cortado: parseFloat(cortado),
        tamanhos: tamanhosValidos,
        status,
        obs: obs.trim(),
        criadoEm: serverTimestamp(),
      });

      setNome("");
      setTipo("");
      setCortado("");
      setTamanhos([{ tamanhoFinal: "", quantidade: 0 }]);
      setStatus("para_cortar");
      setObs("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o pedido. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-primary/5">
      <h2 className="font-serif text-xl font-semibold text-card-foreground mb-5 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        Novo Pedido
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
              Nome do Cliente
            </label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Paula"
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
              Tipo da Corrente
            </label>
            <Input
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ex: Veneziana, Corda..."
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
              Tamanho Cortado (cm)
            </label>
            <Input
              type="number"
              value={cortado}
              onChange={(e) => setCortado(e.target.value)}
              placeholder="Ex: 45"
              step="0.5"
              min="0"
              inputMode="decimal"
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
              Status
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("para_cortar")}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  status === "para_cortar"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-muted border border-border text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Para Cortar
              </button>
              <button
                type="button"
                onClick={() => setStatus("cortado")}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  status === "cortado"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-muted border border-border text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Cortado
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                Tamanhos e Quantidades
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addTamanho}
                className="text-primary hover:text-primary/80 text-xs h-7 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {tamanhos.map((tamanho, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    {index === 0 && (
                      <span className="text-[0.6rem] text-muted-foreground">
                        Tamanho Final (ex: 40 ou 45+5)
                      </span>
                    )}
                    <Input
                      value={tamanho.tamanhoFinal}
                      onChange={(e) => updateTamanho(index, "tamanhoFinal", e.target.value)}
                      placeholder="Ex: 45+5"
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    {index === 0 && (
                      <span className="text-[0.6rem] text-muted-foreground">
                        Qtd.
                      </span>
                    )}
                    <Input
                      type="number"
                      value={tamanho.quantidade || ""}
                      onChange={(e) => updateTamanho(index, "quantidade", e.target.value)}
                      placeholder="0"
                      min="0"
                      inputMode="numeric"
                      className="bg-muted border-border"
                    />
                  </div>
                  {tamanhos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTamanho(index)}
                      className="text-destructive hover:text-destructive/80 h-9 w-9 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
              Observacoes (opcional)
            </label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="bg-muted border-border min-h-[70px] resize-y"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-primary hover:bg-[var(--blue-dark)] text-primary-foreground font-medium uppercase tracking-widest text-sm py-5 shadow-lg shadow-primary/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Pedido
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
