
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { project_id, platform, metrics, start_date, end_date } = await req.json();
    
    if (!project_id || !platform || !metrics || !start_date || !end_date) {
      throw new Error("Missing required parameters");
    }
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Call the database function to get the metrics
    const { data, error } = await supabase.rpc('get_dashboard_metrics', {
      p_project_id: project_id,
      p_platform: platform,
      p_metrics: metrics,
      p_start_date: start_date,
      p_end_date: end_date
    });
    
    if (error) {
      throw error;
    }
    
    // Return the metrics data
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
