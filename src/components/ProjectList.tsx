
import { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { useStaggeredAnimation } from '../utils/animations';

interface ProjectListProps {
  projects: Project[];
}

const ProjectList = ({ projects }: ProjectListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
