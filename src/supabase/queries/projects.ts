
import { supabase } from '../../integrations/supabase/client';
import { Project } from '../../types';

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
    
    // Busca projetos do usuário autenticado no Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
    
    // Formatar para o tipo Project
    return data.map(project => ({
      ...project,
      integrations: [],
      // Garantir que o status seja um dos tipos permitidos
      status: (project.status as 'active' | 'inactive' | 'pending' | null) || null
    }));
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
    // Busca projeto no Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error(`Erro ao buscar projeto ${id} do Supabase:`, error);
      return null;
    }
    
    if (!data) {
      console.warn(`Projeto ${id} não encontrado no Supabase`);
      return null;
    }
    
    // Formatar para o tipo Project
    return {
      ...data,
      integrations: [],
      // Garantir que o status seja um dos tipos permitidos
      status: (data.status as 'active' | 'inactive' | 'pending' | null) || null
    };
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
export const getProjectIntegrations = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('project_id', projectId);
      
    if (error) {
      console.error(`Erro ao buscar integrações do projeto ${projectId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar integrações do projeto ${projectId}:`, error);
    return [];
  }
};
