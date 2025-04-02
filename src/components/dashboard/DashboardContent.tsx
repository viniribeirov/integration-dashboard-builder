
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import WidgetCard from './WidgetCard';
import { Integration } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import AddWidgetModal from './AddWidgetModal';

interface DashboardContentProps {
  projectId: string;
  integrations: Integration[];
  isLoadingIntegrations: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  projectId, 
  integrations, 
  isLoadingIntegrations 
}) => {
  const { widgets, isLoading } = useDashboard();
  const [showAddWidgetModal, setShowAddWidgetModal] = React.useState(false);

  // Check if we have any connected integrations
  const hasFacebookIntegration = integrations.some(
    int => int.platform === 'facebook' && int.status === 'connected'
  );

  // If loading integrations, show loading state
  if (isLoadingIntegrations) {
    return <div className="flex justify-center py-10">Loading integrations...</div>;
  }

  // If no integrations found, show empty state
  if (integrations.length === 0) {
    return (
      <section className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No integrations found</h3>
        <p className="mb-6">Connect an integration first to see metrics on your dashboard.</p>
      </section>
    );
  }

  // If no Facebook integration (which is what our dashboard currently supports)
  if (!hasFacebookIntegration) {
    return (
      <section className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">Facebook integration required</h3>
        <p className="mb-6">Connect your Facebook Ads account to see metrics on this dashboard.</p>
      </section>
    );
  }

  return (
    <div>
      {/* Top actions bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Dashboard</h2>
        <Button onClick={() => setShowAddWidgetModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </div>
      
      {/* Grid of widgets */}
      {widgets.length === 0 ? (
        <div className="border border-dashed rounded-lg p-16 text-center">
          <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
          <p className="mb-6 text-muted-foreground">Create your first widget to start visualizing your data</p>
          <Button onClick={() => setShowAddWidgetModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal 
        open={showAddWidgetModal} 
        onOpenChange={setShowAddWidgetModal} 
      />
    </div>
  );
};

export default DashboardContent;
