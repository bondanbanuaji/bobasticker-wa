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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f0f2f5] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#00a884] z-0"></div>
      <div className="bg-whatsapp-pattern"></div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        {/* Header Logo */}
        <div className="flex items-center gap-3 mb-12 animate-in opacity-0 [--index:0] text-white">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
            <MessageSquare className="w-8 h-8 text-white fill-white/20" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none">BobaSticker</h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 opacity-80 mt-1">Sticker Engine 3.0</p>
          </div>
        </div>

        <div className="w-full max-w-md animate-in opacity-0 [--index:1]" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
            {/* Top Accent */}
            <div className="h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600"></div>
            
            <div className="p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800">Masuk Dashboard</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Gunakan kredensial admin untuk melanjutkan.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="admin@bobasticker.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all font-medium placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Secure Password
                      </Label>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input 
                        id="password" 
                        type="password" 
                        required
                        value={password}
                        placeholder="••••••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all font-medium placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl font-extrabold text-sm shadow-[0_10px_20px_-5px_rgba(0,168,132,0.3)] transition-all active:scale-[0.98] group flex items-center justify-center gap-2" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memverifikasi...
                    </span>
                  ) : (
                    <>
                      Masuk ke Sistem
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-slate-400">Enterprise Security</span>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Protected by BobaGuard Secure Auth
              </p>
            </div>
          </div>
          
          <p className="mt-8 text-center text-slate-400 text-xs font-bold">
            &copy; 2026 BobaSticker Team. <span className="text-emerald-600">All Rights Reserved.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
