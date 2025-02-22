'use client';

import { AlertCircle, CheckCircle2, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_CONFIG } from '@/lib/api-config';
import { useState } from 'react';
import { toast } from 'sonner';

interface StatusProps {
  isBackendConnected: boolean;
  isStreaming: boolean;
  lastFrameTime: Date | null;
  detectionStats: {
    totalFrames: number;
    detections: number;
    errors: number;
  };
  onRefresh?: () => void;
}

export function StatusMonitor({ 
  isBackendConnected, 
  isStreaming, 
  lastFrameTime, 
  detectionStats,
  onRefresh 
}: StatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      onRefresh?.();
      toast.success('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Monitor</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={isRefreshing ? 'animate-spin' : ''}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Backend Connection</span>
            <div className="flex items-center">
              {isBackendConnected ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${isBackendConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isBackendConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Streaming Status</span>
            <span className={`text-sm ${isStreaming ? 'text-green-500' : 'text-gray-500'}`}>
              {isStreaming ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Last Frame Processed</span>
            <span className="text-sm text-gray-500">
              {lastFrameTime ? new Date(lastFrameTime).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xl font-semibold">{detectionStats.totalFrames}</div>
              <div className="text-xs text-gray-500">Frames Processed</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xl font-semibold">{detectionStats.detections}</div>
              <div className="text-xs text-gray-500">Detections</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xl font-semibold">{detectionStats.errors}</div>
              <div className="text-xs text-gray-500">Errors</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
