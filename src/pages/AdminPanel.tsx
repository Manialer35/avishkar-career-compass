
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash, Plus, Save, File, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  isPremium: boolean;
  price?: number;
}

const AdminPanel = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([
    {
      id: '1',
      title: 'चालू घडामोडी',
      description: 'Latest current affairs and news updates in Marathi',
      downloadUrl: '#',
      isPremium: false
    },
    {
      id: '2',
      title: 'Daily टेस्ट पेपर',
      description: 'Daily test papers for one year subscription',
      downloadUrl: '#',
      isPremium: true,
      price: 99
    },
    // Add more initial materials as needed
  ]);
  
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('free');

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setNewMaterial(false);
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    toast({
      title: "Material deleted",
      description: "The study material has been deleted successfully."
    });
  };

  const handleAddNew = () => {
    setEditingMaterial({
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      downloadUrl: '',
      isPremium: activeTab === 'premium',
      price: activeTab === 'premium' ? 0 : undefined
    });
    setNewMaterial(true);
  };

  const handleSave = () => {
    if (!editingMaterial) return;
    
    if (newMaterial) {
      setMaterials([...materials, editingMaterial]);
    } else {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
    }
    
    setEditingMaterial(null);
    setNewMaterial(false);
    
    toast({
      title: "Changes saved",
      description: "The study material has been updated successfully."
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEditingMaterial(null);
    setNewMaterial(false);
  };

  const filteredMaterials = materials.filter(m => m.isPremium === (activeTab === 'premium'));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-academy-primary">Admin Panel</h1>
        <Button asChild variant="outline">
          <Link to="/admin/users" className="flex items-center">
            <Users size={16} className="mr-2" />
            Manage Users
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="free" onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="free">Free Materials</TabsTrigger>
          <TabsTrigger value="premium">Premium Materials</TabsTrigger>
          <TabsTrigger value="videos">Training Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="free" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Free Study Materials</h2>
            <Button onClick={handleAddNew}>
              <Plus size={16} className="mr-2" />
              Add New Material
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMaterials.map(material => (
              <Card key={material.id} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(material)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDelete(material.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{material.description}</p>
                  <p className="text-sm flex items-center">
                    <File size={14} className="mr-1" /> 
                    <a href={material.downloadUrl} className="text-academy-primary hover:underline">Download Link</a>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Premium Study Materials</h2>
            <Button onClick={handleAddNew}>
              <Plus size={16} className="mr-2" />
              Add New Material
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMaterials.map(material => (
              <Card key={material.id} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(material)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDelete(material.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{material.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-academy-primary">₹{material.price}</p>
                    <a href={material.downloadUrl} className="text-academy-primary hover:underline text-sm flex items-center">
                      <File size={14} className="mr-1" /> 
                      Download Link
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Training Videos</h2>
            <Button onClick={() => toast({ title: "Coming Soon", description: "Video upload functionality will be available soon." })}>
              <Plus size={16} className="mr-2" />
              Add New Video
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Video management is coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {editingMaterial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {newMaterial ? 'Add New Material' : 'Edit Material'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input 
                  value={editingMaterial.title} 
                  onChange={(e) => setEditingMaterial({...editingMaterial, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  value={editingMaterial.description} 
                  onChange={(e) => setEditingMaterial({...editingMaterial, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Download URL</label>
                <Input 
                  value={editingMaterial.downloadUrl} 
                  onChange={(e) => setEditingMaterial({...editingMaterial, downloadUrl: e.target.value})}
                />
              </div>
              
              {editingMaterial.isPremium && (
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <Input 
                    type="number"
                    value={editingMaterial.price} 
                    onChange={(e) => setEditingMaterial({...editingMaterial, price: parseInt(e.target.value) || 0})}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setEditingMaterial(null);
                setNewMaterial(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" /> 
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
