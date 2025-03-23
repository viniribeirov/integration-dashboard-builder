
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
  thumbnail?: string;
}): Promise<Project | null> => {
  try {
    // Obtém o usuário atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const newProject = {
      name: projectData.name,
      description: projectData.description,
      user_id: session.user.id,
      status: projectData.status || 'active',
      thumbnail: projectData.thumbnail
    };
    
    // Insere o projeto no Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar projeto:', error);
      return null;
    }
    
    // Formata o resultado para o tipo Project
    return {
      ...data,
      integrations: [],
      owner_id: data.user_id
    };
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
    // Formata as atualizações para a estrutura do banco
    const projectUpdates = {
      ...updates,
      // Converte owner_id para user_id se presente
      ...(updates.owner_id && { user_id: updates.owner_id })
    };
    
    // Remove owner_id e integrations que não existem na tabela
    delete projectUpdates.owner_id;
    delete projectUpdates.integrations;
    
    // Atualiza o projeto no Supabase
    const { data, error } = await supabase
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      return null;
    }
    
    if (!data) {
      console.error(`Projeto ${id} não encontrado para atualização`);
      return null;
    }
    
    // Formata o resultado para o tipo Project
    return {
      ...data,
      integrations: [],
      owner_id: data.user_id
    };
  } catch (error) {
    console.error(`Erro ao atualizar projeto ${id}:`, error);
    return null;
  }
};

/**
 * Exclui um projeto
 * @param id ID do projeto a ser excluído
 * @returns true se bem sucedido, false caso contrário
 */
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao excluir projeto ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao excluir projeto ${id}:`, error);
    return false;
  }
};
