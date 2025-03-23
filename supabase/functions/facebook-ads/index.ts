
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const FACEBOOK_API_VERSION = "v18.0";
const FACEBOOK_API_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  business_name?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget: number;
  lifetime_budget: number;
  insights?: any;
}

interface AdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  daily_budget: number;
  lifetime_budget: number;
  objective: string;
  insights?: any;
}

interface Ad {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  insights?: any;
}

interface ResponseData {
  data: AdAccount[] | Campaign[] | AdSet[] | Ad[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

interface SyncRequest {
  adAccountId: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

interface AdInsight {
  date_start: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  reach: string;
  frequency: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  action_values?: Array<{
    action_type: string;
    value: string;
  }>;
  cost_per_action_type?: Array<{
    action_type: string;
    value: string;
  }>;
}

// Helper function to process actions from insights
function processActions(insights: AdInsight) {
  const result = {
    view_content: 0,
    cost_per_view_content: 0,
    add_to_cart: 0,
    cost_per_add_to_cart: 0,
    initiate_checkout: 0, 
    cost_per_initiate_checkout: 0,
    purchase: 0,
    purchase_value: 0,
    cost_per_purchase: 0,
    roas: 0
  };
  
  if (!insights.actions) return result;
  
  // Process action counts
  insights.actions.forEach(action => {
    if (action.action_type === 'view_content') {
      result.view_content = parseInt(action.value) || 0;
    } else if (action.action_type === 'add_to_cart') {
      result.add_to_cart = parseInt(action.value) || 0;
    } else if (action.action_type === 'initiate_checkout') {
      result.initiate_checkout = parseInt(action.value) || 0;
    } else if (action.action_type === 'purchase') {
      result.purchase = parseInt(action.value) || 0;
    }
  });
  
  // Process action values
  if (insights.action_values) {
    insights.action_values.forEach(action => {
      if (action.action_type === 'purchase') {
        result.purchase_value = parseFloat(action.value) || 0;
        
        // Calculate ROAS
        const spend = parseFloat(insights.spend) || 0;
        if (spend > 0) {
          result.roas = result.purchase_value / spend;
        }
      }
    });
  }
  
  // Process cost per action type
  if (insights.cost_per_action_type) {
    insights.cost_per_action_type.forEach(action => {
      if (action.action_type === 'view_content') {
        result.cost_per_view_content = parseFloat(action.value) || 0;
      } else if (action.action_type === 'add_to_cart') {
        result.cost_per_add_to_cart = parseFloat(action.value) || 0;
      } else if (action.action_type === 'initiate_checkout') {
        result.cost_per_initiate_checkout = parseFloat(action.value) || 0;
      } else if (action.action_type === 'purchase') {
        result.cost_per_purchase = parseFloat(action.value) || 0;
      }
    });
  }
  
  return result;
}

serve(async (req) => {
  console.log("Função facebook-ads foi chamada:", req.method, req.url);
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body as JSON
    let requestData;
    try {
      if (req.method === "POST") {
        requestData = await req.json();
        console.log("POST data recebido:", requestData);
      } else if (req.method === "GET") {
        // For GET requests, try to parse URL parameters
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams.entries());
        requestData = params;
        console.log("GET params recebidos:", requestData);
      }
    } catch (parseError) {
      console.error("Erro ao parsear request:", parseError);
      requestData = {};
    }

    // Use the endpoint from the request data
    const endpoint = requestData?.endpoint;
    console.log("Endpoint solicitado:", endpoint);

    // Get the Facebook permanent token from Edge Function secrets
    const token = Deno.env.get("FACEBOOK_PERMANENT_TOKEN");
    if (!token) {
      console.error("FACEBOOK_PERMANENT_TOKEN não está configurado");
      return new Response(
        JSON.stringify({ error: "Token não configurado" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Token encontrado, tamanho:", token.length);

    if (endpoint === "get-ad-accounts") {
      console.log("Buscando contas de anúncios...");
      // Fetch ad accounts from Facebook API
      const apiUrl = `${FACEBOOK_API_BASE_URL}/me/adaccounts?fields=name,account_id,account_status,currency,business_name&access_token=${token}`;
      console.log("URL da API:", apiUrl);
      
      const response = await fetch(apiUrl, { method: "GET" });

      console.log("Status da resposta Facebook:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Facebook API error:", errorData);
        return new Response(
          JSON.stringify({ 
            error: "Erro ao consultar contas de anúncios", 
            details: errorData 
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const data: ResponseData = await response.json();
      console.log("Dados recebidos do Facebook:", JSON.stringify(data).substring(0, 200) + "...");
      
      // Format the ad accounts data
      const formattedAccounts = data.data.map(account => ({
        id: account.id,
        name: account.name || account.business_name || "Conta sem nome",
        accountId: account.account_id,
        status: getAccountStatus(account.account_status),
        currency: account.currency
      }));

      console.log("Contas formatadas:", formattedAccounts.length, "contas encontradas");
      
      return new Response(
        JSON.stringify({ accounts: formattedAccounts }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else if (endpoint === "sync-data") {
      const { adAccountId, projectId, startDate, endDate } = requestData as SyncRequest;
      
      if (!adAccountId || !projectId) {
        return new Response(
          JSON.stringify({ error: "adAccountId e projectId são obrigatórios" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      console.log(`Sincronizando dados: Conta ${adAccountId}, Projeto ${projectId}, Período ${startDate} até ${endDate}`);
      
      // Fetch campaigns, their insights, and process data
      const campaignsResult = await fetchCampaigns(adAccountId, token, startDate, endDate, projectId);
      
      // Fetch ad sets data
      const adsetsResult = await fetchAdSets(adAccountId, token, startDate, endDate, projectId);
      
      // Fetch ads data
      const adsResult = await fetchAds(adAccountId, token, startDate, endDate, projectId);
      
      return new Response(
        JSON.stringify({ 
          campaigns: campaignsResult.processed,
          adsets: adsetsResult.processed,
          ads: adsResult.processed,
          campaignsCount: campaignsResult.total,
          adsetsCount: adsetsResult.total,
          adsCount: adsResult.total,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Endpoint não encontrado" }),
      { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro no servidor", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to interpret account status code
function getAccountStatus(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return "active";
    case 2:
      return "disabled";
    case 3:
      return "unsettled";
    case 7:
      return "pending_risk_review";
    case 8:
      return "pending_settlement";
    case 9:
      return "in_grace_period";
    case 100:
      return "pending_closure";
    case 101:
      return "closed";
    case 201:
      return "any_active";
    case 202:
      return "any_closed";
    default:
      return "unknown";
  }
}

// Function to fetch campaign data
async function fetchCampaigns(adAccountId: string, token: string, startDate: string, endDate: string, projectId: string) {
  const campaignsUrl = `${FACEBOOK_API_BASE_URL}/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${token}`;
  
  console.log("Buscando campanhas:", campaignsUrl);
  const campaignsResponse = await fetch(campaignsUrl);
  const campaignsData: ResponseData = await campaignsResponse.json();
  
  if (!campaignsData.data) {
    console.error("Erro ao buscar campanhas:", campaignsData);
    return { processed: [], total: 0 };
  }
  
  console.log(`Encontradas ${campaignsData.data.length} campanhas`);
  
  const processedCampaigns = [];
  
  // Process each campaign
  for (const campaign of campaignsData.data as Campaign[]) {
    // Fetch insights for this campaign
    const insightsUrl = `${FACEBOOK_API_BASE_URL}/${campaign.id}/insights?fields=impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,action_values,cost_per_action_type&time_range={"since":"${startDate}","until":"${endDate}"}&time_increment=1&access_token=${token}`;
    console.log(`Buscando insights para campanha ${campaign.id}`);
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    if (insightsData.data && insightsData.data.length > 0) {
      // Process each day's insights
      for (const insight of insightsData.data as AdInsight[]) {
        const actionMetrics = processActions(insight);
        
        processedCampaigns.push({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective || "",
          ad_account_id: adAccountId,
          project_id: projectId,
          date: insight.date_start,
          daily_budget: campaign.daily_budget ? parseInt(campaign.daily_budget) / 100 : null, // Convert from cents
          lifetime_budget: campaign.lifetime_budget ? parseInt(campaign.lifetime_budget) / 100 : null, // Convert from cents
          spend: parseFloat(insight.spend) || 0,
          impressions: parseInt(insight.impressions) || 0,
          clicks: parseInt(insight.clicks) || 0,
          ctr: parseFloat(insight.ctr) || 0,
          cpc: parseFloat(insight.cpc) || 0,
          cpm: parseFloat(insight.cpm) || 0,
          reach: parseInt(insight.reach) || 0,
          frequency: parseFloat(insight.frequency) || 0,
          ...actionMetrics
        });
      }
    } else {
      console.log(`Sem insights para campanha ${campaign.id}`);
    }
  }
  
  return { processed: processedCampaigns, total: campaignsData.data.length };
}

// Function to fetch ad sets data
async function fetchAdSets(adAccountId: string, token: string, startDate: string, endDate: string, projectId: string) {
  const adsetsUrl = `${FACEBOOK_API_BASE_URL}/${adAccountId}/adsets?fields=id,name,status,campaign_id,daily_budget,lifetime_budget,optimization_goal&access_token=${token}`;
  
  console.log("Buscando conjuntos de anúncios:", adsetsUrl);
  const adsetsResponse = await fetch(adsetsUrl);
  const adsetsData: ResponseData = await adsetsResponse.json();
  
  if (!adsetsData.data) {
    console.error("Erro ao buscar conjuntos de anúncios:", adsetsData);
    return { processed: [], total: 0 };
  }
  
  console.log(`Encontrados ${adsetsData.data.length} conjuntos de anúncios`);
  
  const processedAdsets = [];
  
  // Process each ad set
  for (const adset of adsetsData.data as AdSet[]) {
    // Fetch insights for this ad set
    const insightsUrl = `${FACEBOOK_API_BASE_URL}/${adset.id}/insights?fields=impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,action_values,cost_per_action_type&time_range={"since":"${startDate}","until":"${endDate}"}&time_increment=1&access_token=${token}`;
    console.log(`Buscando insights para conjunto de anúncios ${adset.id}`);
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    if (insightsData.data && insightsData.data.length > 0) {
      // Process each day's insights
      for (const insight of insightsData.data as AdInsight[]) {
        const actionMetrics = processActions(insight);
        
        processedAdsets.push({
          id: adset.id,
          name: adset.name,
          status: adset.status,
          campaign_id: adset.campaign_id,
          objective: adset.objective || "",
          ad_account_id: adAccountId,
          project_id: projectId,
          date: insight.date_start,
          daily_budget: adset.daily_budget ? parseInt(adset.daily_budget) / 100 : null, // Convert from cents
          lifetime_budget: adset.lifetime_budget ? parseInt(adset.lifetime_budget) / 100 : null, // Convert from cents
          spend: parseFloat(insight.spend) || 0,
          impressions: parseInt(insight.impressions) || 0,
          clicks: parseInt(insight.clicks) || 0,
          ctr: parseFloat(insight.ctr) || 0,
          cpc: parseFloat(insight.cpc) || 0,
          cpm: parseFloat(insight.cpm) || 0,
          reach: parseInt(insight.reach) || 0,
          frequency: parseFloat(insight.frequency) || 0,
          ...actionMetrics
        });
      }
    } else {
      console.log(`Sem insights para conjunto de anúncios ${adset.id}`);
    }
  }
  
  return { processed: processedAdsets, total: adsetsData.data.length };
}

// Function to fetch ads data
async function fetchAds(adAccountId: string, token: string, startDate: string, endDate: string, projectId: string) {
  const adsUrl = `${FACEBOOK_API_BASE_URL}/${adAccountId}/ads?fields=id,name,status,adset_id&access_token=${token}`;
  
  console.log("Buscando anúncios:", adsUrl);
  const adsResponse = await fetch(adsUrl);
  const adsData: ResponseData = await adsResponse.json();
  
  if (!adsData.data) {
    console.error("Erro ao buscar anúncios:", adsData);
    return { processed: [], total: 0 };
  }
  
  console.log(`Encontrados ${adsData.data.length} anúncios`);
  
  const processedAds = [];
  
  // Process each ad
  for (const ad of adsData.data as Ad[]) {
    // Fetch insights for this ad
    const insightsUrl = `${FACEBOOK_API_BASE_URL}/${ad.id}/insights?fields=impressions,clicks,ctr,cpc,cpm,spend,reach,frequency,actions,action_values,cost_per_action_type&time_range={"since":"${startDate}","until":"${endDate}"}&time_increment=1&access_token=${token}`;
    console.log(`Buscando insights para anúncio ${ad.id}`);
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    if (insightsData.data && insightsData.data.length > 0) {
      // Process each day's insights
      for (const insight of insightsData.data as AdInsight[]) {
        const actionMetrics = processActions(insight);
        
        processedAds.push({
          id: ad.id,
          name: ad.name,
          status: ad.status,
          adset_id: ad.adset_id,
          objective: "", // Ads don't have objective directly
          ad_account_id: adAccountId,
          project_id: projectId,
          date: insight.date_start,
          spend: parseFloat(insight.spend) || 0,
          impressions: parseInt(insight.impressions) || 0,
          clicks: parseInt(insight.clicks) || 0,
          ctr: parseFloat(insight.ctr) || 0,
          cpc: parseFloat(insight.cpc) || 0,
          cpm: parseFloat(insight.cpm) || 0,
          reach: parseInt(insight.reach) || 0,
          frequency: parseFloat(insight.frequency) || 0,
          ...actionMetrics
        });
      }
    } else {
      console.log(`Sem insights para anúncio ${ad.id}`);
    }
  }
  
  return { processed: processedAds, total: adsData.data.length };
}
