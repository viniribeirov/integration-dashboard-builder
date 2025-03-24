
import { useState, useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import ProjectSelector from '../components/ProjectSelector';
import DateRangePicker from '../components/DateRangePicker';
import { useProject } from '../contexts/ProjectContext';
import { useOnceAnimation } from '../utils/animations';
import { supabase } from '../integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDashboard } from '../hooks/useDashboard';
import WidgetCard from '../components/dashboard/WidgetCard';
import AddWidgetModal from '../components/dashboard/AddWidgetModal';
import { Integration } from '../types';
import { PlusIcon, LayoutGridIcon } from 'lucide-react';
import { 
  Box, 
  SimpleGrid, 
  Button, 
  Text, 
  Flex, 
  Icon, 
  useToast,
  ChakraProvider, 
  extendTheme
} from '@chakra-ui/react';

// Extend the ChakraUI theme to match your app's style
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e5e7f9',
      100: '#c2c6f0',
      200: '#9ea4e7',
      300: '#7a82dd',
      400: '#5760d4',
      500: '#333eca',
      600: '#2e38b6',
      700: '#2830a1',
      800: '#23298d',
      900: '#1d2279',
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
      }
    }
  }
});

const Dashboard = () => {
  const { selectedProject, refreshProjects } = useProject();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const hasAnimated = useOnceAnimation(100);
  const toast = useToast();

  const { 
    widgets, 
    isLoading, 
    isLoadingData, 
    fetchWidgets, 
    removeWidget,
    updateWidgetPositions
  } = useDashboard(selectedProject?.id, dateRange);

  // Fetch integrations for the selected project
  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!selectedProject?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('project_id', selectedProject.id)
          .eq('status', 'connected');
          
        if (error) throw error;
        
        // Ensure proper typing for integrations
        const typedIntegrations: Integration[] = data?.map(integration => ({
          ...integration,
          platform: integration.platform as 'facebook' | 'google' | 'instagram' | 'twitter' | 'linkedin',
          status: integration.status as 'connected' | 'disconnected' | 'pending'
        })) || [];
        
        setIntegrations(typedIntegrations);
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
    };
    
    fetchIntegrations();
  }, [selectedProject]);

  // Subscribe to project updates
  useEffect(() => {
    const channel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Received realtime update:', payload);
          refreshProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshProjects]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleRemoveWidget = async (widgetId: string) => {
    const success = await removeWidget(widgetId);
    
    if (success) {
      toast({
        title: "Widget removido",
        description: "O widget foi removido com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Erro ao remover widget",
        description: "Ocorreu um erro ao remover o widget. Tente novamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the position property of each widget
    const reorderedWidgets = items.map((item, index) => ({
      ...item,
      position: index
    }));
    
    updateWidgetPositions(reorderedWidgets);
  };

  return (
    <AuthLayout>
      <ChakraProvider theme={theme}>
        <div className={`transition-all duration-700 ease-out ${
          hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <span>Dashboard</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Visualize dados e métricas do seu projeto.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <ProjectSelector className="md:self-start" />
                <DateRangePicker 
                  className="md:self-start" 
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>
            </div>
          </div>

          {!selectedProject ? (
            /* ... keep existing code (project selection prompt) */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              <p className="text-muted-foreground text-lg font-medium mb-2">Selecione um projeto para visualizar os dados do dashboard</p>
              <p className="text-muted-foreground/70 max-w-md">
                Escolha um projeto na lista suspensa acima para visualizar seus dados e métricas.
              </p>
            </div>
          ) : (
            <Box>
              {/* Dashboard Controls */}
              <Flex justify="space-between" align="center" mb={6}>
                <Flex align="center">
                  <Icon as={LayoutGridIcon} mr={2} />
                  <Text fontWeight="medium">Widgets</Text>
                  <Text ml={2} fontSize="sm" color="gray.500">
                    {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
                  </Text>
                </Flex>
                <Button 
                  leftIcon={<PlusIcon size={16} />}
                  onClick={() => setShowAddWidgetModal(true)}
                  isDisabled={integrations.length === 0}
                  colorScheme="brand"
                  size="sm"
                >
                  Adicionar Widget
                </Button>
              </Flex>

              {/* Placeholder when no widgets */}
              {widgets.length === 0 ? (
                /* ... keep existing code (empty widgets placeholder) */
                <Box 
                  borderWidth="2px" 
                  borderStyle="dashed" 
                  borderColor="gray.200" 
                  borderRadius="lg" 
                  p={8} 
                  textAlign="center"
                >
                  <Box 
                    w="16" 
                    h="16" 
                    borderRadius="full" 
                    bg="gray.100" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    mx="auto"
                    mb={4}
                  >
                    <LayoutGridIcon size={24} />
                  </Box>
                  <Text fontWeight="medium" fontSize="lg" mb={2}>
                    Seu dashboard está vazio
                  </Text>
                  <Text color="gray.500" mb={4} maxW="md" mx="auto">
                    {integrations.length === 0 
                      ? "Você precisa conectar uma integração antes de adicionar widgets." 
                      : "Adicione widgets para visualizar métricas e dados importantes do seu projeto."}
                  </Text>
                  {integrations.length > 0 && (
                    <Button 
                      onClick={() => setShowAddWidgetModal(true)}
                      colorScheme="brand"
                      leftIcon={<PlusIcon size={16} />}
                    >
                      Adicionar Primeiro Widget
                    </Button>
                  )}
                </Box>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="widgets" direction="horizontal">
                    {(provided) => (
                      <SimpleGrid 
                        columns={{ base: 1, md: 2, lg: 3 }}
                        spacing={4}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {widgets.map((widget, index) => (
                          <Draggable key={widget.id} draggableId={widget.id} index={index}>
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                h={{ base: 'auto', md: widget.type === 'kpi' ? '150px' : '300px' }}
                              >
                                <WidgetCard
                                  id={widget.id}
                                  name={widget.name}
                                  type={widget.type}
                                  metrics={widget.metrics}
                                  platform={widget.platform}
                                  data={widget.data}
                                  isLoading={isLoading || isLoadingData}
                                  customFormula={widget.custom_formula || undefined}
                                  onRemove={handleRemoveWidget}
                                />
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </SimpleGrid>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {/* Add Widget Modal */}
              <AddWidgetModal
                isOpen={showAddWidgetModal}
                onClose={() => setShowAddWidgetModal(false)}
                projectId={selectedProject.id}
                integrations={integrations}
                onWidgetAdded={fetchWidgets}
              />
            </Box>
          )}
        </div>
      </ChakraProvider>
    </AuthLayout>
  );
};

export default Dashboard;
