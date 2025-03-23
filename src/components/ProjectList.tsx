
import { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { useStaggeredAnimation } from '../utils/animations';

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted?: (id: string) => void;
}

const ProjectList = ({ projects, onProjectDeleted }: ProjectListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase() || '');
    
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Generate delays for staggered animations
  const animationDelays = useStaggeredAnimation(filteredProjects.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-3 pr-10 py-2 border border-input rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              statusFilter === null
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              statusFilter === 'active'
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              statusFilter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
          </svg>
          <p className="text-muted-foreground text-lg font-medium mb-2">Nenhum projeto encontrado</p>
          <p className="text-muted-foreground/70 max-w-md">
            {searchQuery || statusFilter ? 
              "Tente ajustar os filtros de busca para encontrar seus projetos." :
              "Você ainda não possui projetos. Clique em 'Novo Projeto' para começar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index}
              onDeleted={onProjectDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
