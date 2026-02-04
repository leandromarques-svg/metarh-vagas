
export enum JobType {
  FULL_TIME = 'Tempo Integral',
  PART_TIME = 'Meio Período',
  CONTRACT = 'Contrato',
  INTERNSHIP = 'Estágio',
  REMOTE = 'Remoto'
}

export interface SelectyJobResponse {
  id: number | string;
  title: string;
  description: string; // Full HTML content
  summary: string;     // Plain text short description
  city?: string;
  state?: string;
  department?: string;
  contract_type?: string; // CLT, PJ, etc.
  published_at?: string;
  url_apply?: string;
  remote?: boolean;
}

export interface JobFilterState {
  keyword: string;
  location: string;
  department: string;
  jobCode: string;
}
