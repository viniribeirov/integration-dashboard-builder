
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboard } from '@/hooks/useDashboard';
import { toast } from 'sonner';

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ open, onOpenChange }) => {
  const { addWidget, metrics } = useDashboard();
  
  const [widgetName, setWidgetName] = useState<string>('');
  const [widgetType, setWidgetType] = useState<'kpi' | 'line' | 'bar' | 'area'>('kpi');
  const [platform, setPlatform] = useState<'facebook' | 'google' | 'instagram' | 'twitter' | 'linkedin'>('facebook');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Reset form
      setWidgetName('');
      setWidgetType('kpi');
      setPlatform('facebook');
      setSelectedMetrics([]);
    }
  }, [open]);
  
  // Available metrics based on selected platform
  const availableMetrics = metrics.filter(m => m.category === platform);
  
  const handleSave = async () => {
    // Input validation
    if (!widgetName.trim()) {
      toast.error('Widget name is required');
      return;
    }
    
    if (selectedMetrics.length === 0) {
      toast.error('Select at least one metric');
      return;
    }
    
    try {
      await addWidget({
        name: widgetName,
        type: widgetType,
        platform: platform,
        metrics: selectedMetrics,
        size: 'medium',
        position: 0,  // Will be calculated in the hook
        custom_formula: '',
        project_id: '' // Will be assigned in the hook/backend
      });
      
      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving widget:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
          <DialogDescription>
            Create a new widget to visualize your metrics.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="widget-name">Widget Name</Label>
            <Input
              id="widget-name"
              placeholder="Enter a name for your widget"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="widget-type">Widget Type</Label>
            <Select
              value={widgetType}
              onValueChange={(value) => setWidgetType(value as any)}
            >
              <SelectTrigger id="widget-type">
                <SelectValue placeholder="Select widget type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kpi">KPI (Single Value)</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={platform}
              onValueChange={(value) => {
                setPlatform(value as any);
                setSelectedMetrics([]); // Reset selected metrics when platform changes
              }}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Metrics</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <div key={metric.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`metric-${metric.value}`}
                    checked={selectedMetrics.includes(metric.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // For KPI widgets, only allow one metric
                        if (widgetType === 'kpi') {
                          setSelectedMetrics([metric.value]);
                        } else {
                          setSelectedMetrics([...selectedMetrics, metric.value]);
                        }
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.value));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor={`metric-${metric.value}`}>{metric.label}</Label>
                </div>
              ))}
            </div>
            {widgetType === 'kpi' && selectedMetrics.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Note: KPI widgets can only display one metric.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Add Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWidgetModal;
