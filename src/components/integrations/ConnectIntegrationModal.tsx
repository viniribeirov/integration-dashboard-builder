
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from "../ui/button";
import { Facebook } from "lucide-react";
import { cn } from "@/lib/utils";
import FacebookAccountsModal from './FacebookAccountsModal';

const platforms = [
  {
    id: 'facebook',
    name: 'Facebook Ads',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Conecte sua conta do Facebook Ads para importar métricas e campanhas'
  }
];

interface ConnectIntegrationModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIntegrationAdded: () => void;
}

const ConnectIntegrationModal = ({ 
  projectId, 
  open, 
  onOpenChange,
  onIntegrationAdded
}: ConnectIntegrationModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    
    if (platformId === 'facebook') {
      setShowFacebookModal(true);
      onOpenChange(false);
    }
  };

  const handleFacebookModalClose = () => {
    setShowFacebookModal(false);
    setSelectedPlatform(null);
    onOpenChange(false);
  };

  const handleIntegrationSuccess = () => {
    setShowFacebookModal(false);
    setSelectedPlatform(null);
    onIntegrationAdded();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Nova Plataforma</DialogTitle>
            <DialogDescription>
              Selecione a plataforma que você deseja integrar com seu projeto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            {platforms.map((platform) => (
              <Button
                key={platform.id}
                variant="outline"
                className={cn(
                  "w-full justify-start text-white", 
                  platform.color
                )}
                onClick={() => handlePlatformSelect(platform.id)}
              >
                <platform.icon className="mr-2 h-5 w-5" />
                {platform.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <FacebookAccountsModal 
        open={showFacebookModal} 
        onOpenChange={setShowFacebookModal}
        projectId={projectId}
        onClose={handleFacebookModalClose}
        onSuccess={handleIntegrationSuccess}
      />
    </>
  );
};

export default ConnectIntegrationModal;
