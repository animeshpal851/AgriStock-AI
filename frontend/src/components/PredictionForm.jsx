import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Autocomplete from './Autocomplete'
import ResultCard from './ResultCard'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function PredictionForm({ addToast }) {
  // Autocomplete suggestions lists from API
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [crops, setCrops] = useState([])
  const [seasons, setSeasons] = useState([])

  // Load status
  const [loadingLists, setLoadingLists] = useState(false)
  const [predicting, setPredicting] = useState(false)
  
  // Results
  const [results, setResults] = useState(null)

  // Form parameters
  const [form, setForm] = useState({
    state: '',
    district: '',
    crop: '',
    season: '',
    area: '',
    production: '',
    population: '',
    growth: '',
    literacy: '',
    rainfall: '',
  })

  // Autofill note & validation errors
  const [autofillNote, setAutofillNote] = useState('')
  const [errors, setErrors] = useState({})

  // Fetch initial autocomplete lists from Flask backend
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingLists(true)
      try {
        const [statesRes, cropsRes, seasonsRes] = await Promise.all([
          axios.get(`${API_BASE}/states`),
          axios.get(`${API_BASE}/crops`),
          axios.get(`${API_BASE}/seasons`)
        ])
        setStates(statesRes.data)
        setCrops(cropsRes.data)
        setSeasons(seasonsRes.data)
      } catch (err) {
        console.error('Failed to load initial lists from API:', err)
        addToast('Failed to connect to backend server. Make sure Flask is running.', 'error')
      } finally {
        setLoadingLists(false)
      }
    }
    fetchInitialData()
  }, [addToast])

  // Fetch districts list strictly for selected State
  const fetchDistricts = useCallback(async (stateName) => {
    if (!stateName) {
      setDistricts([])
      return
    }
    try {
      const res = await axios.get(`${API_BASE}/districts/${encodeURIComponent(stateName)}`)
      setDistricts(res.data)
    } catch (err) {
      console.error('Failed to fetch districts:', err)
      setDistricts([])
    }
  }, [])

  // Handle district selection & auto-populate parameters for exact (state, district)
  const handleDistrictChange = useCallback(async (districtName) => {
    if (!districtName) {
      setForm(prev => ({ 
        ...prev, 
        district: '', 
        rainfall: '', 
        population: '', 
        growth: '', 
        literacy: '' 
      }))
      setAutofillNote('')
      return
    }

    setForm(prev => ({ ...prev, district: districtName }))
    setErrors(prev => ({ ...prev, district: '' }))
    setAutofillNote('Fetching parameters for district...')

    try {
      // Pass both state and district for exact dataset lookup
      const url = form.state 
        ? `${API_BASE}/rainfall/${encodeURIComponent(form.state)}/${encodeURIComponent(districtName)}`
        : `${API_BASE}/rainfall/${encodeURIComponent(districtName)}`
        
      const res = await axios.get(url)
      const data = res.data
      setForm(prev => ({
        ...prev,
        rainfall: String(data.monthly_rainfall ? Math.round(data.monthly_rainfall * 10) / 10 : ''),
        population: String(data.population || ''),
        growth: String(data.growth || ''),
        literacy: String(data.literacy || '')
      }))
      setAutofillNote(`✓ ${districtName} parameters loaded from dataset`)
    } catch (err) {
      console.error('Failed to fetch rainfall/metadata for district:', err)
      setAutofillNote('')
    }
  }, [form.state])

  // Set field value with strict cascading resets
  const updateField = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'state') {
        next.district = '' // Reset district when state changes to prevent cross-state selection
        next.rainfall = ''
        next.population = ''
        next.growth = ''
        next.literacy = ''
        fetchDistricts(val)
        setAutofillNote('')
      }
      return next
    })
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // Strict Form Validation
  const validateForm = () => {
    const requiredFields = ['state', 'district', 'crop', 'season', 'area', 'production', 'population', 'rainfall']
    const newErrors = {}
    
    requiredFields.forEach(field => {
      if (!String(form[field]).trim()) {
        newErrors[field] = 'This field is required'
      }
    })

    // Strict Validation: District MUST belong to the selected State
    if (form.state && form.district && districts.length > 0) {
      const isValidDistrict = districts.some(d => d.toLowerCase().trim() === form.district.toLowerCase().trim())
      if (!isValidDistrict) {
        newErrors.district = `'${form.district}' is not a valid district in ${form.state}`
      }
    }

    // Validate numbers are non-negative
    const checkNegative = ['area', 'production', 'population', 'rainfall', 'growth', 'literacy']
    checkNegative.forEach(field => {
      if (form[field] !== '' && Number(form[field]) < 0) {
        newErrors[field] = 'Value cannot be negative'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit Handler
  const handlePredict = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      addToast('Please fix validation errors before submitting', 'warning')
      return
    }

    setPredicting(true)
    setResults(null)

    const payload = {
      state: form.state,
      district: form.district,
      crop: form.crop,
      season: form.season,
      crop_year: 2026,
      area: parseFloat(form.area),
      production: parseFloat(form.production),
      population: parseInt(form.population) || 1800000,
      growth: parseFloat(form.growth) || 15.0,
      literacy: parseFloat(form.literacy) || 70.0,
      monthly_rainfall: parseFloat(form.rainfall) || 100.0,
    }

    try {
      const res = await axios.post(`${API_BASE}/predict`, payload)
      setResults({
        ...res.data,
        payload
      })
      addToast('AI Prediction generated successfully!', 'success')
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.error || 'Failed to generate prediction. Check backend status.'
      addToast(errorMsg, 'error')
    } finally {
      setPredicting(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto px-4 py-8">
      
      {/* Form Card (Glassmorphism + Dark Mode High Contrast) */}
      <div className="glass p-6 md:p-10 rounded-[32px] border border-white/20 dark:border-dark-border shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-olive-green/10 dark:bg-olive-green/5 blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-xl">
            🌾
          </div>
          <div>
            <h2 className="text-2xl font-bold font-poppins text-text-primary dark:text-white">
              Cultivation Inputs
            </h2>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Provide farming statistics to forecast agricultural demand and evaluate risk level.
            </p>
          </div>
        </div>

        {loadingLists ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 font-poppins">Loading dataset parameters...</p>
          </div>
        ) : (
          <form onSubmit={handlePredict} className="flex flex-col gap-6">
            
            {/* Core Autocomplete Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Autocomplete
                id="state"
                label="State *"
                value={form.state}
                onChange={(val) => updateField('state', val)}
                suggestions={states}
                placeholder="Select State"
                error={errors.state}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />

              <Autocomplete
                id="district"
                label="District *"
                value={form.district}
                onChange={handleDistrictChange}
                suggestions={districts}
                placeholder={form.state ? `Districts of ${form.state}` : "Select State First"}
                disabled={!form.state}
                error={errors.district}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />

              <Autocomplete
                id="crop"
                label="Crop *"
                value={form.crop}
                onChange={(val) => updateField('crop', val)}
                suggestions={crops}
                placeholder="Select Crop Type"
                error={errors.crop}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
              />

              <Autocomplete
                id="season"
                label="Season *"
                value={form.season}
                onChange={(val) => updateField('season', val)}
                suggestions={seasons}
                placeholder="Select Season"
                error={errors.season}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Numeric Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-2">
              
              {/* Area */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="area" className="text-xs font-semibold text-text-primary dark:text-gray-300 font-poppins">
                  Area (Hectares) *
                </label>
                <input
                  id="area"
                  type="number"
                  step="any"
                  value={form.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  placeholder="e.g. 1500"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white/70 dark:bg-dark-card/60 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/80 text-text-primary dark:text-white ${
                    errors.area ? 'border-red-500' : 'border-gray-200 dark:border-dark-border'
                  }`}
                />
                {errors.area && <span className="text-[10px] text-red-500">{errors.area}</span>}
              </div>

              {/* Production */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="production" className="text-xs font-semibold text-text-primary dark:text-gray-300 font-poppins">
                  Production (Tons) *
                </label>
                <input
                  id="production"
                  type="number"
                  step="any"
                  value={form.production}
                  onChange={(e) => updateField('production', e.target.value)}
                  placeholder="e.g. 2400"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white/70 dark:bg-dark-card/60 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/80 text-text-primary dark:text-white ${
                    errors.production ? 'border-red-500' : 'border-gray-200 dark:border-dark-border'
                  }`}
                />
                {errors.production && <span className="text-[10px] text-red-500">{errors.production}</span>}
              </div>

              {/* Population (Autofilled / Editable) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="population" className="text-xs font-semibold text-text-primary dark:text-gray-300 font-poppins">
                  District Population *
                </label>
                <input
                  id="population"
                  type="number"
                  value={form.population}
                  onChange={(e) => updateField('population', e.target.value)}
                  placeholder="Autofilled"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white/70 dark:bg-dark-card/60 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/80 text-text-primary dark:text-white ${
                    errors.population ? 'border-red-500' : 'border-gray-200 dark:border-dark-border'
                  }`}
                />
                {errors.population && <span className="text-[10px] text-red-500">{errors.population}</span>}
              </div>

              {/* Rainfall (Autofilled / Editable) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rainfall" className="text-xs font-semibold text-text-primary dark:text-gray-300 font-poppins">
                  Monthly Rainfall (mm) *
                </label>
                <input
                  id="rainfall"
                  type="number"
                  step="any"
                  value={form.rainfall}
                  onChange={(e) => updateField('rainfall', e.target.value)}
                  placeholder="Autofilled"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white/70 dark:bg-dark-card/60 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/80 text-text-primary dark:text-white ${
                    errors.rainfall ? 'border-red-500' : 'border-gray-200 dark:border-dark-border'
                  }`}
                />
                {errors.rainfall && <span className="text-[10px] text-red-500">{errors.rainfall}</span>}
              </div>
            </div>

            {/* Autofill Notification Log */}
            {autofillNote && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs font-semibold font-poppins ${
                  autofillNote.startsWith('✓') 
                    ? 'text-olive-green dark:text-green-400' 
                    : 'text-primary animate-pulse'
                }`}
              >
                {autofillNote}
              </motion.p>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-gray-100 dark:border-dark-border pt-6">
              <button
                type="submit"
                disabled={predicting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white dark:text-dark-bg font-bold font-poppins text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:ring-4 focus:ring-primary/25"
              >
                {predicting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white dark:border-dark-bg border-t-transparent rounded-full animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                    Predict Now
                  </>
                )}
              </button>
              
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-poppins">
                {predicting ? 'AI models computing predictions...' : 'Strict dataset validation active.'}
              </span>
            </div>

          </form>
        )}
      </div>

      {/* Prediction Results Block */}
      <AnimatePresence>
        {results && (
          <div id="results-section" className="scroll-mt-24">
            <ResultCard results={results} />
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
