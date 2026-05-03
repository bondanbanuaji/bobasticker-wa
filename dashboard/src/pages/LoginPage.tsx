import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

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
        toast.error('Gagal masuk: ' + error.message);
      } else {
        toast.success('Berhasil masuk ke dashboard');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan tak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
      <Card className="w-full max-w-[400px] bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="space-y-1.5 pt-8 pb-6 px-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍵</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-slate-900 tracking-tight">
            BobaSticker
          </CardTitle>
          <CardDescription className="text-center text-slate-500 text-sm">
            Masuk ke panel kontrol admin
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin} className="px-8 pb-8">
          <CardContent className="space-y-4 p-0 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 text-xs font-semibold">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@boba.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-white border-slate-200 focus-visible:ring-slate-400 rounded-md transition-all shadow-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 text-xs font-semibold">Kata Sandi</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-white border-slate-200 focus-visible:ring-slate-400 rounded-md transition-all shadow-none"
              />
            </div>
          </CardContent>
          <CardFooter className="p-0">
            <Button 
              className="w-full h-10 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-all active:scale-[0.98]" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
          Sistem Autentikasi Terenkripsi
        </p>
      </div>
    </div>
  );
}
