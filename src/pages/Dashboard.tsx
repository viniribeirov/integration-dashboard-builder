
import { useState, useEffect } from 'react';
import { ChevronRightIcon, LayoutGridIcon, ListIcon } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ProjectList from '../components/ProjectList';
import CreateProjectButton from '../components/CreateProjectButton';
import { mockProjects } from '../services/mockData';
import { useAuth } from '../hooks/useAuth';
import { Project } from '../types';
import { useOnceAnimation } from '../utils/animations';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const hasAnimated = useOnceAnimation(100);

  useEffect(() => {
    // Simulate loading projects from API
    const fetchProjects = async () => {
      try {
        // In a real app, this would fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
            <span>Projects</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage your integration projects and connected platforms.
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
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
