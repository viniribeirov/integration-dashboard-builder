
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useProject } from '../contexts/ProjectContext';
import { Project } from '../types';

interface ProjectSelectorProps {
  className?: string;
}

const ProjectSelector = ({ className }: ProjectSelectorProps) => {
  const { 
    projects, 
    isLoading, 
    selectedProject, 
    setSelectedProject 
  } = useProject();

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId) || null;
    setSelectedProject(project);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center h-10 ${className}`}>
        <div className="animate-pulse h-10 w-48 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-xs ${className}`}>
      <Select
        value={selectedProject?.id}
        onValueChange={handleProjectChange}
        disabled={projects.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um projeto" />
        </SelectTrigger>
        <SelectContent>
          {projects.length === 0 ? (
            <div className="py-2 px-2 text-sm text-muted-foreground">
              Você ainda não criou nenhum projeto.
            </div>
          ) : (
            projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {projects.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Você ainda não criou nenhum projeto.
        </p>
      )}
    </div>
  );
};

export default ProjectSelector;
