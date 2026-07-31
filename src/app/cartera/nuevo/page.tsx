// src/app/cartera/nuevo/page.tsx — registrar una venta fiada o de contado.
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import NuevaVentaForm from "@/components/cartera/NuevaVentaForm";
import { getFichaCliente } from "@/services/cartera.service";

type Props = { searchParams?: Promise<{ cliente?: string }> };

export default async function NuevaVentaPage({ searchParams }: Props) {
  const params = await searchParams;
  const clienteId = typeof params?.cliente === "string" ? params.cliente : null;
  const cliente = clienteId ? await getFichaCliente(clienteId) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href={cliente ? `/cartera/${cliente.id}` : "/cartera"}
          aria-label="Volver"
          className="-ml-2 flex h-9 w-9 items-center justify-center text-cacao"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl text-cacao">Nueva venta</h1>
      </div>

      <NuevaVentaForm
        clienteInicial={
          cliente
            ? { id: cliente.id, nombre: cliente.nombre, saldo: cliente.saldo }
            : null
        }
      />
    </div>
  );
}
