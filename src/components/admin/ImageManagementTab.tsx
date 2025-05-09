import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, Image, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Fixed type definitions
interface ImageItem {
  id: string;
  title: string;
  url: string;
  category: string;
  uploadDate: string;
  size: string;
  fileName: string;
  description?: string;
  altText?: string;
  metadataId?: string;
}

interface NewImageState {
  title: string;
  category: string;
  file: File | null;
  previewUrl: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ImageManagementTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<ImageItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const categories = [
    'Campus', 'Facilities', 'Classes', 'Students', 'Events', 
    'Faculty', 'Successful Candidates', 'Profiles', 'Logos', 'Home'
  ];
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [newImage, setNewImage] = useState<NewImageState>({
    title: '',
    category: '',
    file: null,
    previewUrl: null
  });

  // Improved fetch images function - more concise and error-resistant
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError("You must be logged in to access images");
          return;
        }

        // Get both files and metadata in parallel for better performance
        const [filesResponse, metadataResponse] = await Promise.all([
          supabase.storage.from('images').list(),
          supabase.from('image_metadata').select('*')
        ]);
        
        if (filesResponse.error) {
          throw filesResponse.error;
        }
        
        // Continue even if metadata has error - we can show basic file info
        const metadataList = metadataResponse.data || [];
        
        if (filesResponse.data) {
          const imageData = await Promise.all(
            filesResponse.data
              .filter(file => !file.name.endsWith('/') && file.name)
              .map(async file => {
                const { data: publicUrlData } = supabase.storage
                  .from('images')
                  .getPublicUrl(file.name);
                
                // Find matching metadata if available
                const metadata = metadataList.find(m => m.object_id === file.id);
                
                // Calculate file size in a readable format
                const sizeInKB = (file.metadata?.size || 0) / 1024;
                const fileSize = sizeInKB < 1024 
                  ? `${sizeInKB.toFixed(2)} KB` 
                  : `${(sizeInKB / 1024).toFixed(2)} MB`;
                  
                return {
                  id: file.id,
                  title: metadata?.title || file.name.split('_').slice(1).join('_').replace(/\.[^/.]+$/, ""),
                  url: publicUrlData.publicUrl,
                  category: metadata?.category || file.metadata?.category || 'General',
                  description: metadata?.description || '',
                  altText: metadata?.alt_text || '',
                  uploadDate: new Date(file.created_at || Date.now()).toISOString().split('T')[0],
                  size: fileSize,
                  fileName: file.name,
                  metadataId: metadata?.id
                };
              })
          );
          
          setImages(imageData);
        }
        
      } catch (err) {
        console.error('Error in fetchImages:', err);
        setError(err.message || "Failed to load images");
        toast({
          title: "Error loading images",
          description: err.message || "There was an error loading images. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  }, [refreshTrigger, toast]);
  
  // Improved file handling with proper type checking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `The file size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          variant: "destructive",
        });
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      
      setNewImage({
        ...newImage,
        file,
        previewUrl
      });
    }
  };
  
  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (newImage.previewUrl) {
        URL.revokeObjectURL(newImage.previewUrl);
      }
    };
  }, [newImage.previewUrl]);
  
  // Simplified upload with better error handling
  const handleUploadImage = async () => {
    if (!newImage.title || !newImage.category || !newImage.file) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and select a file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to upload images");
      }
      
      // Format filename
      const timestamp = Date.now();
      const sanitizedTitle = newImage.title.replace(/\s+/g, '_');
      const fileExt = newImage.file.name.split('.').pop();
      const fileName = `${timestamp}_${sanitizedTitle}.${fileExt}`;
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, newImage.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: newImage.file.type,
          metadata: {
            category: newImage.category,
            size: newImage.file.size.toString()
          }
        });
      
      if (error) throw error;
      
      toast({
        title: "Image uploaded",
        description: "The image has been successfully uploaded",
      });
      
      // Reset form
      resetUploadForm();
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Simplified delete function
  const confirmDelete = async () => {
    if (!currentImage) return;
    
    try {
      setLoading(true);
      
      // Delete from storage
      const { error } = await supabase.storage
        .from('images')
        .remove([currentImage.fileName]);
      
      if (error) throw error;
      
      // Remove from state
      setImages(images.filter(img => img.id !== currentImage.id));
      
      toast({
        title: "Image deleted",
        description: "The image has been successfully removed",
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentImage(null);
      
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (image: ImageItem) => {
    setCurrentImage(image);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (image: ImageItem) => {
    setCurrentImage(image);
    setIsDeleteDialogOpen(true);
  };
  
  // Simplified metadata update function
  const saveChanges = async () => {
    if (!currentImage) return;
    
    try {
      setLoading(true);
      
      const metadataPayload = {
        title: currentImage.title,
        category: currentImage.category,
        description: currentImage.description || '',
        alt_text: currentImage.altText || ''
      };
      
      if (currentImage.metadataId) {
        // Update existing metadata
        const { error } = await supabase
          .from('image_metadata')
          .update(metadataPayload)
          .eq('id', currentImage.metadataId);
          
        if (error) throw error;
      } else {
        // Create new metadata
        const { data: { session } } = await supabase.auth.getSession();
        
        const { error } = await supabase
          .from('image_metadata')
          .insert({
            ...metadataPayload,
            object_id: currentImage.id,
            created_by: session?.user.id
          });
          
        if (error) throw error;
      }
      
      // Update in local state
      setImages(images.map(img => 
        img.id === currentImage.id ? currentImage : img
      ));
      
      setIsEditDialogOpen(false);
      setCurrentImage(null);
      
      toast({
        title: "Image updated",
        description: "The image details have been updated successfully",
        variant: "default",
      });
      
      // Refresh to get the latest data
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter images based on search and category
  const filteredImages = images.filter(img => 
    (img.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     img.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory ? img.category === selectedCategory : true)
  );
  
  const resetUploadForm = () => {
    if (newImage.previewUrl) {
      URL.revokeObjectURL(newImage.previewUrl);
    }
    setNewImage({
      title: '',
      category: '',
      file: null,
      previewUrl: null
    });
    setIsUploadDialogOpen(false);
  };

  // Fixed image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-image.jpg';
    e.currentTarget.alt = 'Image loading error';
  };
  
  // Component to avoid duplication in tab views
  const LoadingOrEmptyState = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-academy-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">Loading images...</p>
        </div>
      );
    }
    
    if (filteredImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Image className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No images found matching your criteria</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-academy-primary mb-4">Image Management</h2>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-academy-primary hover:bg-academy-primary/90"
            disabled={loading}
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
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
              
              {/* Grid View */}
              <TabsContent value="grid" className="mt-0">
                <LoadingOrEmptyState />
                
                {!loading && filteredImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200">
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-40 object-cover"
                            onError={handleImageError}
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
                                className="h-7 w-7 text-academy-primary hover:text-academy-primary hover:bg-blue-50"
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
              
              {/* List View */}
              <TabsContent value="list" className="mt-0">
                <LoadingOrEmptyState />
                
                {!loading && filteredImages.length > 0 && (
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
                                  onError={handleImageError}
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
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-academy-primary hover:text-academy-primary hover:bg-blue-50"
                                  onClick={() => handleDelete(image)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Delete</span>
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
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        if (!open) resetUploadForm();
        else setIsUploadDialogOpen(true);
      }}>
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
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
                </p>
                {newImage.file && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {newImage.file.name} ({(newImage.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Image Preview */}
            {newImage.previewUrl && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Preview</Label>
                </div>
                <div className="col-span-3">
                  <div className="mt-2 max-w-full overflow-hidden rounded border border-gray-200">
                    <img 
                      src={newImage.previewUrl} 
                      alt="Preview" 
                      className="max-h-48 w-auto mx-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUploadForm} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUploadImage} disabled={loading} className="bg-academy-primary hover:bg-academy-primary/90">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Upload
                </>
              )}
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
                  onError={handleImageError}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={saveChanges} disabled={loading} className="bg-academy-primary hover:bg-academy-primary/90">
              {loading ? "Saving..." : "Save Changes"}
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
                  onError={handleImageError}
                />
                <div>
                  <p className="font-medium">{currentImage.title}</p>
                  <p className="text-sm text-gray-500">{currentImage.category}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
              className="bg-academy-primary hover:bg-academy-primary/90 text-white border-none"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageManagementTab;
