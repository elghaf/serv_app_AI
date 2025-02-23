'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Analytics() {
  useEffect(() => {
    // Initialize charts here using a charting library
    // For production, consider using React-specific charting libraries
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="occupancyChart" className="h-64" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Motion Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="motionChart" className="h-64" />
        </CardContent>
      </Card>
    </div>
  );
}
