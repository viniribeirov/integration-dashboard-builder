
import { supabase } from '../../integrations/supabase/client';
import { Project, Integration } from '../../types';

/**
 * Busca todos os projetos do usuário atual
 * @returns Lista de projetos
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    // Obtém o usuário atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('Usuário não autenticado');
      return [];
    }
    
    const userId = session.user.id;
    
    // Busca projetos do usuário autenticado no Supabase com suas integrações
    const { data, error } = await supabase
      .from('projects')
      .select('*, integrations(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
    
    // Retorna os projetos com suas integrações
    return data as Project[];
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return [];
  }
};

/**
 * Busca um projeto específico pelo ID
 * @param id ID do projeto
 * @returns Projeto ou null se não encontrado
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    // Busca projeto com suas integrações no Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*, integrations(*)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar projeto ${id} do Supabase:`, error);
      return null;
    }
    
    return data as Project;
  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    return null;
  }
};

/**
 * Busca as integrações de um projeto específico
 * @param projectId ID do projeto
 * @returns Lista de integrações
 */
export const getProjectIntegrations = async (projectId: string): Promise<Integration[]> => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('project_id', projectId);
      
    if (error) {
      console.error(`Erro ao buscar integrações do projeto ${projectId}:`, error);
      return [];
    }
    
    return data as Integration[];
  } catch (error) {
    console.error(`Erro ao buscar integrações do projeto ${projectId}:`, error);
    return [];
  }
};
