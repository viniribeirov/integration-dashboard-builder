
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardWidget } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { 
  loadWidgetsFromSupabase, 
  addWidgetToSupabase,
  updateWidgetInSupabase,
  deleteWidgetFromSupabase
} from '@/utils/dashboardUtils';

export function useWidgetManagement() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  
  // Load widgets
  const loadWidgets = async () => {
    const loadedWidgets = await loadWidgetsFromSupabase();
    setWidgets(loadedWidgets);
  };
  
  // Add widget
  const addWidget = async (widget: Omit<DashboardWidget, 'id'>) => {
    try {
      const newWidget = await addWidgetToSupabase(widget, widgets);
      setWidgets([...widgets, newWidget]);
      toast.success('Widget added successfully');
    } catch (error) {
      console.error('Error adding widget:', error);
      toast.error('Failed to add widget');
      throw error;
    }
  };
  
  // Update widget
  const updateWidget = async (id: string, widget: Partial<DashboardWidget>) => {
    try {
      await updateWidgetInSupabase(id, widget);
      
      // Update local state
      setWidgets(widgets.map(w => 
        w.id === id 
          ? { ...w, ...widget } 
          : w
      ));
      
      toast.success('Widget updated successfully');
    } catch (error) {
      console.error('Error updating widget:', error);
      toast.error('Failed to update widget');
      throw error;
    }
  };
  
  // Delete widget
  const deleteWidget = async (id: string) => {
    try {
      await deleteWidgetFromSupabase(id);
      
      // Remove from local state
      setWidgets(widgets.filter(w => w.id !== id));
      toast.success('Widget deleted successfully');
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Failed to delete widget');
      throw error;
    }
  };
  
  // Initial load
  useEffect(() => {
    loadWidgets();
  }, []);
  
  // Subscribe to real-time updates for widgets
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_widgets'
        },
        () => {
          loadWidgets();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    widgets,
    addWidget,
    updateWidget,
    deleteWidget,
    refreshWidgets: loadWidgets
  };
}
