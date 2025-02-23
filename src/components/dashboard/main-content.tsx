'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CameraGrid } from '@/components/dashboard/camera-grid';
import { Analytics } from '@/components/dashboard/analytics';
import { StatusMonitor } from '@/components/dashboard/status-monitor';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

interface MainContentProps {
  user: User | null;
}

const MainContent: React.FC<MainContentProps> = ({ user }) => {
  const { getToken } = useAuth();
  const [selectedCamera, setSelectedCamera] = useState('camera-1');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState<Date | null>(null);
  const [detectionStats, setDetectionStats] = useState({
    totalFrames: 0,
    detections: 0,
    errors: 0,
  });
  
  const [audioPermission, setAudioPermission] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<OscillatorNode | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const [webcamRef] = useState<any>(null);
  const [frameData, setFrameData] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Add the improved dataURItoBlob helper function
  const dataURItoBlob = (dataURI: string): Blob => {
    try {
      // Validate input
      if (!dataURI || typeof dataURI !== 'string') {
        throw new Error('Invalid data URI');
      }

      // Split the data URI to get the base64 data
      const splitDataURI = dataURI.split(',');
      if (splitDataURI.length !== 2) {
        throw new Error('Invalid data URI format');
      }

      const byteString = atob(splitDataURI[1]);
      
      // Extract MIME type more safely
      const mimeMatch = splitDataURI[0].match(/:(.*?);/);
      if (!mimeMatch) {
        throw new Error('Could not extract MIME type');
      }
      const mimeString = mimeMatch[1];
      
      // Convert base64 to byte array
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      return new Blob([ab], { type: mimeString });
    } catch (error) {
      console.error('Error converting data URI to Blob:', error);
      throw error;
    }
  };

  // Updated capture frame function
  const captureFrame = async (videoElement: HTMLVideoElement): Promise<string | null> => {
    try {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        throw new Error('Invalid video dimensions');
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(videoElement, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8); // Adjust quality as needed
    } catch (error) {
      console.error('Frame capture error:', error);
      return null;
    }
  };

  // Updated send frame to server function
  const sendFrameToServer = useCallback(async (frameBlob: Blob): Promise<any> => {
    try {
      // Get Clerk JWT token
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const formData = new FormData();
      formData.append('file', frameBlob, 'frame.jpg');

      // Log the token being sent (first few characters)
      console.log('Sending token:', token.substring(0, 10) + '...');

      const response = await fetch('http://localhost:8000/predict_fire', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending frame to server:', error);
      throw error;
    }
  }, [getToken]);

  // Get camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to get camera devices:', error);
        toast.error('Failed to get camera devices');
      }
    };
    getDevices();
  }, []);

  // Use the query hook at the component level
  const { data, error, isLoading } = useQuery({
    queryKey: ['frameAnalysis', frameData],
    queryFn: () => frameData ? sendFrameToServer(dataURItoBlob(frameData)) : null,
    enabled: !!frameData, // Only run query when frameData exists
  });

  // Initialize audio context
  const initAudioContext = async () => {
    try {
      if (!audioPermission) {
        const userConsent = window.confirm("Fire alarm requires audio permission. Allow?");
        if (!userConsent) return false;

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        setAudioPermission(true);
        return true;
      }
      return true;
    } catch (error) {
      console.error("Audio initialization error:", error);
      toast.error("Audio initialization failed");
      return false;
    }
  };

  // Alert sound controls
  const stopAlertSound = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }
  };

  const playAlertSound = () => {
    if (!audioContextRef.current) return;
    stopAlertSound();

    const oscillator = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
    oscillator.frequency.linearRampToValueAtTime(880, audioContextRef.current.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(440, audioContextRef.current.currentTime + 1);

    gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

    oscillator.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    oscillator.start();
    sourceNodeRef.current = oscillator;
  };

  // Add polling function
  const showFireAlert = () => {
    const flashOverlay = document.createElement('div');
    flashOverlay.className = 'fixed inset-0 pointer-events-none animate-screenFlash';
    document.body.appendChild(flashOverlay);
    
    const alertElement = document.createElement('div');
    alertElement.innerHTML = `
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2c0 6-8 7.5-8 14a8 8 0 0 0 16 0c0-6.5-8-8-8-14z"/>
        </svg>
        <div>
          <div class="font-semibold mb-0.5">Fire Detected</div>
          <div class="text-sm opacity-90">Fire detected. Please check immediately.</div>
        </div>
      </div>
    `;
    
    alertElement.className = `
      fixed bottom-6 right-6 p-4
      bg-red-500/90 text-white
      rounded-xl shadow-lg
      backdrop-blur-md
      max-w-[400px] z-[9999]
      font-sans
      animate-slideIn animate-pulse animate-flashBorder
    `;

    document.body.appendChild(alertElement);

    const timeout = setTimeout(() => {
      if (document.body.contains(alertElement)) {
        alertElement.classList.remove('animate-slideIn');
        alertElement.classList.add('animate-slideOut');
        flashOverlay.remove();
        setTimeout(() => {
          document.body.removeChild(alertElement);
        }, 500);
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(alertElement)) {
        document.body.removeChild(alertElement);
      }
      if (document.body.contains(flashOverlay)) {
        flashOverlay.remove();
      }
    };
  };

  const startPolling = useCallback(async () => {
    if (!videoRef.current || !isPolling) return;

    try {
      const frame = await captureFrame(videoRef.current);
      if (!frame) return;

      const response = await fetch(frame);
      const blob = await response.blob();

      const result = await sendFrameToServer(blob);
      
      setDetectionStats(prev => ({
        totalFrames: prev.totalFrames + 1,
        detections: prev.detections + (result.detections?.length || 0),
        errors: prev.errors
      }));

      setLastFrameTime(new Date().toISOString());

      if (result.message === "fire detected") {
        playAlertSound();
        showFireAlert();
      }

    } catch (error) {
      console.error('Polling error:', error);
      setDetectionStats(prev => ({
        ...prev,
        errors: prev.errors + 1
      }));
    }
  }, [isPolling, sendFrameToServer, playAlertSound]);

  // Manage polling interval
  useEffect(() => {
    if (isPolling && !pollingInterval.current) {
      pollingInterval.current = setInterval(startPolling, 1000); // Poll every second
    } else if (!isPolling && pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [isPolling, startPolling]);

  const startWebcam = async () => {
    try {
      const audioInitialized = await initAudioContext();
      if (!audioInitialized) {
        toast.error('Audio permission denied');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevice },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setIsPolling(true); // Start polling when camera starts
        toast.success('Camera started successfully');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Failed to access camera');
    }
  };

  const stopWebcam = () => {
    stopAlertSound();
    setIsPolling(false); // Stop polling when camera stops
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setDetectionStats({
        totalFrames: 0,
        detections: 0,
        errors: 0,
      });
      toast.success('Camera stopped');
    }
  };

  const checkBackendConnection = async () => {
    try {
      setIsCheckingConnection(true);
      
      const token = await getToken();
      const url = 'http://localhost:8000/health';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors'
      });
      
      setIsBackendConnected(response.ok);
      return response.ok;
    } catch (error) {
      console.error('Backend connection error:', error);
      setIsBackendConnected(false);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  useEffect(() => {
    checkBackendConnection();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-4">
                <Button onClick={isStreaming ? stopWebcam : startWebcam}>
                  <Video className="mr-2 h-4 w-4" />
                  {isStreaming ? 'Stop' : 'Start'} Camera
                </Button>
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
};

export default MainContent;

