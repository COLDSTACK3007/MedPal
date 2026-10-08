import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, X, Bot, Flame, Droplets, Zap } from 'lucide-react';
import {
  calculateBMI,
  calculateBMRAndTDEE,
  getRecommendedRoutine,
  type ExerciseItem
} from '../data/fitnessData';

const EXPANDED_GOALS = [
  { id: 'weight_loss', label: '⚖️ Weight Loss & Calorie Burn' },
  { id: 'weight_gain', label: '📈 Weight Gain & Mass' },
  { id: 'body_recomposition', label: '🔄 Body Recomposition' },
  { id: 'muscle_hypertrophy', label: '🏋️ Muscle Hypertrophy' },
  { id: 'strength_gain', label: '💪 Strength Gain' },
  { id: 'endurance', label: '🏃 Endurance Improvement' },
  { id: 'flexibility_yoga', label: '🧘 Better Flexibility' },
  { id: 'maintenance', label: '🌟 General Health & Maintenance' },
];

const Fitness: React.FC = () => {
  const navigate = useNavigate();

  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(68);
  const [age, setAge] = useState(26);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState('light');
  const [selectedGoal, setSelectedGoal] = useState('maintenance');

  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [streakCount] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const bmiResult = calculateBMI(height, weight);
  const metabolicResult = calculateBMRAndTDEE(height, weight, age, gender, activityLevel);
  const recommendedRoutines = getRecommendedRoutine(bmiResult.category, selectedGoal);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning]);

  const handleToggleComplete = (id: string) => {
    setCompletedExercises(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setActiveExercise(null);
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleConsultAI = () => {
    navigate('/companion?mode=fitness', {
      state: {
        fitnessContext: {
          height, weight, age, gender,
          bmi: bmiResult.bmi, bmiCategory: bmiResult.category,
          bmr: metabolicResult.bmr, tdee: metabolicResult.tdee,
          waterLiters: metabolicResult.waterLiters,
          goal: EXPANDED_GOALS.find(g => g.id === selectedGoal)?.label || selectedGoal,
          activityLevel,
        }
      }
    });
  };

  const bmiColorClass = bmiResult.category === 'Healthy Weight' ? 'bg-success' : bmiResult.category === 'Underweight' ? 'bg-info' : bmiResult.category === 'Overweight' ? 'bg-warning' : 'bg-danger';
  const categoryMap: Record<string, string> = { yoga: 'bg-brand-glow text-brand-light', cardio: 'bg-danger-bg text-danger', exercise: 'bg-info-bg text-info', nutrition: 'bg-success-bg text-success' };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand via-blue-500 to-teal rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden shadow-sm">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-white mb-1 drop-shadow-sm">Fitness & Wellness Studio</h2>
          <p className="text-white/90 text-sm max-w-lg font-medium drop-shadow-sm">WHO-standard BMI assessment, metabolic analytics, and AI-powered personalized daily routines tailored to your body profile.</p>
        </div>
        <div className="relative z-10 mt-4 md:mt-0 bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center shadow-md">
            <Flame size={22} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white block leading-tight drop-shadow-sm">{streakCount} Days</span>
            <span className="text-[0.7rem] uppercase tracking-wider font-extrabold text-white/90">Daily Streak</span>
          </div>
        </div>
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Input Form - 3 cols */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Activity size={20} className="text-brand-light" />
            <div>
              <h3 className="text-base font-bold text-txt">Health Parameters</h3>
              <p className="text-xs text-txt-muted">Enter your details for accurate calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Height (cm)', value: height, setter: setHeight, min: 100, max: 250 },
              { label: 'Weight (kg)', value: weight, setter: setWeight, min: 30, max: 250 },
              { label: 'Age (Years)', value: age, setter: setAge, min: 10, max: 100 },
            ].map(field => (
              <div key={field.label} className="space-y-1.5">
                <label className="text-xs font-semibold text-txt-muted">{field.label}</label>
                <input type="number" value={field.value} onChange={e => field.setter(Number(e.target.value))} min={field.min} max={field.max}
                  className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm font-medium text-txt outline-none focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-glow)] transition-all" />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-muted">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm font-medium text-txt outline-none focus:border-brand transition-all">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-muted">Activity Level</label>
              <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm font-medium text-txt outline-none focus:border-brand transition-all">
                <option value="sedentary">Sedentary (Little/No Exercise)</option>
                <option value="light">Lightly Active (1-3 days/wk)</option>
                <option value="moderate">Moderately Active (3-5 days/wk)</option>
                <option value="very_active">Very Active (6-7 days/wk)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-txt-muted">Primary Wellness Goal</label>
              <select value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm font-medium text-txt outline-none focus:border-brand transition-all">
                {EXPANDED_GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleConsultAI}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-brand to-teal text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--color-brand-glow)] transition-all duration-300">
            <Bot size={18} />
            Get AI-Powered Personalized Plan
          </button>
        </div>

        {/* BMI Result - 2 cols */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-txt">Body Metrics</h3>
            <span className={`text-[0.7rem] font-bold uppercase px-3 py-1 rounded-full text-white ${bmiColorClass}`}>
              {bmiResult.category}
            </span>
          </div>

          <div className="flex items-center gap-5 my-3">
            <div className={`w-24 h-24 rounded-full ${bmiColorClass} flex flex-col items-center justify-center shadow-xl flex-shrink-0`}>
              <span className="text-3xl font-extrabold text-white leading-none">{bmiResult.bmi}</span>
              <span className="text-[0.6rem] uppercase font-bold text-white/80 tracking-wider">BMI</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-txt mb-1" style={{ color: bmiResult.statusColor }}>{bmiResult.category}</h4>
              <p className="text-xs text-txt-muted leading-relaxed">{bmiResult.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'BMR', value: `${metabolicResult.bmr}`, unit: 'kcal', icon: <Zap size={14} className="text-warning" /> },
              { label: 'TDEE', value: `${metabolicResult.tdee}`, unit: 'kcal', icon: <Flame size={14} className="text-danger" /> },
              { label: 'Water', value: `${metabolicResult.waterLiters}`, unit: 'L/day', icon: <Droplets size={14} className="text-info" /> },
            ].map(m => (
              <div key={m.label} className="bg-elevated border border-border-subtle rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">{m.icon}<span className="text-[0.65rem] text-txt-muted font-semibold">{m.label}</span></div>
                <strong className="text-lg font-extrabold text-txt">{m.value}</strong>
                <span className="text-[0.6rem] text-txt-muted ml-0.5">{m.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Routines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-txt">Recommended Daily Routines</h3>
            <p className="text-xs text-txt-muted">Exercises and yoga tailored to your BMI profile and fitness goal</p>
          </div>
          <span className="text-xs font-semibold text-txt-muted bg-elevated px-3 py-1.5 rounded-full">
            {completedExercises.length} / {recommendedRoutines.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recommendedRoutines.map(item => {
            const done = completedExercises.includes(item.id);
            return (
              <div key={item.id} onClick={() => { setActiveExercise(item); setTimerSeconds(0); setIsTimerRunning(false); }}
                className={`bg-card border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${done ? 'border-success' : 'border-border hover:border-brand'}`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[0.65rem] font-bold uppercase px-2.5 py-1 rounded-full ${categoryMap[item.category] || 'bg-elevated text-txt-muted'}`}>
                      {item.category}
                    </span>
                    {done && <CheckCircle size={18} className="text-success" />}
                  </div>
                  <h4 className="text-sm font-bold text-txt mb-1.5">{item.name}</h4>
                  <p className="text-xs text-txt-muted leading-relaxed">{item.benefits}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
                  <div className="flex gap-3 text-[0.72rem] text-txt-muted font-semibold">
                    <span>⏱️ {item.durationOrReps}</span>
                    <span>🔥 {item.caloriesBurned} kcal</span>
                  </div>
                  <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${done ? 'bg-success text-white' : 'bg-brand text-white hover:bg-brand-light'}`}>
                    {done ? 'Done ✓' : 'View'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {activeExercise && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-5" onClick={() => setActiveExercise(null)}>
          <div className="animate-slide-up bg-card border border-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-7 space-y-5" onClick={e => e.stopPropagation()}>

            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[0.65rem] font-bold uppercase px-2.5 py-1 rounded-full ${categoryMap[activeExercise.category] || 'bg-elevated text-txt-muted'}`}>
                  {activeExercise.category} · {activeExercise.difficulty}
                </span>
                <h3 className="text-xl font-extrabold text-txt mt-2">{activeExercise.name}</h3>
              </div>
              <button onClick={() => setActiveExercise(null)} className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center text-txt-secondary hover:text-txt transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-4 text-sm text-txt-secondary">
              <span><strong className="text-txt">Target:</strong> {activeExercise.targetMuscles.join(', ')}</span>
              <span><strong className="text-txt">Sets:</strong> {activeExercise.defaultSets}</span>
              <span><strong className="text-txt">Burn:</strong> ~{activeExercise.caloriesBurned} kcal</span>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-txt">Step-by-Step Guide</h4>
              {activeExercise.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 bg-elevated border border-border-subtle rounded-xl p-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                  <p className="text-sm text-txt-secondary leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            <div className="bg-warning-bg border border-warning/20 rounded-xl p-3.5 text-sm text-warning">
              <strong>⚠️ Safety:</strong> {activeExercise.safetyTip}
            </div>

            <div className="flex items-center justify-between bg-elevated border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg text-white transition-colors ${isTimerRunning ? 'bg-danger hover:bg-red-600' : 'bg-brand hover:bg-brand-light'}`}>
                  {isTimerRunning ? 'Pause' : 'Start Timer'}
                </button>
                <span className="text-2xl font-extrabold text-brand-light tabular-nums">{formatTimer(timerSeconds)}</span>
              </div>
              <button onClick={() => handleToggleComplete(activeExercise.id)}
                className="bg-gradient-to-r from-success to-emerald-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-success/20 transition-all">
                {completedExercises.includes(activeExercise.id) ? 'Mark Pending' : '✓ Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fitness;
