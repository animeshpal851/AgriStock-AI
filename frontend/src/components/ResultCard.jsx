import { motion } from 'framer-motion'
import CircularRisk from './CircularRisk'
import Charts from './Charts'

export default function ResultCard({ results }) {
  const { 
    predicted_demand, 
    predicted_risk, 
    confidence_score, 
    class_probabilities, 
    prediction_time_ms, 
    payload, 
    input_metadata 
  } = results

  const crop = payload?.crop || 'Crop'
  const state = payload?.state || 'State'
  const district = payload?.district || 'District'
  const season = payload?.season || 'Season'
  const area = payload?.area || 0
  const production = payload?.production || 0

  // Derived recommendation logic
  const getInsights = () => {
    const risk = String(predicted_risk).toLowerCase()
    
    let recommendation = ''
    let marketOutlook = ''
    let riskAnalysis = ''

    if (predicted_demand > production) {
      recommendation = `Demand (${Math.round(predicted_demand).toLocaleString()} Tons) exceeds planned production. High potential for favorable pricing and contract security.`
    } else {
      recommendation = `Planned production (${Math.round(production).toLocaleString()} Tons) exceeds projected local demand. Consider regional distribution or storage buffer.`
    }

    if (risk.includes('low')) {
      marketOutlook = `Stable market prices expected for ${crop} in ${state}. Low yield variance detected.`
      riskAnalysis = `Optimal yield index (${input_metadata?.yield?.toFixed(2)} Tons/ha) and rainfall (${Math.round(input_metadata?.monthly_rainfall || 0)} mm) support low crop risk.`
    } else if (risk.includes('high')) {
      marketOutlook = `Potential yield or price volatility for ${crop}. Risk hedging recommended.`
      riskAnalysis = `Yield metrics indicate sub-optimal performance relative to regional historical benchmarks.`
    } else {
      marketOutlook = `Balanced market outlook for ${crop}. Monitor local weather and supply trends.`
      riskAnalysis = `Moderate risk metrics. Keep tracking irrigation availability and regional yield stats.`
    }

    return { recommendation, marketOutlook, riskAnalysis }
  }

  const insights = getInsights()

  // Container motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  }

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col gap-6"
    >
      {/* Header with AI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white font-poppins">
            Prediction Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#D1D5DB] font-medium">
            Real-time analytics and predictive ML risk classification for your cultivation parameters.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary dark:text-[#FACC15] animate-pulse text-xs font-bold font-poppins shadow-sm self-start sm:self-auto">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          ML Models Evaluated
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Core Demand Metric */}
        <motion.div
          variants={childVariants}
          className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-[#E5E7EB] font-poppins uppercase tracking-wider">
                Predicted Demand
              </span>
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-primary dark:text-[#D9903D] font-poppins mt-4">
              {Math.round(predicted_demand).toLocaleString('en-IN')}
              <span className="text-sm font-bold text-text-primary dark:text-white ml-2">Tons</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#B0B7C3] mt-2 font-medium">
              Agricultural target demand calculated for {crop}.
            </p>
          </div>
          
          <div className="border-t border-gray-100 dark:border-[#3B4454] pt-4 mt-6 flex justify-between text-xs text-gray-600 dark:text-[#D1D5DB] font-semibold">
            <span>Crop / Season</span>
            <span className="font-bold text-text-primary dark:text-white">
              {crop} ({season})
            </span>
          </div>
        </motion.div>

        {/* Circular Risk Indicator */}
        <motion.div variants={childVariants} className="flex justify-center">
          <CircularRisk risk={predicted_risk} confidence={confidence_score} />
        </motion.div>

        {/* Technical Diagnostics */}
        <motion.div
          variants={childVariants}
          className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-[#E5E7EB] font-poppins uppercase tracking-wider">
                Diagnostics
              </span>
              <span className="text-xl">⚙️</span>
            </div>
            
            <div className="flex flex-col gap-3.5 mt-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-[#B0B7C3] font-semibold">Prediction Time</span>
                <span className="font-bold text-text-primary dark:text-white bg-gray-100 dark:bg-[#252C34] px-2.5 py-1 rounded-lg">
                  {prediction_time_ms} ms
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-[#B0B7C3] font-semibold">Yield Index</span>
                <span className="font-bold text-text-primary dark:text-white bg-gray-100 dark:bg-[#252C34] px-2.5 py-1 rounded-lg">
                  {input_metadata?.yield?.toFixed(2)} Tons/ha
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-[#B0B7C3] font-semibold">Model Pipeline</span>
                <span className="font-bold text-olive-green dark:text-[#22C55E] bg-green-500/10 px-2.5 py-1 rounded-lg font-poppins">
                  5-Fold CV RF Engine
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-[#3B4454] pt-4 mt-6 flex justify-between text-xs text-gray-600 dark:text-[#D1D5DB] font-semibold">
            <span>Location</span>
            <span className="font-bold text-text-primary dark:text-white max-w-[150px] truncate text-right">
              {district}, {state}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Probabilities Breakdown Bar if available */}
      {class_probabilities && (
        <motion.div 
          variants={childVariants}
          className="p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl flex flex-col gap-3"
        >
          <span className="text-xs font-bold text-gray-500 dark:text-[#E5E7EB] font-poppins uppercase tracking-wider">
            Risk Category Probabilities Breakdown
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">🟢 Low Risk</span>
              <span className="text-lg font-black text-text-primary dark:text-white">
                {((class_probabilities["Low Risk"] || 0) * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">🟡 Moderate Risk</span>
              <span className="text-lg font-black text-text-primary dark:text-white">
                {((class_probabilities["Moderate Risk"] || 0) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
              <span className="text-xs font-bold text-red-600 dark:text-red-400">🔴 High Risk</span>
              <span className="text-lg font-black text-text-primary dark:text-white">
                {((class_probabilities["High Risk"] || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights Row */}
      <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Recommendation', text: insights.recommendation, icon: '💡' },
          { title: 'Market Outlook', text: insights.marketOutlook, icon: '📈' },
          { title: 'Risk Analysis', text: insights.riskAnalysis, icon: '🔍' }
        ].map((ins, index) => (
          <div 
            key={index}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-md flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{ins.icon}</span>
              <h4 className="text-xs font-bold text-text-primary dark:text-white font-poppins uppercase tracking-wide">
                {ins.title}
              </h4>
            </div>
            <p className="text-xs text-gray-700 dark:text-[#D1D5DB] leading-relaxed font-medium">
              {ins.text}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={childVariants}>
        <Charts results={results} />
      </motion.div>

      {/* Inputs Parameter Breakdown */}
      <motion.div 
        variants={childVariants}
        className="p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl"
      >
        <h4 className="text-xs font-bold text-gray-500 dark:text-[#E5E7EB] font-poppins uppercase tracking-wider mb-4">
          Cultivation Parameters Log
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: 'Cultivated Area', value: `${area.toLocaleString()} ha` },
            { label: 'Planned Production', value: `${production.toLocaleString()} Tons` },
            { label: 'District Population', value: input_metadata?.population?.toLocaleString() || 'N/A' },
            { label: 'Growth Index', value: `${input_metadata?.growth}%` },
            { label: 'Literacy Level', value: `${input_metadata?.literacy}%` },
            { label: 'Historical Rain', value: `${Math.round(input_metadata?.monthly_rainfall || 0)} mm` }
          ].map((param, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase tracking-wide">
                {param.label}
              </span>
              <span className="text-sm font-bold text-text-primary dark:text-white">
                {param.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
