
// Update the import to use the correct path
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';

// Define TypeScript interface for image data
interface ImageData {
  id: string;
  title: string;
  url: string;
  category: string;
  created_at: string;
  filename?: string;
  storage_path?: string;
}

const ImagesAdminPage = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      
      // Fetch all images from the database
      const { data, error } = await supabase
        .from('academy_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Error fetching images. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteImage = async (id: string, storagePath?: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete from database first
      const { error: dbError } = await supabase
        .from('academy_images')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        throw dbError;
      }
      
      // If we have a storage path, delete from storage too
      if (storagePath) {
        const { error: storageError } = await supabase
          .storage
          .from('images')
          .remove([storagePath]);
        
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue anyway as the database record is already deleted
        }
      }
      
      // Update the UI by filtering out the deleted image
      setImages(images.filter(img => img.id !== id));
      
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter images by category
  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);
  
  // Get unique categories from images
  const categories = ['All', ...new Set(images.map(img => img.category))];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-academy-primary mb-6">Image Management</h1>
      
      {/* Image Uploader Component */}
      <div className="mb-8">
        <ImageUploader />
      </div>
      
      {/* Image Gallery */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-academy-primary mb-4">Manage Images</h2>
        
        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Filter by Category</label>
          <select
            className="p-2 border rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading images...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-8">
            <p>No images found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={image.url} 
                    alt={image.title || 'Image'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{image.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600 mb-2">Category: {image.category}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Added: {new Date(image.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between">
                    <a 
                      href={image.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Full Size
                    </a>
                    <button
                      onClick={() => handleDeleteImage(image.id, image.storage_path)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesAdminPage;
