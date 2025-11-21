"use client";

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  HeartPulse, 
  AlertTriangle,
  FileText,
  ScanSearch,
  CheckCircle,
  BarChart2,
  Brain
} from 'lucide-react';

// --- 1. DEFINE OUR DATA TYPES ---
type RiskResult = {
  probability: number;
  label: "High Risk" | "Low Risk";
};

// --- 2. RADIAL GAUGE COMPONENT ---
// This component draws the "crazy" animated circle
const RiskGauge = ({ probability }: { probability: number }) => {
  const isHighRisk = probability > 0.5;
  const pct = Math.round(probability * 100);
  const strokeColor = isHighRisk ? "stroke-red-500" : "stroke-green-500";
  const textColor = isHighRisk ? "text-red-400" : "text-green-400";
  
  // SVG arc calculation
  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const [offset, setOffset] = useState(circumference);

  // Animate the circle on load
  useEffect(() => {
    // Adding a slight delay to start the animation after component mounts
    const timer = setTimeout(() => {
      const strokeDashoffset = circumference - (probability * circumference);
      setOffset(strokeDashoffset);
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, [probability, circumference]);

  return (
    <div className="relative flex items-center justify-center w-56 h-56">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <defs>
          {/* Creates the glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background Circle */}
        <circle
          className="stroke-slate-700"
          strokeWidth="8"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        {/* Progress Circle */}
        <circle
          className={`transform -rotate-90 origin-center ${strokeColor} transition-all duration-1000 ease-out`}
          style={{ strokeDashoffset: offset }}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-6xl font-bold ${textColor}`}>{pct}%</span>
        <span className="text-lg font-medium text-slate-300">Risk Score</span>
      </div>
    </div>
  );
};

// --- 3. FAKE EKG/HEARTBEAT COMPONENT ---
const HeartbeatMonitor = ({ isHighRisk }: { isHighRisk: boolean }) => {
  return (
    <div className={`w-full h-24 bg-black/30 rounded-lg flex items-center p-4 overflow-hidden`}>
      {/* The EKG line SVG path */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 60"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {/* Background grid lines */}
        <path
          d="M 0 10 L 200 10 M 0 20 L 200 20 M 0 30 L 200 30 M 0 40 L 200 40 M 0 50 L 200 50"
          stroke="#374151" // gray-700
          strokeWidth="0.2"
        />
        <path
          d="M 0 30 L 70 30 L 75 20 L 80 45 L 85 30 L 90 35 L 95 30 L 200 30"
          stroke={isHighRisk ? "#f87171" : "#4ade80"} /* red-400 or green-400 */
          strokeWidth="2"
          fill="none"
          className="animate-pulse-ekg"
          style={{ 
            animationDuration: isHighRisk ? '0.8s' : '1.5s', // Faster pulse for high risk
            filter: `drop-shadow(0 0 3px ${isHighRisk ? "#ef4444" : "#22c55e"})` 
          }}
        />
      </svg>
    </div>
  );
};

// --- 4. FAKE "BOOTING" LOADER ---
const BootingLoader = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const logLines = [
      "Booting ClinicalBERT AI core...",
      "Initializing model: discharge_readmission",
      "Loading vocabulary (30,522 tokens)...",
      "Model architecture confirmed: 12-layer, 768-hidden.",
      "Awaiting patient data...",
      "Receiving note... tokenizing input...",
      "Padding and truncating to 512 tokens...",
      "Running analysis through 12 attention heads...",
      "Calculating final logit score...",
      "Applying sigmoid... generating probability...",
      "Analysis complete. Booting results UI..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logLines.length) {
        setLogs(prev => [...prev, logLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300); // Speed of the log lines appearing
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-10 h-full bg-slate-800/50 rounded-lg border border-blue-800 shadow-xl shadow-blue-900/30">
      <Brain className="w-16 h-16 animate-pulse text-blue-400" />
      <p className="mt-6 text-2xl text-slate-300 font-mono">ANALYZING RISK</p>
      
      {/* Fake Log Terminal */}
      <div className="mt-4 w-full max-w-lg h-48 bg-black/50 rounded p-4 font-mono text-sm text-green-400 overflow-y-auto">
        {logs.map((log, i) => (
          <p key={i}>{`> ${log}`}</p>
        ))}
        {/* Blinking caret */}
        <span className="border-r-2 animate-typing-blink">&nbsp;</span>
      </div>
    </div>
  );
};

// --- 5. MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const [note, setNote] = useState("");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleNote = "Patient: 78 y/o Male. History: CHF (Congestive Heart Failure), T2DM (Type 2 Diabetes), CKD (Chronic Kidney Disease). Admission: Admitted for acute exacerbation of CHF. Hospital Course: Patient required 8 days of IV diuretics. Complicated by acute kidney injury. Multiple medications adjusted. Patient remains weak and has poor mobility. Discharge: Discharged to SNF (Skilled Nursing Facility).";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    // Fake delay to make the "booting" sequence visible and feel "heavy"
    await new Promise(resolve => setTimeout(resolve, 3500)); 

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data: RiskResult = await response.json();
      setResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = () => {
    setNote(sampleNote);
    setResult(null);
    setError(null);
  };

  return (
    <main className="flex min-h-screen w-full p-8 font-sans">
      {/* Background glow/grid effect */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900" />
      
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        {/* --- Header --- */}
        <header className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Clinical AI Risk Analyzer
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_2px_rgba(74,222,128,0.7)]" />
            <span className="text-sm text-green-400">MODEL ONLINE</span>
          </div>
        </header>

        {/* --- Content Area (2-column layout) --- */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          
          {/* --- Left Column (Input) --- */}
          <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-xl transition-all hover:shadow-blue-900/50">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center">
                <label htmlFor="note" className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Patient Discharge Note
                </label>
                <button
                  type="button"
                  onClick={handleSampleClick}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Load High-Risk Sample
                </button>
              </div>
              <textarea
                id="note"
                name="note"
                rows={24}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-4 w-full p-4 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Patient is a 78 y/o Male. History: CHF..."
              />
              <button
                type="submit"
                disabled={isLoading || !note}
                className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    ANALYZING...
                  </>
                ) : "RUN RISK ANALYSIS"}
              </button>
            </form>
          </div>

          {/* --- Right Column (Dashboard Output) --- */}
          <div className="lg:col-span-3">
            {isLoading && <BootingLoader />}
            {error && <ErrorState error={error} />}
            
            {!isLoading && !error && result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Risk Gauge */}
                <div className="md:col-span-1 p-6 bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col items-center justify-center animate-fade-in-up shadow-xl transition-all hover:shadow-blue-900/50">
                  <RiskGauge probability={result.probability} />
                </div>
                
                {/* 2. Model Verdict */}
                <div className="md:col-span-1 p-6 bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col items-center justify-center animate-fade-in-up shadow-xl transition-all hover:shadow-blue-900/50" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-lg font-medium text-slate-400">AI VERDICT</h3>
                  <p className={`mt-4 text-6xl font-bold ${result.label === 'High Risk' ? 'text-red-400' : 'text-green-400'}`}>
                    {result.label}
                  </p>
                  <p className="mt-4 text-slate-300 text-center">
                    Model classified this note with a {result.label === 'High Risk' ? 'HIGH' : 'LOW'} probability of 30-day readmission.
                  </p>
                </div>

                {/* 3. Vitals Monitor */}
                <div className="md:col-span-2 p-6 bg-slate-800/50 border border-slate-700 rounded-lg animate-fade-in-up shadow-xl transition-all hover:shadow-blue-900/50" style={{ animationDelay: '0.4s' }}>
                  <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-blue-400" />
                    RISK MONITOR
                  </h3>
                  <HeartbeatMonitor isHighRisk={result.label === 'High Risk'} />
                </div>

              </div>
            )}

            {!isLoading && !error && !result && (
              <div className="text-center text-slate-500 h-full flex flex-col items-center justify-center bg-slate-800/30 border border-slate-700 rounded-lg p-10">
                <ScanSearch className="w-24 h-24 mx-auto" />
                <p className="mt-4 text-xl">AWAITING INPUT</p>
                <p>Paste a note and click "Run Risk Analysis" to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


const ErrorState = ({ error }: { error: string }) => (
  <div className="flex flex-col items-center justify-center p-10 h-full text-center bg-red-900/30 border border-red-700 rounded-lg">
    <AlertTriangle className="w-12 h-12 text-red-400" />
    <p className="mt-4 text-lg font-semibold text-red-400">Error: {error}</p>
    <p className="text-slate-400 mt-2">
      Could not connect to the backend.<br />
      Please ensure the Python API server is running (`python app.py`).
    </p>
  </div>
);