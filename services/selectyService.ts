
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
 * Tenta buscar os dados usando diferentes estratégias de contorno de CORS
 */
const fetchWithStrategy = async (targetUrl: string, token: string) => {
  const isVercel = window.location.hostname.includes('vercel.app');
  const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');

  // 1. ESTRATÉGIA A: PROXY REVERSO VERCEL (O padrão ouro)
  // Só funciona se o arquivo vercel.json estiver no deploy
  if (!isLocal) {
    try {
      console.log("🚀 Tentando via Vercel Reverse Proxy...");
      const vercelProxyUrl = targetUrl.replace(API_BASE_URL, '/api-selecty');
      const response = await fetch(vercelProxyUrl, {
        headers: { 'X-Api-Key': token }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Sucesso via Vercel Proxy!");
        return data;
      }
      console.warn(`Vercel Proxy retornou status: ${response.status}`);
    } catch (e) {
      console.warn("Vercel Proxy falhou, tentando fallback...");
    }
  }

  // 2. ESTRATÉGIA B: ALLORIGINS WRAPPER (O mais difícil de bloquear)
  // Ele encapsula o JSON dentro de outro JSON, o que engana a trava de segurança do navegador
  try {
    console.log("🔄 Tentando via AllOrigins Wrapper...");
    // Passamos o token na URL para máxima compatibilidade com proxies
    const urlWithToken = `${targetUrl}&api_key=${encodeURIComponent(token)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlWithToken)}&_t=${Date.now()}`;
    
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const wrapper = await response.json();
      if (wrapper && wrapper.contents) {
        // O AllOrigins entrega o resultado como uma string dentro de 'contents'
        const data = JSON.parse(wrapper.contents);
        console.log("✅ Sucesso via AllOrigins Wrapper!");
        return data;
      }
    }
  } catch (e) {
    console.warn("AllOrigins Wrapper falhou.");
  }

  // 3. ESTRATÉGIA C: CORSPROXY.IO (Simples)
  try {
    console.log("🔄 Tentando via CorsProxy.io...");
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, {
      headers: { 'X-Api-Key': token }
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("CorsProxy.io falhou.");
  }

  throw new Error("Não foi possível conectar à API de vagas. Por favor, verifique sua conexão ou tente novamente mais tarde.");
};

export const fetchJobs = async (): Promise<SelectyJobResponse[]> => {
  try {
    const portalName = 'metarh'; 
    // Buscamos 100 vagas de uma vez para evitar múltiplas chamadas de página que podem causar erros de CORS repetitivos
    const url = `${API_BASE_URL}/jobfeed/index?portal=${portalName}&per_page=100&page=1`;
    
    const jsonData = await fetchWithStrategy(url, SELECTY_API_TOKEN);

    let allRawJobs: any[] = [];
    if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
        allRawJobs = jsonData.data;
    } else if (Array.isArray(jsonData)) {
        allRawJobs = jsonData;
    }

    if (!allRawJobs || allRawJobs.length === 0) {
        console.warn("Nenhuma vaga encontrada na resposta.");
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
    console.error("Erro ao processar vagas:", error);
    throw error; 
  }
};
