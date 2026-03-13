import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Camera, 
  History as HistoryIcon, 
  User as UserIcon, 
  BarChart3, 
  Plus, 
  ChevronRight, 
  Droplets, 
  Flame, 
  Target, 
  Utensils,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  Settings,
  Info,
  ChevronLeft,
  Calendar,
  Filter,
  Search,
  Zap,
  Coffee,
  Sun,
  Moon,
  Apple,
  Sparkles,
  Heart,
  Leaf,
  Scan,
  Maximize2,
  Activity,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './services/api';
import { analyzeFoodImage, getHealthAdvice } from './services/gemini';
import { User, Meal, WaterLog, AnalysisResult } from './types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, startOfDay } from 'date-fns';

// --- UI Components ---

const Card = ({ children, className = "", noPadding = false, ...props }: { children: React.ReactNode, className?: string, noPadding?: boolean, [key: string]: any }) => (
  <div className={`premium-card ${noPadding ? '' : 'p-6'} ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, loading = false, size = "md" }: any) => {
  const variants: any = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    success: "bg-success text-white hover:bg-success/90"
  };
  const sizes: any = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default" }: any) => {
  const variants: any = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-amber-100 text-amber-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('home');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingDone = localStorage.getItem('nutrisnap_onboarding');
    if (!onboardingDone) {
      setShowOnboarding(true);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [u, m, w] = await Promise.all([
        api.getProfile(),
        api.getMeals(),
        api.getWater()
      ]);
      setUser(u);
      setMeals(m);
      setWaterLogs(w);
      
      if (m.length > 0) {
        getHealthAdvice(m, u).then(setAdvice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('nutrisnap_onboarding', 'true');
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-slate-100 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm animate-pulse">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-50 border-r border-slate-200 flex-col p-6 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">NutriSnap</h1>
        </div>
        
        <div className="space-y-1">
          <NavItem active={view === 'home'} icon={<Home />} label="Overview" onClick={() => setView('home')} />
          <NavItem active={view === 'scan'} icon={<Camera />} label="Scan Meal" onClick={() => setView('scan')} />
          <NavItem active={view === 'history'} icon={<HistoryIcon />} label="Journal" onClick={() => setView('history')} />
          <NavItem active={view === 'reports'} icon={<BarChart3 />} label="Analytics" onClick={() => setView('reports')} />
          <NavItem active={view === 'profile'} icon={<UserIcon />} label="Profile" onClick={() => setView('profile')} />
        </div>
        
        <div className="mt-auto">
          <Card className="bg-slate-900 text-white p-5 border-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Pro Plan</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Unlock advanced AI insights and detailed macro tracking.</p>
            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">Upgrade Now</button>
          </Card>
        </div>
      </aside>

      {/* Mobile Bottom Nav - Premium Floating Dock */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
        <nav className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl rounded-[2rem] p-2 flex justify-between items-center shadow-2xl shadow-slate-900/40 pointer-events-auto border border-white/10">
          <MobileNavItem active={view === 'home'} icon={<Home />} label="Home" onClick={() => setView('home')} />
          <MobileNavItem active={view === 'history'} icon={<HistoryIcon />} label="Journal" onClick={() => setView('history')} />
          
          <button 
            onClick={() => setView('scan')}
            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 active:scale-90 transition-all hover:rotate-90"
          >
            <Plus className="w-8 h-8" />
          </button>
          
          <MobileNavItem active={view === 'reports'} icon={<BarChart3 />} label="Stats" onClick={() => setView('reports')} />
          <MobileNavItem active={view === 'profile'} icon={<UserIcon />} label="Profile" onClick={() => setView('profile')} />
        </nav>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-10 lg:p-16 pb-32 lg:pb-16">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeDashboard user={user} meals={meals} waterLogs={waterLogs} advice={advice} onWaterAdd={fetchData} setView={setView} />}
            {view === 'scan' && <ScanMeal onComplete={() => { setView('home'); fetchData(); }} />}
            {view === 'history' && <MealHistory meals={meals} />}
            {view === 'reports' && <NutritionReports meals={meals} waterLogs={waterLogs} />}
            {view === 'profile' && <ProfileScreen user={user} onUpdate={fetchData} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? "bg-white text-primary shadow-sm border border-slate-200" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-primary' : ''}` })}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function MobileNavItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center justify-center transition-all duration-300 ${
        active ? "px-5 py-2.5 bg-white/10 rounded-full text-white" : "p-3 text-slate-500 hover:text-slate-300"
      }`}
    >
      <div className="flex items-center gap-2">
        {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-primary' : ''}` })}
        <AnimatePresence>
          {active && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-[10px] font-bold uppercase tracking-wider overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {active && (
        <motion.div 
          layoutId="mobileActivePill"
          className="absolute inset-0 bg-white/5 rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}

// --- Onboarding ---

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: "Precision Nutrition",
      desc: "AI-powered meal analysis that understands every ingredient on your plate.",
      icon: <Zap className="w-12 h-12" />,
      color: "bg-primary"
    },
    {
      title: "Effortless Tracking",
      desc: "No more manual entry. Just snap a photo and let our AI do the heavy lifting.",
      icon: <Camera className="w-12 h-12" />,
      color: "bg-slate-900"
    },
    {
      title: "Actionable Insights",
      desc: "Personalized health advice based on your real eating habits and goals.",
      icon: <Activity className="w-12 h-12" />,
      color: "bg-success"
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm space-y-8"
          >
            <div className={`w-24 h-24 ${slides[step].color} text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/10`}>
              {slides[step].icon}
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{slides[step].title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed">{slides[step].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex gap-2 mt-12">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary' : 'w-2 bg-slate-100'}`} />
          ))}
        </div>
      </div>

      <div className="p-10 space-y-4">
        <Button 
          onClick={() => step < slides.length - 1 ? setStep(step + 1) : onComplete()} 
          className="w-full py-5 text-lg"
        >
          {step === slides.length - 1 ? "Get Started" : "Next Step"}
        </Button>
        <button onClick={onComplete} className="w-full py-2 text-slate-400 text-sm font-bold uppercase tracking-widest">Skip</button>
      </div>
    </div>
  );
}

// --- Home Dashboard ---

function HomeDashboard({ user, meals, waterLogs, advice, onWaterAdd, setView }: any) {
  const today = startOfDay(new Date());
  const todayMeals = meals.filter((m: any) => isSameDay(new Date(m.timestamp), today));
  const todayWater = waterLogs.reduce((acc: number, log: any) => acc + log.amount, 0);
  
  const totals = todayMeals.reduce((acc: any, m: any) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = 2200;
  const waterGoal = 2500;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hello, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-400 text-sm font-medium">Here's your wellness summary for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setView('profile')} className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full bg-slate-50" />
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 flex flex-col justify-between min-h-[240px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Energy Balance</span>
              <h3 className="text-4xl font-extrabold text-slate-900">{Math.round(totals.calories)} <span className="text-sm font-medium text-slate-400">kcal</span></h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Remaining</p>
                  <p className="text-sm font-bold">{Math.max(0, calorieGoal - Math.round(totals.calories))} kcal</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Goal</p>
                  <p className="text-sm font-bold">{calorieGoal} kcal</p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">{Math.round((totals.calories / calorieGoal) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totals.calories / calorieGoal) * 100, 100)}%` }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between min-h-[240px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hydration</span>
              <h3 className="text-4xl font-extrabold text-slate-900">{todayWater} <span className="text-sm font-medium text-slate-400">ml</span></h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              {[250, 500].map(amount => (
                <button 
                  key={amount}
                  onClick={() => { api.addWater(amount).then(onWaterAdd); }}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 transition-all"
                >
                  +{amount}ml
                </button>
              ))}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((todayWater / waterGoal) * 100, 100)}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard label="Protein" value={totals.protein} goal={150} color="bg-emerald-500" />
        <MacroCard label="Carbs" value={totals.carbs} goal={250} color="bg-indigo-500" />
        <MacroCard label="Fat" value={totals.fat} goal={70} color="bg-amber-500" />
        <MacroCard label="Fiber" value={0} goal={30} color="bg-purple-500" />
      </div>

      {/* AI Advice */}
      {advice && (
        <Card className="bg-slate-50 border-none p-6 flex gap-4 items-start">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">AI Health Insight</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{advice}</p>
          </div>
        </Card>
      )}

      {/* Recent Meals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Recent Journal</h3>
          <button onClick={() => setView('history')} className="text-xs font-bold text-primary hover:underline">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayMeals.slice(0, 2).map(meal => (
            <Card key={meal.id} className="p-3 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img src={meal.image_url} alt="Meal" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="primary">{meal.type}</Badge>
                  <span className="text-[10px] font-bold text-slate-300">{format(new Date(meal.timestamp), 'h:mm a')}</span>
                </div>
                <h4 className="font-bold text-slate-900 truncate text-sm">{meal.items.join(', ')}</h4>
                <p className="text-xs font-medium text-slate-400">{Math.round(meal.calories)} kcal • {Math.round(meal.protein)}g Protein</p>
              </div>
            </Card>
          ))}
          {todayMeals.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium">No meals recorded today. Start by scanning your next meal!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MacroCard({ label, value, goal, color }: any) {
  const percentage = Math.min((value / goal) * 100, 100);
  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-900">{Math.round(value)}g</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </Card>
  );
}

// --- Scan Meal Screen ---

function ScanMeal({ onComplete }: { onComplete: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [portion, setPortion] = useState(1);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const res = await analyzeFoodImage(image);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !image) return;
    setSaving(true);
    try {
      const { url } = await api.uploadImage(image);
      await api.addMeal({
        type: mealType,
        image_url: url,
        items: result.items,
        calories: result.nutrition.calories * portion,
        protein: result.nutrition.protein * portion,
        carbs: result.nutrition.carbs * portion,
        fat: result.nutrition.fat * portion,
        fiber: result.nutrition.fiber * portion,
        vitamins: result.nutrition.vitamins
      });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      {!image ? (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scan Your Meal</h2>
            <p className="text-slate-400 font-medium">Capture a photo to get instant nutritional data.</p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square md:aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-10 text-center space-y-4 cursor-pointer hover:bg-slate-100 transition-all group"
          >
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Take a Photo</h3>
              <p className="text-sm text-slate-400">or select from your gallery</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Instant AI Analysis</p>
                <p className="text-xs text-slate-400">Powered by Gemini Vision</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">95% Accuracy</p>
                <p className="text-xs text-slate-400">On common food items</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden aspect-square md:aspect-video shadow-xl border border-slate-100">
            <img src={image} alt="Meal" className="w-full h-full object-cover" />
            
            <AnimatePresence>
              {analyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-10 text-center"
                >
                  <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                  <h3 className="text-xl font-bold mb-2">Analyzing Meal...</h3>
                  <p className="text-white/60 text-sm max-w-xs">Our AI is identifying ingredients and calculating nutritional values.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!analyzing && !result && (
              <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                <Button variant="outline" className="flex-1 bg-white/90 backdrop-blur-xl" onClick={() => setImage(null)}>Cancel</Button>
                <Button className="flex-[2]" onClick={handleAnalyze}>Analyze Photo</Button>
              </div>
            )}
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900">Analysis Result</h3>
                    <p className="text-sm text-slate-400">We found {result.items.length} items in your meal.</p>
                  </div>
                  <Badge variant="success">{Math.round(result.confidence * 100)}% Confidence</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {result.items.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meal Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'breakfast', icon: <Coffee /> },
                        { id: 'lunch', icon: <Sun /> },
                        { id: 'dinner', icon: <Moon /> },
                        { id: 'snack', icon: <Apple /> }
                      ].map((t: any) => (
                        <button 
                          key={t.id}
                          onClick={() => setMealType(t.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all border ${
                            mealType === t.id ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-400"
                          }`}
                        >
                          {React.cloneElement(t.icon, { className: "w-5 h-5" })}
                          <span className="text-[8px] font-bold uppercase">{t.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portion Size</label>
                      <span className="text-sm font-bold text-primary">{portion}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3" step="0.5" value={portion} 
                      onChange={(e) => setPortion(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase">
                      <span>Small</span>
                      <span>Normal</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatItem label="Calories" value={Math.round(result.nutrition.calories * portion)} unit="kcal" />
                  <StatItem label="Protein" value={Math.round(result.nutrition.protein * portion)} unit="g" />
                  <StatItem label="Carbs" value={Math.round(result.nutrition.carbs * portion)} unit="g" />
                  <StatItem label="Fat" value={Math.round(result.nutrition.fat * portion)} unit="g" />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => { setImage(null); setResult(null); }}>Retake</Button>
                  <Button className="flex-[2]" onClick={handleSave} loading={saving}>Save to Journal</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StatItem({ label, value, unit }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-extrabold text-slate-900">{value}<span className="text-xs font-medium text-slate-400 ml-1">{unit}</span></p>
    </div>
  );
}

// --- Meal History ---

function MealHistory({ meals }: { meals: Meal[] }) {
  const [filter, setFilter] = useState('all');
  const filteredMeals = filter === 'all' ? meals : meals.filter(m => m.type === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meal Journal</h2>
          <p className="text-slate-400 font-medium">Your complete nutritional history.</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-50 rounded-xl overflow-x-auto no-scrollbar">
          {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeals.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto">
              <HistoryIcon className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-medium">No meals found for this category.</p>
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <Card key={meal.id} className="p-0 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-48">
              <div className="w-full sm:w-48 h-48 sm:h-full shrink-0">
                <img src={meal.image_url} alt={meal.type} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Badge variant="primary">{meal.type}</Badge>
                    <span className="text-[10px] font-bold text-slate-300">{format(new Date(meal.timestamp), 'MMM d')}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 truncate">{meal.items.join(', ')}</h3>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Kcal</p>
                      <p className="text-sm font-bold text-slate-700">{Math.round(meal.calories)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Prot</p>
                      <p className="text-sm font-bold text-slate-700">{Math.round(meal.protein)}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Carb</p>
                      <p className="text-sm font-bold text-slate-700">{Math.round(meal.carbs)}g</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}

// --- Nutrition Reports ---

function NutritionReports({ meals, waterLogs }: any) {
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  }).map(day => {
    const dayMeals = meals.filter((m: any) => isSameDay(new Date(m.timestamp), day));
    return {
      name: format(day, 'EEE'),
      calories: dayMeals.reduce((acc: number, m: any) => acc + m.calories, 0),
    };
  });

  const totalMacros = meals.reduce((acc: any, m: any) => ({
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'Protein', value: totalMacros.protein, color: '#10B981' },
    { name: 'Carbs', value: totalMacros.carbs, color: '#6366F1' },
    { name: 'Fat', value: totalMacros.fat, color: '#F59E0B' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Weekly Calorie Trend</h3>
            <Badge variant="primary">Last 7 Days</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-8">
          <h3 className="font-bold text-slate-900">Macro Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {macroData.map(m => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-bold text-slate-500">{m.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{Math.round(m.value)}g</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// --- Profile Screen ---

function ProfileScreen({ user, onUpdate }: { user: User, onUpdate: () => void }) {
  const [name, setName] = useState(user.name || '');
  const [weight, setWeight] = useState(user.weight || '');
  const [height, setHeight] = useState(user.height || '');
  const [goalWeight, setGoalWeight] = useState(user.goal_weight || '');
  const [dietGoal, setDietGoal] = useState(user.diet_goal || 'balanced');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ 
        name, 
        weight: Number(weight), 
        height: Number(height), 
        goal_weight: Number(goalWeight), 
        diet_goal: dietGoal 
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full bg-slate-50" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h2>
          <p className="text-slate-400 font-medium">{user.email}</p>
        </div>
      </div>

      <Card className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Goal Weight (kg)</label>
            <input type="number" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Goal</label>
          <div className="grid grid-cols-3 gap-3">
            {['weight loss', 'muscle gain', 'balanced'].map(g => (
              <button 
                key={g}
                onClick={() => setDietGoal(g)}
                className={`px-4 py-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                  dietGoal === g 
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/10" 
                    : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full py-4" onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700">App Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-200" />
        </button>
        <button className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
              <Info className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700">Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-200" />
        </button>
      </div>
    </motion.div>
  );
}
