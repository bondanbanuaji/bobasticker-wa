import { useState } from 'react';
import { useAuth } from '../hooks/auth-context';
import { useBotState } from '../hooks/useBotState';
import { StatusBadge } from '../components/StatusBadge';
import { QrDisplay } from '../components/QrDisplay';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { ActivityLogs } from '../components/ActivityLogs';
import { BotSettings } from '../components/BotSettings';
import { StatsOverview } from '../components/StatsOverview';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Power, LogOut, RefreshCw, ServerOff, Activity, Smartphone, Plus, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

export function DashboardPage() {
  const { signOut } = useAuth();
  const botState = useBotState();
  const [isRestarting, setIsRestarting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Broadcast State
  const [broadcastJid, setBroadcastJid] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleRestart = async () => {
    setIsRestarting(true);
    botState.restart();
    toast.info('Perintah restart telah dikirim');
    setTimeout(() => setIsRestarting(false), 3000);
  };

  const handleBotLogout = async () => {
    setIsLoggingOut(true);
    botState.logout();
    toast.success('Sesi bot telah dihapus');
    setTimeout(() => setIsLoggingOut(false), 3000);
  };

  const handleBroadcast = () => {
    if (!broadcastJid || !broadcastMsg) {
      toast.error('Mohon isi semua bidang siaran');
      return;
    }
    setIsBroadcasting(true);
    botState.broadcast(broadcastJid, broadcastMsg);
    toast.success('Siaran berhasil dikirim');
    setBroadcastMsg('');
    setTimeout(() => setIsBroadcasting(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111b21] font-sans">
      
      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 bg-[#075e54] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner">🍵</div>
            <div>
              <h1 className="text-xl text-white font-bold tracking-tight leading-none">BobaSticker Hub</h1>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-[0.2em] mt-1">Pro Admin Panel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#128c7e] border border-[#25d366]/20 rounded-full shadow-sm">
              <StatusBadge status={botState.status} />
            </div>
            
            <div className="w-px h-6 bg-white/20 mx-1 hidden md:block"></div>
            
            <button 
              onClick={signOut} 
              className="text-sm font-bold text-white/80 hover:text-white transition-colors flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              Dashboard
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </h2>
            <p className="text-slate-500 font-bold text-sm">Kelola bot WhatsApp Anda secara real-time.</p>
          </div>
          
          <Dialog>
            <DialogTrigger
              render={
                <Button 
                  className="bg-[#25d366] hover:bg-[#128c7e] text-white font-extrabold h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20 border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all"
                  disabled={botState.status !== 'connected'}
                />
              }
            >
              <Plus className="w-5 h-5 mr-2" />
              Siaran Baru
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 rounded-2xl shadow-2xl sm:max-w-lg">
              <DialogHeader className="border-b border-slate-100 pb-4">
                <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-500" />
                  Kirim Pesan Siaran
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-sm pt-1">
                  Pesan akan dikirim langsung melalui nomor WhatsApp bot.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor Tujuan / JID</p>
                  <Input 
                    placeholder="Contoh: 628xxx atau 123456789@g.us" 
                    value={broadcastJid}
                    onChange={(e) => setBroadcastJid(e.target.value)}
                    className="rounded-lg h-10 bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Isi Pesan</p>
                  <Textarea 
                    placeholder="Tulis pesan Anda di sini..." 
                    className="min-h-[120px] rounded-lg bg-slate-50 border-slate-200"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleBroadcast} 
                  disabled={isBroadcasting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-lg"
                >
                  {isBroadcasting ? 'Mengirim...' : 'Kirim Siaran Sekarang'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={botState.stats} />

        {botState.error && (
          <Card className="bg-red-50 border-red-100 p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <ServerOff className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-bold text-red-800 text-sm">Kesalahan Koneksi</p>
              <p className="text-red-600 text-xs font-medium">{botState.error}</p>
            </div>
          </Card>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Status Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-8 flex flex-col items-center justify-center text-center bg-white border-slate-200 shadow-sm rounded-xl h-full min-h-[420px]">
              {botState.status === 'connected' ? (
                <div className="space-y-8 flex flex-col items-center w-full">
                  <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                      <Smartphone className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Bot Aktif</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                      Koneksi WhatsApp stabil. BobaSticker siap memproses pesan masuk.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                    <Button 
                      variant="outline" 
                      onClick={handleRestart}
                      disabled={isRestarting}
                      className="rounded-lg border-slate-200 h-10 text-xs font-bold hover:bg-slate-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isRestarting ? 'animate-spin' : ''}`} />
                      Restart
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleBotLogout}
                      disabled={isLoggingOut}
                      className="rounded-lg border-slate-200 h-10 text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                    >
                      <Power className="w-3.5 h-3.5 mr-2" />
                      Putus
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 w-full flex flex-col items-center animate-in fade-in duration-700">
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">Tautkan Perangkat</h3>
                    <p className="text-slate-500 text-sm font-medium">Scan QR dengan WhatsApp Anda</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-md">
                    <QrDisplay qr={botState.qr} />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse"></span>
                    Menunggu Koneksi
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Settings & Logs Column */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Analytics Summary */}
              <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Lalu Lintas Pesan
                  </h3>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 overflow-hidden">
                  <AnalyticsChart />
                </div>
              </Card>

              {/* Bot Settings */}
              <BotSettings 
                config={botState.config} 
                onUpdate={botState.updateConfig} 
              />
            </div>

            {/* Activity Logs */}
            <div className="h-[480px]">
              <ActivityLogs logs={botState.logs} />
            </div>

          </div>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-8 py-10 text-center border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          BobaSticker Admin Suite &copy; 2026
        </p>
      </footer>
    </div>
  );
}
