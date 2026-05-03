import { useState } from 'react';
import type { BotLog } from '../hooks/useBotState';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Clock, Terminal, User, FileJson, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface ActivityLogsProps {
  logs: BotLog[];
}

export function ActivityLogs({ logs }: ActivityLogsProps) {
  const [selectedLog, setSelectedLog] = useState<BotLog | null>(null);

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full border-b-4 border-slate-100">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#075e54] text-white">
        <h3 className="text-lg font-extrabold flex items-center gap-2 text-white">
          <Terminal className="w-5 h-5 text-emerald-300" />
          Log Aktivitas Terkini
        </h3>
        <span className="text-[10px] font-black bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
          Live Feed
        </span>
      </div>
      
      <ScrollArea className="flex-grow h-[450px] bg-[#f0f2f5]/50">
        <div className="p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="py-24 text-center text-slate-400 text-sm font-bold italic bg-white rounded-2xl border-2 border-dashed border-slate-100">
              Menunggu aktivitas dari WhatsApp...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all group relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-grow">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-extrabold text-slate-800 text-sm tracking-tight">
                        {formatAction(log.action)}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                        {log.metadata?.sender && (
                          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3" />
                            {log.metadata.pushName ? `${log.metadata.pushName} (${log.metadata.sender})` : log.metadata.sender}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger
                      render={
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer" />
                      }
                    >
                      <FileJson className="w-5 h-5" />
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200 rounded-2xl shadow-2xl sm:max-w-md">
                      <DialogHeader className="border-b border-slate-100 pb-4">
                        <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-500" />
                          Detail Aktivitas
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-6 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Aksi</span>
                            <span className="col-span-2 text-sm font-bold text-slate-800">{formatAction(log.action)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Waktu</span>
                            <span className="col-span-2 text-sm font-bold text-slate-800">{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                          {log.metadata?.pushName && (
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Nama WA</span>
                              <span className="col-span-2 text-sm font-bold text-emerald-600">{log.metadata.pushName}</span>
                            </div>
                          )}
                          {log.metadata?.sender && (
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Nomor WA</span>
                              <span className="col-span-2 text-sm font-bold text-slate-800">{log.metadata.sender}</span>
                            </div>
                          )}
                          {log.metadata?.chatId && (
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">ID Chat</span>
                              <span className="col-span-2 text-[10px] font-medium text-slate-500 break-all">{log.metadata.chatId}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-slate-900 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Raw Metadata</p>
                          <pre className="text-[10px] text-emerald-400 overflow-x-auto font-mono whitespace-pre-wrap">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
