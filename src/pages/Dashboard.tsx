
import { useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ProjectList from '../components/ProjectList';
import CreateProjectButton from '../components/CreateProjectButton';
import { useAuth } from '../hooks/useAuth';
import { Project } from '../types';
import { useOnceAnimation } from '../utils/animations';
import { getProjects } from '../supabase/queries/projects';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { user } = useAuth();
  const hasAnimated = useOnceAnimation(100);

  // Usar React Query para gerenciar dados e estado de carregamento
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    enabled: !!user, // Só executa a query quando o usuário estiver autenticado
  });

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus projetos de integração e plataformas conectadas.
              </p>
            </div>
            <CreateProjectButton />
          </div>
        </div>

        {/* Project List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Erro ao carregar projetos</p>
            <p className="text-muted-foreground">Tente novamente mais tarde.</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-8">
              Você ainda não tem nenhum projeto. Crie seu primeiro projeto para começar.
            </p>
            <CreateProjectButton />
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
