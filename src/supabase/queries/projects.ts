
import { supabase } from '../../integrations/supabase/client';
import { mockProjects } from '../../services/mockData';
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
      console.warn('Usuário não autenticado, retornando dados mockados');
      return mockProjects;
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
      return mockProjects;
    }
    
    if (!data || data.length === 0) {
      console.info('Nenhum projeto encontrado, retornando dados mockados');
      return mockProjects;
    }
    
    // Formatar para o tipo Project
    return data.map(project => ({
      ...project,
      integrations: [],
      // Garantir que o status seja um dos tipos permitidos
      status: (project.status as 'active' | 'inactive' | 'pending' | null) || 'active'
    }));
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return mockProjects;
  }
};

/**
 * Busca um projeto específico pelo ID
 * @param id ID do projeto
 * @returns Projeto ou null se não encontrado
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    // Tenta buscar do Supabase primeiro
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.warn(`Erro ao buscar projeto ${id} do Supabase:`, error);
      // Fallback para dados mockados
      const project = mockProjects.find(project => project.id === id);
      return project || null;
    }
    
    if (!data) {
      console.warn(`Projeto ${id} não encontrado no Supabase, buscando em mockados`);
      const project = mockProjects.find(project => project.id === id);
      return project || null;
    }
    
    // Formatar para o tipo Project
    return {
      ...data,
      integrations: [],
      // Garantir que o status seja um dos tipos permitidos
      status: (data.status as 'active' | 'inactive' | 'pending' | null) || 'active'
    };
  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    // Fallback para dados mockados
    const project = mockProjects.find(project => project.id === id);
    return project || null;
  }
};
