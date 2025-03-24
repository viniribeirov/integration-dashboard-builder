
import { useState, useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import ProjectSelector from '../components/ProjectSelector';
import DateRangePicker from '../components/DateRangePicker';
import { useProject } from '../contexts/ProjectContext';
import { useOnceAnimation } from '../utils/animations';
import { supabase } from '../integrations/supabase/client';
import { DateRange } from 'react-day-picker';

const Dashboard = () => {
  const { selectedProject, refreshProjects } = useProject();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const hasAnimated = useOnceAnimation(100);

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
    console.log('Date range changed:', range);
    // Future implementation: Apply date range filter to dashboard data
  };

  return (
    <AuthLayout>
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
          <section className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
            Em breve você poderá adicionar widgets aqui com as métricas do seu projeto.
          </section>
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
