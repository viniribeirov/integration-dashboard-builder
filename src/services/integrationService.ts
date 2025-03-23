
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Delete an integration and all its related data
 * @param integrationId The ID of the integration to delete
 * @param projectId The ID of the project the integration belongs to
 * @returns Object indicating success or error
 */
export const deleteIntegration = async (
  integrationId: string,
  projectId: string
): Promise<DeleteResult> => {
  try {
    console.log(`Deleting integration ${integrationId} from project ${projectId}`);
    
    // Step 1: Check if it's a Facebook integration (we'll only delete Facebook data for now)
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('platform')
      .eq('id', integrationId)
      .single();
      
    if (integrationError) {
      console.error('Error fetching integration:', integrationError);
      return { success: false, error: 'Erro ao localizar integração' };
    }
    
    if (integration?.platform === 'facebook') {
      // Step 2: Delete Facebook ads data
      console.log('Deleting Facebook ads data...');
      const { error: adsError } = await supabase
        .from('facebook_ads')
        .delete()
        .eq('project_id', projectId);
        
      if (adsError) {
        console.error('Error deleting ads:', adsError);
        toast.error('Erro ao excluir anúncios');
      }
      
      // Step 3: Delete Facebook adsets data
      console.log('Deleting Facebook adsets data...');
      const { error: adsetsError } = await supabase
        .from('facebook_adsets')
        .delete()
        .eq('project_id', projectId);
        
      if (adsetsError) {
        console.error('Error deleting adsets:', adsetsError);
        toast.error('Erro ao excluir conjuntos de anúncios');
      }
      
      // Step 4: Delete Facebook campaigns data
      console.log('Deleting Facebook campaigns data...');
      const { error: campaignsError } = await supabase
        .from('facebook_campaigns')
        .delete()
        .eq('project_id', projectId);
        
      if (campaignsError) {
        console.error('Error deleting campaigns:', campaignsError);
        toast.error('Erro ao excluir campanhas');
      }
    }
    
    // Step 5: Finally delete the integration itself
    console.log('Deleting the integration...');
    const { error: deleteError } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId);
      
    if (deleteError) {
      console.error('Error deleting integration:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteIntegration:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};
