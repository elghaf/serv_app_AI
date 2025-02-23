'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SourceSelector() {
  const [selectedDevice, setSelectedDevice] = useState<string>('camera-1');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getDevices = () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        setIsLoading(false);
        return;
      }

      navigator.mediaDevices.enumerateDevices()
        .then(deviceList => {
          if (!mounted) return;
          
          const videoDevices = deviceList
            .filter(device => device.kind === 'videoinput')
            .map(device => ({
              ...device,
              deviceId: device.deviceId?.trim() || 'default-camera'
            }));
            
          setDevices(videoDevices);
          
          if (videoDevices.length > 0) {
            setSelectedDevice(videoDevices[0].deviceId);
          }
        })
        .catch(err => {
          console.error('Error accessing media devices:', err);
        })
        .finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
    };

    getDevices();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <div>Loading cameras...</div>;
  }

  const getDeviceLabel = (device: MediaDeviceInfo, index: number) => {
    if (device.label) return device.label;
    if (device.deviceId === 'default-camera') return 'Default Camera';
    return `Camera ${index + 2}`;
  };

  return (
    <Select
      value={selectedDevice}
      onValueChange={setSelectedDevice}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a camera" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="camera-1">Camera 1</SelectItem>
        {devices.map((device, index) => (
          <SelectItem 
            key={`camera-${index + 2}`}
            value={device.deviceId}
          >
            {getDeviceLabel(device, index)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
