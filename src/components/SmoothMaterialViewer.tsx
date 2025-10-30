import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Material {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

interface SmoothMaterialViewerProps {
  material: Material;
  onClose?: () => void;
}

const SmoothMaterialViewer: React.FC<SmoothMaterialViewerProps> = ({ 
  material, 
  onClose 
}) => {
  const [isViewing, setIsViewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      // Smooth navigation back instead of app exit
      navigate(-1);
    }
  }, [onClose, navigate]);

  const handleView = useCallback(() => {
    setLoading(true);
    setIsViewing(true);
    // Simulate loading time
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      const link = document.createElement('a');
      link.href = material.downloadUrl;
      link.download = `${material.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  }, [material]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold truncate">{material.title}</h1>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!isViewing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">{material.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {material.thumbnailUrl && (
                    <div className="flex justify-center">
                      <img
                        src={material.thumbnailUrl}
                        alt={material.title}
                        className="max-w-full h-48 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-center">{material.description}</p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleView}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {loading ? 'Loading...' : 'View Material'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <h2 className="font-semibold">{material.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsViewing(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
                
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-500">Loading material...</p>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={material.downloadUrl}
                      className="w-full h-96 border-0"
                      title={material.title}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmoothMaterialViewer;