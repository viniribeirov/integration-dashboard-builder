import { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  Checkbox,
  Box,
  useToast,
  FormHelperText,
  Textarea
} from '@chakra-ui/react';
import { Integration } from '../../types';
import { supabase } from '../../integrations/supabase/client';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  integrations: Integration[];
  onWidgetAdded: () => void;
}

const METRIC_OPTIONS = {
  facebook: [
    { value: 'spend', label: 'Gasto' },
    { value: 'clicks', label: 'Cliques' },
    { value: 'ctr', label: 'Taxa de Cliques (CTR)' },
    { value: 'cpc', label: 'Custo por Clique (CPC)' },
    { value: 'cpm', label: 'Custo por Mil Impressões (CPM)' }
  ]
};

const WIDGET_TYPES = [
  { value: 'kpi', label: 'Indicador de Performance (KPI)' },
  { value: 'line', label: 'Gráfico de Linhas' },
  { value: 'bar', label: 'Gráfico de Barras' }
];

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ 
  isOpen, 
  onClose, 
  projectId,
  integrations,
  onWidgetAdded
}) => {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [type, setType] = useState('kpi');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [customFormula, setCustomFormula] = useState('');
  const [useCustomFormula, setUseCustomFormula] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPlatform('');
      setType('kpi');
      setSelectedMetrics([]);
      setCustomFormula('');
      setUseCustomFormula(false);
    }
  }, [isOpen]);
  
  const availableMetrics = platform ? METRIC_OPTIONS[platform as keyof typeof METRIC_OPTIONS] || [] : [];
  
  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      if (type === 'kpi' && !useCustomFormula) {
        setSelectedMetrics([metric]);
      } else {
        setSelectedMetrics([...selectedMetrics, metric]);
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, forneça um nome para o widget.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!platform) {
      toast({
        title: 'Plataforma obrigatória',
        description: 'Por favor, selecione uma plataforma.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (selectedMetrics.length === 0 && !useCustomFormula) {
      toast({
        title: 'Métricas obrigatórias',
        description: 'Por favor, selecione pelo menos uma métrica.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (useCustomFormula && !customFormula) {
      toast({
        title: 'Fórmula obrigatória',
        description: 'Por favor, forneça uma fórmula personalizada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data: widgets, error: countError } = await supabase
        .from('dashboard_widgets')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1);
      
      if (countError) throw countError;
      
      const position = widgets && widgets.length > 0 ? widgets[0].position + 1 : 0;
      
      const { error } = await supabase
        .from('dashboard_widgets')
        .insert({
          project_id: projectId,
          name,
          type,
          platform,
          metrics: selectedMetrics,
          position,
          custom_formula: useCustomFormula ? customFormula : null,
          size: 'medium'
        });
      
      if (error) throw error;
      
      toast({
        title: 'Widget adicionado',
        description: 'O widget foi adicionado com sucesso ao dashboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onWidgetAdded();
      onClose();
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: 'Erro ao adicionar widget',
        description: 'Ocorreu um erro ao adicionar o widget. Por favor, tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar Widget</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nome do Widget</FormLabel>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Gastos Diários"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Plataforma</FormLabel>
              <Select 
                value={platform} 
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setSelectedMetrics([]);
                }}
                placeholder="Selecione uma plataforma"
              >
                {integrations.map((integration) => (
                  <option key={integration.id} value={integration.platform}>
                    {integration.name} ({integration.platform})
                  </option>
                ))}
              </Select>
              {integrations.length === 0 && (
                <FormHelperText color="red.500">
                  Nenhuma integração disponível. Adicione uma integração primeiro.
                </FormHelperText>
              )}
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Tipo de Widget</FormLabel>
              <Select 
                value={type} 
                onChange={(e) => {
                  setType(e.target.value);
                  if (e.target.value === 'kpi' && selectedMetrics.length > 1) {
                    setSelectedMetrics(selectedMetrics.length > 0 ? [selectedMetrics[0]] : []);
                  }
                }}
              >
                {WIDGET_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Usar Fórmula Personalizada</FormLabel>
              <Checkbox 
                isChecked={useCustomFormula} 
                onChange={(e) => {
                  setUseCustomFormula(e.target.checked);
                  if (e.target.checked) {
                    setSelectedMetrics(availableMetrics.map(m => m.value));
                  } else {
                    if (type === 'kpi') {
                      setSelectedMetrics(selectedMetrics.length > 0 ? [selectedMetrics[0]] : []);
                    }
                  }
                }}
              >
                Habilitar fórmula personalizada
              </Checkbox>
            </FormControl>
            
            {useCustomFormula ? (
              <FormControl isRequired={useCustomFormula}>
                <FormLabel>Fórmula Personalizada</FormLabel>
                <Textarea 
                  value={customFormula} 
                  onChange={(e) => setCustomFormula(e.target.value)} 
                  placeholder="Ex: spend / clicks"
                />
                <FormHelperText>
                  Use os nomes das métricas na fórmula, ex: spend / clicks para CPC
                </FormHelperText>
              </FormControl>
            ) : (
              <FormControl isRequired>
                <FormLabel>Métricas</FormLabel>
                {platform ? (
                  <Stack spacing={2} mt={2}>
                    {availableMetrics.map((metric) => (
                      <Checkbox 
                        key={metric.value}
                        isChecked={selectedMetrics.includes(metric.value)}
                        onChange={() => handleMetricToggle(metric.value)}
                        isDisabled={type === 'kpi' && selectedMetrics.length > 0 && !selectedMetrics.includes(metric.value)}
                      >
                        {metric.label}
                      </Checkbox>
                    ))}
                  </Stack>
                ) : (
                  <Text color="gray.500">Selecione uma plataforma primeiro</Text>
                )}
                {type === 'kpi' && !useCustomFormula && (
                  <FormHelperText>
                    Para widgets do tipo KPI, apenas uma métrica pode ser selecionada
                  </FormHelperText>
                )}
              </FormControl>
            )}
          </Stack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={
              !name || 
              !platform || 
              (!useCustomFormula && selectedMetrics.length === 0) ||
              (useCustomFormula && !customFormula)
            }
          >
            Adicionar Widget
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddWidgetModal;
