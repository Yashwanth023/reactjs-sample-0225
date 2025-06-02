
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User } from 'lucide-react';
import { useRandomAvatar } from '@/hooks/useRandomAvatar';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export function UserProfile({ userName, userEmail, onLogout }: UserProfileProps) {
  const { avatar, loading } = useRandomAvatar();
  const { toast } = useToast();

  const handleProfileClick = () => {
    toast({
      title: 'Profile',
      description: 'Profile settings coming soon!',
    });
  };

  const handleSettingsClick = () => {
    toast({
      title: 'Settings',
      description: 'Settings panel coming soon!',
    });
  };

  const handleLogoutClick = () => {
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    onLogout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={userName} />
            <AvatarFallback className="bg-blue-500 text-white">
              {loading ? '...' : userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl rounded-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-900">{userName}</p>
            <p className="text-xs leading-none text-gray-600">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onClick={handleProfileClick}
          className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-gray-700 hover:text-blue-700"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSettingsClick}
          className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-gray-700 hover:text-blue-700"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onClick={handleLogoutClick} 
          className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
