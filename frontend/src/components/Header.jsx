import { Truck, ShieldAlert } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg">
            <ShieldAlert className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Sistema ANTT — Produtos Perigosos
            </h1>
            <p className="text-xs text-gray-500">Pantanal Agrícola Ltda · Resolução ANTT 5.998/2022</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <Truck size={18} />
          <span className="hidden sm:inline">Expedição & Transporte</span>
        </div>
      </div>
    </header>
  )
}
