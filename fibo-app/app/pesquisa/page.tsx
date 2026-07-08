"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pedido } from "@/lib/types";
import { OrderCard } from "@/components/order-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, ArrowLeft, Filter, X } from "lucide-react";
import Link from "next/link";

export default function PesquisaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [search, setSearch] = useState("");
  const [tamanhoSearch, setTamanhoSearch] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dateStep, setDateStep] = useState<"inicio" | "fim">("inicio");
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      },
      (error) => {
        console.error("Erro na conexão:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (dateStep === "inicio") {
      setDataInicio(val);
      setDataFim("");
      setDateStep("fim");
    } else {
      if (val >= dataInicio) {
        setDataFim(val);
        setDateStep("inicio");
      }
    }
  };

  const clearDate = () => {
    setDataInicio("");
    setDataFim("");
    setDateStep("inicio");
  };

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      if (search) {
        const s = search.toLowerCase();
        const match =
          p.nome.toLowerCase().includes(s) ||
          p.tipo.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s) ||
          (p.obs && p.obs.toLowerCase().includes(s));
        if (!match) return false;
      }

      if (tamanhoSearch) {
        const t = tamanhoSearch.toLowerCase();
        const match = p.tamanhos?.some((tam) =>
          tam.tamanhoFinal.toLowerCase().includes(t)
        );
        if (!match) return false;
      }

      if (dataInicio || dataFim) {
        if (!p.criadoEm?.toDate) return false;
        const pedidoDate = p.criadoEm.toDate();
        pedidoDate.setHours(0, 0, 0, 0);
        if (dataInicio) {
          const inicio = new Date(dataInicio + "T00:00:00");
          if (pedidoDate < inicio) return false;
        }
        if (dataFim) {
          const fim = new Date(dataFim + "T23:59:59");
          if (pedidoDate > fim) return false;
        }
      }

      return true;
    });
  }, [pedidos, search, tamanhoSearch, dataInicio, dataFim]);

  const clearFilters = () => {
    setSearch("");
    setTamanhoSearch("");
    clearDate();
  };

  const hasActiveFilters = search || tamanhoSearch || dataInicio || dataFim;

  const dateLabel = () => {
    if (!dataInicio) return null;
    if (!dataFim) return `De ${dataInicio.split("-").reverse().join("/")} → selecione data fim`;
    return `${dataInicio.split("-").reverse().join("/")} → ${dataFim.split("-").reverse().join("/")}`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-16">
        <header className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            Pesquisa de Pedidos
          </h1>
        </header>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-lg shadow-primary/5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Filtros
            </h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground text-xs h-7"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Busca por texto */}
            <div className="space-y-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                Buscar (cliente, corrente, ID ou observações)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="pl-10 bg-muted border-border"
                />
              </div>
            </div>

            {/* Busca por Tamanho */}
            <div className="space-y-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                Tamanho final (ex: 45, 40+5)
              </label>
              <Input
                value={tamanhoSearch}
                onChange={(e) => setTamanhoSearch(e.target.value)}
                placeholder="Digite um tamanho..."
                className="bg-muted border-border"
              />
            </div>

            {/* Calendário único com range */}
            <div className="space-y-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Período
                {dateStep === "fim" && dataInicio && (
                  <span className="text-primary ml-1">← selecione a data fim</span>
                )}
              </label>

              {/* Feedback da seleção */}
              {dataInicio && (
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
                  <span className="text-foreground font-medium">{dateLabel()}</span>
                  <button
                    type="button"
                    onClick={clearDate}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <input
                type="date"
                min={dateStep === "fim" ? dataInicio : undefined}
                onChange={handleDateChange}
                value=""
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[0.6rem] text-muted-foreground">
                {!dataInicio
                  ? "1º clique = data início"
                  : !dataFim
                  ? "2º clique = data fim (somente datas a partir de " + dataInicio.split("-").reverse().join("/") + ")"
                  : "Período selecionado ✓ — clique novamente para redefinir"}
              </p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Resultados
            </h2>
            <span className="bg-secondary border border-border rounded-full text-secondary-foreground text-[0.65rem] tracking-wide font-medium px-3 py-1">
              {filteredPedidos.length} pedido{filteredPedidos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-8 text-sm tracking-wide">
              Carregando...
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 bg-card border border-border rounded-xl">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum pedido encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPedidos.map((pedido) => (
                <OrderCard key={pedido.id} pedido={pedido} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
