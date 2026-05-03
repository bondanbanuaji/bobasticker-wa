import type { BotStatus } from '../hooks/useBotState';

interface StatusBadgeProps {
  status: BotStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'connecting': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'offline': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      case 'qr': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'offline': return 'Offline';
      case 'qr': return 'Waiting for Scan';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-full border border-white/10 text-sm font-medium">
      <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span>{getStatusText()}</span>
    </div>
  );
}
