
import React from 'react';
import { Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            {/* Using text fallback if image fails, or specific generic logo if needed. 
                Ideally this would be the MetaRH logo URL */}
            <div className="text-2xl font-bold text-brand-700 tracking-tight">
              Meta<span className="text-slate-800">RH</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Quem somos</a>
            <a href="#" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Soluções</a>
            <a href="#" className="text-brand-600 font-semibold transition-colors">Vagas</a>
            <a href="#" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Blog</a>
            <a 
              href="#" 
              className="px-5 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
            >
              Contato
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-500 hover:text-brand-600 p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
