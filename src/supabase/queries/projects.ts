
import { supabase } from '../../integrations/supabase/client';
import { mockProjects } from '../../services/mockData';
import { Project } from '../../types';

/**
 * Busca todos os projetos do usuário atual
 * @returns Lista de projetos
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    // Verificamos se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return [];
    }

    // Agora busca-se os projetos do banco de dados
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
    
    // Adaptar formato para corresponder ao tipo Project
    const projects: Project[] = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      integrations: [], // Por enquanto não temos integrações
      status: 'active', // Por padrão todos projetos são ativos
      owner_id: item.user_id,
      thumbnail: item.logo_url // Usamos logo_url como thumbnail por enquanto
    }));
    
    return projects;
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
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      return null;
    }
    
    if (!data) return null;
    
    // Adaptar formato para corresponder ao tipo Project
    const project: Project = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      integrations: [], // Por enquanto não temos integrações
      status: 'active', // Por padrão todos projetos são ativos
      owner_id: data.user_id,
      thumbnail: data.logo_url // Usamos logo_url como thumbnail por enquanto
    };
    
    return project;
  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    return null;
  }
};
