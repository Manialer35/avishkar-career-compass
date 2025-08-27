import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, Calendar, Shield, Edit3, Save, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const { profile, userRole, loading, updating, updateProfile, updatePhoneNumber } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone_number: ''
  });

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone_number: userRole?.phone_number || ''
      });
    }
  }, [profile, userRole]);

  const handleSave = async () => {
    try {
      const profileUpdates = {
        full_name: formData.full_name || null,
        username: formData.username || null
      };

      const profileSuccess = await updateProfile(profileUpdates);
      
      let phoneSuccess = true;
      if (formData.phone_number !== (userRole?.phone_number || '')) {
        phoneSuccess = await updatePhoneNumber(formData.phone_number);
      }

      if (profileSuccess && phoneSuccess) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      phone_number: userRole?.phone_number || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url || ''} alt="Profile picture" />
                  <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {profile?.full_name || 'No name set'}
              </CardTitle>
              <div className="flex justify-center mt-2">
                <Badge variant={userRole?.role === 'admin' ? 'default' : 'secondary'}>
                  <Shield className="w-3 h-3 mr-1" />
                  {userRole?.role || 'User'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {userRole?.phone_number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{userRole.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Update your personal details and contact information
                </p>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                disabled={updating}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="min-h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                      {profile?.full_name || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  ) : (
                    <div className="min-h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                      {profile?.username || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="min-h-10 px-3 py-2 border rounded-md bg-gray-100 flex items-center text-gray-600">
                    {user.email}
                    <span className="ml-2 text-xs">(Cannot be changed)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  ) : (
                    <div className="min-h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                      {userRole?.phone_number || 'Not set'}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <>
                  <Separator />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Security Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Security
            </CardTitle>
            <p className="text-sm text-gray-600">
              Manage your account security and authentication settings
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Account Role</h4>
                  <p className="text-sm text-gray-600">Your current access level</p>
                </div>
                <Badge variant={userRole?.role === 'admin' ? 'default' : 'secondary'}>
                  {userRole?.role || 'User'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;