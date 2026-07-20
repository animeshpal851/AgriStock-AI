import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const MARQUEE_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton',
  'Tomato', 'Potato', 'Onion', 'Bajra', 'Jowar',
  'Groundnut', 'Soyabean', 'Sunflower', 'Mustard', 'Pigeon Pea'
]

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 px-6">
      
      {/* Premium Gradient Backdrops */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-olive-green/10 dark:bg-olive-green/5 blur-[120px]" />
        
        {/* Vercel-style subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
      </div>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Heading and Subtitle */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left max-w-2xl">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary self-start text-xs font-bold font-poppins tracking-wider uppercase"
          >
            🌾 AgriStock AI v1.2 Release
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black font-poppins text-text-primary dark:text-white leading-[1.1] tracking-tight"
          >
            Predict Agricultural <br />
            <span className="bg-gradient-to-r from-primary to-olive-green bg-clip-text text-transparent">
              Demand with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed"
          >
            Use Machine Learning to estimate agricultural demand and crop risk using real-world farming parameters. Empowering agricultural stakeholders with data-driven predictive forecasts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link
              to="/prediction"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white dark:text-dark-bg font-extrabold font-poppins text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer focus:ring-4 focus:ring-primary/25"
            >
              Start Predicting
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 hover:bg-gray-50 dark:hover:bg-dark-bg/60 text-text-primary dark:text-white font-bold font-poppins text-sm tracking-wide transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              Learn Methodology
            </Link>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-dark-border mt-6"
          >
            {[
              { label: 'Regression R²', value: '1.00' },
              { label: 'Classifier F1', value: '0.99' },
              { label: 'States Coverage', value: '30' }
            ].map((metric, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {metric.label}
                </span>
                <span className="text-xl font-extrabold text-text-primary dark:text-white font-poppins">
                  {metric.value}
                </span>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Right Column: Interactive Floating Cards Illustration */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[380px]">
          
          {/* Card 1: Input Simulator (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass p-5 rounded-3xl border border-white/20 shadow-xl w-64 absolute -left-4 sm:left-4 bottom-12 z-20 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Cultivation Input</span>
              <span className="text-primary font-poppins">Live</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-text-primary dark:text-gray-300">
                <span>Crop Type</span>
                <span className="font-bold text-primary font-poppins">Rice</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-text-primary dark:text-gray-300">
                <span>Area Size</span>
                <span className="font-bold font-poppins">2,450 ha</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-text-primary dark:text-gray-300">
                <span>Avg Rainfall</span>
                <span className="font-bold font-poppins">142.5 mm</span>
              </div>
            </div>

            <div className="w-full bg-primary/10 dark:bg-primary/20 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: ['10%', '85%', '10%'] }} 
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="bg-primary h-full rounded-full" 
              />
            </div>
          </motion.div>

          {/* Card 2: Prediction Output (Top Right) */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: -40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass p-6 rounded-[28px] border border-white/20 shadow-2xl w-72 absolute right-0 sm:right-6 top-8 z-10 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-poppins">
                AI Prediction Result
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Target Demand Estimate
              </span>
              <h4 className="text-3xl font-extrabold text-primary font-poppins tracking-tight">
                9,842 <span className="text-sm font-semibold text-text-primary dark:text-gray-300">Tons</span>
              </h4>
            </div>

            <div className="flex items-center justify-between border-t border-gray-150/40 dark:border-dark-border/40 pt-4 mt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Crop Risk</span>
                <span className="text-xs font-bold text-green-500 font-poppins">Low Risk (96%)</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-500 text-sm">
                ✓
              </div>
            </div>
          </motion.div>

          {/* Card 3: Model Health (Center Background) */}
          <div className="w-56 h-56 rounded-full bg-primary/20 dark:bg-primary/10 blur-xl absolute" />
          
        </div>

      </div>

      {/* Marquee Crop List */}
      <div className="w-full mt-20 relative z-10 overflow-hidden border-y border-gray-100/50 dark:border-dark-border/20 py-4 bg-white/20 dark:bg-dark-card/10 backdrop-blur-sm">
        <div className="flex w-[200%] gap-12 items-center animate-[shimmer_30s_linear_infinite]">
          {/* Repeat marquee crops to ensure seamless looping */}
          {[...MARQUEE_CROPS, ...MARQUEE_CROPS, ...MARQUEE_CROPS].map((crop, index) => (
            <div key={index} className="flex items-center gap-2.5 shrink-0">
              <span className="text-primary text-xs">●</span>
              <span className="text-xs font-bold font-poppins text-text-primary/75 dark:text-gray-300/75 uppercase tracking-wider">
                {crop}
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
