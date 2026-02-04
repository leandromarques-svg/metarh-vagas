
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
             <div className="text-2xl font-bold text-white tracking-tight mb-4">
              Meta<span className="text-brand-400">RH</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transformando organizações através de pessoas. Especialistas em Recrutamento e Seleção.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Quem somos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Nossos Serviços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vagas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-4">Contato</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>contato@metarh.com.br</li>
              <li>+55 11 1234-5678</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-4">Redes Sociais</h4>
            <div className="flex space-x-4">
              {/* Social Placeholders */}
              <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-brand-600 transition-colors cursor-pointer flex items-center justify-center text-xs">In</div>
              <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-brand-600 transition-colors cursor-pointer flex items-center justify-center text-xs">Ig</div>
              <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-brand-600 transition-colors cursor-pointer flex items-center justify-center text-xs">Fb</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} MetaRH. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0">Powered by Selecty</p>
        </div>
      </div>
    </footer>
  );
};
