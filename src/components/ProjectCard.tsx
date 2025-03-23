
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { Project, Integration } from '../types';
import { getPlatformColor, getStatusColor } from '../services/mockData';
import { useInView } from '../utils/animations';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface ProjectCardProps {
  project: Project;
  index: number;
  onDeleted?: (id: string) => void;
}

const ProjectCard = ({ project, index, onDeleted }: ProjectCardProps) => {
  const { ref, isInView } = useInView();
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
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
      <Link to={`/project/${project.id}`}>
        <Card 
          className="overflow-hidden h-full border border-border transition-all duration-300 hover:shadow-md"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {project.thumbnail && (
            <div className="relative h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                style={{ 
                  backgroundImage: `url(${project.thumbnail})`,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <Badge 
                  className={`${getStatusColor(project.status)} border-none`}
                  variant="outline"
                >
                  {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'No Status'}
                </Badge>
              </div>
            </div>
          )}
          
          <CardContent className={`p-6 ${!project.thumbnail ? 'pt-6' : 'pt-4'}`}>
            <div className="space-y-3">
              <h3 className="font-semibold text-xl line-clamp-1">{project.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
            </div>
            
            {project.integrations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">CONNECTED PLATFORMS</h4>
                <div className="flex flex-wrap gap-2">
                  {project.integrations.map((integration: Integration) => (
                    <IntegrationIcon key={integration.id} integration={integration} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>Updated {formatDate(project.updated_at)}</span>
            </div>
            
            <ArrowRightIcon 
              className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
            />
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
};

const IntegrationIcon = ({ integration }: { integration: Integration }) => {
  const platformColor = getPlatformColor(integration.platform);
  const statusColor = getStatusColor(integration.status);
  
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
