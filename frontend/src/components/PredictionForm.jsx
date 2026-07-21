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

  // Track if user manually edited population or rainfall
  const [isCustomEdit, setIsCustomEdit] = useState(false)

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

  // Validate if district matches one of the filtered suggestions for the selected state
  const checkDistrictValidity = useCallback((districtName) => {
    if (!districtName || !districtName.trim()) {
      return { isValid: false, message: 'This field is required' }
    }
    if (districts.length === 0) {
      return { isValid: false, message: 'Please select a valid state first.' }
    }
    const matched = districts.find(d => d.toLowerCase().trim() === districtName.toLowerCase().trim())
    if (!matched) {
      return { isValid: false, message: 'Please select a valid district from the list.' }
    }
    return { isValid: true, matchedDistrict: matched }
  }, [districts])

  // Handle district selection & auto-populate population & rainfall parameters from dataset
  const handleDistrictChange = useCallback(async (districtName) => {
    setForm(prev => ({ ...prev, district: districtName }))
    setIsCustomEdit(false) // reset custom edit flag on new district selection

    if (!districtName || !districtName.trim()) {
      setErrors(prev => ({ ...prev, district: 'This field is required' }))
      setAutofillNote('')
      return
    }

    const { isValid, matchedDistrict, message } = checkDistrictValidity(districtName)

    if (!isValid) {
      setErrors(prev => ({ ...prev, district: message }))
      setForm(prev => ({
        ...prev,
        rainfall: '',
        population: '',
        growth: '',
        literacy: ''
      }))
      setAutofillNote('')
      return
    }

    // District is valid and belongs to the state
    setErrors(prev => ({ ...prev, district: '' }))
    setAutofillNote('Loading dataset parameters...')

    try {
      const url = form.state 
        ? `${API_BASE}/rainfall/${encodeURIComponent(form.state)}/${encodeURIComponent(matchedDistrict)}`
        : `${API_BASE}/rainfall/${encodeURIComponent(matchedDistrict)}`
        
      const res = await axios.get(url)
      const data = res.data

      const fetchedRainfall = data.monthly_rainfall ? String(Math.round(data.monthly_rainfall * 10) / 10) : ''
      const fetchedPopulation = data.population ? String(data.population) : ''
      const fetchedGrowth = data.growth ? String(data.growth) : ''
      const fetchedLiteracy = data.literacy ? String(data.literacy) : ''

      setForm(prev => ({
        ...prev,
        district: matchedDistrict, // normalize capitalization
        rainfall: fetchedRainfall,
        population: fetchedPopulation,
        growth: fetchedGrowth,
        literacy: fetchedLiteracy
      }))

      setAutofillNote(`✓ Auto-filled from dataset: Population (${parseInt(fetchedPopulation).toLocaleString()}) & Rainfall (${fetchedRainfall} mm)`)
    } catch (err) {
      console.error('Failed to fetch metadata for district:', err)
      setAutofillNote('')
    }
  }, [form.state, checkDistrictValidity])

  // Blur handler for District field to force valid list selection
  const handleDistrictBlur = (value) => {
    const { isValid, message } = checkDistrictValidity(value)
    if (!isValid) {
      setErrors(prev => ({ ...prev, district: message }))
    } else {
      setErrors(prev => ({ ...prev, district: '' }))
    }
  }

  // Set field value with strict cascading resets
  const updateField = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val }
      
      // Dynamic Reset when State changes: Clear District, Population, and Rainfall
      if (field === 'state') {
        next.district = ''
        next.rainfall = ''
        next.population = ''
        next.growth = ''
        next.literacy = ''
        fetchDistricts(val)
        setAutofillNote('')
        setIsCustomEdit(false)
      }
      return next
    })

    // Track manual edits to population or rainfall
    if (field === 'population' || field === 'rainfall') {
      setIsCustomEdit(true)
      setAutofillNote(`✎ Custom values entered for ${field === 'population' ? 'Population' : 'Rainfall'} (will be used for prediction)`)
    }

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
    const districtCheck = checkDistrictValidity(form.district)
    if (!districtCheck.isValid) {
      newErrors.district = districtCheck.message
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

  const isFormValid = () => {
    const required = ['state', 'district', 'crop', 'season', 'area', 'production', 'population', 'rainfall']
    const hasValues = required.every(f => !!String(form[f]).trim())
    const districtValid = checkDistrictValidity(form.district).isValid
    const noErrors = Object.keys(errors).every(key => !errors[key])
    return hasValues && districtValid && noErrors
  }

  // Submit Handler - Sends CURRENT form input values (auto-filled or user-edited) to backend ML model
  const handlePredict = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      addToast('Please fill all required fields with valid inputs.', 'warning')
      return
    }

    setPredicting(true)
    setResults(null)

    // Current values displayed in the input fields are sent directly
    const payload = {
      state: form.state,
      district: form.district,
      crop: form.crop,
      season: form.season,
      crop_year: 2026,
      area: parseFloat(form.area),
      production: parseFloat(form.production),
      population: parseInt(form.population),
      growth: parseFloat(form.growth) || 15.0,
      literacy: parseFloat(form.literacy) || 70.0,
      monthly_rainfall: parseFloat(form.rainfall),
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
      <div className="p-6 md:p-10 rounded-[32px] bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-2xl relative overflow-hidden transition-all duration-300">
        
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
            <p className="text-xs font-semibold text-gray-500 dark:text-[#D1D5DB]">
              Provide farming statistics to forecast agricultural demand and evaluate risk level.
            </p>
          </div>
        </div>

        {loadingLists ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500 dark:text-[#D1D5DB] font-poppins">Loading dataset parameters...</p>
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
                onBlur={handleDistrictBlur}
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
                <label htmlFor="area" className="text-xs font-bold text-text-primary dark:text-white font-poppins">
                  Area (Hectares) *
                </label>
                <input
                  id="area"
                  type="number"
                  step="any"
                  value={form.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  placeholder="e.g. 1500"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] ${
                    errors.area ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.area && <span className="text-[10px] text-red-500">{errors.area}</span>}
              </div>

              {/* Production */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="production" className="text-xs font-bold text-text-primary dark:text-white font-poppins">
                  Production (Tons) *
                </label>
                <input
                  id="production"
                  type="number"
                  step="any"
                  value={form.production}
                  onChange={(e) => updateField('production', e.target.value)}
                  placeholder="e.g. 2400"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] ${
                    errors.production ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.production && <span className="text-[10px] text-red-500">{errors.production}</span>}
              </div>

              {/* Population (Auto-filled / Editable) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="population" className="text-xs font-bold text-text-primary dark:text-white font-poppins flex items-center justify-between">
                  <span>District Population *</span>
                  <span className="text-[10px] font-semibold text-primary dark:text-[#D9903D] uppercase">Editable</span>
                </label>
                <input
                  id="population"
                  type="number"
                  value={form.population}
                  onChange={(e) => updateField('population', e.target.value)}
                  placeholder="Auto-filled from dataset"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] ${
                    errors.population ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.population && <span className="text-[10px] text-red-500">{errors.population}</span>}
              </div>

              {/* Monthly Rainfall (Auto-filled / Editable) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rainfall" className="text-xs font-bold text-text-primary dark:text-white font-poppins flex items-center justify-between">
                  <span>Monthly Rainfall (mm) *</span>
                  <span className="text-[10px] font-semibold text-primary dark:text-[#D9903D] uppercase">Editable</span>
                </label>
                <input
                  id="rainfall"
                  type="number"
                  step="any"
                  value={form.rainfall}
                  onChange={(e) => updateField('rainfall', e.target.value)}
                  placeholder="Auto-filled from dataset"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] ${
                    errors.rainfall ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.rainfall && <span className="text-[10px] text-red-500">{errors.rainfall}</span>}
              </div>
            </div>

            {/* Auto-fill Status Notification Log */}
            {autofillNote && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs font-bold font-poppins ${
                  isCustomEdit 
                    ? 'text-amber-600 dark:text-[#FACC15]' 
                    : autofillNote.startsWith('✓')
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-primary dark:text-[#D9903D] animate-pulse'
                }`}
              >
                {autofillNote}
              </motion.p>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-gray-100 dark:border-[#3B4454] pt-6">
              <button
                type="submit"
                disabled={!isFormValid() || predicting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold font-poppins text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:ring-4 focus:ring-primary/25"
              >
                {predicting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              
              <span className="text-xs font-semibold text-gray-500 dark:text-[#D1D5DB] font-poppins">
                {!isFormValid() ? 'Please select a valid district from the list.' : 'Ready — ML model will evaluate exact displayed inputs.'}
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
