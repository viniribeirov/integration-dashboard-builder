
import { useState } from 'react';
import { PlusIcon, Upload } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface CreateProjectButtonProps {
  onProjectCreated?: (project: Project | null) => void;
}

const CreateProjectButton = ({ onProjectCreated }: CreateProjectButtonProps) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file (optional)
      if (!file.type.includes('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      
      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set file for upload
      setThumbnailFile(file);
    }
  };

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Por favor, informe um nome para o projeto');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Usamos a função de mutation para criar o projeto com a imagem
      const newProject = await createProject({
        name: projectName,
        description: projectDescription || null,
        thumbnailFile
      });
      
      if (newProject) {
        setOpen(false);
        toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
        
        // Chamamos o callback se existir
        if (onProjectCreated) {
          onProjectCreated(newProject);
        }
        
        // Reset form
        resetForm();
      } else {
        toast.error('Falha ao criar projeto');
      }
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
      
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
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
              
              <div className="space-y-2">
                <Label>Logo do Projeto (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    {thumbnailPreview ? (
                      <AvatarImage src={thumbnailPreview} alt="Preview" />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {projectName ? projectName.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <Label 
                      htmlFor="thumbnail" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {thumbnailFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                    </Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    {thumbnailFile && (
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {thumbnailFile.name}
                      </p>
                    )}
                  </div>
                </div>
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
