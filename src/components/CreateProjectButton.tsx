
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { createProject } from '../supabase/mutations/projects';
import { Project } from '../types';

interface CreateProjectButtonProps {
  onProjectCreated?: (project: Project | null) => void;
}

const CreateProjectButton = ({ onProjectCreated }: CreateProjectButtonProps) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Por favor, informe um nome para o projeto');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Usamos a função de mutation para criar o projeto
      const newProject = await createProject({
        name: projectName,
        description: projectDescription
      });
      
      if (newProject) {
        toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
        setOpen(false);
        
        // Chamamos o callback se existir
        if (onProjectCreated) {
          onProjectCreated(newProject);
        }
      } else {
        toast.error('Falha ao criar projeto');
      }
      
      // Reset form
      setProjectName('');
      setProjectDescription('');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Falha ao criar projeto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="shadow-sm hover:shadow"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Novo Projeto
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Adicione os detalhes para o seu novo projeto de integração.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome do projeto"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Para que serve este projeto?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              >
                {isLoading ? 'Criando...' : 'Criar Projeto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProjectButton;
