import React from 'react';
import { X, Palette, Pipette, Target } from 'lucide-react';
import { ThemePreset, ThemeColors, TierId } from '../types';
import { THEME_PRESETS, TIERS } from '../constants';

interface ThemeManagerProps {
  activeTheme: ThemePreset;
  setActiveTheme: (theme: ThemePreset) => void;
  customColors: ThemeColors;
  setCustomColors: (colors: ThemeColors) => void;
  goal: number;
  setGoal: (goal: number) => void;
  onClose: () => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ 
  activeTheme, 
  setActiveTheme, 
  customColors, 
  setCustomColors, 
  goal,
  setGoal,
  onClose 
}) => {
  const presets: ThemePreset[] = ['Dark Academia', 'Cyberpunk', 'Pastel Dream', 'Custom'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-8 border-b flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">App Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><Target className="w-4 h-4 text-indigo-600" /> Yearly Goal</label>
            <div className="flex items-center gap-5 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
              <input type="number" min="0" value={goal} onChange={(e) => setGoal(parseInt(e.target.value) || 0)} className="w-24 p-4 rounded-2xl border-2 border-indigo-200 outline-none text-center font-black text-xl text-indigo-700" />
              <div className="flex-1">
                <p className="text-sm font-bold text-indigo-900 leading-tight">Reading Target</p>
                <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1">Set to 0 to show read total only</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Atmosphere Preset</label>
            <div className="grid grid-cols-2 gap-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setActiveTheme(p)}
                  className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${activeTheme === p ? 'border-indigo-500 bg-white ring-8 ring-indigo-50' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                >
                  <span className={`font-black uppercase text-[10px] tracking-widest ${activeTheme === p ? 'text-indigo-600' : 'text-gray-400'}`}>{p}</span>
                  <div className="flex gap-1 opacity-80">
                    {TIERS.slice(0, 4).map(t => (
                      <div key={t.id} className="w-4 h-4 rounded-full border border-black/5 shadow-sm" style={{ backgroundColor: THEME_PRESETS[p][t.id as TierId] }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeTheme === 'Custom' && (
            <div className="space-y-4 pt-6 border-t animate-in slide-in-from-bottom-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><Pipette className="w-3 h-3" /> Visual Branding</label>
              <div className="grid grid-cols-2 gap-4">
                {([...TIERS, { id: 'background', label: 'Canvas' }, { id: 'accent', label: 'Accent' }, { id: 'text', label: 'Ink' }] as any).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <input type="color" value={(customColors as any)[item.id]} onChange={(e) => setCustomColors({ ...customColors, [item.id]: e.target.value })} className="w-10 h-10 p-0 rounded-xl border-0 cursor-pointer overflow-hidden shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-tight text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 border-t">
          <button onClick={onClose} className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-xl active:scale-95 transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ThemeManager;