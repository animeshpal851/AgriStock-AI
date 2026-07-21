import { useEffect, useState } from 'react'

export default function CircularRisk({ risk = 'Low', confidence = 0.85 }) {
  const [offset, setOffset] = useState(251.2) // circumference of circle r=40 (2 * pi * 40 = 251.2)

  // Color & label mapping based on risk level
  const getRiskDetails = (riskLevel) => {
    const rl = String(riskLevel).toLowerCase()
    if (rl.includes('low')) {
      return {
        label: '🟢 Low Risk',
        color: '#22C55E', // Green
        bgLight: 'rgba(34, 197, 94, 0.15)',
        desc: 'Favorable condition index. High probability of optimal crop yield.'
      }
    }
    if (rl.includes('mod') || rl.includes('med')) {
      return {
        label: '🟡 Moderate Risk',
        color: '#FACC15', // Yellow
        bgLight: 'rgba(250, 204, 21, 0.15)',
        desc: 'Moderate yield variation predicted. Standard monitoring advised.'
      }
    }
    return {
      label: '🔴 High Risk',
      color: '#EF4444', // Red
      bgLight: 'rgba(239, 68, 68, 0.15)',
      desc: 'Sub-optimal yield metrics predicted. Risk mitigation advised.'
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
    <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl w-full max-w-[280px]">
      <h4 className="text-xs font-bold text-gray-500 dark:text-[#E5E7EB] font-poppins uppercase tracking-wider mb-4">
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
            className="stroke-gray-100 dark:stroke-[#252C34]"
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
          <span className="text-2xl font-black text-text-primary dark:text-white font-poppins">
            {confidencePercent}%
          </span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-[#B0B7C3] uppercase tracking-wider mt-0.5">
            Confidence
          </span>
        </div>
      </div>

      {/* Risk Badge & Description */}
      <div className="text-center mt-5">
        <div 
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-poppins shadow-sm"
          style={{ 
            color: details.color, 
            backgroundColor: details.bgLight 
          }}
        >
          {details.label}
        </div>
        <p className="text-xs text-gray-600 dark:text-[#D1D5DB] mt-3 font-medium leading-relaxed px-1">
          {details.desc}
        </p>
      </div>
    </div>
  )
}
