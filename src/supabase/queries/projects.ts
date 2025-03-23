
import { supabase } from '../../integrations/supabase/client';
import { mockProjects } from '../../services/mockData';
import { Project } from '../../types';

/**
 * Busca todos os projetos do usuário atual
 * @returns Lista de projetos
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    // Por enquanto retornamos dados mockados
    // Em uma implementação futura, usaremos o cliente Supabase:
    
    /* 
    const { data, error } = await supabase
      .from('projects')
      .select('*, integrations(*)')
      .eq('owner_id', userId);
      
    if (error) throw error;
    return data;
    */
    
    return mockProjects;
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
    // Por enquanto, busca nos dados mockados
    // Em uma implementação futura, usaremos o cliente Supabase
    
    /*
    const { data, error } = await supabase
      .from('projects')
      .select('*, integrations(*)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
    */
    
    const project = mockProjects.find(project => project.id === id);
    return project || null;
  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    return null;
  }
};
