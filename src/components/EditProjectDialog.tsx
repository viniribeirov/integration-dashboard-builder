
import { useState, useEffect } from 'react';
import { Pencil, Upload } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { updateProject } from '../supabase/mutations/projects';
import { Project } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface EditProjectDialogProps {
  project: Project;
  onProjectUpdated?: (project: Project) => void;
  triggerButtonId?: string; // Add this prop to the interface
}

const EditProjectDialog = ({ project, onProjectUpdated, triggerButtonId }: EditProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(project.thumbnail || null);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state if the project prop changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description || '');
    setThumbnailPreview(project.thumbnail || null);
  }, [project]);

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
    setName(project.name);
    setDescription(project.description || '');
    setThumbnailPreview(project.thumbnail || null);
    setThumbnailFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, informe um nome para o projeto');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const updatedProject = await updateProject(project.id, {
        name,
        description: description || null,
        thumbnailFile
      });
      
      if (updatedProject) {
        setOpen(false);
        
        // Chamamos o callback se existir
        if (onProjectUpdated) {
          onProjectUpdated(updatedProject);
        }
        
        toast.success(`Projeto "${updatedProject.name}" atualizado com sucesso!`);
      } else {
        toast.error('Falha ao atualizar projeto');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Falha ao atualizar projeto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {triggerButtonId ? (
        <Button
          id={triggerButtonId}
          variant="ghost"
          size="icon"
          className="hidden"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Editar projeto</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-10 z-10 opacity-0 transition-opacity duration-200 hover:bg-secondary"
          style={{ opacity: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do seu projeto.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Projeto</Label>
                <Input
                  id="edit-name"
                  placeholder="Digite o nome do projeto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Para que serve este projeto?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <Label 
                      htmlFor="edit-thumbnail" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {thumbnailFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                    </Label>
                    <Input
                      id="edit-thumbnail"
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
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditProjectDialog;
