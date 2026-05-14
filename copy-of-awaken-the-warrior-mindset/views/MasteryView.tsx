
import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { UserData } from '../types';
import {
  Plus, Trash2, Info, TrendingUp, Landmark, Calendar, X, Lock, Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface FinancialTableProps {
  title: string;
  entries: any[];
  path: string[];
  showTarget?: boolean;
  canAdd?: boolean;
  handleEntryChange: (path: string[], field: 'target' | 'actual' | 'value', value: string) => void;
  removeItem: (path: string[], index: number) => void;
  addNewItem: (path: string[], label: string) => void;
  isGuest: boolean;
  onRestricted: () => void;
}

const FinancialTable = memo(({ title, entries, path, showTarget = true, canAdd = false, handleEntryChange, removeItem, addNewItem, isGuest, onRestricted }: FinancialTableProps) => {
  const [localLabel, setLocalLabel] = useState('');
  const [localNums, setLocalNums] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalNums({});
  }, [entries.length]);
  const handleAdd = useCallback(() => {
    if (isGuest) { onRestricted(); return; }
    const trimmed = localLabel.trim();
    if (trimmed) { addNewItem(path, trimmed); setLocalLabel(''); }
  }, [localLabel, addNewItem, path, isGuest, onRestricted]);
  const onChangeWrapper = (path: string[], field: 'target' | 'actual' | 'value', value: string) => {
    if (isGuest) return;
    handleEntryChange(path, field, value);
  };

  return (
    <div className="bg-[#595b61] border-2 border-[#f78121]/50 rounded-xl p-4 md:p-6 mb-6 md:mb-0 h-full flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#45d0d0]">{title}</h3>
      </div>
      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-left min-w-[300px]">
          <thead>
            <tr className="border-b border-[#f78121]/20">
              <th className="pb-3 md:pb-4 px-3 md:px-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#f78121]">Mission Item</th>
              {showTarget && <th className="pb-3 md:pb-4 px-3 md:px-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#f78121] text-right">Target</th>}
              <th className="pb-3 md:pb-4 px-3 md:px-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#f78121] text-right">{showTarget ? 'Actual' : 'Value'}</th>
              <th className="pb-3 md:pb-4 w-8 md:w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f78121]/10">
            {entries.map((entry, idx) => (
              <tr key={`${entry.label}-${idx}`} className="group">
                <td className="py-4 md:py-5 px-3 md:px-5 text-xs md:text-sm font-bold text-white">{entry.label}</td>
                {showTarget && (
                  <td className="py-2 md:py-3 px-3 md:px-5 text-right">
                    <input type="number" value={`${idx}-target` in localNums ? localNums[`${idx}-target`] : (entry.target || '')} onChange={(e) => { setLocalNums(prev => ({ ...prev, [`${idx}-target`]: e.target.value })); onChangeWrapper([...path, idx.toString()], 'target', e.target.value); }} className="w-20 md:w-28 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-right outline-none focus:border-[#f78121] text-[#595b61] font-bold" />
                  </td>
                )}
                <td className="py-2 md:py-3 px-3 md:px-5 text-right">
                  <input type="number" value={`${idx}-actual` in localNums ? localNums[`${idx}-actual`] : (entry.actual ?? entry.value ?? '')} onChange={(e) => { setLocalNums(prev => ({ ...prev, [`${idx}-actual`]: e.target.value })); onChangeWrapper([...path, idx.toString()], entry.value !== undefined ? 'value' : 'actual', e.target.value); }} className="w-20 md:w-28 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-right outline-none focus:border-[#f78121] text-[#595b61] font-bold" />
                </td>
                <td className="py-2 md:py-3 px-3 md:px-5 text-right">
                  <button onClick={() => { if(isGuest) onRestricted(); else removeItem(path, idx); }} className="text-white/50 hover:text-[#f78121] opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {canAdd && (
              <tr>
                <td className="py-4 md:py-5 px-3 md:px-5">
                  <input type="text" value={localLabel} onChange={(e) => setLocalLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="Deploy resource..." className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-lg px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm outline-none focus:border-[#f78121] text-[#595b61] placeholder:text-[#595b61]/70" />
                </td>
                <td colSpan={showTarget ? 3 : 2} className="py-4 md:py-5 px-3 md:px-5 text-right">
                  <button onClick={handleAdd} className="p-1.5 md:p-2 bg-[#f78121]/10 text-[#f78121] rounded-lg hover:bg-[#f78121] hover:text-white transition-all"><Plus size={16} /></button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const MasteryView: React.FC<{ data: UserData; update: (u: Partial<UserData>) => void; isGuest: boolean; onRestricted: () => void; isMobileMode: boolean; }> = ({ data, update, isGuest, onRestricted, isMobileMode }) => {
  const [showLesson, setShowLesson] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 500ms delay ensures the tab is visible and layout is ready
    setTimeout(() => setIsMounted(true), 500);
  }, []);

  const handleEntryChange = useCallback((path: string[], field: 'target' | 'actual' | 'value', value: string) => {
    const newData = JSON.parse(JSON.stringify(data.financialData));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
    const targetIdx = parseInt(path[path.length - 1]);
    if (Array.isArray(current)) { current[targetIdx][field] = parseFloat(value) || 0; } 
    else { current[path[path.length - 1]][field] = parseFloat(value) || 0; }
    newData.lastUpdated = new Date().toISOString();
    update({ financialData: newData });
  }, [data.financialData, update]);

  const handleAddNewItem = useCallback((path: string[], label: string) => {
    const newData = JSON.parse(JSON.stringify(data.financialData));
    let current = newData;
    for (let i = 0; i < path.length; i++) current = current[path[i]];
    if (path.includes('income') || path.includes('expenses')) { current.push({ label, target: 0, actual: 0 }); } 
    else { current.push({ label, value: 0 }); }
    newData.lastUpdated = new Date().toISOString();
    update({ financialData: newData, warriorCodePoints: data.warriorCodePoints + 5 });
  }, [data.financialData, data.warriorCodePoints, update]);

  const handleRemoveItem = useCallback((path: string[], index: number) => {
    const newData = JSON.parse(JSON.stringify(data.financialData));
    let current = newData;
    for (let i = 0; i < path.length; i++) current = current[path[i]];
    current.splice(index, 1);
    newData.lastUpdated = new Date().toISOString();
    update({ financialData: newData });
  }, [data.financialData, update]);

  const stats = useMemo(() => {
    const sum = (items: any[], key: string) => items.reduce((acc, item) => acc + (item[key] || 0), 0);
    const monthlyIncome = sum(data.financialData.income, 'actual');
    const expensesFixed = sum(data.financialData.expenses.fixed, 'actual');
    const expensesMandatory = sum(data.financialData.expenses.mandatory, 'actual');
    const expensesVariable = sum(data.financialData.expenses.variable, 'actual');
    const totalExpenses = expensesFixed + expensesMandatory + expensesVariable;
    const netCashFlow = monthlyIncome - totalExpenses;
    const assetsLiquid = sum(data.financialData.assets.liquid, 'value');
    const assetsFixed = sum(data.financialData.assets.fixed, 'value');
    const totalAssets = assetsLiquid + assetsFixed;
    const liabShort = sum(data.financialData.liabilities.shortTerm, 'value');
    const liabLong = sum(data.financialData.liabilities.longTerm, 'value');
    const totalLiabilities = liabShort + liabLong;
    const netWorth = totalAssets - totalLiabilities;
    return { netCashFlow, netWorth, totalAssets, totalLiabilities };
  }, [data.financialData]);

  const projections = useMemo(() => {
    const { netCashFlow, netWorth } = stats;
    const p6m = netWorth + (netCashFlow * 6);
    const p1y = netWorth + (netCashFlow * 12);
    const p3y = netWorth + (netCashFlow * 36);
    const p5y = netWorth + (netCashFlow * 60);
    return [{ label: '6 Months', value: p6m }, { label: '1 Year', value: p1y }, { label: '3 Years', value: p3y }, { label: '5 Years', value: p5y }];
  }, [stats]);

  const lastUpdatedFormatted = useMemo(() => {
    const date = new Date(data.financialData.lastUpdated);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }, [data.financialData.lastUpdated]);

  const isUnlocked = data.tier === 'Adept' || data.tier === 'Legend';
  const props = { isGuest, onRestricted };

  return (
    <div className="space-y-12 md:space-y-16 pb-20 relative">
      {!isUnlocked && (
        <div className="absolute inset-0 z-50 bg-[#0A3762]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center h-[100vh]">
            <Lock size={48} className="text-[#f78121] mb-4" />
            <h3 className="text-2xl font-black uppercase text-white mb-2">Restricted Intel</h3>
            <p className="text-[#45d0d0] mb-8 max-w-sm">Upgrade to Adept Class to access Wealth.</p>
            {!isMobileMode && <button onClick={() => update({ tier: 'Adept' })} className="px-8 py-3 bg-[#f78121] text-white font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-[#0A3762] transition-all">Unlock Access</button>}
        </div>
      )}
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-white/20 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-white mb-4">Resource Protocols</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic">
                "Money is ammunition. Do not waste it. Direct it towards targets that expand your empire."
              </p>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Your Finances</h2>
              <button onClick={() => setShowLesson(true)} className="p-2 bg-gradient-to-br from-white/10 to-white/5 border border-[#f78121]/30 rounded-full hover:text-white text-[#f78121] transition-colors">
                <Info size={20} />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-[#45d0d0] mt-1">
               <Calendar size={12} className="md:w-4 md:h-4" />
               <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Last Updated: {lastUpdatedFormatted}</p>
            </div>
          </div>
          {!isGuest && (
            <button
              onClick={() => {
                const newData = { ...data.financialData, lastUpdated: new Date().toISOString() };
                update({ financialData: newData });
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f78121] text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white hover:text-[#0A3762] transition-all self-start"
            >
              <Save size={14} />
              Save Wealth
            </button>
          )}
        </div>
      </header>

      {/* Net Financial Health Hero */}
      <section className="bg-[#595b61] border-2 border-[#f78121]/50 p-6 md:p-10 relative overflow-hidden rounded-xl transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-20 pointer-events-none"><Landmark size={150} /></div>
        <div className="relative z-10">
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-[#f78121] block mb-3 md:mb-4">Net Worth</span>
            <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-6">
                <h4 className={`text-4xl sm:text-7xl font-black font-brand-header tracking-tighter text-white`}>
                    {stats.netWorth < 0 ? '-' : ''}RM {Math.abs(stats.netWorth).toLocaleString()}
                </h4>
                <div className={`mb-1 sm:mb-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border self-start sm:self-auto ${stats.netWorth >= 0 ? 'bg-[#45d0d0]/10 border-[#45d0d0]/30 text-[#45d0d0]' : 'bg-[#f78121]/10 border-[#f78121]/30 text-[#f78121]'}`}>
                    {stats.netWorth >= 0 ? 'Solvent' : 'Insolvent'}
                </div>
            </div>
            <div className="flex gap-8 md:gap-12 mt-6 md:mt-8">
                <div>
                    <span className="text-[10px] md:text-xs text-[#45d0d0] font-bold uppercase tracking-widest block">Total Assets</span>
                    <span className="text-base md:text-xl font-black text-white">RM {stats.totalAssets.toLocaleString()}</span>
                </div>
                <div>
                    <span className="text-[10px] md:text-xs text-[#45d0d0] font-bold uppercase tracking-widest block">Total Liabilities</span>
                    <span className="text-base md:text-xl font-black text-white">RM {stats.totalLiabilities.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </section>

      {/* Future Projections Chart - SAFE MOUNT APPLIED */}
      <section className="space-y-4 md:space-y-5">
        <div className="flex items-center space-x-2 md:space-x-3 px-2">
            <TrendingUp size={16} className="text-[#f78121] md:w-5 md:h-5" />
            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-[#45d0d0]">Net Worth Trend</h3>
        </div>
        
        {/* SAFETY WRAPPER */}
        <div style={{ width: '100%', height: '350px', minHeight: '350px' }} className="bg-[#595b61] border-2 border-[#f78121]/50 rounded-xl p-4">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={projections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `RM${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f78121' }}
                    formatter={(value: number) => [`RM ${value.toLocaleString()}`, 'Net Worth']}
                  />
                  <Bar dataKey="value" fill="#f78121" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-gray-800/50 animate-pulse rounded-xl flex items-center justify-center">
               <span className="text-gray-500 text-xs font-bold uppercase">Decrypting Financial Data...</span>
            </div>
          )}
        </div>
      </section>

      {/* Cash Flow Section */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-2 pb-2 md:pb-3 border-b border-[#f78121]/30">
            <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase text-[#f78121] drop-shadow-md">Supply Lines</h3>
            <div className={`text-xs md:text-base font-black px-3 py-1 md:px-4 md:py-1.5 rounded-lg ${stats.netCashFlow >= 0 ? 'bg-[#45d0d0]/10 text-[#45d0d0]' : 'bg-[#f78121]/10 text-[#f78121]'}`}>
                {stats.netCashFlow >= 0 ? '+' : ''}RM {stats.netCashFlow.toLocaleString()} / mo
            </div>
        </div>
        <div className="space-y-4">
            <FinancialTable title="Inflow Vectors" entries={data.financialData.income} path={['income']} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
            <FinancialTable title="Fixed Expenses" entries={data.financialData.expenses.fixed} path={['expenses', 'fixed']} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
            <FinancialTable title="Mandatory Expenses" entries={data.financialData.expenses.mandatory} path={['expenses', 'mandatory']} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
            <FinancialTable title="Resource Outflow" entries={data.financialData.expenses.variable} path={['expenses', 'variable']} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
        </div>
      </section>

      {/* Assets Section */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-2 pb-2 md:pb-3 border-b border-[#f78121]/30">
            <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase text-[#f78121] drop-shadow-md">Assets</h3>
            <div className="text-xs md:text-base font-black px-3 py-1 md:px-4 md:py-1.5 rounded-lg bg-[#45d0d0]/10 text-[#45d0d0]">
                RM {stats.totalAssets.toLocaleString()}
            </div>
        </div>
        <div className="space-y-4">
            <FinancialTable title="Liquid Assets" entries={data.financialData.assets.liquid} path={['assets', 'liquid']} showTarget={false} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
            <FinancialTable title="Fixed Assets" entries={data.financialData.assets.fixed} path={['assets', 'fixed']} showTarget={false} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
        </div>
      </section>

      {/* Liabilities Section */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-2 pb-2 md:pb-3 border-b border-[#f78121]/30">
            <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase text-[#f78121] drop-shadow-md">Liabilities</h3>
            <div className="text-xs md:text-base font-black px-3 py-1 md:px-4 md:py-1.5 rounded-lg bg-[#f78121]/10 text-[#f78121]">
                RM {stats.totalLiabilities.toLocaleString()}
            </div>
        </div>
        <div className="space-y-4">
            <FinancialTable title="Short-Term Debt" entries={data.financialData.liabilities.shortTerm} path={['liabilities', 'shortTerm']} showTarget={false} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
            <FinancialTable title="Long-Term Debt" entries={data.financialData.liabilities.longTerm} path={['liabilities', 'longTerm']} showTarget={false} canAdd handleEntryChange={handleEntryChange} removeItem={handleRemoveItem} addNewItem={handleAddNewItem} {...props} />
        </div>
      </section>
    </div>
  );
};

export default MasteryView;
