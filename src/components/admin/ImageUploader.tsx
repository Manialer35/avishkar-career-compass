
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ImageUploader = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('Profiles');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const categories = [
    'Profiles',
    'Logos',
    'Successful Candidates',
    'Other'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      
      // If only one file is selected and no title is set, use the filename as title
      if (fileArray.length === 1 && title === '') {
        // Remove extension from filename
        const fileName = fileArray[0].name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one file');
      setMessageType('error');
      return;
    }

    if (!title && files.length === 1) {
      setMessage('Please provide a title for the image');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const uploadPromises = files.map(async (file, index) => {
        // Generate a unique file name to avoid conflicts
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}.${fileExt}`;
        const filePath = `${category}/${fileName}`;
        
        // Individual file title
        const fileTitle = files.length === 1 ? title : `${title || 'Image'} ${index + 1}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('images')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);
          
        const publicUrl = urlData.publicUrl;
        
        // Store image metadata in the database
        const { data: dbData, error: dbError } = await supabase
          .from('academy_images')
          .insert([
            {
              title: fileTitle,
              url: publicUrl,
              category: category,
              filename: fileName,
              storage_path: filePath
            }
          ]);
          
        if (dbError) {
          throw dbError;
        }
        
        return publicUrl;
      });
      
      const results = await Promise.all(uploadPromises);
      
      setMessage(`Successfully uploaded ${results.length} image(s)`);
      setMessageType('success');
      
      // Reset form
      setFiles([]);
      setTitle('');
      
      // Refresh the page after 2 seconds to show the new images
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage(`Error uploading: ${error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-academy-primary mb-4">Upload Images</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Category</label>
        <select
          className="w-full p-2 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Title {files.length > 1 && '(will be used as base name for multiple files)'}
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter image title"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Select Image(s)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {files.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-700">{files.length} file(s) selected:</p>
          <ul className="list-disc pl-5">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full p-2 text-white rounded ${
          uploading ? 'bg-gray-400' : 'bg-academy-primary hover:bg-academy-secondary'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload Image(s)'}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
