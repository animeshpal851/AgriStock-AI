import { motion } from 'framer-motion'

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.15 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 max-w-5xl mx-auto flex flex-col gap-10">
      
      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-3">
        <span className="text-primary text-xs font-bold uppercase tracking-wider font-poppins">
          METHODOLOGY &amp; ARCHITECTURE
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-poppins text-text-primary dark:text-white tracking-tight">
          About AgriStock AI
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#D1D5DB] font-medium max-w-2xl leading-relaxed">
          Discover the technology, balanced machine learning models, and datasets backing our agricultural forecasting and risk estimation platform.
        </p>
      </div>

      {/* Grid of Sections */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Model 1 details */}
        <motion.div 
          variants={cardVariants}
          className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl flex flex-col gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-lg">
            📈
          </div>
          <h3 className="text-lg font-bold font-poppins text-text-primary dark:text-white">
            Demand Regression Pipeline
          </h3>
          <p className="text-xs text-gray-600 dark:text-[#D1D5DB] font-medium leading-relaxed">
            Predicts the target agricultural crop demand (in Tons) using historical production records, local area metrics, regional demographics, and rainfall stats.
          </p>
          
          <div className="border-t border-gray-100 dark:border-[#3B4454] pt-4 mt-2 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold font-poppins text-text-primary dark:text-white">MODELS &amp; METRICS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Algorithm</span>
                <span className="text-xs font-bold text-text-primary dark:text-white">RandomForestRegressor</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Validation</span>
                <span className="text-xs font-bold text-text-primary dark:text-white">5-Fold CV + GridSearch</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">R² Score</span>
                <span className="text-xs font-bold text-olive-green dark:text-green-400">1.00 (Perfect Fit)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Mean Abs Error</span>
                <span className="text-xs font-bold text-text-primary dark:text-white">0.0009</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Model 2 details */}
        <motion.div 
          variants={cardVariants}
          className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl flex flex-col gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-olive-green/10 dark:bg-olive-green/20 flex items-center justify-center text-olive-green text-lg">
            🛡️
          </div>
          <h3 className="text-lg font-bold font-poppins text-text-primary dark:text-white">
            Crop Yield Risk Classifier
          </h3>
          <p className="text-xs text-gray-600 dark:text-[#D1D5DB] font-medium leading-relaxed">
            Classifies the yield risk profile into Low, Moderate, or High risk categories. Calibrated using balanced quantiles and class weight balancing.
          </p>
          
          <div className="border-t border-gray-100 dark:border-[#3B4454] pt-4 mt-2 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold font-poppins text-text-primary dark:text-white">MODELS &amp; METRICS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Algorithm</span>
                <span className="text-xs font-bold text-text-primary dark:text-white">RandomForestClassifier</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Validation</span>
                <span className="text-xs font-bold text-text-primary dark:text-white">5-Fold CV + Balanced</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Test Accuracy</span>
                <span className="text-xs font-bold text-olive-green dark:text-green-400">94.77%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase">Weighted F1</span>
                <span className="text-xs font-bold text-text-primary dark:text-white">0.948</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Dataset & Tech Stack Summary */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl flex flex-col gap-6">
        <h3 className="text-lg font-bold font-poppins text-text-primary dark:text-white">
          Data Integration &amp; Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-[#D1D5DB] leading-relaxed font-medium">
          <div className="flex flex-col gap-2">
            <h4 className="font-bold font-poppins text-text-primary dark:text-white text-xs">RAW DATASETS</h4>
            <p>
              We merge Indian crop production statistics with historic regional population density, literacy indexes, annual growth metrics, and daily rainfall totals aggregated into monthly averages.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold font-poppins text-text-primary dark:text-white text-xs">PREPROCESSING</h4>
            <p>
              Whitespace stripping, case normalizations, missing value removal, duplicate clearing, robust label encoding of districts/states, and yield computations ($production / area$) are fully automated.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold font-poppins text-text-primary dark:text-white text-xs">ROBUST MAPPINGS</h4>
            <p>
              The Flask API loads label encoders and features lookups on server boot. It performs case-insensitive search and fallback mappings for unknown inputs, avoiding runtime errors.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
