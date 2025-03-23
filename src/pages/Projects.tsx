
import { useState, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ProjectList from '../components/ProjectList';
import CreateProjectButton from '../components/CreateProjectButton';
import { useOnceAnimation } from '../utils/animations';
import { Project } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

const Projects = () => {
  const { projects, isLoading, refreshProjects } = useProject();
  const hasAnimated = useOnceAnimation(100);

  useEffect(() => {
    const channel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Received realtime update:', payload);
          refreshProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshProjects]);

  const handleProjectUpdated = (updatedProject: Project) => {
    refreshProjects();
  };

  return (
    <AuthLayout>
      <div className={`transition-all duration-700 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <span>Projetos</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus projetos de integração e plataformas conectadas.
              </p>
            </div>
            <CreateProjectButton onProjectCreated={(newProject) => {
              if (newProject) {
                refreshProjects();
                toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
              }
            }} />
          </div>
        </div>
        <ProjectList 
          projects={projects}
          isLoading={isLoading}
          onProjectDeleted={(id) => {
            refreshProjects();
            toast.success('Projeto removido com sucesso!');
          }}
          onProjectUpdated={handleProjectUpdated}
        />
      </div>
    </AuthLayout>
  );
};

export default Projects;
