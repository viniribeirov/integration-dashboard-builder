
import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "./ui/progress";
import { 
  syncFacebookAdsData, 
  getDefaultDateRange, 
  findFacebookIntegration,
  hasRecentSync
} from "../services/facebookAdsService";
import { DateRange } from "react-day-picker";
import { Integration, Project } from "../types";

interface FacebookAdsSyncStatusProps {
  project: Project | null;
  dateRange: DateRange | undefined;
  isVisible: boolean;
  onSyncComplete: () => void;
}

const FacebookAdsSyncStatus: React.FC<FacebookAdsSyncStatusProps> = ({
  project,
  dateRange,
  isVisible,
  onSyncComplete
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState('');
  const [facebookIntegration, setFacebookIntegration] = useState<Integration | undefined>(undefined);

  useEffect(() => {
    if (project?.integrations) {
      const integration = findFacebookIntegration(project.id, project.integrations);
      setFacebookIntegration(integration);
    }
  }, [project]);
  
  useEffect(() => {
    // Auto-sync when component mounts or when project changes, if no recent sync
    if (isVisible && project && facebookIntegration && !hasRecentSync(facebookIntegration)) {
      handleSync();
    }
  }, [isVisible, project, facebookIntegration]);

  const handleSync = async () => {
    if (!project || !facebookIntegration) {
      toast.error("Projeto ou integração não encontrada");
      return;
    }
    
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStage('Iniciando sincronização...');
    
    // Extract the ad account ID from the account_name
    // Format is typically "Account Name (account_id)"
    const accountNameMatch = facebookIntegration.account_name?.match(/\(([^)]+)\)$/);
    let adAccountId = accountNameMatch ? accountNameMatch[1].trim() : '';
    
    // If no match was found, assume the whole string might be ID (fallback)
    if (!adAccountId && facebookIntegration.account_name) {
      adAccountId = facebookIntegration.account_name;
    }
    
    // If still no ID, use a fallback from the integration ID
    if (!adAccountId) {
      const fallbackMatch = facebookIntegration.id.match(/\d+/);
      adAccountId = fallbackMatch ? fallbackMatch[0] : facebookIntegration.id;
      console.warn("Using fallback ad account ID:", adAccountId);
    }
    
    // Determine date range from props or use default
    let { startDate, endDate } = getDefaultDateRange();
    
    if (dateRange?.from) {
      startDate = format(dateRange.from, 'yyyy-MM-dd');
    }
    
    if (dateRange?.to) {
      endDate = format(dateRange.to, 'yyyy-MM-dd');
    }
    
    try {
      const result = await syncFacebookAdsData({
        projectId: project.id,
        adAccountId: adAccountId,
        startDate,
        endDate,
        onProgress: (progress, stage) => {
          setSyncProgress(progress);
          setSyncStage(stage);
        }
      });
      
      if (result.success) {
        toast.success("Dados sincronizados com sucesso!");
        if (result.stats) {
          console.log("Sync stats:", result.stats);
          if (result.stats.totalRecords > 0) {
            toast.info(`Sincronizados: ${result.stats.campaigns} campanhas, ${result.stats.adsets} conjuntos de anúncios, ${result.stats.ads} anúncios.`);
          } else {
            toast.info("Nenhum novo dado para sincronizar no período selecionado.");
          }
        }
        onSyncComplete();
      } else {
        toast.error(result.error || "Erro ao sincronizar dados");
      }
    } catch (error) {
      console.error("Error during sync:", error);
      toast.error("Erro ao sincronizar dados");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isVisible || !facebookIntegration) {
    return null;
  }

  return (
    <div className="bg-card border rounded-md p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium">Dados do Facebook Ads</h3>
          {facebookIntegration.last_sync && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {format(parseISO(facebookIntegration.last_sync), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar agora
            </>
          )}
        </Button>
      </div>

      {isSyncing && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>{syncStage}</span>
            <span>{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default FacebookAdsSyncStatus;
