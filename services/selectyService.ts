
import { SelectyJobResponse } from '../types';
import { SELECTY_API_TOKEN, API_BASE_URL } from '../constants';

/**
 * Helper to strip HTML tags for summary generation
 */
const stripHtml = (html: string) => {
  if (!html) return '';
  try {
    return html.replace(/<[^>]*>?/gm, '') || '';
  } catch (e) {
    return '';
  }
};

/**
 * Helper to convert plain text to HTML with smarter formatting
 */
const formatPlainTextToHtml = (text: string) => {
  if (!text) return '';
  let formatted = text;
  formatted = formatted.replace(/([^\n>])\s*([•·*-])\s+/g, '$1<br/>$2 ');
  formatted = formatted.replace(/\r\n|\r|\n/g, '<br />');
  return formatted;
};

/**
 * Process description to ensure line breaks are respected
 */
const processDescription = (text: string) => {
    if (!text) return '';
    const hasBlockTags = /<\s*(p|div|br|ul|ol|li|h[1-6])\b[^>]*>/i.test(text);
    if (!hasBlockTags) {
        return formatPlainTextToHtml(text);
    }
    return text;
};

/**
 * Tries to fetch data using a robust chain of proxies to bypass CORS in production.
 */
const fetchWithFallback = async (targetUrl: string, options: RequestInit) => {
  // Estratégia 1: AllOrigins (Geralmente o mais estável para JSON em produção)
  try {
    const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(allOriginsUrl);
    if (response.ok) {
      const wrapper = await response.json();
      // AllOrigins retorna o conteúdo original como uma string em .contents
      return JSON.parse(wrapper.contents);
    }
  } catch (e) {
    console.warn("AllOrigins falhou, tentando próximo proxy...");
  }

  // Estratégia 2: CorsProxy.io
  try {
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, options);
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("CorsProxy.io falhou...");
  }

  // Estratégia 3: Tentativa Direta (Pode funcionar se o usuário tiver plugins ou o servidor permitir)
  try {
    const response = await fetch(targetUrl, options);
    if (response.ok) return await response.json();
  } catch (e) {
    console.error("Todas as tentativas de conexão (Proxies e Direta) falharam.");
  }

  throw new Error("Erro de conexão: O servidor da Selecty bloqueou a requisição (CORS). Tente recarregar em alguns instantes.");
};

export const fetchJobs = async (): Promise<SelectyJobResponse[]> => {
  try {
    const portalName = 'metarh'; 
    let allRawJobs: any[] = [];
    let currentPage = 1;
    let shouldFetch = true;
    
    // Loop "Fetch Until Empty" - Garante capturar todas as vagas sem depender de metadados
    while (shouldFetch) {
        const timestamp = new Date().getTime();
        const url = `${API_BASE_URL}/jobfeed/index?portal=${portalName}&per_page=100&page=${currentPage}&_t=${timestamp}`;
        
        console.log(`Buscando página ${currentPage} de vagas...`);

        const jsonData = await fetchWithFallback(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Api-Key': SELECTY_API_TOKEN,
            }
        });

        let pageData: any[] = [];
        if (jsonData && Array.isArray(jsonData.data)) {
            pageData = jsonData.data;
        } else if (Array.isArray(jsonData)) {
            pageData = jsonData;
        }

        if (pageData && pageData.length > 0) {
            allRawJobs = [...allRawJobs, ...pageData];
            // Se recebemos menos que o limite (100), significa que é a última página
            if (pageData.length < 100) {
                shouldFetch = false;
            } else {
                currentPage++;
            }
        } else {
            shouldFetch = false;
        }

        // Limite de segurança para evitar loops infinitos em caso de erro na API
        if (currentPage > 20) shouldFetch = false;
    } 

    console.log(`Sucesso! ${allRawJobs.length} vagas encontradas no total.`);

    const mappedJobs = allRawJobs.map((item: any) => {
      if (!item) return null;
      
      let city = '';
      let state = '';
      if (item.location) {
        const parts = item.location.split('-').map((s: string) => s.trim());
        city = parts[0];
        if (parts.length > 1) state = parts[1];
      }

      let contractType = item.contractType || '';
      contractType = contractType.replace(/['"]+/g, '');

      let fullDesc = processDescription(item.description || '');
      
      if (item.requirements) fullDesc += `<br><br><h3><strong>Requisitos</strong></h3>${formatPlainTextToHtml(item.requirements)}`;
      if (item.education) fullDesc += `<br><br><h3><strong>Escolaridade</strong></h3>${formatPlainTextToHtml(item.education)}`;
      if (item.qualification) fullDesc += `<br><br><h3><strong>Qualificações</strong></h3>${formatPlainTextToHtml(item.qualification)}`;
      if (item.benefits) fullDesc += `<br><br><h3><strong>Benefícios</strong></h3>${formatPlainTextToHtml(item.benefits)}`;
      if (item.workSchedule) fullDesc += `<br><br><h3><strong>Horário de Trabalho</strong></h3>${formatPlainTextToHtml(item.workSchedule)}`;

      const summaryText = stripHtml(item.description || ''); 
      let title = item.title || 'Vaga sem título';
      title = title.replace(/^Vaga para\s+/i, '');
      const id = item.id || Math.random().toString(36).substr(2, 9);
      const department = item.actingArea || item.occupation || 'Geral';

      return {
        id: id,
        title: title,
        description: fullDesc,
        summary: summaryText,
        city: city,
        state: state,
        department: department,
        contract_type: contractType,
        published_at: item.publicationDate || item.created_at,
        url_apply: item.subscriptionUrl || item.url,
        remote: !!(item.title?.toLowerCase().includes('remoto') || item.location?.toLowerCase().includes('remoto'))
      };
    }).filter(item => item !== null) as SelectyJobResponse[];
    
    return mappedJobs.sort((a, b) => {
        const dateA = new Date(a.published_at || 0).getTime();
        const dateB = new Date(b.published_at || 0).getTime();
        return dateB - dateA;
    });

  } catch (error: any) {
    console.error("Erro fatal no serviço de vagas:", error);
    throw error; 
  }
};
