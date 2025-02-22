'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Backend Connection</span>
              <span className={`text-sm font-medium ${isBackendConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isBackendConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Streaming Status</span>
              <span className={`text-sm font-medium ${isStreaming ? 'text-green-500' : 'text-yellow-500'}`}>
                {isStreaming ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Frame</span>
              <span className="text-sm">
                {lastFrameTime ? new Date(lastFrameTime).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Detection Statistics</h4>
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