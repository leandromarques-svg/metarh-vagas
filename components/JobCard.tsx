
import React from 'react';
import { SelectyJobResponse } from '../types';
import { MapPin, Briefcase, ArrowRight, Hash } from 'lucide-react';

interface JobCardProps {
  job: SelectyJobResponse;
  onShowDetails: (job: SelectyJobResponse) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onShowDetails }) => {
  return (
    <div className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_rgba(170,63,254,0.15)] hover:border-brand-200 transition-all duration-300 group h-full overflow-hidden">
      
      <div className="p-7 flex-grow">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors uppercase tracking-wide">
              {job.department || 'Geral'}
            </span>
            <span className="inline-flex items-center px-2 py-1 text-slate-400 text-xs font-mono border border-slate-200 rounded-full bg-white" title="Cód. Vaga">
                <Hash className="w-3 h-3 mr-1" />
                {job.id}
            </span>
          </div>
          
          {job.remote && (
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 uppercase tracking-wide">
               Remoto
             </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {job.title}
        </h3>

        <div className="flex flex-col gap-2.5 mb-5">
           <div className="flex items-center text-sm text-slate-500 font-medium">
             <MapPin className="w-4 h-4 mr-2 text-brand-400 shrink-0" />
             <span className="truncate">{job.remote ? 'Qualquer lugar (Remoto)' : `${job.city}, ${job.state}`}</span>
           </div>
           {job.contract_type && (
             <div className="flex items-center text-sm text-slate-500 font-medium">
               <Briefcase className="w-4 h-4 mr-2 text-brand-400 shrink-0" />
               <span>{job.contract_type}</span>
             </div>
           )}
        </div>

        <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
          {job.summary || job.description.replace(/<[^>]*>?/gm, '')}
        </p>
      </div>

      <div className="px-7 pb-7 pt-0 mt-auto">
        <button 
          onClick={() => onShowDetails(job)}
          className="w-full group-hover:bg-brand-600 group-hover:text-white bg-white text-brand-600 border border-brand-200 group-hover:border-brand-600 py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md"
        >
          Ver detalhes da vaga
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
