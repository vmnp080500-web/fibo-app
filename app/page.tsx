import { OrderForm } from "@/components/order-form";
import { OrderList } from "@/components/order-list";
import Link from "next/link";
import { Search, Scissors } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-16">
        {/* Navegação Rápida entre Módulos */}
        <div className="flex justify-end mb-2">
          <Link 
            href="/corte"
            className="inline-flex items-center gap-1.5 bg-card border border-border hover:bg-accent rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-all"
          >
            <Scissors className="w-3.5 h-3.5 text-primary" />
            Calculadora de Corte
          </Link>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 shadow-lg shadow-primary/10 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold font-serif">
              F
            </div>
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Gestão de Pedidos
            </span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            FIBO <span className="text-primary">Company</span>
          </h1>
          
          <p className="text-[0.78rem] uppercase tracking-[0.15em] text-muted-foreground mt-2">
            Sistema de Correntes
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />

          <Link 
            href="/pesquisa"
            className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-700 rounded-full px-5 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all"
          >
            <Search className="w-4 h-4" />
            Pesquisa Avançada
          </Link>
        </header>

        {/* Order Form */}
        <div className="mb-8">
          <OrderForm />
        </div>

        {/* Order List */}
        <OrderList />
      </div>
    </div>
  );
}
