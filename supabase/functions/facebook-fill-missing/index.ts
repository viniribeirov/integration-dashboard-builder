
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchFacebookData } from "../_shared/fetchFacebookData.ts";
import { saveFacebookData } from "../_shared/saveFacebookData.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get request data
    const requestData = await req.json();
    console.log("Received request:", JSON.stringify(requestData));
    
    const { project_id, ad_account_id, dates } = requestData;
    
    if (!project_id || !ad_account_id || !dates || !Array.isArray(dates) || dates.length === 0) {
      throw new Error("Missing or invalid parameters: project_id, ad_account_id, and dates array required");
    }
    
    // Get Facebook token
    const token = Deno.env.get("FACEBOOK_PERMANENT_TOKEN");
    if (!token) {
      throw new Error("FACEBOOK_PERMANENT_TOKEN not configured");
    }
    
    // Get Supabase client to check existing data
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results = [];
    
    // Check each date for existing data across all levels
    for (const date of dates) {
      console.log(`Checking data for date: ${date}`);
      
      // Check campaigns
      const { data: existingCampaigns } = await supabase
        .from('facebook_campaigns')
        .select('id')
        .eq('project_id', project_id)
        .eq('ad_account_id', ad_account_id)
        .eq('date', date)
        .limit(1);
      
      // Check ad sets
      const { data: existingAdsets } = await supabase
        .from('facebook_adsets')
        .select('id')
        .eq('project_id', project_id)
        .eq('ad_account_id', ad_account_id)
        .eq('date', date)
        .limit(1);
      
      // Check ads
      const { data: existingAds } = await supabase
        .from('facebook_ads')
        .select('id')
        .eq('project_id', project_id)
        .eq('ad_account_id', ad_account_id)
        .eq('date', date)
        .limit(1);
      
      const hasCampaigns = existingCampaigns && existingCampaigns.length > 0;
      const hasAdsets = existingAdsets && existingAdsets.length > 0;
      const hasAds = existingAds && existingAds.length > 0;
      
      // If data is missing for any level, fetch it
      if (!hasCampaigns || !hasAdsets || !hasAds) {
        console.log(`Missing data for date ${date}: campaigns=${!hasCampaigns}, adsets=${!hasAdsets}, ads=${!hasAds}`);
        
        try {
          const dateResult = {
            date,
            campaigns: { fetched: false },
            adsets: { fetched: false },
            ads: { fetched: false }
          };
          
          // Fetch campaign data if missing
          if (!hasCampaigns) {
            console.log(`Fetching missing campaign data for ${date}`);
            const campaignData = await fetchFacebookData(ad_account_id, date, date, 'campaign', token);
            const campaignResult = await saveFacebookData('campaign', campaignData, project_id, ad_account_id);
            dateResult.campaigns = { fetched: true, result: campaignResult };
          }
          
          // Fetch ad set data if missing
          if (!hasAdsets) {
            console.log(`Fetching missing ad set data for ${date}`);
            const adsetData = await fetchFacebookData(ad_account_id, date, date, 'adset', token);
            const adsetResult = await saveFacebookData('adset', adsetData, project_id, ad_account_id);
            dateResult.adsets = { fetched: true, result: adsetResult };
          }
          
          // Fetch ad data if missing
          if (!hasAds) {
            console.log(`Fetching missing ad data for ${date}`);
            const adData = await fetchFacebookData(ad_account_id, date, date, 'ad', token);
            const adResult = await saveFacebookData('ad', adData, project_id, ad_account_id);
            dateResult.ads = { fetched: true, result: adResult };
          }
          
          results.push({
            date,
            success: true,
            ...dateResult
          });
        } catch (dateError) {
          console.error(`Error processing date ${date}:`, dateError);
          results.push({
            date,
            success: false,
            error: dateError.message
          });
        }
      } else {
        console.log(`Data already exists for date ${date}, skipping`);
        results.push({
          date,
          success: true,
          skipped: true,
          reason: "Data already exists for all levels"
        });
      }
    }
    
    // Update last_sync timestamp
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('project_id', project_id)
      .eq('platform', 'facebook');
    
    if (updateError) {
      console.warn(`Failed to update last_sync for project ${project_id}: ${updateError.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Fill missing data operation completed",
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in facebook-fill-missing function:", error);
    
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
