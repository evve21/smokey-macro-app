
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BASES, FRUIT_PACKS, PROTEINS, FRUITS_MASTER, ADD_ONS, PRESET_EXTRA, BEST_SELLERS } from './constants';
import { SmoothieState, SmoothieSnap, BestSeller, NutritionValues } from './types';
import { calculateNutrition, formatValue } from './services/nutritionService';
import { SmoothieCup } from './components/SmoothieCup';

/**
 * REUSABLE UNIVERSAL SELECTION CARD
 * Used for Fruit Pack, Milk, and Protein selection steps.
 */
interface SelectionCardProps {
  id: string;
  name: string;
  image: string;
  tags: string[];
  nutrition: NutritionValues;
  extras?: string[]; // Specifically for fruit pack extra chips logic
  state: 'selected' | 'other' | 'empty';
  onToggle: (id: string) => void;
  type: 'fruit' | 'milk' | 'protein';
  variant?: 'default' | 'minimal';
}

const SelectionCard: React.FC<SelectionCardProps> = ({ 
  id, name, image, tags, nutrition, extras, state, onToggle, type, variant = 'default'
}) => {
  // Minimal variant used for Milk and Protein selection as per latest request
  if (variant === 'minimal') {
    const containerClasses = `h-16 w-full rounded-xl overflow-hidden flex flex-row items-center justify-between px-4 transition-all duration-300 relative ${
      state === 'selected' 
        ? 'ring-2 ring-green-500 bg-green-900/20 shadow-lg scale-[1.02] z-10' 
        : state === 'other'
          ? 'border border-gray-600 bg-gray-800 opacity-90'
          : 'border border-gray-600 bg-gray-800'
    }`;

    return (
      <div className={containerClasses} onClick={() => onToggle(id)}>
        <h4 className="text-sm font-bold uppercase tracking-tight text-white leading-tight break-words flex-1 pr-2">
          {name}
        </h4>
        <button 
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xl transition-all shadow-md ${
            state === 'selected' ? 'bg-red-600 text-white' : 'bg-green-600 text-white hover:bg-green-500'
          }`}
        >
          {state === 'selected' ? '−' : '+'}
        </button>
      </div>
    );
  }

  // 3-State Container Logic (Default Version)
  const containerClasses = `h-32 w-full rounded-xl overflow-hidden flex flex-row transition-all duration-300 relative ${
    state === 'selected' 
      ? 'ring-2 ring-green-500 bg-green-900/20 shadow-lg scale-[1.02] z-10' 
      : state === 'other'
        ? 'border border-gray-600 bg-gray-800 opacity-90'
        : 'border border-gray-600 bg-gray-800'
  }`;

  // 3-State Summary Panel Logic
  const summaryClasses = `w-32 p-3 flex flex-col justify-between transition-colors duration-300 shrink-0 border-l border-white/5 ${
    state === 'selected' ? 'bg-red-600' : state === 'other' ? 'bg-red-900/30' : 'bg-green-600'
  }`;

  const imgClasses = `w-24 h-full object-cover transition-all duration-500 shrink-0 ${
    state === 'other' ? 'opacity-70 grayscale-[30%]' : 'opacity-100'
  }`;

  return (
    <div className={containerClasses}>
      {/* LEFT AREA: IMG (w-24) - Only rendered for fruit packs as requested */}
      {type === 'fruit' && (
        <img src={image} alt={name} className={imgClasses} />
      )}
      
      {/* MIDDLE AREA: DETAIL */}
      <div className="flex-1 p-3 flex flex-col min-w-0 justify-center gap-1.5">
        <div className="flex items-start gap-1.5">
          <h4 className="text-base font-bold uppercase tracking-tight text-white leading-tight break-words">{name}</h4>
          {/* Tag badge for special attributes (e.g. 2x Protein) */}
          {type === 'fruit' && FRUIT_PACKS.find(p => p.id === id)?.tag && (
            <span className="text-[9px] uppercase bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black shrink-0 shadow-sm">
              {FRUIT_PACKS.find(p => p.id === id)?.tag}
            </span>
          )}
        </div>
        
        {/* Chips for characteristics - ONLY SHOWN FOR FRUIT PACKS */}
        {type === 'fruit' && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded font-black uppercase whitespace-nowrap shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Extra text chips for fruit pack sub-ingredients */}
        {extras && extras.length > 0 && (
          <div className="flex flex-wrap gap-x-2 mt-0.5 opacity-80">
            {extras.map((ex, i) => (
              <span key={i} className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                {ex}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT AREA: SUMMARY (w-32) */}
      <div className={summaryClasses}>
        <div className="space-y-0.5">
           <div className="flex justify-between items-baseline">
             <span className="text-xs text-gray-100/80 uppercase font-black">Cal:</span>
             <span className="text-sm font-bold text-white">{Math.round(nutrition.kcal)}</span>
           </div>
           <div className="flex justify-between items-baseline">
             <span className="text-xs text-gray-100/80 uppercase font-black">P:</span>
             <span className="text-sm font-bold text-white">{formatValue(nutrition.protein)}</span>
           </div>
           <div className="flex justify-between items-baseline">
             <span className="text-xs text-gray-100/80 uppercase font-black">C:</span>
             <span className="text-sm font-bold text-white">{formatValue(nutrition.carbs)}</span>
           </div>
           <div className="flex justify-between items-baseline">
             <span className="text-xs text-gray-100/80 uppercase font-black">F:</span>
             <span className="text-sm font-bold text-white">{formatValue(nutrition.fat)}</span>
           </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onToggle(id)}
          className="text-xs font-semibold text-white uppercase flex items-center justify-center gap-1 w-full bg-black/20 rounded py-1.5 transition-all hover:bg-black/40 active:scale-95 shadow-md"
        >
          {state === 'selected' ? '− Remove' : state === 'other' ? '+ Change' : '+ Add'}
        </button>
      </div>
    </div>
  );
};

/**
 * Main Application
 */
const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const [state, setState] = useState<SmoothieState>(() => {
    const saved = localStorage.getItem('smokeys_pro_v5_updated');
    if (saved) return JSON.parse(saved);
    return { base: null, fruitPackId: null, protein: null, selectedAddOns: [] };
  });

  const [smoothie1, setSmoothie1] = useState<SmoothieSnap | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('step-1');
  const [showBest, setShowBest] = useState(false);
  
  const prevKcalRef = useRef(0);

  useEffect(() => {
    const options = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, options);
    ['step-1', 'step-2', 'step-3', 'step-4'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const stepsDone = useMemo(() => ({
    step1: state.fruitPackId !== null,
    step2: state.base !== null,
    step3: state.protein !== null,
    step4: state.selectedAddOns?.length > 0
  }), [state]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('smokeys_pro_v5_updated', JSON.stringify(state));
  }, [state]);

  const nutrition = useMemo(() => calculateNutrition(state), [state]);
  
  useEffect(() => {
    if (Math.round(nutrition.kcal) !== Math.round(prevKcalRef.current)) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      prevKcalRef.current = nutrition.kcal;
      return () => clearTimeout(timer);
    }
  }, [nutrition.kcal]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshAll = () => {
    setState({ base: null, fruitPackId: null, protein: null, selectedAddOns: [] }); 
    showToast("Smoothie reset"); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const startCompare = () => {
    setSmoothie1({
      baseId: state.base, fruitPackId: state.fruitPackId, proteinId: state.protein,
      selectedAddOns: [...(state.selectedAddOns || [])], nutrition: { ...nutrition }
    }); 
    setCompareMode(true); 
    setState({ base: null, fruitPackId: null, protein: null, selectedAddOns: [] }); 
    showToast("Locked. Build Smoothie 2!"); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const clearCompare = () => { setCompareMode(false); setSmoothie1(null); showToast("Comparison cleared"); };

  const selectPack = (packId: string) => {
    setState(prev => ({ ...prev, fruitPackId: prev.fruitPackId === packId ? null : packId }));
  };

  const selectMilk = (id: string) => {
    setState(prev => ({ ...prev, base: prev.base === id ? null : id }));
  };

  const selectProtein = (id: string) => {
    setState(prev => ({ ...prev, protein: prev.protein === id ? null : id }));
  };

  const toggleAddOn = (id: string) => {
    setState(prev => {
      const current = prev.selectedAddOns || [];
      return current.includes(id) 
        ? { ...prev, selectedAddOns: current.filter(item => item !== id) }
        : { ...prev, selectedAddOns: [...current, id] };
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const activePack = FRUIT_PACKS.find(p => p.id === state.fruitPackId);

  const navItems = [
    { n: '1', t: 'CHOOSE YOUR FRUIT PACK', id: 'step-1', done: stepsDone.step1 },
    { n: '2', t: 'CHOOSE YOUR MILK', id: 'step-2', done: stepsDone.step2 },
    { n: '3', t: 'CHOOSE YOUR PROTEIN', id: 'step-3', done: stepsDone.step3 },
    { n: '4', t: 'CHOOSE YOUR ADD-ON', id: 'step-4', done: stepsDone.step4 }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-300 flex flex-col md:flex-row overflow-x-hidden selection:bg-[#CA210E] selection:text-white">
      
      {/* BEST SELLER BUTTON */}
      <button onClick={() => setShowBest(true)} className="fixed top-1/2 left-2 -translate-y-1/2 z-[200] w-12 h-12 bg-yellow-400 text-white rounded-full flex flex-col items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-white/50 dark:border-white/10">
        <span className="text-xl">⭐</span>
        <span className="text-[8px] font-black uppercase tracking-tighter">Best</span>
      </button>

      <BestSellerDrawer open={showBest} onClose={() => setShowBest(false)} onSelect={(best) => {
        setState({ fruitPackId: best.fruitPackId, base: best.milkId, protein: best.proteinId, selectedAddOns: best.addOns || [] });
        setShowBest(false);
        showToast(`Best-seller ${best.name} selected!`);
      }} />

      {/* THEME TOGGLE */}
      <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="fixed top-6 left-6 z-[120] p-3 rounded-2xl bg-gray-100 dark:bg-white/5 backdrop-blur-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 transition-all active:scale-95 shadow-xl md:flex hidden">
        {theme === 'dark' ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
      </button>

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[400] bg-black text-white px-8 py-4 border-l-8 border-[#CA210E] shadow-2xl animate-in slide-in-from-top duration-300 rounded-lg">
          <p className="font-black text-xs uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <main className="flex-1 min-h-screen transition-all duration-300 relative bg-white dark:bg-[#050505] p-6 md:p-12 lg:p-16 order-1">
        <div className="max-w-[1000px] mx-auto space-y-20">
          <div className="space-y-4 flex flex-col items-center text-center">
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-[1] font-display text-center">
              Build a <span className="text-[#CA210E]">smoothie...</span> <br className="md:hidden" /> Check your <span className="text-[#CA210E]">Macros!</span>
            </h2>
          </div>

          {/* PROGRESS STEPS BAR */}
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex items-center justify-center gap-6">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#CA210E] max-w-[100px]"></div>
              <h3 className="text-sm font-black text-[#CA210E] uppercase tracking-[0.8em] italic">STEP BY STEP</h3>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#CA210E] max-w-[100px]"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {navItems.map((step) => (
                <button key={step.n} onClick={() => scrollToSection(step.id)} className="bg-gray-50 dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 group transition-all hover:bg-white dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/20 shadow-sm text-left active:scale-[0.98]">
                  <div className="w-10 h-10 shrink-0 bg-[#CA210E] rounded-full flex items-center justify-center text-white font-black text-sm shadow-[0_4px_12px_rgba(202,33,14,0.3)] group-hover:scale-110 transition-transform">{step.n}</div>
                  <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white leading-tight tracking-wider">{step.t}</p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: FRUIT PACKS (One card per row) */}
          <section id="step-1" className="scroll-mt-24 p-6 md:p-8 rounded-[2.5rem] bg-gray-50 dark:bg-[#080808] border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="flex items-center space-x-6 mb-6">
              <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-white dark:text-black text-xs font-black ${stepsDone.step1 ? 'bg-green-500' : 'bg-gray-900 dark:bg-white'}`}>{stepsDone.step1 ? '✓' : '01'}</span>
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-display">PICK FRUIT PACK</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {FRUIT_PACKS.map(pack => (
                <SelectionCard 
                  key={pack.id} 
                  id={pack.id}
                  name={pack.name}
                  image={pack.image || ''}
                  tags={pack.items.map(i => FRUITS_MASTER.find(f => f.id === i.fruitId)?.name || '')}
                  nutrition={calculateNutrition({ ...state, fruitPackId: pack.id })}
                  extras={PRESET_EXTRA[pack.id]?.map(e => e.name)}
                  state={state.fruitPackId === pack.id ? 'selected' : (state.fruitPackId !== null ? 'other' : 'empty')}
                  onToggle={selectPack}
                  type="fruit"
                />
              ))}
            </div>
          </section>

          {/* STEP 2: MILK BASE (Two columns, Minimal information) */}
          <section id="step-2" className="scroll-mt-24 p-8 md:p-12 rounded-[3rem] bg-gray-50 dark:bg-[#080808] border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="flex items-center space-x-6 mb-12">
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-white dark:text-black text-base font-black ${stepsDone.step2 ? 'bg-green-500' : 'bg-green-600 dark:bg-white'}`}>{stepsDone.step2 ? '✓' : '02'}</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-display">CHOOSE YOUR MILK</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BASES.map(base => (
                <SelectionCard 
                  key={base.id}
                  id={base.id}
                  name={base.name}
                  image={base.image}
                  tags={base.tags}
                  nutrition={{ kcal: base.kcal, protein: base.protein, carbs: base.carbs, fat: base.fat }}
                  state={state.base === base.id ? 'selected' : (state.base !== null ? 'other' : 'empty')}
                  onToggle={selectMilk}
                  type="milk"
                  variant="minimal"
                />
              ))}
            </div>
          </section>

          {/* STEP 3: PROTEIN (Two columns, Minimal information) */}
          <section id="step-3" className="scroll-mt-24 p-8 md:p-12 rounded-[3rem] bg-gray-50 dark:bg-[#080808] border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="flex items-center space-x-6 mb-12">
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-white dark:text-black text-base font-black ${stepsDone.step3 ? 'bg-green-500' : 'bg-gray-900 dark:bg-white'}`}>{stepsDone.step3 ? '✓' : '03'}</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-display">SELECT PROTEIN</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROTEINS.map(protein => (
                <SelectionCard 
                  key={protein.id}
                  id={protein.id}
                  name={protein.name}
                  image={protein.image}
                  tags={protein.tags}
                  nutrition={{ kcal: protein.kcal, protein: protein.protein, carbs: protein.carbs, fat: protein.fat }}
                  state={state.protein === protein.id ? 'selected' : (state.protein !== null ? 'other' : 'empty')}
                  onToggle={selectProtein}
                  type="protein"
                  variant="minimal"
                />
              ))}
            </div>
          </section>

          {/* STEP 4: ADD-ONS (Classic Grid) */}
          <section id="step-4" className="scroll-mt-24 p-8 md:p-12 rounded-[3rem] bg-gray-50 dark:bg-[#080808] border border-gray-100 dark:border-white/5 shadow-2xl relative">
            <button onClick={() => setState(prev => ({ ...prev, selectedAddOns: [] }))} className="absolute top-10 right-10 text-[10px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors">RESET ALL</button>
            <div className="flex items-center space-x-6 mb-12">
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-white dark:text-black text-base font-black ${stepsDone.step4 ? 'bg-green-500' : 'bg-gray-900 dark:bg-white'}`}>{stepsDone.step4 ? '✓' : '04'}</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-display">ADD-ON BOOSTERS</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {ADD_ONS.map(addOn => (
                <button key={addOn.id} onClick={() => toggleAddOn(addOn.id)} className={`p-6 rounded-2xl border-2 text-[10px] uppercase font-black transition-all duration-300 active:scale-95 ${state.selectedAddOns?.includes(addOn.id) ? 'bg-gray-200 dark:bg-white/10 border-green-500 text-green-500' : 'border-transparent bg-white dark:bg-[#0c0c0c] text-gray-900 dark:text-white shadow-sm hover:border-white/10'}`}>{addOn.name}</button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* SIDEBAR COMMAND CENTER */}
      <div className="hidden md:block w-[285px] shrink-0 pointer-events-none order-2"></div>
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] bg-white dark:bg-[#0c0c0c] border-l border-gray-200 dark:border-white/5 shadow-2xl w-fit hidden md:flex flex-row items-stretch rounded-l-[2.5rem] py-4 transition-transform">
        <div className="flex flex-col items-center justify-center p-3 lg:p-4 bg-gray-50 dark:bg-black/20 border-r border-gray-100 dark:border-white/5">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 font-black text-[9px] transition-all hover:scale-110 active:scale-90 ${item.done ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#151515] text-gray-500'}`}>{item.n}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-5 lg:p-6 w-[220px]">
          {compareMode && smoothie1 && (
            <div className="w-full mb-4 border-b border-gray-100 dark:border-white/5 pb-4 opacity-70 flex flex-col items-center animate-in slide-in-from-top duration-300">
               <div className="text-[7px] font-black uppercase text-gray-400 mb-1 italic">SNAPSHOT #1</div>
               <div className="w-12 h-16 mx-auto mb-2 overflow-hidden rounded-lg bg-black/10 border border-gray-200 dark:border-white/10 shadow-lg">
                 {FRUIT_PACKS.find(p => p.id === smoothie1.fruitPackId)?.image ? (
                   <img src={FRUIT_PACKS.find(p => p.id === smoothie1.fruitPackId)?.image} className="w-full h-full object-cover grayscale" />
                 ) : (
                   <div className="scale-75 grayscale opacity-50">
                     <SmoothieCup state={{ base: smoothie1.baseId, fruitPackId: smoothie1.fruitPackId, protein: smoothie1.proteinId, selectedAddOns: smoothie1.selectedAddOns }} />
                   </div>
                 )}
               </div>
               <div className="bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 flex flex-col items-center">
                 <span className="text-[11px] font-black text-[#CA210E]">{Math.round(smoothie1.nutrition.kcal)}</span>
               </div>
            </div>
          )}

          {/* LIVE PREVIEW CONTAINER */}
          <div className="w-32 h-44 flex flex-col items-center justify-center relative mb-4 overflow-hidden rounded-2xl border-2 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/40 shadow-inner">
            {activePack?.image ? (
              <img src={activePack.image} className="w-full h-full object-cover animate-in fade-in duration-500" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="scale-110 opacity-60"><SmoothieCup state={state} /></div>
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[8px] font-black uppercase text-white/70 tracking-tighter">PREVIEW</div>
          </div>

          <div className="flex flex-col items-center leading-none mb-4 text-center">
            <span className={`text-5xl font-black text-[#CA210E] transition-all duration-300 neon-red ${isAnimating ? 'scale-110' : 'scale-100'}`}>{Math.round(nutrition.kcal)}</span>
            <span className="text-[9px] font-black text-gray-400 uppercase mt-1 italic tracking-widest">KCAL</span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full text-center border-y border-gray-100 dark:border-white/5 py-4 mb-4 text-[11px] font-black">
            <div className="flex flex-col"><span className="text-[7px] text-gray-400 mb-0.5">P</span>{formatValue(nutrition.protein)}</div>
            <div className="flex flex-col border-x border-gray-100 dark:border-white/5"><span className="text-[7px] text-gray-400 mb-0.5">C</span>{formatValue(nutrition.carbs)}</div>
            <div className="flex flex-col"><span className="text-[7px] text-gray-400 mb-0.5">F</span>{formatValue(nutrition.fat)}</div>
          </div>

          <div className="w-full space-y-2">
            <button onClick={() => setIsModalOpen(true)} className="w-full py-2.5 rounded-lg bg-[#CA210E] text-[9px] font-black uppercase text-white hover:bg-red-700 active:scale-95 shadow-lg transition-colors">SUMMARY</button>
            <button onClick={refreshAll} className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-[#151515] text-[8px] font-black uppercase border border-gray-200 dark:border-white/5 active:scale-95">RESET</button>
            <button onClick={compareMode ? clearCompare : startCompare} className={`w-full text-center text-[8px] font-black uppercase tracking-[0.2em] pt-1 active:scale-95 ${compareMode ? 'text-green-500' : 'text-gray-400'}`}>{compareMode ? 'EXIT COMPARE' : 'COMPARE BLENDS'}</button>
          </div>
        </div>
      </aside>

      {/* SUMMARY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className={`w-full ${compareMode ? 'max-w-4xl' : 'max-w-sm'} rounded-[2.5rem] bg-white dark:bg-[#080808] border-[3px] border-[#CA210E] p-4 md:p-8 text-center relative shadow-[0_0_80px_rgba(202,33,14,0.3)] overflow-y-auto max-h-[95vh] custom-scrollbar flex flex-col animate-in zoom-in duration-300`}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full hover:bg-[#CA210E] hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/></svg></button>
            <h4 className="text-xl font-black mb-6 uppercase italic tracking-tight font-display">BLEND SUMMARY</h4>
            {compareMode && smoothie1 ? (
              <div className="flex flex-col w-full h-full lg:grid lg:grid-cols-2 gap-6">
                <SummaryCard nut={smoothie1.nutrition} stateToUse={{ ...smoothie1, base: smoothie1.baseId, protein: smoothie1.proteinId }} title="SMOOTHIE 1" isSecondary />
                <SummaryCard nut={nutrition} stateToUse={state} title="SMOOTHIE 2" />
              </div>
            ) : <div className="flex justify-center"><SummaryCard nut={nutrition} stateToUse={state} title="NUTRITION FACTS" /></div>}
            <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.3em] active:scale-95 shadow-xl">BACK TO BUILDER</button>
          </div>
        </div>
      )}
    </div>
  );
};

// DRAWER COMPONENT
const BestSellerDrawer: React.FC<{ open: boolean, onClose: () => void, onSelect: (b: BestSeller) => void }> = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0c0c0c] h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic uppercase font-display">Best Sellers</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {BEST_SELLERS.map(best => (
            <button key={best.id} onClick={() => onSelect(best)} className="w-full text-left p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#CA210E] group transition-all active:scale-[0.98]">
              <h3 className="text-lg font-black uppercase mb-1 group-hover:text-[#CA210E] transition-colors">{best.name}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{best.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// MODAL CARD COMPONENT
const SummaryCard: React.FC<{ nut: NutritionValues, stateToUse: any, title: string, isSecondary?: boolean }> = ({ nut, stateToUse, title, isSecondary = false }) => {
  const pack = FRUIT_PACKS.find(p => p.id === stateToUse.fruitPackId);
  return (
    <div className={`p-6 md:p-8 rounded-[2rem] flex flex-col items-center flex-1 border-2 transition-all ${isSecondary ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 shadow-xl'}`}>
      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">{title}</h5>
      <div className="w-24 h-36 mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black shadow-sm">
        {pack?.image ? <img src={pack.image} className="w-full h-full object-cover" /> : <div className="scale-90 opacity-40"><SmoothieCup state={stateToUse} /></div>}
      </div>
      <div className="text-4xl font-black text-[#CA210E] mb-1 italic leading-none">{Math.round(nut.kcal)}</div>
      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8">CALORIES TOTAL</div>
      <div className="grid grid-cols-3 gap-8 w-full border-y border-gray-200 dark:border-white/10 py-6 mb-8 text-center">
        <div><div className="text-xs font-black text-gray-900 dark:text-white">{formatValue(nut.protein)}g</div><div className="text-[8px] uppercase text-gray-400 font-bold">Protein</div></div>
        <div><div className="text-xs font-black text-gray-900 dark:text-white">{formatValue(nut.carbs)}g</div><div className="text-[8px] uppercase text-gray-400 font-bold">Carbs</div></div>
        <div><div className="text-xs font-black text-gray-900 dark:text-white">{formatValue(nut.fat)}g</div><div className="text-[8px] uppercase text-gray-400 font-bold">Fat</div></div>
      </div>
      <div className="w-full space-y-3 text-left">
        {[
          { label: 'Base', val: BASES.find(b => b.id === stateToUse.base)?.name },
          { label: 'Fruits', val: pack?.name },
          { label: 'Protein', val: PROTEINS.find(p => p.id === stateToUse.protein)?.name },
          { label: 'Extras', val: stateToUse.selectedAddOns?.length > 0 ? `${stateToUse.selectedAddOns.length} selected` : 'None' }
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center gap-4 text-[9px] font-black uppercase"><span className="text-gray-400 tracking-widest">{item.label}</span><span className="truncate text-gray-900 dark:text-white">{item.val || '---'}</span></div>
        ))}
      </div>
    </div>
  );
};

export default App;
