import type { BotStats } from '../hooks/useBotState';
import { Card } from './ui/card';
import { MessageSquare, Zap, Clock, ShieldCheck } from 'lucide-react';

interface StatsOverviewProps {
  stats?: BotStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatUptime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}j ${minutes}m ${seconds}s`;
  };

  const items = [
    {
      label: 'Pesan Diproses',
      value: stats?.messagesProcessed || 0,
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Stiker Dibuat',
      value: (stats as any)?.totalStickers || 0,
      icon: Zap,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Waktu Aktif',
      value: stats?.uptime ? formatUptime(stats.uptime) : '0j 0m 0s',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Status Sistem',
      value: 'Online',
      icon: ShieldCheck,
      color: 'text-[#075e54]',
      bg: 'bg-emerald-100/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, idx) => (
        <Card key={idx} className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col gap-4 hover:shadow-md transition-all border-b-4 border-slate-100">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Realtime</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
