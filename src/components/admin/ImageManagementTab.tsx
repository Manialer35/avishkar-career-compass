import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Image, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PLACEHOLDER_IMAGE = '/placeholder-image.jpg';
const ANDROID_APP_CATEGORY = 'Android App'; // New category specific for Android app images

const AndroidImageManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Android App'); // Default to Android App
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const { toast } = useToast();
  
  // Include Android-specific categories
  const categories = [
    'Campus', 'Facilities', 'Classes', 'Students', 'Events', 
    'Faculty', 'Successful Candidates', 'Profiles', 'Logos', 'Home',
    'Android App', 'App Banners', 'App Icons', 'Profile Pictures', 'UI Elements'
  ];
  
  const [newImage, setNewImage] = useState({
    title: '',
    category: 'Android App',
    file: null,
    previewUrl: null
  });

  // Fetch images with Android app focus
  useEffect(() => {
    fetchImages();
  }, []);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if we have any images in the database
      const { data: dbImages, error: dbError } = await supabase
        .from('academy_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dbError) {
        console.warn("Database error:", dbError);
        // We'll continue with an empty array for dbImages
      }
      
      // Initialize array to store all images
      let allImages = [];
      
      // Process database images if available
      if (dbImages && !dbError) {
        allImages = dbImages.map(img => ({
          id: img.id,
          title: img.title || 'Untitled',
          url: img.url,
          category: img.category || 'General',
          storage_path: img.storage_path,
          fileName: img.filename || '',
          bucket: 'images', // Default bucket name
          uploadDate: new Date(img.created_at).toISOString().split('T')[0],
          inDatabase: true
        }));
      }
      
      // Safely access storage
      try {
        // First try to check available buckets
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.warn("Error listing buckets:", bucketError);
          // Skip storage operations if we can't access buckets
        } else {
          // Find appropriate bucket - default to 'images' or first available
          const bucketToUse = buckets?.find(b => b.name === 'images') || 
                             (buckets && buckets.length > 0 ? buckets[0] : { name: 'images' });
          
          // Get files from the bucket
          const { data: storageFiles, error: storageError } = await supabase.storage
            .from(bucketToUse.name)
            .list('', { sortBy: { column: 'name', order: 'asc' } });
          
          if (storageError) {
            console.warn("Storage error:", storageError);
            // Continue with DB images only
          } else if (storageFiles) {
            // Filter for image files
            const imageFiles = storageFiles.filter(file => 
              file && !file.name.endsWith('/') && 
              /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file.name)
            );
            
            for (const file of imageFiles) {
              // Skip if already in database
              if (allImages.some(img => img.storage_path === file.name || 
                                      img.fileName === file.name)) {
                continue;
              }
              
              // Get public URL
              const { data: publicUrlData } = supabase.storage
                .from(bucketToUse.name)
                .getPublicUrl(file.name);
              
              // Add to images array if we got a URL
              if (publicUrlData && publicUrlData.publicUrl) {
                allImages.push({
                  id: `storage-${file.id || file.name}`,
                  title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
                  url: publicUrlData.publicUrl,
                  category: 'Android App', // Default for untagged storage files
                  fileName: file.name,
                  storage_path: file.name,
                  bucket: bucketToUse.name,
                  uploadDate: new Date(file.created_at || Date.now()).toISOString().split('T')[0],
                  inDatabase: false
                });
              }
            }
          }
        }
      } catch (storageErr) {
        console.error("Error accessing storage:", storageErr);
        // We'll continue with database images only
      }
      
      setImages(allImages);
      
    } catch (err) {
      console.error('Error in fetchImages:', err);
      setError(err.message || "Failed to load images");
      toast({
        title: "Error loading images",
        description: "There was an error loading images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
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
      
      setNewImage({
        ...newImage,
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };
  
  // Upload image
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
      
      // Format filename
      const timestamp = Date.now();
      const sanitizedTitle = newImage.title.replace(/\s+/g, '_');
      const fileExt = newImage.file.name.split('.').pop();
      const fileName = `${timestamp}_${sanitizedTitle}.${fileExt}`;
      
      // Default bucket name
      let bucketName = 'images';
      
      // Try to get available buckets, but don't fail if we can't
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (!bucketError && buckets && buckets.length > 0) {
          const bucketToUse = buckets.find(b => b.name === 'images') || buckets[0];
          bucketName = bucketToUse.name;
        }
      } catch (bucketErr) {
        console.warn("Error listing buckets:", bucketErr);
        // Continue with default bucket name
      }
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, newImage.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded image");
      }
      
      // Add to database
      const { error: dbError } = await supabase.from('academy_images').insert({
        title: newImage.title,
        category: newImage.category,
        url: publicUrlData.publicUrl,
        filename: fileName,
        storage_path: fileName
      });
      
      if (dbError) throw dbError;
      
      toast({ title: "Image uploaded", description: "The image has been successfully uploaded" });
      resetUploadForm();
      fetchImages(); // Refresh images
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete image
  const confirmDelete = async () => {
    if (!currentImage) return;
    
    try {
      setLoading(true);
      
      // Delete from storage if we have a path
      if (currentImage.storage_path) {
        try {
          await supabase.storage
            .from(currentImage.bucket || 'images')
            .remove([currentImage.storage_path]);
        } catch (storageErr) {
          console.warn("Error deleting from storage:", storageErr);
          // Continue with database deletion
        }
      }
      
      // Delete from database if it exists there
      if (currentImage.inDatabase) {
        try {
          await supabase.from('academy_images').delete().eq('id', currentImage.id);
        } catch (dbErr) {
          console.warn("Error deleting from database:", dbErr);
          throw dbErr; // Propagate database errors
        }
      }
      
      setImages(images.filter(img => img.id !== currentImage.id));
      toast({ title: "Image deleted", description: "The image has been successfully removed" });
      setIsDeleteDialogOpen(false);
      setCurrentImage(null);
      
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting the image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save image changes
  const saveChanges = async () => {
    if (!currentImage) return;
    
    try {
      setLoading(true);
      
      if (currentImage.inDatabase) {
        // Update existing database record
        await supabase
          .from('academy_images')
          .update({
            title: currentImage.title,
            category: currentImage.category
          })
          .eq('id', currentImage.id);
      } else {
        // Add to database if it was only in storage before
        const { data: publicUrlData } = supabase.storage
          .from(currentImage.bucket || 'images')
          .getPublicUrl(currentImage.storage_path);
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Failed to get public URL for the image");
        }
        
        await supabase.from('academy_images').insert({
          title: currentImage.title,
          category: currentImage.category,
          url: publicUrlData.publicUrl,
          filename: currentImage.fileName,
          storage_path: currentImage.storage_path
        });
      }
      
      setImages(images.map(img => img.id === currentImage.id ? 
        {...currentImage, inDatabase: true} : img));
      setIsEditDialogOpen(false);
      setCurrentImage(null);
      toast({ title: "Image updated", description: "The image details have been updated successfully" });
      
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating the image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset upload form
  const resetUploadForm = () => {
    if (newImage.previewUrl) {
      URL.revokeObjectURL(newImage.previewUrl);
    }
    setNewImage({ 
      title: '', 
      category: 'Android App', 
      file: null, 
      previewUrl: null 
    });
    setIsUploadDialogOpen(false);
  };
  
  // Filter images
  const filteredImages = images.filter(img => 
    (img.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     img.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory ? img.category === selectedCategory : true)
  );
  
  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-academy-primary">Android App Images</h2>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-academy-primary hover:bg-academy-primary/90"
          >
            <Plus size={16} className="mr-2" />
            Upload Image
          </Button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-10"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
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
          <Alert variant="destructive" className="mb-4">
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
                {loading ? (
                  <div className="text-center py-8">Loading images...</div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-8">No images found</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200">
                        <div className="h-40">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
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
                                onClick={() => {
                                  setCurrentImage(image);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500"
                                onClick={() => {
                                  setCurrentImage(image);
                                  setIsDeleteDialogOpen(true);
                                }}
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
                {loading ? (
                  <div className="text-center py-8">Loading images...</div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-8">No images found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Preview</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Upload Date</TableHead>
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
                                  onError={(e) => {
                                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{image.title}</TableCell>
                            <TableCell><Badge variant="secondary">{image.category}</Badge></TableCell>
                            <TableCell>{image.uploadDate}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setCurrentImage(image);
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => {
                                setCurrentImage(image);
                                setIsDeleteDialogOpen(true);
                              }}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
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
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => !open && resetUploadForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={newImage.title}
                onChange={e => setNewImage({...newImage, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
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
              <Label htmlFor="file" className="text-right">Image</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="col-span-3"
              />
            </div>
            
            {newImage.previewUrl && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Preview</Label>
                </div>
                <div className="col-span-3">
                  <img 
                    src={newImage.previewUrl} 
                    alt="Preview" 
                    className="max-h-48 w-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUploadForm} disabled={loading}>Cancel</Button>
            <Button onClick={handleUploadImage} disabled={loading} className="bg-academy-primary">
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">Title</Label>
                <Input
                  id="edit-title"
                  value={currentImage.title}
                  onChange={e => setCurrentImage({...currentImage, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={saveChanges} disabled={loading} className="bg-academy-primary">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div>
                  <p className="font-medium">{currentImage.title}</p>
                  <p className="text-sm text-gray-500">{currentImage.category}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AndroidImageManagementTab;
