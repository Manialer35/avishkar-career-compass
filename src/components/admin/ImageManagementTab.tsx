
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Plus, 
  Upload, 
  Image, 
  Edit, 
  Trash2, 
  Search 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageItem {
  id: string;
  title: string;
  url: string;
  category: string;
  uploadDate: string;
  size: string;
}

const ImageManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();
  
  // Sample image data - replace with actual data from backend
  const sampleImages: ImageItem[] = [
    { 
      id: '1', 
      title: 'Academy Campus Main Building', 
      url: 'https://via.placeholder.com/350x230/3b82f6/ffffff?text=Campus',
      category: 'Campus',
      uploadDate: '2025-04-01',
      size: '2.4 MB'
    },
    { 
      id: '2', 
      title: 'Library Facilities', 
      url: 'https://via.placeholder.com/350x230/1e3a8a/ffffff?text=Library',
      category: 'Facilities',
      uploadDate: '2025-04-05',
      size: '1.8 MB'
    },
    { 
      id: '3', 
      title: 'Classroom Session', 
      url: 'https://via.placeholder.com/350x230/0284c7/ffffff?text=Classroom',
      category: 'Classes',
      uploadDate: '2025-04-10',
      size: '2.1 MB'
    },
    { 
      id: '4', 
      title: 'Students Group Study', 
      url: 'https://via.placeholder.com/350x230/93c5fd/000000?text=Group+Study',
      category: 'Students',
      uploadDate: '2025-04-15',
      size: '1.9 MB'
    },
  ];

  const categories = ['Campus', 'Facilities', 'Classes', 'Students', 'Events', 'Faculty'];
  const [images, setImages] = useState<ImageItem[]>(sampleImages);
  const [newImage, setNewImage] = useState<{
    title: string;
    category: string;
    file: File | null;
  }>({
    title: '',
    category: '',
    file: null
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage({
        ...newImage,
        file: e.target.files[0]
      });
    }
  };
  
  const handleUploadImage = () => {
    if (!newImage.title || !newImage.category || !newImage.file) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and select a file",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, you would upload the file to a server/storage here
    // For now, we'll just simulate adding it to our local state
    const newImageItem: ImageItem = {
      id: `new-${Date.now()}`,
      title: newImage.title,
      url: URL.createObjectURL(newImage.file),
      category: newImage.category,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(newImage.file.size / (1024 * 1024)).toFixed(1)} MB`
    };
    
    setImages([...images, newImageItem]);
    setIsUploadDialogOpen(false);
    setNewImage({
      title: '',
      category: '',
      file: null
    });
    
    toast({
      title: "Image uploaded",
      description: "The image has been successfully uploaded",
    });
  };
  
  const handleEdit = (image: ImageItem) => {
    setCurrentImage(image);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (image: ImageItem) => {
    setCurrentImage(image);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!currentImage) return;
    
    setImages(images.filter(img => img.id !== currentImage.id));
    setIsDeleteDialogOpen(false);
    setCurrentImage(null);
    
    toast({
      title: "Image deleted",
      description: "The image has been successfully removed",
    });
  };
  
  const saveChanges = () => {
    if (!currentImage) return;
    
    setImages(images.map(img => 
      img.id === currentImage.id ? currentImage : img
    ));
    setIsEditDialogOpen(false);
    setCurrentImage(null);
    
    toast({
      title: "Image updated",
      description: "The image details have been updated",
    });
  };
  
  const filteredImages = images.filter(img => 
    (img.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     img.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory ? img.category === selectedCategory : true)
  );
  
  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-academy-primary">Image Management</h2>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-academy-primary hover:bg-academy-primary/90"
          >
            <Plus size={16} className="mr-2" />
            Upload New Image
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="mb-4">
            Manage all images used throughout the application. Upload new images, edit image details,
            or remove images that are no longer needed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-10"
                placeholder="Search images by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="grid" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                <span className="text-sm text-gray-500">
                  {filteredImages.length} images found
                </span>
              </div>
              
              <TabsContent value="grid" className="mt-0">
                {filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Image className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No images found matching your criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200">
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium truncate" title={image.title}>
                            {image.title}
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <Badge variant="secondary">{image.category}</Badge>
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleEdit(image)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(image)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                {filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Image className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No images found matching your criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Preview</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredImages.map((image) => (
                          <TableRow key={image.id}>
                            <TableCell>
                              <div className="w-12 h-12 overflow-hidden rounded">
                                <img
                                  src={image.url}
                                  alt={image.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{image.title}</TableCell>
                            <TableCell><Badge variant="secondary">{image.category}</Badge></TableCell>
                            <TableCell>{image.uploadDate}</TableCell>
                            <TableCell>{image.size}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2"
                                  onClick={() => handleEdit(image)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(image)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newImage.title}
                onChange={e => setNewImage({...newImage, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={newImage.category} 
                onValueChange={value => setNewImage({...newImage, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {newImage.file && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {newImage.file.name} ({(newImage.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadImage}>
              <Upload size={16} className="mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {currentImage && (
            <div className="grid gap-4 py-4">
              <div className="mx-auto mb-4">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="max-w-full max-h-32 object-contain"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={currentImage.title}
                  onChange={e => setCurrentImage({...currentImage, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select 
                  value={currentImage.category} 
                  onValueChange={value => setCurrentImage({...currentImage, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Are you sure you want to delete this image?</p>
            {currentImage && (
              <div className="flex items-center space-x-4">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{currentImage.title}</p>
                  <p className="text-sm text-gray-500">{currentImage.category}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageManagementTab;
