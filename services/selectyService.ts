
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
 * Handles bullet points and line breaks better.
 */
const formatPlainTextToHtml = (text: string) => {
  if (!text) return '';

  let formatted = text;

  // 1. Tentar identificar listas com marcadores comuns (-, *, •) que estejam "colados" no texto anterior
  // Ex: "Texto anterior - Item 1" vira "Texto anterior<br> - Item 1"
  formatted = formatted.replace(/([^\n>])\s*([•·*-])\s+/g, '$1<br/>$2 ');

  // 2. Identificar finais de frase com pontuação seguidos de letra maiúscula colada (erro comum de copy-paste)
  // Cuidado: isso pode quebrar nomes próprios, então usamos apenas se tiver pontuação clara (.!?:)
  // Ex: "Fim da frase.Inicio da outra" -> "Fim da frase.<br>Inicio da outra"
  // Essa regex procura: ponto, espaço opcional, quebra de linha opcional, seguida de maiúscula.
  // Simplificado para apenas garantir quebras em quebras de linha reais.

  // 3. Converter quebras de linha padrão (\n) em <br />
  formatted = formatted.replace(/\r\n|\r|\n/g, '<br />');

  return formatted;
};

/**
 * Process description to ensure line breaks are respected
 * If the text doesn't contain explicit block HTML tags, we convert newlines to <br>
 */
const processDescription = (text: string) => {
  if (!text) return '';

  // Check if text contains common block-level HTML tags or explicit breaks
  // If it DOES NOT contain <p>, <div>, <br>, or <ul>/<li>, treat it as plain text needing formatting
  const hasBlockTags = /<\s*(p|div|br|ul|ol|li|h[1-6])\b[^>]*>/i.test(text);

  if (!hasBlockTags) {
    return formatPlainTextToHtml(text);
  }

  // Mesmo se tiver tags, às vezes o conteúdo dentro das tags é texto puro sem quebras
  // Se detectarmos blocos de texto muito longos sem tags, podemos tentar formatar
  return text;
};

/**
 * Tries to fetch data using multiple strategies to bypass CORS and network restrictions.
 */
const fetchWithFallback = async (targetUrl: string, options: RequestInit) => {
  // Strategy 1: Direct fetch (Works if CORS is allowed on server)
  try {
    const response = await fetch(targetUrl, options);
    if (response.ok) return await response.json();
    // If 401/403, it's auth error, no need to proxy. If 0/Network, it's CORS.
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Acesso negado pela API (${response.status}). Verifique o Token.`);
    }
  } catch (e) {
    console.log("Tentativa direta falhou (provável CORS), iniciando estratégias de proxy...");
  }

  // Strategy 2: Proxies
  // Note: corsproxy.io is now paid/restricted. using thingproxy as backup.
  // Ideally, you should use a backend proxy (e.g. Vercel Rewrites, Netlify Redirects) in production
  // instead of relying on public CORS proxies which are unreliable.
  const proxies = [
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  let lastError;

  for (const createProxyUrl of proxies) {
    try {
      const proxyUrl = createProxyUrl(targetUrl);

      const response = await fetch(proxyUrl, {
        ...options,
      });

      if (response.ok) {
        return await response.json();
      }

      console.warn(`Proxy retornou erro: ${response.status}`);
      lastError = new Error(`Proxy error: ${response.status}`);
    } catch (e) {
      console.warn("Falha na tentativa de proxy:", e);
      lastError = e;
    }
  }

  throw new Error(
    "Falha de Conexão (CORS/Bloqueio): O ambiente atual não permite acesso direto à API e os proxies públicos falharam. " +
    "Se estiver em Produção, configure um Proxy/Rewrite no servidor (ex: Vercel Rewrites, Nginx). " +
    "Se estiver Local, verifique se o Proxy do Vite está ativo."
  );
};

export const fetchJobs = async (): Promise<SelectyJobResponse[]> => {
  try {
    const portalName = 'metarh';
    let allRawJobs: any[] = [];
    let currentPage = 1;
    let shouldFetch = true;

    // Loop para buscar TODAS as páginas (Fetch Until Empty)
    // Ignora 'last_page' da API e confia na presença de dados
    while (shouldFetch) {
      const timestamp = new Date().getTime();
      // Aumentado per_page para 100 para reduzir requisições
      const url = `${API_BASE_URL}/jobfeed/index?portal=${portalName}&per_page=100&page=${currentPage}&_t=${timestamp}`;

      console.log(`Buscando página ${currentPage}...`);

      const jsonData = await fetchWithFallback(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': SELECTY_API_TOKEN,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      let pageData: any[] = [];

      // Handle Selecty Response Structure
      if (jsonData && Array.isArray(jsonData.data)) {
        pageData = jsonData.data;
      } else if (Array.isArray(jsonData)) {
        pageData = jsonData;
      }

      if (pageData.length > 0) {
        allRawJobs = [...allRawJobs, ...pageData];
        currentPage++;
      } else {
        // Se a lista veio vazia, acabaram as páginas
        shouldFetch = false;
      }

      // Safety break (max 50 pages * 100 jobs = 5000 jobs)
      if (currentPage > 50) shouldFetch = false;
    }

    console.log(`Total de vagas carregadas: ${allRawJobs.length}`);

    // Map Selecty API fields (JobFeed format) to our app's interface
    const mappedJobs = allRawJobs.map((item: any) => {
      if (!item) return null;

      // Jobfeed provides location like "Curitiba - PR"
      let city = '';
      let state = '';
      if (item.location) {
        const parts = item.location.split('-').map((s: string) => s.trim());
        city = parts[0];
        if (parts.length > 1) state = parts[1];
      }

      // Jobfeed contractType often comes with quotes e.g. "\"CLT (Efetivo)\""
      let contractType = item.contractType || '';
      contractType = contractType.replace(/['"]+/g, '');

      // Build the FULL description by concatenating fields

      // Apply processing to main description to fix missing line breaks
      let fullDesc = processDescription(item.description || '');

      if (item.requirements) {
        fullDesc += `<br><br><h3><strong>Requisitos</strong></h3>${formatPlainTextToHtml(item.requirements)}`;
      }

      if (item.education) {
        fullDesc += `<br><br><h3><strong>Escolaridade</strong></h3>${formatPlainTextToHtml(item.education)}`;
      }

      if (item.qualification) {
        fullDesc += `<br><br><h3><strong>Qualificações</strong></h3>${formatPlainTextToHtml(item.qualification)}`;
      }

      if (item.benefits) {
        fullDesc += `<br><br><h3><strong>Benefícios</strong></h3>${formatPlainTextToHtml(item.benefits)}`;
      }

      if (item.workSchedule) {
        fullDesc += `<br><br><h3><strong>Horário de Trabalho</strong></h3>${formatPlainTextToHtml(item.workSchedule)}`;
      }

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

    // Sort by publication date (newest first) to ensure fresh jobs appear at top
    return mappedJobs.sort((a, b) => {
      const dateA = new Date(a.published_at || 0).getTime();
      const dateB = new Date(b.published_at || 0).getTime();
      return dateB - dateA;
    });

  } catch (error: any) {
    console.error("Erro no serviço de vagas:", error);
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
      throw new Error("Não foi possível conectar à Selecty devido a bloqueios de rede. Tentando reconexão...");
    }
    throw error;
  }
};
