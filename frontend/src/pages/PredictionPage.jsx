import PredictionForm from '../components/PredictionForm'

export default function PredictionPage({ addToast }) {
  return (
    <div className="min-h-screen pt-28 pb-16 flex flex-col items-center">
      
      {/* Hero Header Section */}
      <div className="max-w-4xl w-full text-center px-6 flex flex-col items-center gap-3.5 mb-2">
        <span className="px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary text-xs font-bold font-poppins tracking-wider uppercase">
          🌾 AI Prediction Engine
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-poppins text-text-primary dark:text-white tracking-tight">
          Crop Analysis Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
          Provide your farming coordinates, crop selections, and land parameters to receive deep agricultural demand projections and crop risk analysis.
        </p>
      </div>

      {/* Prediction Form component */}
      <div className="w-full relative z-10">
        <PredictionForm addToast={addToast} />
      </div>

    </div>
  )
}
