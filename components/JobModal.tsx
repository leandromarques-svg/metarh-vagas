
import React, { useEffect } from 'react';
import { SelectyJobResponse } from '../types';
import { X, MapPin, Briefcase, Clock, ExternalLink, Building2, Hash, ChevronLeft } from 'lucide-react';

interface JobModalProps {
  job: SelectyJobResponse;
  onClose: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  
  // Ao montar, garantir que estamos no topo (útil para transições)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    // Removemos classes de position fixed/absolute para funcionar como uma página normal dentro do iframe
    <div className="relative bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] w-full flex flex-col border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50 relative">
          
          <div className="w-full pr-0 md:pr-12">
             <button 
                onClick={onClose}
                className="mb-6 flex items-center text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-wide group"
              >
                <div className="bg-white border border-slate-200 rounded-full p-1.5 mr-2 group-hover:border-brand-300 transition-colors">
                   <ChevronLeft className="w-4 h-4" />
                </div>
                Voltar para lista
              </button>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wide rounded-full">
                {job.department || 'Geral'}
                </span>
                <span className="inline-flex items-center px-2 py-1 text-slate-400 text-xs font-mono border border-slate-200 rounded-full bg-white">
                    <Hash className="w-3 h-3 mr-1" />
                    {job.id}
                </span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">{job.title}</h2>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-slate-600 font-medium">
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                <MapPin className="w-4 h-4 mr-2 text-brand-500" />
                {job.remote ? 'Trabalho Remoto' : `${job.city}, ${job.state}`}
              </div>
              {job.contract_type && (
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                  <Briefcase className="w-4 h-4 mr-2 text-brand-500" />
                  {job.contract_type}
                </div>
              )}
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                <Clock className="w-4 h-4 mr-2 text-brand-500" />
                {new Date(job.published_at || Date.now()).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          {/* Botão de fechar redundante (X) no canto superior direito para desktop */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 hidden md:flex p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Layout de coluna única agora */}
        <div className="p-6 sm:p-10">
            
            {/* Descrição da Vaga */}
            <div className="prose prose-slate prose-brand max-w-none mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center pb-4 border-b border-slate-100">
                    <Building2 className="w-6 h-6 mr-3 text-brand-600" />
                    Sobre a vaga
                </h3>
                
                <div 
                className="text-slate-600 leading-relaxed text-lg
                            [&>p]:mb-4 [&>p]:leading-8
                            [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2
                            [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:pl-5 
                            [&>li]:pl-1 [&>li]:mb-2
                            [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:uppercase [&>h3]:tracking-wide [&>h3]:mt-10 [&>h3]:mb-4
                            [&>strong]:text-slate-900 [&>strong]:font-bold
                            [&>br]:content-[''] [&>br]:block [&>br]:my-2"
                dangerouslySetInnerHTML={{ __html: job.description }}
                />
                
                {!job.description && (
                <p className="text-slate-500 italic">
                    Nenhuma descrição detalhada disponível para esta vaga.
                </p>
                )}
            </div>

            {/* Rodapé de Ação (Sempre ao final) */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center">
                <h4 className="text-2xl font-bold text-slate-900 mb-3">Tem interesse nesta oportunidade?</h4>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
                    Se o seu perfil corresponde ao que estamos buscando, envie seu currículo e venha fazer parte da nossa história.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-8 py-4 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-colors text-sm order-2 sm:order-1"
                    >
                        Voltar para lista
                    </button>

                    <a
                        href={job.url_apply || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center px-10 py-4 rounded-full bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 transform active:scale-[0.98] transition-all text-sm order-1 sm:order-2"
                    >
                        Candidatar-se agora
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </div>

        </div>
    </div>
  );
};
