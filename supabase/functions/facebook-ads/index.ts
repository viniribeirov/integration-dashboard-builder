
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

interface ResponseData {
  data: AdAccount[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body as JSON
    let requestData;
    if (req.method === "POST") {
      requestData = await req.json();
    } else if (req.method === "GET") {
      // For GET requests, try to parse URL parameters
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      requestData = params;
    }

    // Use the endpoint from the request data
    const endpoint = requestData?.endpoint;

    // Get the Facebook permanent token from Edge Function secrets
    const token = Deno.env.get("FACEBOOK_PERMANENT_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token não configurado" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (endpoint === "get-ad-accounts") {
      // Fetch ad accounts from Facebook API
      const response = await fetch(
        `${FACEBOOK_API_BASE_URL}/me/adaccounts?fields=name,account_id,account_status,currency,business_name&access_token=${token}`,
        { method: "GET" }
      );

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
      
      // Format the ad accounts data
      const formattedAccounts = data.data.map(account => ({
        id: account.id,
        name: account.name || account.business_name || "Conta sem nome",
        accountId: account.account_id,
        status: getAccountStatus(account.account_status),
        currency: account.currency
      }));

      return new Response(
        JSON.stringify({ accounts: formattedAccounts }),
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
