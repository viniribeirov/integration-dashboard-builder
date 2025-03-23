
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Save Facebook data to Supabase
export async function saveFacebookData(
  level: 'campaign' | 'adset' | 'ad',
  data: any[],
  projectId: string,
  adAccountId: string
) {
  if (!data || data.length === 0) {
    console.log(`No ${level} data to save`);
    return { inserted: 0, updated: 0 };
  }

  console.log(`Preparing to save ${data.length} ${level} records to Supabase`);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let tableName: string;
  
  // Determine table based on level
  if (level === 'campaign') {
    tableName = 'facebook_campaigns';
  } else if (level === 'adset') {
    tableName = 'facebook_adsets';
  } else if (level === 'ad') {
    tableName = 'facebook_ads';
  } else {
    throw new Error(`Invalid level: ${level}`);
  }
  
  // Enrich data with project_id and ad_account_id
  const enrichedData = data.map(item => ({
    ...item,
    project_id: projectId,
    ad_account_id: adAccountId
  }));
  
  console.log(`Upserting ${enrichedData.length} records to ${tableName}`);
  
  try {
    // Use upsert with conflict handling on composite key
    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(enrichedData, { 
        onConflict: 'id,date,ad_account_id,project_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error(`Error saving ${level} data:`, error);
      throw error;
    }
    
    console.log(`Successfully saved ${level} data`);
    return { inserted: enrichedData.length, updated: 0 };
  } catch (error) {
    console.error(`Error in saveFacebookData for ${level}:`, error);
    throw error;
  }
}
