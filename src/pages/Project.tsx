
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRightIcon, Clock, Users, Settings, Share2, Plus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { mockProjects, getPlatformColor, getStatusColor } from '../services/mockData';
import { Project as ProjectType, Integration } from '../types';
import { useOnceAnimation } from '../utils/animations';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { format } from 'date-fns';

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasAnimated = useOnceAnimation(100);

  useEffect(() => {
    // Simulate loading from API
    const fetchProject = async () => {
      try {
        // In a real app, this would fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 800));
        const foundProject = mockProjects.find(p => p.id === id) || null;
        setProject(foundProject);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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
        <div className="flex flex-col items-center justify-center py-32">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className={`transition-all duration-700 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRightIcon className="h-4 w-4 mx-1" />
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <ChevronRightIcon className="h-4 w-4 mx-1" />
            <span>{project.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <span className={`${getStatusColor(project.status)} text-xs font-medium px-2 py-1 rounded-full border`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {format(new Date(project.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium">
                      {format(new Date(project.updated_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Owner</span>
                    <span className="text-sm font-medium">You</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Integrations</span>
                    <span className="text-sm font-medium">{project.integrations.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>People with access to this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>YO</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">You</p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Integrations and Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="integrations">
              <TabsList>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="integrations" className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.integrations.length > 0 ? (
                    project.integrations.map((integration) => (
                      <IntegrationCard key={integration.id} integration={integration} />
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                      <p className="text-muted-foreground mb-4">No integrations yet</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first integration
                      </Button>
                    </div>
                  )}
                  
                  {/* Add Integration Card */}
                  <Card className="flex items-center justify-center cursor-pointer border border-dashed bg-transparent h-32 hover:border-primary/50 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium mt-2">Connect Platform</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Actions performed on this project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Project created</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(project.created_at), 'MMM d, yyyy - h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      {project.integrations.map((integration) => (
                        <div key={integration.id} className="flex items-start gap-3">
                          <div className={`h-5 w-5 rounded-full ${getPlatformColor(integration.platform)} flex items-center justify-center text-white text-xs`}>
                            {integration.platform.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{integration.name} connected</p>
                            <p className="text-xs text-muted-foreground">
                              {integration.last_sync 
                                ? format(new Date(integration.last_sync), 'MMM d, yyyy - h:mm a')
                                : 'Recently'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                    <CardDescription>Manage your project configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Project settings will be implemented in a future update.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

const IntegrationCard = ({ integration }: { integration: Integration }) => {
  const platformColor = getPlatformColor(integration.platform);
  const statusColor = getStatusColor(integration.status);
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${platformColor} flex items-center justify-center text-white text-sm font-medium`}>
              {integration.platform.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-sm">{integration.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{integration.platform}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            integration.status === 'connected' ? 'bg-green-50 text-green-600' : 
            integration.status === 'disconnected' ? 'bg-red-50 text-red-600' : 
            'bg-amber-50 text-amber-600'
          }`}>
            {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
          </span>
        </div>
        
        {integration.account_name && (
          <div className="mt-4 pt-4 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium">{integration.account_name}</span>
            </div>
            {integration.last_sync && (
              <div className="flex justify-between mt-2">
                <span className="text-muted-foreground">Last synced</span>
                <span>{format(new Date(integration.last_sync), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs h-7">
            Configure
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50">
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Project;
