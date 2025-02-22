'use client';

import { UserPlus, AlertTriangle, Video } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      title: 'Motion Detected',
      location: 'Camera 1 - Main Entrance',
      time: '2 minutes ago',
    },
    {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      title: 'Low Light Warning',
      location: 'Camera 2 - Parking Lot',
      time: '15 minutes ago',
    },
    {
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: 'Recording Started',
      location: 'Camera 3 - Reception',
      time: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
            <activity.icon className={`h-4 w-4 ${activity.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.location}</p>
            <p className="text-xs text-gray-400">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}