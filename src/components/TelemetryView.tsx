import React from 'react';
import { Card, Badge } from '@inducore/ui-kit';
import { Cpu, Activity, AlertOctagon, RefreshCw } from 'lucide-react';

export const TelemetryView: React.FC = () => {
  const sensors = [
    { id: 'sensor-vib-01', asset: 'Primary Crude Pump #3', metric: 'Vibration Drift', value: '4.2 mm/s', status: 'WARNING', threshold: '3.8 mm/s' },
    { id: 'sensor-temp-04', asset: 'Main Compressor Bearing', metric: 'Operating Temperature', value: '88.5 °C', status: 'NORMAL', threshold: '95.0 °C' },
    { id: 'sensor-pres-09', asset: 'Steam Reformer Manifold', metric: 'Line Pressure', value: '14.2 Bar', status: 'NORMAL', threshold: '16.0 Bar' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Plant Floor IoT & Telemetry Streaming</h2>
        <p className="text-xs text-slate-500 mt-1">Subdomain: <span className="font-semibold text-slate-700">Supporting IoT Telemetry Streamer</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sensors.map(s => (
          <Card key={s.id} title={s.asset} subtitle={`Sensor ID: ${s.id}`}>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{s.metric}</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-400">Threshold: {s.threshold}</span>
                <Badge variant={s.status === 'NORMAL' ? 'success' : 'warning'}>{s.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
