
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchFacebookData } from "../_shared/fetchFacebookData.ts";
import { saveFacebookData } from "../_shared/saveFacebookData.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get request data
    const requestData = await req.json();
    console.log("Received request:", JSON.stringify(requestData));
    
    const { project_id, ad_account_id, date_range } = requestData;
    
    if (!project_id || !ad_account_id) {
      throw new Error("Missing required parameters: project_id and ad_account_id");
    }
    
    // Get Facebook token
    const token = Deno.env.get("FACEBOOK_PERMANENT_TOKEN");
    if (!token) {
      throw new Error("FACEBOOK_PERMANENT_TOKEN not configured");
    }
    
    // Default to last 30 days if no date range provided
    const today = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(today.getDate() - 30);
    
    const since = date_range?.since || defaultStartDate.toISOString().split('T')[0];
    const until = date_range?.until || today.toISOString().split('T')[0];
    
    console.log(`Syncing Facebook data for account ${ad_account_id} from ${since} to ${until}`);
    
    // Fetch and save data for each level
    try {
      // Campaigns
      const campaignData = await fetchFacebookData(ad_account_id, since, until, 'campaign', token);
      const campaignResult = await saveFacebookData('campaign', campaignData, project_id, ad_account_id);
      console.log(`Campaign sync complete: ${JSON.stringify(campaignResult)}`);
      
      // Ad Sets
      const adsetData = await fetchFacebookData(ad_account_id, since, until, 'adset', token);
      const adsetResult = await saveFacebookData('adset', adsetData, project_id, ad_account_id);
      console.log(`Ad Set sync complete: ${JSON.stringify(adsetResult)}`);
      
      // Ads
      const adData = await fetchFacebookData(ad_account_id, since, until, 'ad', token);
      const adResult = await saveFacebookData('ad', adData, project_id, ad_account_id);
      console.log(`Ad sync complete: ${JSON.stringify(adResult)}`);
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: "Data sync completed successfully",
          summary: {
            campaigns: campaignResult,
            adsets: adsetResult,
            ads: adResult
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (syncError) {
      console.error("Error syncing data:", syncError);
      throw syncError;
    }
  } catch (error) {
    console.error("Error in facebook-sync-data function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
