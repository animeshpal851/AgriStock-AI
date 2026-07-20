import { motion } from 'framer-motion'
import CircularRisk from './CircularRisk'
import Charts from './Charts'

export default function ResultCard({ results }) {
  const { predicted_demand, predicted_risk, confidence_score, prediction_time_ms, payload, input_metadata } = results
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
      recommendation = `Demand (${Math.round(predicted_demand).toLocaleString()} Tons) is expected to exceed planned supply. Securing early contracts and storage is highly recommended to capture high prices.`
    } else {
      recommendation = `Planned production (${Math.round(production).toLocaleString()} Tons) exceeds projected demand. Consider diversifying crop allocation or exploring immediate wholesale commitments.`
    }

    if (risk.includes('low')) {
      marketOutlook = `Stable market prices expected for ${crop} in ${state}. Ideal time for long-term supply agreements.`
      riskAnalysis = `Favorable climatic index (${Math.round(input_metadata?.monthly_rainfall || 0)}mm avg monthly rain) and demographics support smooth cultivation and distribution.`
    } else if (risk.includes('high')) {
      marketOutlook = `High price volatility alert for ${crop}. Consider securing crop insurance or crop hedging to buffer risk.`
      riskAnalysis = `Sub-optimal crop yield index computed (${input_metadata?.yield?.toFixed(2)} Tons/ha). High threat of pest, drought, or distribution bottlenecks.`
    } else {
      marketOutlook = `Balanced market outlook. Keep track of local supply trends during harvest.`
      riskAnalysis = `Moderate risks detected. Keep close eye on monsoon performance and regional pest reports.`
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
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white font-poppins">
            Prediction Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Real-time analytics and predictive insights for your cultivation parameters.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary animate-pulse text-xs font-bold font-poppins">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Prediction Active
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Core Demand Metric */}
        <motion.div
          variants={childVariants}
          className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 font-poppins uppercase tracking-wider">
                Predicted Demand
              </span>
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-3xl font-extrabold text-primary dark:text-primary font-poppins mt-4">
              {Math.round(predicted_demand).toLocaleString('en-IN')}
              <span className="text-sm font-semibold text-text-primary dark:text-gray-300 ml-1.5">Tons</span>
            </h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Agricultural target demand calculated for {crop}.
            </p>
          </div>
          
          <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-6 flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Crop / Season</span>
            <span className="font-bold text-text-primary dark:text-gray-200">
              {crop} / {season}
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
          className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 font-poppins uppercase tracking-wider">
                System Diagnostics
              </span>
              <span className="text-lg">⚙️</span>
            </div>
            
            <div className="flex flex-col gap-3.5 mt-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Prediction Time</span>
                <span className="font-bold text-text-primary dark:text-gray-200 bg-gray-50 dark:bg-dark-bg/60 px-2.5 py-1 rounded-lg">
                  {prediction_time_ms} ms
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">District Yield</span>
                <span className="font-bold text-text-primary dark:text-gray-200 bg-gray-50 dark:bg-dark-bg/60 px-2.5 py-1 rounded-lg">
                  {input_metadata?.yield?.toFixed(2)} Tons/ha
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Model Backend</span>
                <span className="font-bold text-olive-green dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-lg font-poppins">
                  RF Regressor &amp; Cls v1.2
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-6 flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Location</span>
            <span className="font-bold text-text-primary dark:text-gray-200 max-w-[150px] truncate text-right">
              {district}, {state}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Insights Row */}
      <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Recommendation', text: insights.recommendation, icon: '💡', color: 'border-amber-100 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5' },
          { title: 'Market Outlook', text: insights.marketOutlook, icon: '📈', color: 'border-blue-100 dark:border-blue-950/40 bg-blue-50/10 dark:bg-blue-950/5' },
          { title: 'Risk Analysis', text: insights.riskAnalysis, icon: '🔍', color: 'border-olive-green/20 bg-olive-green/5' }
        ].map((ins, index) => (
          <div 
            key={index}
            className={`p-5 rounded-2xl border ${ins.color} flex flex-col gap-2.5`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{ins.icon}</span>
              <h4 className="text-xs font-bold text-text-primary dark:text-white font-poppins uppercase tracking-wide">
                {ins.title}
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
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
        className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-md"
      >
        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 font-poppins uppercase tracking-wider mb-4">
          Parameters Log
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
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {param.label}
              </span>
              <span className="text-sm font-bold text-text-primary dark:text-gray-200">
                {param.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
