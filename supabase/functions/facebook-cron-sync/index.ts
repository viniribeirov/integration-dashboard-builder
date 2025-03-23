
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
    // Calculate dates - sync last 2 days
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const since = yesterday.toISOString().split('T')[0];
    const until = today.toISOString().split('T')[0];
    
    console.log(`Running cron sync for the last 2 days: ${since} to ${until}`);
    
    // Get Facebook token
    const token = Deno.env.get("FACEBOOK_PERMANENT_TOKEN");
    if (!token) {
      throw new Error("FACEBOOK_PERMANENT_TOKEN not configured");
    }
    
    // Get Supabase client to fetch active integrations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all active Facebook integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('project_id, account_name')
      .eq('platform', 'facebook')
      .eq('status', 'connected');
    
    if (integrationsError) {
      throw new Error(`Failed to fetch integrations: ${integrationsError.message}`);
    }
    
    if (!integrations || integrations.length === 0) {
      console.log("No active Facebook integrations found");
      return new Response(
        JSON.stringify({ success: true, message: "No active integrations to sync" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${integrations.length} active Facebook integrations`);
    const results = [];
    
    // Process each integration
    for (const integration of integrations) {
      const project_id = integration.project_id;
      // Extract ad_account_id from account_name (format: "Account Name (act_123456789)")
      const accountNameMatch = integration.account_name?.match(/\(act_(\d+)\)$/);
      
      if (!accountNameMatch) {
        console.warn(`Could not extract ad_account_id from account_name: ${integration.account_name}`);
        continue;
      }
      
      const ad_account_id = `act_${accountNameMatch[1]}`;
      console.log(`Processing integration for project ${project_id}, ad account ${ad_account_id}`);
      
      try {
        // Sync campaigns
        const campaignData = await fetchFacebookData(ad_account_id, since, until, 'campaign', token);
        const campaignResult = await saveFacebookData('campaign', campaignData, project_id, ad_account_id);
        
        // Sync ad sets
        const adsetData = await fetchFacebookData(ad_account_id, since, until, 'adset', token);
        const adsetResult = await saveFacebookData('adset', adsetData, project_id, ad_account_id);
        
        // Sync ads
        const adData = await fetchFacebookData(ad_account_id, since, until, 'ad', token);
        const adResult = await saveFacebookData('ad', adData, project_id, ad_account_id);
        
        // Update last_sync timestamp
        const { error: updateError } = await supabase
          .from('integrations')
          .update({ last_sync: new Date().toISOString() })
          .eq('project_id', project_id)
          .eq('platform', 'facebook');
        
        if (updateError) {
          console.warn(`Failed to update last_sync for project ${project_id}: ${updateError.message}`);
        }
        
        results.push({
          project_id,
          ad_account_id,
          success: true,
          summary: {
            campaigns: campaignResult,
            adsets: adsetResult,
            ads: adResult
          }
        });
      } catch (integrationError) {
        console.error(`Error syncing data for project ${project_id}, ad account ${ad_account_id}:`, integrationError);
        results.push({
          project_id,
          ad_account_id,
          success: false,
          error: integrationError.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Cron sync completed",
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in facebook-cron-sync function:", error);
    
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
