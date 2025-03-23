
import { supabase } from '../../integrations/supabase/client';
import { Project } from '../../types';

/**
 * Cria um novo projeto para o usuário atual
 * @param projectData Dados do projeto a ser criado
 * @returns O projeto criado ou null em caso de erro
 */
export const createProject = async (projectData: {
  name: string;
  description: string | null;
  status?: 'active' | 'inactive' | 'pending' | null;
  thumbnail?: string | null;
  thumbnailFile?: File | null;
}): Promise<Project | null> => {
  try {
    // Validar dados
    if (!projectData.name.trim()) {
      console.error('Nome do projeto não pode ser vazio');
      return null;
    }
    
    // Obtém o usuário atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const userId = session.user.id;
    
    let thumbnailUrl = projectData.thumbnail || null;
    
    // Upload da imagem se existir
    if (projectData.thumbnailFile) {
      const timestamp = new Date().getTime();
      const filePath = `logos/${userId}/${timestamp}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, projectData.thumbnailFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('project-assets')
          .getPublicUrl(uploadData.path);
        
        thumbnailUrl = urlData.publicUrl;
      }
    }
    
    const newProject = {
      name: projectData.name,
      description: projectData.description || null,
      user_id: userId,
      status: projectData.status || 'active',
      thumbnail: thumbnailUrl
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
      status: (data.status as 'active' | 'inactive' | 'pending' | null)
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
  updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'integrations'>> & { thumbnailFile?: File | null }
): Promise<Project | null> => {
  try {
    // Verifica se ao menos um campo foi fornecido
    if (Object.keys(updates).length === 0) {
      console.error('Nenhum campo fornecido para atualização');
      return null;
    }
    
    // Obtém o usuário atual para o upload da imagem
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const userId = session.user.id;
    
    // Cria uma cópia dos updates sem o campo thumbnailFile
    const projectUpdates = { ...updates };
    delete (projectUpdates as any).thumbnailFile;
    
    // Upload da imagem se existir
    if (updates.thumbnailFile) {
      const timestamp = new Date().getTime();
      const filePath = `logos/${userId}/${timestamp}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, updates.thumbnailFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('project-assets')
          .getPublicUrl(uploadData.path);
        
        projectUpdates.thumbnail = urlData.publicUrl;
      }
    }
    
    // Atualiza o projeto no Supabase
    const { data, error } = await supabase
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .select('*, integrations(*)')
      .single();
      
    if (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      return null;
    }
    
    if (!data) {
      console.error(`Projeto ${id} não encontrado para atualização`);
      return null;
    }
    
    // Retorna o projeto atualizado
    return data as unknown as Project;
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
