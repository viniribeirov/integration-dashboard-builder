
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { Project } from '../../types';
import { getStatusColor, formatDate } from '../../utils/projectUtils';
import { useInView } from '../../utils/animations';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import IntegrationIcon from './IntegrationIcon';
import ProjectActions from './ProjectActions';

interface ProjectCardProps {
  project: Project;
  index: number;
  onDeleted?: (id: string) => void;
  onUpdated?: (project: Project) => void;
}

const ProjectCard = ({ project, index, onDeleted, onUpdated }: ProjectCardProps) => {
  const { ref, isInView } = useInView();
  const [currentProject, setCurrentProject] = useState<Project>(project);

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
      <Card className="group overflow-hidden h-full border border-border transition-all duration-300 hover:shadow-md relative">
        <ProjectActions 
          project={currentProject} 
          onDeleted={onDeleted}
          onUpdated={handleProjectUpdated}
        />

        <Link to={`/project/${currentProject.id}`} className="block h-full">
          <CardContent className="p-6">
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
            
            <div className="mt-4">
              <Badge 
                className={`${getStatusColor(currentProject.status)} border-none`}
                variant="outline"
              >
                {currentProject.status?.charAt(0).toUpperCase() + currentProject.status?.slice(1) || 'No Status'}
              </Badge>
            </div>
            
            {currentProject.integrations && currentProject.integrations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">PLATAFORMAS CONECTADAS</h4>
                <div className="flex flex-wrap gap-2">
                  {currentProject.integrations.map((integration) => (
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
            
            <ArrowRightIcon className="h-4 w-4" />
          </CardFooter>
        </Link>
      </Card>
    </div>
  );
};

export default ProjectCard;
