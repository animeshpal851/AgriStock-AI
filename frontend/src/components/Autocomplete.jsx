import { useState, useEffect, useRef } from 'react'

export default function Autocomplete({
  label,
  id,
  value,
  onChange,
  onBlur,
  suggestions = [],
  placeholder = '',
  disabled = false,
  error = '',
  icon
}) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Filtering: Prefix match first, then contains match, sorted alphabetically
  const getFilteredSuggestions = () => {
    if (!value) return [...suggestions].sort()
    
    const query = value.toLowerCase().trim()
    const prefixMatches = []
    const containsMatches = []

    suggestions.forEach(item => {
      const itemStr = String(item)
      const itemLower = itemStr.toLowerCase()
      if (itemLower.startsWith(query)) {
        prefixMatches.push(itemStr)
      } else if (itemLower.includes(query)) {
        containsMatches.push(itemStr)
      }
    })

    return [...prefixMatches.sort(), ...containsMatches.sort()]
  }

  const filtered = getFilteredSuggestions()

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [value])

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex]
      if (highlightedEl) {
        highlightedEl.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [highlightedIndex])

  const selectItem = (item) => {
    onChange(item)
    setOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prev => (prev + 1) % filtered.length)
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlightedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
        e.preventDefault()
        break
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          selectItem(filtered[highlightedIndex])
          e.preventDefault()
        } else if (filtered.length > 0) {
          // If none highlighted but items exist, select first item
          selectItem(filtered[0])
          e.preventDefault()
        }
        break
      case 'Escape':
        setOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        e.preventDefault()
        break
      case 'Tab':
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          selectItem(filtered[highlightedIndex])
        } else {
          setOpen(false)
        }
        break
      default:
        break
    }
  }

  return (
    <div className="relative w-full flex flex-col gap-1.5" ref={containerRef}>
      <label 
        htmlFor={id} 
        className="text-xs font-semibold text-text-primary dark:text-gray-300 font-poppins tracking-wide transition-colors"
      >
        {label}
      </label>
      
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            setOpen(true)
          }}
          onBlur={(e) => {
            onBlur && onBlur(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined}
          className={`w-full py-3 ${icon ? 'pl-11' : 'pl-4'} pr-10 text-sm font-medium rounded-2xl bg-white/70 dark:bg-dark-card/50 border transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-text-primary dark:text-white ${
            error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-200 dark:border-dark-border hover:border-primary/40 dark:hover:border-primary/40'
          }`}
        />

        {/* Dropdown toggle button */}
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Toggle suggestion list"
          className="absolute right-3.5 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className={`w-5 h-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400 mt-0.5 ml-1 animate-fade-in">
          {error}
        </span>
      )}

      {/* Suggestions Dropdown */}
      {open && filtered.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          ref={listRef}
          className="absolute z-50 w-full mt-22 max-h-60 overflow-y-auto rounded-2xl border border-gray-100 dark:border-dark-border bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl shadow-xl dark:shadow-black/50 py-1.5 custom-scrollbar animate-fade-in"
        >
          {filtered.map((item, index) => {
            const isHighlighted = index === highlightedIndex
            const isSelected = value.toLowerCase() === String(item).toLowerCase()

            return (
              <li
                key={item}
                id={`${id}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 ${
                  isHighlighted 
                    ? 'suggestion-highlight' 
                    : isSelected
                      ? 'bg-primary/5 text-primary dark:bg-primary/10'
                      : 'text-text-primary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg/40'
                }`}
              >
                {item}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
