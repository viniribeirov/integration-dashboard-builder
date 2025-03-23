
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ClockIcon, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import AuthLayout from '../components/AuthLayout';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Integration, Project as ProjectType } from '../types';
import { getStatusColor, getPlatformColor } from '../services/mockData';
import { getProjectById } from '../supabase/queries/projects';
import { useOnceAnimation } from '../utils/animations';

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasAnimated = useOnceAnimation(100);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const projectData = await getProjectById(id);
        
        if (!projectData) {
          navigate('/dashboard');
          return;
        }
        
        setProject(projectData);
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
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
    return null;
  }

  return (
    <AuthLayout>
      <div className={`transition-all duration-700 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Projects
        </Button>

        {/* Project header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={`${getStatusColor(project.status)} bg-transparent`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Created: {formatDate(project.created_at)}</span>
            </div>
            <div className="flex items-center ml-4">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Updated: {formatDate(project.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Integrations section */}
        <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Integrations</h2>
          <Separator className="mb-6" />

          {project.integrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No integrations connected yet.</p>
              <Button className="mt-4">
                Connect New Integration
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {project.integrations.map((integration: Integration) => (
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
                        {integration.account_name || 'No account name'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm ${getStatusColor(integration.status)}`}>
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </span>
                    <Button variant="ghost" size="sm" className="ml-2">
                      Settings
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics section placeholder */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
          <Separator className="mb-6" />
          <div className="flex items-center justify-center py-16 border border-dashed rounded-md">
            <p className="text-muted-foreground">Analytics will be displayed here</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Project;
