import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, parseISO, isAfter, isSameDay } from "date-fns";
import { Integration } from "../types";

export interface FacebookSyncParams {
  projectId: string;
  adAccountId: string;
  startDate: string;
  endDate: string;
  onProgress?: (progress: number, stage: string) => void;
}

export interface FacebookSyncResult {
  success: boolean;
  error?: string;
  stats?: {
    campaigns: number;
    adsets: number;
    ads: number;
    totalRecords: number;
  };
}

/**
 * Get dates that are missing in the database for a specific time range
 */
export const getMissingDates = async (
  projectId: string,
  adAccountId: string,
  startDate: string,
  endDate: string
): Promise<string[]> => {
  try {
    console.log(`Checking missing dates for project ${projectId}, account ${adAccountId} from ${startDate} to ${endDate}`);
    
    // Get all unique dates that exist in the campaigns table for this project/account
    const { data: existingDates, error } = await supabase
      .from('facebook_campaigns')
      .select('date')
      .eq('project_id', projectId)
      .eq('ad_account_id', adAccountId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
      
    if (error) {
      console.error("Error fetching existing dates:", error);
      return generateDateRange(startDate, endDate); // If error, sync all dates
    }
    
    // Create a Set of all existing dates for O(1) lookup
    const existingDatesSet = new Set(existingDates?.map(d => d.date) || []);
    
    // Generate all dates in the range
    const allDates = generateDateRange(startDate, endDate);
    
    // Filter out dates that already exist in the database
    const missingDates = allDates.filter(date => !existingDatesSet.has(date));
    
    console.log(`Found ${missingDates.length} missing dates out of ${allDates.length} total days`);
    
    // Always include today's date for re-sync (if it's in the range)
    const today = format(new Date(), 'yyyy-MM-dd');
    if (allDates.includes(today) && !missingDates.includes(today)) {
      missingDates.push(today);
      console.log(`Added today's date (${today}) for re-sync`);
    }
    
    return missingDates;
  } catch (error) {
    console.error("Error in getMissingDates:", error);
    return generateDateRange(startDate, endDate); // If error, sync all dates
  }
};

/**
 * Generate an array of dates between start and end dates (inclusive)
 */
export const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let currentDate = parseISO(startDate);
  const end = parseISO(endDate);
  
  while (!isAfter(currentDate, end)) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
  
  return dates;
};

/**
 * Get a default date range (last 30 days)
 */
export const getDefaultDateRange = (): { startDate: string, endDate: string } => {
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  
  return { startDate, endDate };
};

/**
 * Synchronize Facebook Ads data for a given project and date range
 */
export const syncFacebookAdsData = async (params: FacebookSyncParams): Promise<FacebookSyncResult> => {
  const { projectId, adAccountId, startDate, endDate, onProgress } = params;
  
  try {
    // Update progress
    onProgress?.(10, "Verificando datas existentes...");
    
    // Check which dates we need to sync
    const missingDates = await getMissingDates(projectId, adAccountId, startDate, endDate);
    
    if (missingDates.length === 0) {
      console.log("No missing dates to sync");
      onProgress?.(100, "Dados já sincronizados!");
      return { 
        success: true,
        stats: { campaigns: 0, adsets: 0, ads: 0, totalRecords: 0 }
      };
    }
    
    // For this implementation, we'll sync all dates at once
    onProgress?.(20, `Sincronizando ${missingDates.length} dia(s)...`);
    
    // Call the NEW Edge Function to fetch data
    const { data, error } = await supabase.functions.invoke('facebook-sync', {
      method: 'POST',
      body: { 
        projectId,
        adAccountId,
        startDate,
        endDate
      }
    });
    
    if (error) {
      console.error("Error invoking facebook-sync function:", error);
      onProgress?.(100, "Erro ao sincronizar dados");
      return { 
        success: false, 
        error: `Falha ao acessar função de sincronização: ${error.message}`
      };
    }
    
    if (!data) {
      console.error("No data returned from facebook-sync function");
      onProgress?.(100, "Erro ao sincronizar dados");
      return { 
        success: false, 
        error: "Nenhum dado retornado da função de sincronização" 
      };
    }
    
    onProgress?.(50, "Processando campanhas...");
    
    // Insert campaign data into the database
    const { campaigns, adsets, ads } = data;
    
    // Store campaigns
    if (campaigns && campaigns.length > 0) {
      const { error: campaignsError } = await supabase.from('facebook_campaigns').upsert(
        campaigns,
        { onConflict: 'id,date,ad_account_id,project_id' }
      );
      
      if (campaignsError) {
        console.error("Error inserting campaign data:", campaignsError);
      }
    }
    
    onProgress?.(70, "Processando conjuntos de anúncios...");
    
    // Store ad sets
    if (adsets && adsets.length > 0) {
      const { error: adsetsError } = await supabase.from('facebook_adsets').upsert(
        adsets,
        { onConflict: 'id,date,ad_account_id,project_id' }
      );
      
      if (adsetsError) {
        console.error("Error inserting adset data:", adsetsError);
      }
    }
    
    onProgress?.(90, "Processando anúncios...");
    
    // Store ads
    if (ads && ads.length > 0) {
      const { error: adsError } = await supabase.from('facebook_ads').upsert(
        ads,
        { onConflict: 'id,date,ad_account_id,project_id' }
      );
      
      if (adsError) {
        console.error("Error inserting ads data:", adsError);
      }
    }
    
    onProgress?.(100, "Sincronização concluída!");
    
    // Update last_sync timestamp for the integration
    await updateLastSync(projectId);
    
    return {
      success: true,
      stats: {
        campaigns: campaigns?.length || 0,
        adsets: adsets?.length || 0,
        ads: ads?.length || 0,
        totalRecords: (campaigns?.length || 0) + (adsets?.length || 0) + (ads?.length || 0)
      }
    };
    
  } catch (error) {
    console.error("Error syncing Facebook Ads data:", error);
    onProgress?.(100, "Erro ao sincronizar dados");
    return { 
      success: false, 
      error: `Erro ao sincronizar dados: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Update the last_sync timestamp for a Facebook integration
 */
const updateLastSync = async (projectId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('project_id', projectId)
      .eq('platform', 'facebook');
      
    if (error) {
      console.error("Error updating last_sync:", error);
    }
  } catch (error) {
    console.error("Error in updateLastSync:", error);
  }
};

/**
 * Check if a Facebook integration has a recent sync (within the last 4 hours)
 */
export const hasRecentSync = (integration: Integration | undefined): boolean => {
  if (!integration || !integration.last_sync) return false;
  
  const lastSyncDate = parseISO(integration.last_sync);
  const fourHoursAgo = new Date();
  fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);
  
  return isAfter(lastSyncDate, fourHoursAgo);
};

/**
 * Find the Facebook integration for a project
 */
export const findFacebookIntegration = (
  projectId: string | undefined, 
  integrations: Integration[] | undefined
): Integration | undefined => {
  if (!projectId || !integrations) return undefined;
  
  return integrations.find(
    integration => integration.project_id === projectId && integration.platform === 'facebook'
  );
};
