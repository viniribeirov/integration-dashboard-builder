
import { supabase } from '../../integrations/supabase/client';
import { Project } from '../../types';

/**
 * Cria um novo projeto para o usuário atual
 * @param projectData Dados do projeto a ser criado
 * @returns O projeto criado ou null em caso de erro
 */
export const createProject = async (projectData: {
  name: string;
  description: string;
  logo_url?: string;
  website_url?: string;
}): Promise<Project | null> => {
  try {
    // Verificamos se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const newProject = {
      name: projectData.name,
      description: projectData.description,
      logo_url: projectData.logo_url,
      website_url: projectData.website_url,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select('*')
      .single();
      
    if (error) {
      console.error('Erro ao criar projeto:', error);
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
    console.error('Erro ao criar projeto:', error);
    return null;
  }
};

/**
 * Atualiza um projeto existente
 * @param id ID do projeto a ser atualizado
 * @param updates Campos a serem atualizados
 * @returns O projeto atualizado ou null em caso de erro
 */
export const updateProject = async (
  id: string, 
  updates: Partial<{
    name: string;
    description: string;
    logo_url: string;
    website_url: string;
    status: 'active' | 'inactive' | 'pending';
  }>
): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
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
      status: 'active', // Definimos como active por padrão
      owner_id: data.user_id,
      thumbnail: data.logo_url // Usamos logo_url como thumbnail por enquanto
    };
    
    return project;
  } catch (error) {
    console.error(`Erro ao atualizar projeto ${id}:`, error);
    return null;
  }
};
