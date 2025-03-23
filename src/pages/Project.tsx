import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ClockIcon, CalendarIcon, Settings, PlusIcon, Trash2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Integration, Project as ProjectType } from '../types';
import { getStatusColor, getPlatformColor, formatDate } from '../utils/projectUtils';
import { getProjectById } from '../supabase/queries/projects';
import { useOnceAnimation } from '../utils/animations';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import EditProjectDialog from '../components/EditProjectDialog';
import ConnectIntegrationModal from '../components/integrations/ConnectIntegrationModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { deleteIntegration } from '../services/integrationService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletingIntegration, setDeletingIntegration] = useState<Integration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasAnimated = useOnceAnimation(100);

  const fetchProject = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const projectData = await getProjectById(id);
      
      if (!projectData) {
        toast.error('Projeto não encontrado');
        navigate('/dashboard');
        return;
      }
      
      setProject(projectData);
      
      setIntegrations(projectData.integrations || []);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      toast.error('Erro ao carregar projeto');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('public:projects:single')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Received realtime update for project:', payload);
          setProject(prevProject => {
            if (!prevProject) return null;
            return { 
              ...payload.new as ProjectType, 
              integrations: prevProject.integrations 
            };
          });
        }
      )
      .subscribe();

    const integrationsChannel = supabase
      .channel('public:integrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'integrations',
          filter: `project_id=eq.${id}`
        },
        (payload) => {
          console.log('Received realtime update for integrations:', payload);
          fetchProject();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(integrationsChannel);
    };
  }, [id]);

  const handleProjectUpdated = (updatedProject: ProjectType) => {
    setProject(updatedProject);
    toast.success('Projeto atualizado com sucesso!');
  };

  const handleIntegrationAdded = () => {
    fetchProject();
  };

  const handleDeleteIntegration = async (integration: Integration) => {
    setDeletingIntegration(integration);
    setShowDeleteAlert(true);
  };

  const confirmDeleteIntegration = async () => {
    if (!deletingIntegration) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteIntegration(deletingIntegration.id, deletingIntegration.project_id);
      
      if (result.success) {
        toast.success(`Integração ${deletingIntegration.name} excluída com sucesso`);
        fetchProject();
      } else {
        toast.error(`Erro ao excluir integração: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Erro ao excluir integração');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
      setDeletingIntegration(null);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  if (!project) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O projeto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar para a Dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className={`transition-all duration-700 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Voltar para Projetos
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-full border border-border">
              {project.thumbnail ? (
                <AvatarImage src={project.thumbnail} alt={project.name} />
              ) : (
                <AvatarFallback className="text-xl">
                  {project.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
                <Badge className={`${getStatusColor(project?.status)} bg-transparent`}>
                  {project?.status?.charAt(0).toUpperCase() + project?.status?.slice(1) || 'Sem Status'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{project?.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Criado: {formatDate(project?.created_at)}</span>
                </div>
                <div className="flex items-center ml-4">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Atualizado: {formatDate(project?.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <EditProjectDialog project={project} onProjectUpdated={handleProjectUpdated} />
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Integrações</h2>
            <Button size="sm" onClick={() => setShowIntegrationModal(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Conectar Nova Plataforma
            </Button>
          </div>
          <Separator className="mb-6" />

          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma integração conectada ainda.</p>
              <Button className="mt-4" onClick={() => setShowIntegrationModal(true)}>
                Conectar Nova Integração
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration: Integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 bg-background rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${getPlatformColor(integration.platform)}`}>
                      {integration.platform.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.account_name || 'Sem nome de conta'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm ${getStatusColor(integration.status)}`}>
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Settings className="h-4 w-4 mr-1" />
                          Configurações
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => handleDeleteIntegration(integration)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir integração
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Visão Geral</h2>
          <Separator className="mb-6" />
          <div className="flex items-center justify-center py-16 border border-dashed rounded-md">
            <p className="text-muted-foreground">Análises serão exibidas aqui</p>
          </div>
        </div>
      </div>

      <ConnectIntegrationModal 
        projectId={id || ''} 
        open={showIntegrationModal} 
        onOpenChange={setShowIntegrationModal}
        onIntegrationAdded={handleIntegrationAdded}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir integração</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá excluir permanentemente a integração "{deletingIntegration?.name}" e todos os dados relacionados 
              (campanhas, conjuntos de anúncios e anúncios). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteIntegration} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthLayout>
  );
};

export default Project;
