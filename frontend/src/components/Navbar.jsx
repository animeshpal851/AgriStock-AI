import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Shrink navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Sync theme with local storage & HTML document class list
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/prediction', label: 'Prediction' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-3.5 bg-white/85 dark:bg-[#0F1117]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#3B4454] shadow-md' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
            🌾
          </span>
          <span className="text-lg font-black font-poppins text-text-primary dark:text-white tracking-tight flex items-center gap-1">
            AgriStock <span className="text-primary font-black uppercase text-xs px-1.5 py-0.5 rounded-md bg-primary/10 dark:bg-primary/20">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Link items */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold font-poppins tracking-wide transition-colors duration-200 ${
                  isActive(link.to) 
                    ? 'text-primary dark:text-[#D9903D]' 
                    : 'text-text-primary/80 dark:text-[#E5E7EB] hover:text-primary dark:hover:text-[#D9903D]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a 
              href="https://github.com/animeshpal851/AgriStock-AI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-bold font-poppins tracking-wide text-text-primary/80 dark:text-[#E5E7EB] hover:text-primary dark:hover:text-[#D9903D] transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-[#3B4454]">
            {/* Dark Mode Switch Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] text-gray-700 dark:text-[#FFFFFF] hover:text-primary dark:hover:text-[#D9903D] transition-all duration-300 cursor-pointer shadow-sm"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <Link 
              to="/prediction" 
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-poppins text-xs tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            >
              Get Prediction
            </Link>
          </div>
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#1E2430] border border-gray-200 dark:border-[#3B4454] text-gray-700 dark:text-white cursor-pointer"
          >
            {theme === 'light' ? (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu layout"
            className="p-2 text-text-primary dark:text-white cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white dark:bg-[#1E2430] border-b border-gray-200 dark:border-[#3B4454] px-6 py-4 flex flex-col gap-4 animate-fade-in shadow-xl">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-bold font-poppins py-1 transition-colors ${
                isActive(link.to) 
                  ? 'text-primary dark:text-[#D9903D]' 
                  : 'text-text-primary/80 dark:text-[#E5E7EB]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a 
            href="https://github.com/animeshpal851/AgriStock-AI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold font-poppins py-1 text-text-primary/80 dark:text-[#E5E7EB]"
          >
            GitHub
          </a>
          <Link 
            to="/prediction" 
            className="w-full text-center py-2.5 rounded-xl bg-primary text-white font-bold font-poppins text-xs tracking-wider"
          >
            Get Prediction
          </Link>
        </div>
      )}
    </nav>
  )
}
