
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";

interface AdAccount {
  id: string;
  name: string;
  accountId: string;
  status: string;
  currency: string;
}

interface FacebookAccountsModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const FacebookAccountsModal = ({ 
  projectId, 
  open, 
  onOpenChange,
  onClose,
  onSuccess
}: FacebookAccountsModalProps) => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAdAccounts();
    }
  }, [open]);

  const fetchAdAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Iniciando chamada para a função facebook-ads");
      
      // Corrigindo o formato da chamada da Edge Function
      const { data, error } = await supabase.functions.invoke('facebook-ads', {
        method: 'POST',
        body: { endpoint: 'get-ad-accounts' }
      });

      console.log("Resposta da função facebook-ads:", data, error);

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAdAccounts(data.accounts || []);
    } catch (err) {
      console.error('Error fetching ad accounts:', err);
      setError('Não foi possível carregar as contas de anúncio. Por favor tente novamente.');
      toast.error('Falha ao buscar contas do Facebook Ads');
    } finally {
      setIsLoading(false);
    }
  };

  const connectAccount = async (account: AdAccount) => {
    setConnectingId(account.id);
    
    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          platform: 'facebook',
          project_id: projectId,
          status: 'connected',
          name: account.name,
          account_name: `${account.name} (${account.accountId})`,
          last_sync: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Conta do Facebook Ads conectada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('Error connecting account:', err);
      toast.error('Falha ao conectar conta do Facebook Ads');
    } finally {
      setConnectingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500';
    if (status === 'disabled') return 'bg-red-500';
    return 'bg-amber-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Ativo';
    if (status === 'disabled') return 'Desativado';
    if (status === 'unsettled') return 'Não liquidado';
    if (status === 'pending_risk_review') return 'Revisão pendente';
    if (status === 'pending_settlement') return 'Liquidação pendente';
    if (status === 'in_grace_period') return 'Em período de carência';
    if (status === 'pending_closure') return 'Fechamento pendente';
    if (status === 'closed') return 'Fechado';
    return 'Desconhecido';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Conectar com Facebook Ads</DialogTitle>
          <DialogDescription>
            Selecione a conta de anúncios que você deseja conectar ao seu projeto.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando contas de anúncio...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchAdAccounts}>Tentar Novamente</Button>
            </div>
          ) : adAccounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Nenhuma conta de anúncio encontrada para este token.</p>
              <Button onClick={onClose}>Fechar</Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {adAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between border p-4 rounded-md">
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {account.accountId}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-white ${getStatusColor(account.status)}`}>
                        {getStatusLabel(account.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{account.currency}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => connectAccount(account)}
                    disabled={connectingId !== null}
                    className="min-w-24"
                  >
                    {connectingId === account.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      'Conectar'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacebookAccountsModal;
