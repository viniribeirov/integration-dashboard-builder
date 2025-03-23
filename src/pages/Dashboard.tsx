
import { useState, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ProjectSelector from '../components/ProjectSelector';
import { useProject } from '../contexts/ProjectContext';
import { useOnceAnimation } from '../utils/animations';
import { supabase } from '../integrations/supabase/client';

const Dashboard = () => {
  const { selectedProject, refreshProjects } = useProject();
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

  return (
    <AuthLayout>
      <div className={`transition-all duration-700 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <span>Dashboard</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Visualize dados e métricas do seu projeto.
              </p>
            </div>
            <ProjectSelector className="md:self-start" />
          </div>
        </div>

        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground text-lg font-medium mb-2">Selecione um projeto para visualizar os dados do dashboard</p>
            <p className="text-muted-foreground/70 max-w-md">
              Escolha um projeto na lista suspensa acima para visualizar seus dados e métricas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Projeto Selecionado</h3>
                <p className="text-sm text-muted-foreground">Detalhes do projeto</p>
              </div>
              <div className="mt-6">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Nome:</span> {selectedProject.name}
                  </div>
                  <div>
                    <span className="font-semibold">Descrição:</span> {selectedProject.description || 'Sem descrição'}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {selectedProject.status || 'Não definido'}
                  </div>
                  <div>
                    <span className="font-semibold">Integrações:</span> {selectedProject.integrations?.length || 0}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Outros cards de métricas podem ser adicionados aqui */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Integrações</h3>
                <p className="text-sm text-muted-foreground">Status das integrações</p>
              </div>
              <div className="mt-6">
                {selectedProject.integrations && selectedProject.integrations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProject.integrations.map(integration => (
                      <div key={integration.id} className="flex items-center justify-between">
                        <span>{integration.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          integration.status === 'connected' 
                            ? 'bg-green-100 text-green-800' 
                            : integration.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma integração configurada</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-lg font-semibold leading-none tracking-tight">Atividade Recente</h3>
                <p className="text-sm text-muted-foreground">Últimas atualizações</p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">Sem atividades recentes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
