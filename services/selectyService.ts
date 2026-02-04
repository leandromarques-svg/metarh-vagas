
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
 * Função de Fetch ultra-resiliente focada em contornar CORS no Vercel
 */
const fetchWithRetry = async (targetUrl: string, token: string) => {
  // 1. TENTATIVA COM ALLORIGINS (MODO WRAPPER) - O mais seguro para CORS
  // Este método não envia cabeçalhos customizados diretamente para o proxy, 
  // evitando o erro de "preflight" (OPTIONS) que vimos nos logs.
  try {
    console.log("Tentando conexão via Proxy Seguro (AllOrigins Wrapper)...");
    
    // Tentamos passar o token na URL também, caso o proxy não suporte headers
    const urlWithToken = `${targetUrl}&api_key=${encodeURIComponent(token)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlWithToken)}&_t=${Date.now()}`;
    
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const wrapper = await response.json();
      if (wrapper && wrapper.contents) {
        // AllOrigins retorna o corpo da resposta original em 'contents' como string
        const data = JSON.parse(wrapper.contents);
        console.log("Conexão bem sucedida via AllOrigins!");
        return data;
      }
    }
  } catch (e) {
    console.warn("Proxy AllOrigins falhou ou retornou dados inválidos.");
  }

  // 2. TENTATIVA COM CODETABS (Fallback estável)
  try {
    console.log("Tentando conexão via Proxy Alternativo (CodeTabs)...");
    const codeTabsUrl = `https://api.codetabs.com/v1/proxy?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(codeTabsUrl, {
      headers: { 'X-Api-Key': token }
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("Proxy CodeTabs falhou.");
  }

  // 3. TENTATIVA COM CORSPROXY.IO (Último recurso)
  try {
    console.log("Tentando conexão via Proxy 3 (CorsProxy)...");
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, {
      method: 'GET',
      headers: { 'X-Api-Key': token }
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("Proxy 3 falhou.");
  }

  throw new Error("Não foi possível estabelecer uma conexão segura com o servidor de vagas (Erro de CORS).");
};

export const fetchJobs = async (): Promise<SelectyJobResponse[]> => {
  try {
    const portalName = 'metarh'; 
    const url = `${API_BASE_URL}/jobfeed/index?portal=${portalName}&per_page=100&page=1`;
    
    const jsonData = await fetchWithRetry(url, SELECTY_API_TOKEN);

    let allRawJobs: any[] = [];
    if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
        allRawJobs = jsonData.data;
    } else if (Array.isArray(jsonData)) {
        allRawJobs = jsonData;
    }

    if (allRawJobs.length === 0) {
        console.warn("Nenhuma vaga encontrada na resposta da API.");
        return [];
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

      const summaryText = stripHtml(item.description || '').substring(0, 160) + '...'; 

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
    console.error("Erro crítico na extração de vagas:", error);
    throw error; 
  }
};
