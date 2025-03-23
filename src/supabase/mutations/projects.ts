
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
  status?: 'active' | 'inactive' | 'pending';
}): Promise<Project | null> => {
  try {
    // Por enquanto apenas simulamos a criação
    // Em uma implementação futura, usaremos o cliente Supabase:
    
    /*
    const newProject = {
      ...projectData,
      owner_id: user.id,
      status: projectData.status || 'active'
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
    */
    
    // Simulação de criação
    const newId = Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    
    const mockProject: Project = {
      id: newId,
      name: projectData.name,
      description: projectData.description,
      created_at: now,
      updated_at: now,
      integrations: [],
      status: projectData.status || 'active',
      owner_id: 'user-1', // ID fixo para mock
      thumbnail: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2006&auto=format&fit=crop'
    };
    
    console.log('Projeto simulado criado:', mockProject);
    return mockProject;
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
  updates: Partial<Omit<Project, 'id' | 'created_at' | 'owner_id'>>
): Promise<Project | null> => {
  try {
    // Em uma implementação futura, usaremos o cliente Supabase:
    
    /*
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, integrations(*)')
      .single();
      
    if (error) throw error;
    return data;
    */
    
    // Simulação de atualização
    console.log(`Simulação: projeto ${id} atualizado com`, updates);
    return {
      id,
      name: updates.name || 'Projeto Atualizado',
      description: updates.description || 'Descrição atualizada',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
      integrations: [],
      status: updates.status || 'active',
      owner_id: 'user-1',
      thumbnail: updates.thumbnail
    };
  } catch (error) {
    console.error(`Erro ao atualizar projeto ${id}:`, error);
    return null;
  }
};
