'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ClipboardList } from "lucide-react";

interface MedidaItem {
  tamanho: string;
  proporcao: string;
}

interface ResultadoCorte {
  cortes: { tamanho: number; quantidade: number }[];
  sobra: number;
}

export default function CalculadoraCortePage() {
  const [comprimentoMetros, setComprimentoMetros] = useState('');
  const [numMedidas, setNumMedidas] = useState('2');
  const [medidas, setMedidas] = useState<MedidaItem[]>([
    { tamanho: '', proporcao: '' },
    { tamanho: '', proporcao: '' }
  ]);
  const [resultado, setResultado] = useState<ResultadoCorte | null>(null);

  // Monitora o número de medidas para criar ou remover linhas do formulário automaticamente
  useEffect(() => {
    let n = parseInt(numMedidas) || 1;
    if (n > 20) n = 20; //Limite maximo de medidas para nao travar o app
    setMedidas((prev) => {
      const novasMedidas = [...prev];
      if (novasMedidas.length < n) {
        while (novasMedidas.length < n) {
          novasMedidas.push({ tamanho: '', proporcao: '' });
        }
      } else if (novasMedidas.length > n) {
        novasMedidas.splice(n);
      }
      return novasMedidas;
    });
  }, [numMedidas]);

  const handleInputChange = (index: number, campo: 'tamanho' | 'proporcao', valor: string) => {
    const novas = [...medidas];
    novas[index][campo] = valor;
    setMedidas(novas);
  };

  const calcularCortes = (e: React.FormEvent) => {
    e.preventDefault();

    const metros = parseFloat(comprimentoMetros);
    if (isNaN(metros) || metros <= 0) return;

    // Converte metros para centímetros arredondando para baixo
    const comprimentoCm = Math.floor(metros * 100);

    let tamanhoCiclo = 0;
    const listaValidada = medidas.map((m) => {
      const t = parseInt(m.tamanho) || 0;
      const p = parseInt(m.proporcao) || 0;
      tamanhoCiclo += t * p;
      return { tamanho: t, proporcao: p };
    });

    if (tamanhoCiclo === 0) return;

    // Descobre quantos ciclos cabem e a sobra
    const ciclos = Math.floor(comprimentoCm / tamanhoCiclo);
    const sobra = comprimentoCm % tamanhoCiclo;

    // Calcula a quantidade total de cortes de cada tamanho
    const cortes = listaValidada.map((m) => ({
      tamanho: m.tamanho,
      quantidade: ciclos * m.proporcao,
    }));

    setResultado({ cortes, sobra });
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50 text-gray-800 antialiased">
      {/* Botão de Navegação para Voltar */}
      <div className="flex justify-between items-center mb-4 mt-2">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all"
        >
          <ClipboardList className="w-3.5 h-3.5 text-black" />
          Voltar para Pedidos
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Otimizador de Cortes</h1>
        <p className="text-sm text-gray-500">Calcule o fracionamento de correntes sem desperdício.</p>
      </header>

      <form onSubmit={calcularCortes} className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {/* Passo 1: Comprimento Total */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Comprimento Total da Corrente (metros)
          </label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="Ex: 1.50"
            value={comprimentoMetros}
            onChange={(e) => setComprimentoMetros(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>

        
        {/* Passo 2: Quantidade de Medidas Diferentes */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Quantas medidas diferentes quer cortar? (Máx: 20)
  </label>
  <input
    type="number"
    min="1"
    max="20" // Altera o limite visual do HTML para 20
    required
    value={numMedidas}
    onChange={(e) => {
      const valor = e.target.value;
      // Se o cara digitar algo maior que 20, a gente trava o texto em 20 na hora
      if (parseInt(valor) > 20) {
        setNumMedidas('20');
      } else {
        setNumMedidas(valor);
      }
    }}
    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
  />
</div>


        <hr className="border-gray-100 my-2" />

        {/* Passo 3: Inputs das Medidas Dinâmicas */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Configuração dos Cortes</label>
          
          {medidas.map((medida, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Medida {index + 1} (cm)</span>
                <input
                  type="number"
                  required
                  placeholder="Ex: 45"
                  value={medida.tamanho}
                  onChange={(e) => handleInputChange(index, 'tamanho', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Proporção / Qtd</span>
                <input
                  type="number"
                  required
                  placeholder="Ex: 1"
                  value={medida.proporcao}
                  onChange={(e) => handleInputChange(index, 'proporcao', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-medium rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          Calcular Distribuição
        </button>
      </form>

      {/* Passo 4: Exibição dos Resultados */}
      {resultado && (
        <div className="mt-5 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
          <h2 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
            ✨ Resultado do Corte
          </h2>
          
          <ul className="space-y-2 bg-white/60 rounded-xl p-3 border border-emerald-200/50">
            {resultado.cortes.map((corte, idx) => (
              <li key={idx} className="flex justify-between text-sm text-gray-700 font-medium">
                <span>📏 Corrente de <strong className="text-emerald-900">{corte.tamanho}cm</strong>:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-xs font-bold">
                  {corte.quantidade} peças
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 pt-3 border-t border-emerald-200/60 flex justify-between text-xs text-emerald-800">
            <span>Sobra técnica no rolo:</span>
            <span className="font-bold">{resultado.sobra} cm</span>
          </div>
        </div>
      )}
    </div>
  );
}
