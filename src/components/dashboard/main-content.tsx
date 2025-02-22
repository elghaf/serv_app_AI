'use client';

import { useState } from 'react';
import { Settings, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CameraGrid } from '@/components/dashboard/camera-grid';
import { Analytics } from '@/components/dashboard/analytics';

export function MainContent() {
  const [selectedCamera, setSelectedCamera] = useState('camera-1');

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="camera-1">Camera 1 - Main Entrance</SelectItem>
              <SelectItem value="camera-2">Camera 2 - Parking Lot</SelectItem>
              <SelectItem value="camera-3">Camera 3 - Reception</SelectItem>
              <SelectItem value="camera-4">Camera 4 - Storage Area</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-4">
            <Button>
              <Video className="mr-2 h-4 w-4" />
              Record
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
          <video id="player" playsInline controls>
            <source src="#" type="video/mp4" />
          </video>
        </div>
        <CameraGrid />
      </div>
      <Analytics />
    </>
  );
}