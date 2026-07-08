import { Timestamp } from "firebase/firestore";

export type StatusPedido = "para_cortar" | "cortado";

export interface Tamanho {
  tamanhoFinal: string;
  quantidade: number;
}

export interface Pedido {
  id: string;
  nome: string;
  tipo: string;
  cortado: number;
  tamanhos: Tamanho[];
  obs: string;
  status: StatusPedido;
  criadoEm: Timestamp | null;
}
