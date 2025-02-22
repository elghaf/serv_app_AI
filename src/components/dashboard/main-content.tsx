'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CameraGrid } from '@/components/dashboard/camera-grid';
import { Analytics } from '@/components/dashboard/analytics';
import { StatusMonitor } from '@/components/dashboard/status-monitor';
import { toast } from 'sonner';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function MainContent({ user }) {
  const [selectedCamera, setSelectedCamera] = useState('camera-1');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState<Date | null>(null);
  const [detectionStats, setDetectionStats] = useState({
    totalFrames: 0,
    detections: 0,
    errors: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      setIsBackendConnected(response.ok);
    } catch (error) {
      setIsBackendConnected(false);
      toast.error('Backend connection failed');
    }
  };

  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to access webcam');
      console.error('Error accessing webcam:', err);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const sendFrame = async (blob: Blob) => {
    console.log('Attempting to send frame:', {
      blobSize: blob.size,
      blobType: blob.type,
      timestamp: new Date().toISOString()
    });

    const formData = new FormData();
    formData.append('frame', blob);
    
    try {
      console.log('Sending request to:', `${BACKEND_URL}/detect/stream`);
      const response = await fetch(`${BACKEND_URL}/detect/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      });
      
      console.log('Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Frame processing result:', result);

      setLastFrameTime(new Date());
      setDetectionStats(prev => ({
        ...prev,
        totalFrames: prev.totalFrames + 1,
      }));

      if (result.has_fire) {
        toast.error('Fire detected!', {
          description: `Confidence: ${(result.confidence_score * 100).toFixed(1)}%`,
        });
        setDetectionStats(prev => ({
          ...prev,
          detections: prev.detections + 1,
        }));
      }
    } catch (error) {
      console.error('Error sending frame:', error);
      setDetectionStats(prev => ({
        ...prev,
        errors: prev.errors + 1,
      }));
    }
  };

  const startDetection = () => {
    if (!canvasRef.current || !videoRef.current) {
        console.log('Canvas or video ref not ready');
        return () => {};
    }

    console.log('Starting detection with streaming state:', isStreaming);

    const processFrame = () => {
      if (!isStreaming) {
        console.log('Streaming is paused');
        return;
      }

      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          console.log('Video not ready for frame capture');
          return;
      }
      
      console.log('Processing frame:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          videoReadyState: video.readyState,
          timestamp: new Date().toISOString(),
          isStreaming: isStreaming
      });
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          console.log('Failed to get canvas context');
          return;
      }
      
      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and send
      canvas.toBlob(
        (blob) => {
          if (blob) {
              console.log('Frame captured and converted to blob:', {
                  size: blob.size,
                  type: blob.type,
                  isStreaming: isStreaming
              });
              sendFrame(blob);
          } else {
              console.log('Failed to create blob from canvas');
          }
        },
        'image/jpeg',
        0.8
      );
    };

    console.log('Setting up detection interval');
    const detectionInterval = setInterval(processFrame, 1000);

    return () => {
        console.log('Cleaning up detection interval');
        clearInterval(detectionInterval);
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.play();
      setIsStreaming(true);
      startDetection();
      toast.success('Video uploaded successfully');
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
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
                <Button onClick={isStreaming ? stopWebcam : startWebcam}>
                  <Video className="mr-2 h-4 w-4" />
                  {isStreaming ? 'Stop' : 'Start'} Camera
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('videoUpload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
                <input
                  id="videoUpload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="object-cover w-full h-full"
              />
              <canvas 
                ref={canvasRef} 
                className="hidden absolute top-0 left-0" 
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Camera is off
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <StatusMonitor
            isBackendConnected={isBackendConnected}
            isStreaming={isStreaming}
            lastFrameTime={lastFrameTime}
            detectionStats={detectionStats}
            onRefresh={checkBackendConnection}
          />
        </div>
      </div>

      <CameraGrid />
      <Analytics />
    </div>
  );
}
