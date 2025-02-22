'use client';

import { Badge } from '@/components/ui/badge';

export function SystemStatus() {
  const cameras = [
    {
      name: 'Camera 1',
      location: 'Main Entrance',
      status: 'online',
    },
    {
      name: 'Camera 2',
      location: 'Parking Lot',
      status: 'online',
    },
    {
      name: 'Camera 3',
      location: 'Reception',
      status: 'maintenance',
    },
    {
      name: 'Camera 4',
      location: 'Storage Area',
      status: 'online',
    },
  ];

  return (
    <div className="space-y-4">
      {cameras.map((camera, index) => (
        <div key={index} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{camera.name}</p>
            <p className="text-xs text-gray-500">{camera.location}</p>
          </div>
          <Badge variant={camera.status === 'online' ? 'success' : 'warning'}>
            {camera.status === 'online' ? 'Online' : 'Maintenance'}
          </Badge>
        </div>
      ))}
    </div>
  );
}