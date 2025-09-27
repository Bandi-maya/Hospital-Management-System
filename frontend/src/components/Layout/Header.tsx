import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Shield,
  Heart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Header: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const handleProfileSettings = () => {
    navigate('/settings');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const handleSystemSettings = () => {
    navigate('/system-settings');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nurse': return 'bg-green-100 text-green-800 border-green-200';
      case 'patient': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'receptionist': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pharmacist': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lab_technician': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Logo and Sidebar Trigger */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">MediCare HMS</h1>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search patients, doctors, appointments..."
              className="pl-10 pr-4 border-gray-300 focus:border-blue-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Section - Notifications and User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 border border-gray-200 hover:bg-gray-50 rounded-lg"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white border-2 border-white flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border border-gray-200">
              <DropdownMenuLabel className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                Notifications
              </DropdownMenuLabel>
              <div className="space-y-3 p-3 max-h-80 overflow-y-auto">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">New appointment request</p>
                    <p className="text-gray-600 text-sm mt-1">John Smith requested an appointment</p>
                    <p className="text-xs text-gray-400 mt-2">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Lab results ready</p>
                    <p className="text-gray-600 text-sm mt-1">Blood test results for Patient ID: P001</p>
                    <p className="text-xs text-gray-400 mt-2">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Discharge completed</p>
                    <p className="text-gray-600 text-sm mt-1">Mary Johnson has been discharged</p>
                    <p className="text-xs text-gray-400 mt-2">3 hours ago</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white font-medium">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 border border-gray-200 rounded-lg"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-4 border-b border-gray-100">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs border ${getRoleColor(user?.role || '')}`}
                  >
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <div className="p-1">
                <DropdownMenuItem
                  onClick={handleProfileSettings}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSystemSettings}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  System Settings
                </DropdownMenuItem>

                {hasRole('admin') && (
                  <DropdownMenuItem
                    onClick={handleAdminPanel}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
              </div>

              <DropdownMenuSeparator className="bg-gray-100" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;