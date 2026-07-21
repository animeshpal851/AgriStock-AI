import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    org: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const tempErrors = {}
    if (!form.name.trim()) tempErrors.name = 'Name is required'
    if (!form.email.trim()) {
      tempErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = 'Email address is invalid'
    }
    if (!form.message.trim()) tempErrors.message = 'Message is required'
    
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setSubmitted(true)
    }
  }

  const updateField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 max-w-xl mx-auto flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="contact-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 md:p-10 rounded-[32px] bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-2xl flex flex-col gap-6 relative"
          >
            <div className="flex flex-col gap-1">
              <span className="text-primary dark:text-[#D9903D] text-xs font-bold uppercase tracking-wider font-poppins">
                GET IN TOUCH
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-poppins text-text-primary dark:text-white">
                Contact AgriStock AI
              </h1>
              <p className="text-xs font-semibold text-gray-500 dark:text-[#D1D5DB]">
                Have questions about our predictive algorithms or custom dataset integrations?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-bold text-text-primary dark:text-white font-poppins">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] ${
                    errors.name ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-red-500">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-bold text-text-primary dark:text-white font-poppins">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="e.g. amit@farmautomation.com"
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] ${
                    errors.email ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
              </div>

              {/* Organization */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="org" className="text-xs font-bold text-text-primary dark:text-white font-poppins">
                  Organization / Farm Name
                </label>
                <input
                  id="org"
                  type="text"
                  value={form.org}
                  onChange={(e) => updateField('org', e.target.value)}
                  placeholder="e.g. Green Valley Farm Cooperative"
                  className="w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border border-gray-200 dark:border-[#3B4454] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF]"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-text-primary dark:text-white font-poppins">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="Enter your message details..."
                  className={`w-full py-3 px-4 text-sm font-medium rounded-2xl bg-white dark:bg-[#252C34] border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-[#9CA3AF] resize-none ${
                    errors.message ? 'border-red-500' : 'border-gray-200 dark:border-[#3B4454]'
                  }`}
                />
                {errors.message && <span className="text-[10px] text-red-500">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold font-poppins text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-[32px] bg-white dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] shadow-2xl text-center flex flex-col items-center gap-5"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-2xl font-bold font-poppins text-text-primary dark:text-white">
              Message Sent!
            </h2>
            <p className="text-xs font-semibold text-gray-500 dark:text-[#D1D5DB] max-w-sm leading-relaxed">
              Thank you, {form.name}. We have received your inquiry and our team will get back to you within 24 hours at <b>{form.email}</b>.
            </p>
            <button
              onClick={() => {
                setForm({ name: '', email: '', org: '', message: '' })
                setSubmitted(false)
              }}
              className="px-6 py-2.5 mt-4 rounded-xl border border-gray-200 dark:border-[#3B4454] hover:bg-gray-100 dark:hover:bg-[#252C3A] text-xs font-bold font-poppins text-text-primary dark:text-white transition-all cursor-pointer"
            >
              Send Another Message
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
