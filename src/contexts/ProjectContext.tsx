
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '../types';
import { getProjects } from '../supabase/queries/projects';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

type ProjectContextType = {
  projects: Project[];
  isLoading: boolean;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
      
      // Automatically select the first project if there is one and none is selected
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Falha ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setIsLoading(false);
      setProjects([]);
      setSelectedProject(null);
    }
  }, [user]);

  const refreshProjects = async () => {
    await fetchProjects();
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        isLoading, 
        selectedProject, 
        setSelectedProject,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
