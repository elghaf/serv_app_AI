'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StatusMonitorProps {
  isBackendConnected: boolean;
  isStreaming: boolean;
  lastFrameTime: Date | null;
  detectionStats: {
    totalFrames: number;
    detections: number;
    errors: number;
  };
  onRefresh: () => void;
}

export function StatusMonitor({
  isBackendConnected,
  isStreaming,
  lastFrameTime,
  detectionStats,
  onRefresh,
}: StatusMonitorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      console.log('🔄 Refreshing system status...');
      setIsRefreshing(true);
      await onRefresh();
      console.log('✅ System status refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh system status:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Minimum spinning time for better UX
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "transition-all duration-200",
            isRefreshing && "animate-spin"
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Backend Connection</span>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${isBackendConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isBackendConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Streaming Status</span>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className={`text-sm font-medium ${isStreaming ? 'text-green-500' : 'text-yellow-500'}`}>
                  {isStreaming ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Frame</span>
              <span className="text-sm font-medium">
                {lastFrameTime ? new Date(lastFrameTime).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none">Detection Statistics</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-secondary/10 rounded-lg">
                <span className="text-xs text-muted-foreground">Frames</span>
                <span className="text-lg font-bold">{detectionStats.totalFrames}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-secondary/10 rounded-lg">
                <span className="text-xs text-muted-foreground">Detections</span>
                <span className="text-lg font-bold">{detectionStats.detections}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-secondary/10 rounded-lg">
                <span className="text-xs text-muted-foreground">Errors</span>
                <span className="text-lg font-bold">{detectionStats.errors}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
