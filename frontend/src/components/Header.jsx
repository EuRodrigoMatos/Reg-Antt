import { Truck, Menu } from 'lucide-react'

export default function Header({ onMenuClick }) {
  return (
    <header className="bg-primary-500 border-b-4 border-primary-700 shadow-md z-30 sticky top-0">
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/80 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src="/logo.png"
            alt="Pantanal Agrícola"
            className="h-11 w-11 object-contain rounded-xl flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white leading-tight truncate">
              Sistema ANTT — Produtos Perigosos
            </h1>
            <p className="text-xs text-white/70">Pantanal Agrícola Ltda · Resolução ANTT 5.998/2022</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-white/70 flex-shrink-0">
          <Truck size={16} />
          <span>Expedição & Transporte</span>
        </div>
      </div>
    </header>
  )
}
