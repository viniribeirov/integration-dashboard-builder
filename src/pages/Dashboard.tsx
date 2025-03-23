
import { useState, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ProjectList from '../components/ProjectList';
import CreateProjectButton from '../components/CreateProjectButton';
import { useAuth } from '../hooks/useAuth';
import { Project } from '../types';
import { useOnceAnimation } from '../utils/animations';
import { getProjects } from '../supabase/queries/projects';
import { toast } from 'sonner';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const hasAnimated = useOnceAnimation(100);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
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
    }
  }, [user]);

  return (
    <AuthLayout>
      <div className={`transition-all duration-700 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <span>Dashboard</span>
            <ChevronRightIcon className="h-4 w-4 mx-1" />
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
                setProjects(prev => [newProject, ...prev]);
                toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
              }
            }} />
          </div>
        </div>

        {/* Project List */}
        <ProjectList 
          projects={projects}
          isLoading={isLoading}
          onProjectDeleted={(id) => {
            setProjects(prev => prev.filter(p => p.id !== id));
            toast.success('Projeto removido com sucesso!');
          }}
        />
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
