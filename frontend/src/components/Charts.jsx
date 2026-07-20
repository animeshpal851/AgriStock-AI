import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts'

export default function Charts({ results }) {
  const { demand, payload, input_metadata } = results
  const crop = payload?.crop || 'Crop'
  const production = payload?.production || 0
  const demandNum = typeof demand === 'number' ? demand : parseFloat(demand) || 0

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
    { name: 'Historical Rain (mm)', value: Math.round(rain), color: '#3B82F6' },
    { name: 'Literacy Rate (%)', value: Math.round(literacy), color: '#10B981' },
    { name: 'Population Growth (%)', value: Math.round(growth), color: '#F59E0B' }
  ]

  // Custom tooltips for premium aesthetic
  const CustomTooltip = ({ active, payload: tooltipPayload, label }) => {
    if (active && tooltipPayload && tooltipPayload.length) {
      return (
        <div className="p-3 bg-white/95 dark:bg-dark-card/95 border border-gray-150 dark:border-dark-border rounded-xl shadow-lg backdrop-blur-md animate-fade-in text-xs font-semibold">
          <p className="text-gray-400 mb-1">{label}</p>
          {tooltipPayload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="font-poppins py-0.5">
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
      <div className="p-6 rounded-3xl bg-white/40 dark:bg-dark-card/40 border border-white/20 dark:border-dark-border backdrop-blur-xl shadow-lg">
        <h4 className="text-sm font-bold text-text-primary dark:text-white font-poppins mb-4 tracking-wide">
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
                stroke="#9CA3AF" 
                fontSize={12} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                dataKey="Predicted Demand (Tons)" 
                fill="#D9903D" 
                radius={[10, 10, 0, 0]} 
                maxBarSize={60} 
                animationDuration={1500}
              />
              <Bar 
                dataKey="Planned Production (Tons)" 
                fill="#526E40" 
                radius={[10, 10, 0, 0]} 
                maxBarSize={60} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-3 font-medium">
          {demandNum > production 
            ? `⚠️ Potential crop deficit of ${(demandNum - production).toLocaleString(undefined, {maximumFractionDigits: 0})} Tons predicted in this district.`
            : `✓ Potential crop surplus of ${(production - demandNum).toLocaleString(undefined, {maximumFractionDigits: 0})} Tons expected.`
          }
        </p>
      </div>

      {/* Chart 2: Climate & Metrics */}
      <div className="p-6 rounded-3xl bg-white/40 dark:bg-dark-card/40 border border-white/20 dark:border-dark-border backdrop-blur-xl shadow-lg">
        <h4 className="text-sm font-bold text-text-primary dark:text-white font-poppins mb-4 tracking-wide">
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
                stroke="#9CA3AF" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]} 
                animationDuration={1500}
                fill="#3B82F6"
              >
                {/* Dynamically color bars based on item */}
                {metricsData.map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-3 font-medium">
          Historic climate averages synced from population and census data.
        </p>
      </div>
    </div>
  )
}
