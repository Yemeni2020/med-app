import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

export default function MetricChart({ data, meta, onDelete }) {
  const [showTable, setShowTable] = useState(false);

  const chartData = data.map(d => ({
    ...d,
    date: format(new Date(d.recorded_date), 'MMM d'),
    fullDate: d.recorded_date,
  }));

  const values = data.map(d => d.value);
  const latest = values[values.length - 1];
  const previous = values[values.length - 2];
  const trend = previous !== undefined ? latest - previous : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-lg">{meta.label} History</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{data.length} entries</span>
            {previous !== undefined && (
              <span className={`flex items-center gap-0.5 font-medium ${trendColor}`}>
                <TrendIcon className="w-3.5 h-3.5" />
                {Math.abs(trend).toFixed(1)} {meta.unit} vs prev
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowTable(t => !t)} className="text-xs rounded-lg">
          {showTable ? 'Show Chart' : 'Show Table'}
        </Button>
      </div>

      {!showTable ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
              formatter={(v) => [`${v} ${meta.unit}`, meta.label]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={meta.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: meta.color, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="overflow-auto max-h-56">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left pb-2 font-medium">Date</th>
                <th className="text-right pb-2 font-medium">Value</th>
                <th className="text-left pb-2 font-medium pl-3">Notes</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...data].reverse().map(d => (
                <tr key={d.id} className="group">
                  <td className="py-2 text-muted-foreground">{d.recorded_date}</td>
                  <td className="py-2 text-right font-semibold">{d.value} <span className="text-xs font-normal text-muted-foreground">{meta.unit}</span></td>
                  <td className="py-2 pl-3 text-muted-foreground text-xs truncate max-w-[120px]">{d.notes || '—'}</td>
                  <td className="py-2 pl-2">
                    <button onClick={() => onDelete(d.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
