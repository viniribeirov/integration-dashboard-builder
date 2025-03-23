
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ArrowRightIcon, Trash2Icon } from 'lucide-react';
import { Project, Integration } from '../types';
import { getPlatformColor, getStatusColor, formatDate } from '../utils/projectUtils';
import { useInView } from '../utils/animations';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { deleteProject } from '../supabase/mutations/projects';
import EditProjectDialog from './EditProjectDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface ProjectCardProps {
  project: Project;
  index: number;
  onDeleted?: (id: string) => void;
  onUpdated?: (project: Project) => void;
}

const ProjectCard = ({ project, index, onDeleted, onUpdated }: ProjectCardProps) => {
  const { ref, isInView } = useInView();
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>(project);

  const handleDelete = async () => {
    if (!currentProject.id) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteProject(currentProject.id);
      
      if (success) {
        toast.success("Projeto excluído com sucesso");
        if (onDeleted) {
          onDeleted(currentProject.id);
        }
      } else {
        toast.error("Erro ao excluir projeto");
      }
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      toast.error("Erro ao excluir projeto");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
    if (onUpdated) {
      onUpdated(updatedProject);
    }
  };

  return (
    <div 
      ref={ref}
      style={{ 
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.5s ease-out ${index * 0.1}s`
      }}
    >
      <Card 
        className="overflow-hidden h-full border border-border transition-all duration-300 hover:shadow-md relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Delete button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-200 hover:bg-red-600"
          style={{ opacity: isHovered ? 0.9 : 0 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>

        {/* Edit button (new) */}
        <EditProjectDialog 
          project={currentProject} 
          onProjectUpdated={handleProjectUpdated} 
        />

        <Link to={`/project/${currentProject.id}`} className="block h-full">
          {currentProject.thumbnail && (
            <div className="relative h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                style={{ 
                  backgroundImage: `url(${currentProject.thumbnail})`,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <Badge 
                  className={`${getStatusColor(currentProject.status)} border-none`}
                  variant="outline"
                >
                  {currentProject.status?.charAt(0).toUpperCase() + currentProject.status?.slice(1) || 'No Status'}
                </Badge>
              </div>
            </div>
          )}
          
          <CardContent className={`p-6 ${!currentProject.thumbnail ? 'pt-6' : 'pt-4'}`}>
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 rounded-full border border-border flex-shrink-0">
                {currentProject.thumbnail ? (
                  <AvatarImage src={currentProject.thumbnail} alt={currentProject.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {currentProject.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-xl line-clamp-1">{currentProject.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{currentProject.description}</p>
              </div>
            </div>
            
            {currentProject.integrations && currentProject.integrations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">PLATAFORMAS CONECTADAS</h4>
                <div className="flex flex-wrap gap-2">
                  {currentProject.integrations.map((integration: Integration) => (
                    <IntegrationIcon key={integration.id} integration={integration} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>Atualizado {formatDate(currentProject.updated_at)}</span>
            </div>
            
            <ArrowRightIcon 
              className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
            />
          </CardFooter>
        </Link>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto "{currentProject.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const IntegrationIcon = ({ integration }: { integration: Integration }) => {
  const platformColor = getPlatformColor(integration.platform);
  
  // Get platform letter for avatar
  const getPlatformLetter = () => {
    return integration.platform.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <Avatar className={`h-8 w-8 ${platformColor}`}>
        <AvatarFallback className="text-white text-xs">
          {getPlatformLetter()}
        </AvatarFallback>
      </Avatar>
      
      <span 
        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
          integration.status === 'connected' ? 'bg-green-500' : 
          integration.status === 'disconnected' ? 'bg-red-500' : 'bg-amber-500'
        }`}
      />
    </div>
  );
};

export default ProjectCard;
