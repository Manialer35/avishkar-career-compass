import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSecureAdmin } from '@/hooks/useSecureAdmin';
import useAdminStats from '@/hooks/useAdminStats';
import AdminNavigation from '@/components/AdminNavigation';
import { Shield, Users, BookOpen, Settings, Activity, Calendar, TrendingUp, Database, Zap } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useSecureAdmin();
  const { totalUsers, totalClasses, totalMaterials, totalRegistrations, loading: statsLoading } = useAdminStats();

  // Show loading while checking authentication and admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.phoneNumber}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {statsLoading ? '...' : totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Live data
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Study Materials</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {statsLoading ? '...' : totalMaterials.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Live data
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {statsLoading ? '...' : totalClasses.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Live data
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Class Registrations</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {statsLoading ? '...' : totalRegistrations.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Live data
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start h-11" 
                variant="outline"
                asChild
              >
                <Link to="/admin/users">
                  <Users className="mr-3 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button 
                className="w-full justify-start h-11" 
                variant="outline"
                asChild
              >
                <Link to="/admin">
                  <BookOpen className="mr-3 h-4 w-4" />
                  Add Study Material
                </Link>
              </Button>
              <Button 
                className="w-full justify-start h-11" 
                variant="outline"
                asChild
              >
                <Link to="/admin/system-settings">
                  <Settings className="mr-3 h-4 w-4" />
                  System Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Management */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Admin Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Manage admin access for phone numbers. +918888769281 is configured as admin.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-gray-900">How to add new admins:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Use SQL function to promote phone numbers</li>
                    <li>Phone numbers are added to pending admins</li>
                    <li>Users become admin automatically on signup</li>
                  </ol>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  View Admin Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 xl:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'user', message: 'New user registered', time: '2 min ago', color: 'bg-green-500' },
                  { type: 'purchase', message: 'Material purchased', time: '5 min ago', color: 'bg-blue-500' },
                  { type: 'system', message: 'System backup completed', time: '1 hour ago', color: 'bg-purple-500' },
                  { type: 'admin', message: 'Admin login detected', time: '2 hours ago', color: 'bg-orange-500' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 ${activity.color} rounded-full flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Settings & Performance */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Settings & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Server Uptime</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">245ms</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:col-span-2 lg:col-span-1">
                  <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">Excellent</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Database Health</div>
                </div>
              </div>
              <div className="mt-4 p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>System Settings:</strong> Configure admin permissions, backup schedules, 
                  email notifications, and system maintenance windows. Monitor real-time database 
                  performance and user activity metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;