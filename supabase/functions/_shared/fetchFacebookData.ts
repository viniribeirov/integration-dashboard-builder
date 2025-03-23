
import { corsHeaders } from './cors.ts';

// Fetch data from Facebook Graph API
export async function fetchFacebookData(
  adAccountId: string, 
  since: string, 
  until: string, 
  level: 'campaign' | 'adset' | 'ad',
  token: string
) {
  console.log(`Fetching ${level} data for ${adAccountId} from ${since} to ${until}`);
  
  // Define fields to fetch based on the level
  const fields = [
    "spend", "ctr", "cpc", "cpm", "impressions", "clicks", "reach", "frequency",
    "view_content", "cost_per_view_content", "add_to_cart", "cost_per_add_to_cart",
    "initiate_checkout", "cost_per_initiate_checkout", "purchase", "purchase_value",
    "cost_per_purchase", "roas"
  ];

  // Additional fields based on level
  if (level === 'campaign' || level === 'adset') {
    fields.push("daily_budget", "lifetime_budget");
  }

  // Add object-specific fields
  let endpoint = '';
  let extraFields = '';
  
  if (level === 'campaign') {
    endpoint = `${adAccountId}/campaigns`;
    extraFields = 'name,status,objective,id';
  } else if (level === 'adset') {
    endpoint = `${adAccountId}/adsets`;
    extraFields = 'name,status,objective,id,campaign_id';
  } else if (level === 'ad') {
    endpoint = `${adAccountId}/ads`;
    extraFields = 'name,status,objective,id,adset_id';
  }

  // Build the insights URL with time range and increment
  const insightsUrl = new URL(`https://graph.facebook.com/v18.0/${endpoint}`);
  insightsUrl.searchParams.append('access_token', token);
  insightsUrl.searchParams.append('fields', `insights.time_range({"since":"${since}","until":"${until}"}).time_increment(1){${fields.join(',')}},${extraFields}`);
  insightsUrl.searchParams.append('limit', '500');

  try {
    console.log(`Request URL: ${insightsUrl.toString().replace(token, 'TOKEN_HIDDEN')}`);
    
    const response = await fetch(insightsUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Facebook API Error (${response.status}): ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('Facebook token unauthorized or expired');
      }
      
      throw new Error(`Failed to fetch ${level} data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${level} data: ${data.data ? data.data.length : 0} items`);
    
    // Process the data to extract insights with date and entity info
    const processedData = [];
    
    for (const item of data.data || []) {
      const entityId = item.id;
      const entityName = item.name;
      const entityStatus = item.status;
      const objective = item.objective;
      const campaignId = item.campaign_id;
      const adsetId = item.adset_id;
      
      // Skip items without insights
      if (!item.insights || !item.insights.data) {
        console.log(`No insights data for ${level} ${entityId}`);
        continue;
      }
      
      // Process each day of insights
      for (const insight of item.insights.data) {
        processedData.push({
          id: entityId,
          name: entityName,
          status: entityStatus,
          objective: objective,
          campaign_id: campaignId, // Only for adsets and ads
          adset_id: adsetId, // Only for ads
          date: insight.date_start,
          daily_budget: insight.daily_budget,
          lifetime_budget: insight.lifetime_budget,
          spend: insight.spend,
          ctr: insight.ctr,
          cpc: insight.cpc,
          cpm: insight.cpm,
          impressions: insight.impressions,
          clicks: insight.clicks,
          reach: insight.reach,
          frequency: insight.frequency,
          view_content: insight.view_content,
          cost_per_view_content: insight.cost_per_view_content,
          add_to_cart: insight.add_to_cart,
          cost_per_add_to_cart: insight.cost_per_add_to_cart,
          initiate_checkout: insight.initiate_checkout,
          cost_per_initiate_checkout: insight.cost_per_initiate_checkout,
          purchase: insight.purchase,
          purchase_value: insight.purchase_value,
          cost_per_purchase: insight.cost_per_purchase,
          roas: insight.roas
        });
      }
    }
    
    console.log(`Processed ${processedData.length} daily records for ${level}`);
    return processedData;
  } catch (error) {
    console.error(`Error fetching ${level} data:`, error);
    throw error;
  }
}
