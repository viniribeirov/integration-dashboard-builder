
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DashboardWidget } from '@/types';
import { toast } from 'sonner';

// Load dashboard widgets from Supabase
export async function loadWidgetsFromSupabase() {
  try {
    // Using generic fetch to avoid typing issues with project_widgets table
    const { data, error } = await supabase
      .from('project_widgets')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    if (!data) {
      return [];
    }
    
    // Type-safe conversion for dashboard widgets
    const typedWidgets: DashboardWidget[] = data.map((widget: any) => ({
      id: widget.id,
      name: widget.widget_name,
      type: widget.visualization_type as "kpi" | "line" | "bar" | "area",
      platform: widget.platform as "facebook" | "google" | "instagram" | "twitter" | "linkedin",
      metrics: widget.metrics || [],
      size: 'medium' as 'small' | 'medium' | 'large',
      position: widget.position,
      custom_formula: widget.formula || '',
      project_id: widget.project_id
    }));
    
    return typedWidgets;
  } catch (error) {
    console.error('Error loading widgets:', error);
    toast.error('Failed to load dashboard widgets');
    return [];
  }
}

// Load dashboard metrics data
export async function loadDashboardMetricsData(
  dateRange: { from?: Date, to?: Date } | undefined, 
  metrics: string[]
) {
  if (!dateRange?.from || !dateRange?.to) return null;
  
  try {
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    
    // Load Facebook data
    const { data: fbData, error: fbError } = await supabase
      .rpc('get_dashboard_metrics', {
        p_project_id: null, // Current project
        p_platform: 'facebook',
        p_metrics: metrics.filter(m => m === 'facebook'), // Just pass the relevant metrics
        p_start_date: formatDate(dateRange.from),
        p_end_date: formatDate(dateRange.to)
      });
    
    if (fbError) {
      console.error('Error loading Facebook data:', fbError);
      toast.error('Failed to load Facebook metrics');
      return null;
    }
    
    return { facebook: fbData };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    toast.error('Failed to load dashboard data');
    return null;
  }
}

// Add a new widget to Supabase
export async function addWidgetToSupabase(widget: Omit<DashboardWidget, 'id'>, widgets: DashboardWidget[]) {
  try {
    // Calculate next position
    const nextPosition = widgets.length > 0 
      ? Math.max(...widgets.map(w => w.position)) + 1 
      : 0;
    
    // Insert new widget using generic approach to avoid type conflicts
    const { data, error } = await supabase
      .from('project_widgets')
      .insert({
        widget_name: widget.name,
        visualization_type: widget.type,
        platform: widget.platform,
        metrics: widget.metrics,
        position: nextPosition,
        formula: widget.custom_formula || null,
        project_id: widget.project_id // Ensure project_id is included
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error("No data returned after insert");
    }
    
    // Convert to widget type
    const newWidget: DashboardWidget = {
      id: data.id,
      name: data.widget_name,
      type: data.visualization_type as "kpi" | "line" | "bar" | "area",
      platform: data.platform as "facebook" | "google" | "instagram" | "twitter" | "linkedin",
      metrics: data.metrics || [],
      size: 'medium',
      position: data.position,
      custom_formula: data.formula || '',
      project_id: data.project_id
    };
    
    return newWidget;
  } catch (error) {
    console.error('Error adding widget:', error);
    throw error;
  }
}

// Update an existing widget in Supabase
export async function updateWidgetInSupabase(id: string, widget: Partial<DashboardWidget>) {
  try {
    // Map widget data to database columns
    const updateData: Record<string, any> = {};
    if (widget.name) updateData.widget_name = widget.name;
    if (widget.type) updateData.visualization_type = widget.type;
    if (widget.platform) updateData.platform = widget.platform;
    if (widget.metrics) updateData.metrics = widget.metrics;
    if (widget.position !== undefined) updateData.position = widget.position;
    if (widget.custom_formula !== undefined) updateData.formula = widget.custom_formula;
    
    // Using generic approach to avoid type errors
    const { error } = await supabase
      .from('project_widgets')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating widget:', error);
    throw error;
  }
}

// Delete a widget from Supabase
export async function deleteWidgetFromSupabase(id: string) {
  try {
    // Using generic approach to avoid type errors
    const { error } = await supabase
      .from('project_widgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting widget:', error);
    throw error;
  }
}
