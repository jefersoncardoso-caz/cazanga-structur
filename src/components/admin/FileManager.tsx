import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Trash2, 
  Download,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  size: number;
  url: string;
  uploadedAt: Date;
  category: 'employee-photos' | 'logos' | 'documents' | 'other';
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<FileItem['category']>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'Todos os Arquivos' },
    { value: 'employee-photos', label: 'Fotos de Funcionários' },
    { value: 'logos', label: 'Logos e Ícones' },
    { value: 'documents', label: 'Documentos' },
    { value: 'other', label: 'Outros' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    if (files.length > 0) {
      setUploadModalOpen(true);
    }
  };

  const handleUpload = async () => {
    // Simulate file upload - in real implementation, this would upload to Supabase Storage
    try {
      const newFiles: FileItem[] = selectedFiles.map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other',
        size: file.size,
        url: URL.createObjectURL(file), // In real implementation, this would be the uploaded URL
        uploadedAt: new Date(),
        category: uploadCategory
      }));

      setFiles(prev => [...prev, ...newFiles]);
      setSelectedFiles([]);
      setUploadModalOpen(false);
      
      toast({
        title: "Upload concluído",
        description: `${newFiles.length} arquivo(s) enviado(s) com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Erro ao enviar arquivos",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "Arquivo removido",
      description: "Arquivo removido com sucesso"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-primary" />;
      case 'document':
        return <FileText className="w-8 h-8 text-secondary" />;
      default:
        return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFilesByCategory = (category: string) => {
    return files.filter(f => f.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Arquivos</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload de Arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Image className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{getFilesByCategory('employee-photos')}</p>
              <p className="text-sm text-muted-foreground">Fotos de Funcionários</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Image className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">{getFilesByCategory('logos')}</p>
              <p className="text-sm text-muted-foreground">Logos e Ícones</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{getFilesByCategory('documents')}</p>
              <p className="text-sm text-muted-foreground">Documentos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{files.length}</p>
              <p className="text-sm text-muted-foreground">Total de Arquivos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum arquivo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {files.length === 0 
              ? 'Comece fazendo upload dos seus primeiros arquivos'
              : 'Tente alterar os filtros de busca'
            }
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Fazer Upload
          </Button>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {filteredFiles.map(file => (
            <Card key={file.id} className={viewMode === 'grid' ? 'p-4' : 'p-3'}>
              {viewMode === 'grid' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    {file.type === 'image' ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {categories.find(c => c.value === file.category)?.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.name}</h4>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline">
                        {categories.find(c => c.value === file.category)?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Arquivos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <select 
                value={uploadCategory} 
                onChange={(e) => setUploadCategory(e.target.value as any)}
                className="w-full mt-1 p-2 border rounded"
              >
                {categories.slice(1).map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Arquivos Selecionados</label>
              <div className="space-y-2 mt-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    {getFileIcon(file.type.startsWith('image/') ? 'image' : 'document')}
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpload}>
                Fazer Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;