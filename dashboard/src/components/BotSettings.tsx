import { useState, useEffect } from 'react';
import type { BotConfig } from '../hooks/useBotState';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Settings, Save, ShieldAlert, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface BotSettingsProps {
  config?: BotConfig;
  onUpdate: (config: Partial<BotConfig>) => void;
}

export function BotSettings({ config, onUpdate }: BotSettingsProps) {
  const [prefix, setPrefix] = useState(config?.prefix || '.');
  const [maintenance, setMaintenance] = useState(config?.maintenance || false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setPrefix(config.prefix);
      setMaintenance(config.maintenance);
    }
  }, [config]);

  const handleSave = () => {
    onUpdate({ prefix, maintenance });
    setHasChanges(false);
    toast.success('Pengaturan sistem telah diperbarui');
  };

  const checkChanges = (newPrefix: string, newMaintenance: boolean) => {
    setHasChanges(newPrefix !== config?.prefix || newMaintenance !== config?.maintenance);
  };

  return (
    <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Pengaturan Sistem
        </h3>
        {hasChanges && (
          <Button 
            size="sm" 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-md px-3 h-8 text-xs font-bold shadow-sm animate-in fade-in zoom-in"
            onClick={handleSave}
          >
            <Save className="w-3 h-3 mr-1.5" />
            Simpan Perubahan
          </Button>
        )}
      </div>

      <div className="space-y-6 flex-grow">
        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Mode Pemeliharaan
            </Label>
            <p className="text-[11px] text-slate-500 font-medium">Nonaktifkan perintah bot untuk pengguna umum.</p>
          </div>
          <Switch 
            checked={maintenance} 
            onCheckedChange={(val) => {
              setMaintenance(val);
              checkChanges(prefix, val);
            }} 
          />
        </div>

        <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-3">
          <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />
            Awalan Perintah (Prefix)
          </Label>
          <div className="flex gap-2">
            <Input 
              value={prefix} 
              onChange={(e) => {
                setPrefix(e.target.value);
                checkChanges(e.target.value, maintenance);
              }}
              placeholder="." 
              className="h-9 bg-white border-slate-200 rounded-md font-bold text-center w-12"
              maxLength={1}
            />
            <div className="flex-grow flex items-center px-3 bg-white border border-slate-200 rounded-md text-[11px] text-slate-400 font-medium italic">
              Contoh: {prefix}sticker
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Bot Engine v1.0.4</p>
      </div>
    </Card>
  );
}
