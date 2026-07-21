import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

export default function Charts({ results }) {
  const { predicted_demand, payload, input_metadata } = results
  const crop = payload?.crop || 'Crop'
  const production = payload?.production || 0
  const demandNum = typeof predicted_demand === 'number' ? predicted_demand : parseFloat(predicted_demand) || 0

  // 1. Data for Supply vs Demand Chart
  const supplyDemandData = [
    {
      name: crop,
      'Predicted Demand (Tons)': Math.round(demandNum),
      'Planned Production (Tons)': Math.round(production)
    }
  ]

  // 2. Data for Climate & Demographics
  const rain = input_metadata?.monthly_rainfall || payload?.monthly_rainfall || 0
  const literacy = input_metadata?.literacy || 0
  const growth = input_metadata?.growth || 0

  const metricsData = [
    { name: 'Rainfall (mm)', value: Math.round(rain), color: '#3B82F6' },
    { name: 'Literacy (%)', value: Math.round(literacy), color: '#22C55E' },
    { name: 'Growth (%)', value: Math.round(growth), color: '#FACC15' }
  ]

  // Custom tooltips for high-contrast dark theme
  const CustomTooltip = ({ active, payload: tooltipPayload, label }) => {
    if (active && tooltipPayload && tooltipPayload.length) {
      return (
        <div className="p-3.5 bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] rounded-xl shadow-xl animate-fade-in text-xs font-semibold">
          <p className="text-gray-500 dark:text-[#E5E7EB] mb-1.5 font-poppins">{label}</p>
          {tooltipPayload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="font-poppins py-0.5 font-bold">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-6">
      {/* Chart 1: Supply vs Demand */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl">
        <h4 className="text-sm font-black text-text-primary dark:text-white font-poppins mb-4 tracking-wide">
          Supply &amp; Demand Balance
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={supplyDemandData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis 
                dataKey="name" 
                stroke="#B0B7C3" 
                fontSize={12} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#B0B7C3" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#E5E7EB' }} />
              <Bar 
                dataKey="Predicted Demand (Tons)" 
                fill="#D9903D" 
                radius={[10, 10, 0, 0]} 
                maxBarSize={60} 
                animationDuration={1200}
              />
              <Bar 
                dataKey="Planned Production (Tons)" 
                fill="#22C55E" 
                radius={[10, 10, 0, 0]} 
                maxBarSize={60} 
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-[#D1D5DB] text-center mt-3 font-semibold">
          {demandNum > production 
            ? `⚠️ Potential crop deficit of ${(demandNum - production).toLocaleString(undefined, {maximumFractionDigits: 0})} Tons predicted in this district.`
            : `✓ Potential crop surplus of ${(production - demandNum).toLocaleString(undefined, {maximumFractionDigits: 0})} Tons expected.`
          }
        </p>
      </div>

      {/* Chart 2: Climate & Metrics */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-xl">
        <h4 className="text-sm font-black text-text-primary dark:text-white font-poppins mb-4 tracking-wide">
          Climate &amp; Regional Metrics
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metricsData}
              layout="vertical"
              margin={{ top: 15, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
              <XAxis 
                type="number" 
                stroke="#B0B7C3" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#B0B7C3" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]} 
                animationDuration={1200}
                fill="#3B82F6"
              >
                {metricsData.map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-gray-600 dark:text-[#D1D5DB] text-center mt-3 font-semibold">
          Historic climate and census metrics loaded from dataset.
        </p>
      </div>
    </div>
  )
}
