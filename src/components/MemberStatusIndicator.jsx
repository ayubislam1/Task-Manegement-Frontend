import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MemberStatusIndicator = ({ member, onlineMembers = [], showEmail = false, size = 'md' }) => {
  // Check if this member is currently online
  const isOnline = onlineMembers.some(onlineMember => 
    onlineMember.email === member.email || 
    onlineMember.uid === member.uid ||
    onlineMember.uid === member._id
  );

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-xs',
      badge: 'w-2 h-2',
      padding: 'p-1'
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      badge: 'w-3 h-3',
      padding: 'p-2'
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-base',
      badge: 'w-3.5 h-3.5',
      padding: 'p-3'
    }
  };

  const config = sizeConfig[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex items-center cursor-pointer">
            <Avatar className={`${config.avatar} border-2 border-white dark:border-gray-800`}>
              <AvatarImage
                src={member.photoURL || ""}
                alt={member.name || "User"}
              />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {member.name ? member.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            
            {/* Online status indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 ${config.badge} rounded-full border-2 border-white dark:border-gray-800 ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            
            {showEmail && member.email && (
              <span className={`ml-2 ${config.text} text-gray-600 dark:text-gray-300`}>
                {member.email}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{member.name || "Unknown User"}</div>
            {member.email && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
            )}
            {member.role && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {member.role}
              </Badge>
            )}
            <div className={`mt-1 text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MemberStatusIndicator;
