
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-white overflow-hidden pt-10 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 mr-2"></span>
              Carreiras & Oportunidades
            </div>
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl leading-tight">
              Confira nossas <br/>
              <span className="text-brand-600">vagas em aberto</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Faça parte do nosso time ou de nossos clientes! Conectamos talentos às melhores oportunidades do mercado com agilidade e humanização.
            </p>
          </div>

          {/* Right Image Content */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md overflow-hidden group">
               <div className="absolute inset-0 bg-brand-600/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-500"></div>
               <img 
                 className="w-full h-full object-cover object-center"
                 src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                 alt="Equipe MetaRH trabalhando" 
               />
            </div>
            
            {/* Decorative Blob */}
            <div className="hidden lg:block absolute -top-12 -right-12 -z-10 w-64 h-64 rounded-full bg-brand-50 blur-3xl opacity-60"></div>
            <div className="hidden lg:block absolute -bottom-12 -left-12 -z-10 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-60"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
