import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail, MessageSquare, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Akses Ditolak: ' + error.message);
      } else {
        toast.success('Selamat Datang, Admin!');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan pada sistem autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f8fafc] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-100/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="bg-whatsapp-pattern opacity-[0.03]"></div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in">
        {/* Minimalist Logo */}
        <div className="flex flex-col items-center mb-10 group">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
            <MessageSquare className="w-8 h-8 text-white fill-white/10" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-900 tracking-tighter">BobaSticker<span className="text-emerald-500">.</span></h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-4 bg-slate-200"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sticker Engine 3.0</p>
            <span className="h-px w-4 bg-slate-200"></span>
          </div>
        </div>

        <div className="glass-morphism rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden border border-white/40">
          <div className="p-10">
            <div className="mb-10 text-center">
              <h2 className="text-xl font-black text-slate-800">Admin Login</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Sistem manajemen stiker otomatis</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@bobasticker.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 pl-12 bg-white/50 border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input 
                      id="password" 
                      type="password" 
                      required
                      value={password}
                      placeholder="••••••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 bg-white/50 border-slate-200/60 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all active:scale-[0.98] group flex items-center justify-center gap-3 overflow-hidden relative" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Masuk ke Kontrol Panel</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>
          
          <div className="px-10 py-6 bg-slate-50/50 border-t border-white/40 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Sistem Terenkripsi End-to-End
            </p>
          </div>
        </div>
        
        <p className="mt-10 text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          Build v3.0.0 &bull; <span className="text-slate-800">BobaSticker Team</span>
        </p>
      </div>
    </div>
  );
}
