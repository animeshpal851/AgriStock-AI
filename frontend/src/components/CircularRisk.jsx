import { useEffect, useState } from 'react'

export default function CircularRisk({ risk = 'Low', confidence = 0.85 }) {
  const [offset, setOffset] = useState(251.2) // circumference of circle r=40 (2 * pi * 40 = 251.2)

  // Color & label mapping based on risk level
  const getRiskDetails = (riskLevel) => {
    const rl = String(riskLevel).toLowerCase()
    if (rl.includes('low')) {
      return {
        label: 'Low Risk',
        color: '#22C55E', // Green
        bgLight: 'rgba(34, 197, 94, 0.1)',
        desc: 'Favorable conditions. High probability of healthy yield.'
      }
    }
    if (rl.includes('mod') || rl.includes('med')) {
      return {
        label: 'Moderate Risk',
        color: '#F59E0B', // Amber/Yellow
        bgLight: 'rgba(245, 158, 11, 0.1)',
        desc: 'Minor weather anomalies or market volatility possible. Monitor crops.'
      }
    }
    return {
      label: 'High Risk',
      color: '#EF4444', // Red
      bgLight: 'rgba(239, 68, 68, 0.1)',
      desc: 'Significant agricultural or market risk. Insurance & contingencies advised.'
    }
  }

  const details = getRiskDetails(risk)
  const confidencePercent = Math.round(confidence * 100)

  useEffect(() => {
    // Animate the circle filling up based on confidence score
    const targetOffset = 251.2 - (251.2 * confidencePercent) / 100
    const timer = setTimeout(() => {
      setOffset(targetOffset)
    }, 200)
    return () => clearTimeout(timer)
  }, [confidencePercent])

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/40 dark:bg-dark-card/40 border border-white/20 dark:border-dark-border backdrop-blur-xl shadow-lg w-full max-w-[280px]">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-poppins uppercase tracking-wider mb-4">
        Risk Assessment
      </h4>
      
      {/* SVG Ring Gauge */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active indicator circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={details.color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        
        {/* Core content in center */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-text-primary dark:text-white font-poppins">
            {confidencePercent}%
          </span>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">
            Confidence
          </span>
        </div>
      </div>

      {/* Risk Badge & Description */}
      <div className="text-center mt-5">
        <div 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-poppins"
          style={{ 
            color: details.color, 
            backgroundColor: details.bgLight 
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: details.color }} />
          {details.label}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium leading-relaxed px-1">
          {details.desc}
        </p>
      </div>
    </div>
  )
}
