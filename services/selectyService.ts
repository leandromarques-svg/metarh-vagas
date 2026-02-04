
import { SelectyJobResponse } from '../types';
import { SELECTY_API_TOKEN, API_BASE_URL } from '../constants';

const stripHtml = (html: string) => {
  if (!html) return '';
  try {
    return html.replace(/<[^>]*>?/gm, '') || '';
  } catch (e) {
    return '';
  }
};

const formatPlainTextToHtml = (text: string) => {
  if (!text) return '';
  let formatted = text;
  formatted = formatted.replace(/([^\n>])\s*([•·*-])\s+/g, '$1<br/>$2 ');
  formatted = formatted.replace(/\r\n|\r|\n/g, '<br />');
  return formatted;
};

const processDescription = (text: string) => {
    if (!text) return '';
    const hasBlockTags = /<\s*(p|div|br|ul|ol|li|h[1-6])\b[^>]*>/i.test(text);
    if (!hasBlockTags) {
        return formatPlainTextToHtml(text);
    }
    return text;
};

/**
 * Função de Fetch ultra-resiliente para produção (Vercel/Cloudflare/etc)
 */
const fetchWithRetry = async (targetUrl: string, token: string) => {
  const headers = {
    'Accept': 'application/json',
    'X-Api-Key': token,
  };

  // TENTATIVA 1: CorsProxy.io (Excelente para manter cabeçalhos customizados)
  try {
    console.log("Tentando conexão via Proxy 1 (CorsProxy)...");
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, {
      method: 'GET',
      headers: headers
    });
    if (response.ok) return await response.json();
    console.warn(`Proxy 1 falhou com status: ${response.status}`);
  } catch (e) {
    console.warn("Proxy 1 (CorsProxy) falhou.");
  }

  // TENTATIVA 2: AllOrigins (Modo Wrapper - Mais lento, mas muito estável)
  try {
    console.log("Tentando conexão via Proxy 2 (AllOrigins Wrapper)...");
    const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;
    const response = await fetch(allOriginsUrl);
    if (response.ok) {
      const wrapper = await response.json();
      // O AllOrigins retorna o JSON como string dentro de 'contents'
      return JSON.parse(wrapper.contents);
    }
  } catch (e) {
    console.warn("Proxy 2 (AllOrigins) falhou.");
  }

  // TENTATIVA 3: Direta (Alguns ambientes de deploy permitem se a API tiver CORS liberado)
  try {
    console.log("Tentando conexão direta...");
    const response = await fetch(targetUrl, { method: 'GET', headers: headers });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error("Conexão direta bloqueada pelo navegador (CORS).");
  }

  throw new Error("Não foi possível conectar à API de vagas. Por favor, verifique sua conexão ou tente novamente mais tarde.");
};

export const fetchJobs = async (): Promise<SelectyJobResponse[]> => {
  try {
    const portalName = 'metarh'; 
    let allRawJobs: any[] = [];
    
    // Para simplificar e evitar erros de loop no Vercel, buscamos as primeiras 100 vagas de uma vez
    // Já que você tem 25, isso garantirá que todas venham na primeira chamada.
    const url = `${API_BASE_URL}/jobfeed/index?portal=${portalName}&per_page=100&page=1&_cache=${Date.now()}`;
    
    const jsonData = await fetchWithRetry(url, SELECTY_API_TOKEN);

    if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
        allRawJobs = jsonData.data;
    } else if (Array.isArray(jsonData)) {
        allRawJobs = jsonData;
    }

    if (allRawJobs.length === 0) {
        console.warn("API retornou sucesso, mas a lista de vagas está vazia.");
    }

    const mappedJobs = allRawJobs.map((item: any) => {
      if (!item) return null;
      
      let city = 'Não informado';
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
      if (item.benefits) fullDesc += `<br><br><h3><strong>Benefícios</strong></h3>${formatPlainTextToHtml(item.benefits)}`;

      const summaryText = stripHtml(item.description || '').substring(0, 180) + '...'; 

      return {
        id: item.id || Math.random().toString(36).substr(2, 9),
        title: (item.title || 'Vaga de Emprego').replace(/^Vaga para\s+/i, ''),
        description: fullDesc,
        summary: summaryText,
        city: city,
        state: state,
        department: item.actingArea || item.occupation || 'Geral',
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
    console.error("Erro crítico ao buscar vagas:", error);
    throw error; 
  }
};
