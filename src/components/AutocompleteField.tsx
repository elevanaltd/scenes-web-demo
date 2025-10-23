import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useDropdown } from '../contexts/DropdownContext'
import './AutocompleteField.css'

interface AutocompleteFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  onOtherChange?: (otherValue: string | null) => void
  options: string[]
  allowOther: boolean
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
  showOtherText?: boolean // Whether to show the "Other" text input field
  otherValue?: string | null // Value of the "Other" text field
}

/**
 * AutocompleteField Component
 *
 * Smart autocomplete with fuzzy matching, blur validation, and "Other" handling.
 *
 * Behavior:
 * 1. User types → filter options in real-time
 * 2. User selects option or types exact match → saves value
 * 3. User types non-matching value and blurs → shows confirmation dialog
 * 4. If allowOther=true → can save as "Other" with custom text
 * 5. If allowOther=false → must select from predefined list
 *
 * Auto-saves on blur (with optional confirmation for custom values)
 */
export function AutocompleteField({
  value,
  onChange,
  onOtherChange,
  options,
  allowOther,
  isLoading = false,
  placeholder = 'Type to search...',
  disabled = false,
  showOtherText = false,
  otherValue = null,
}: AutocompleteFieldProps) {
  const { activeDropdownId, setActiveDropdownId } = useDropdown()

  // Generate unique ID for this instance (stable across re-renders)
  const dropdownId = useMemo(() => Math.random().toString(36).substr(2, 9), [])
  const isActive = activeDropdownId === dropdownId

  const [inputValue, setInputValue] = useState(value || '')
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [pendingValue, setPendingValue] = useState<string | null>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync parent value changes to local state
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Calculate dropdown position when this dropdown becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
        right: 'auto',
        width: `${rect.width}px`,
      })
    }
  }, [isActive])

  // Filter options based on input (case-insensitive, substring matching)
  const fuzzyFilter = (input: string, opts: string[]) => {
    if (!input.trim()) return opts
    const lower = input.toLowerCase()
    return opts.filter((opt) => opt.toLowerCase().includes(lower)).sort((a, b) => {
      const aLower = a.toLowerCase()
      const bLower = b.toLowerCase()
      // Prioritize exact matches and prefix matches
      if (aLower === lower) return -1
      if (bLower === lower) return 1
      if (aLower.startsWith(lower)) return -1
      if (bLower.startsWith(lower)) return 1
      return 0
    })
  }

  // Update filtered options when input changes
  useEffect(() => {
    if (isLoading) {
      setFilteredOptions([])
      return
    }
    const filtered = fuzzyFilter(inputValue, options)
    setFilteredOptions(filtered)
    setSelectedIndex(-1)

    // Open this dropdown if there are options to show
    if (filtered.length > 0 || inputValue.length > 0) {
      setActiveDropdownId(dropdownId)
    } else {
      // Close if no options and no input
      setActiveDropdownId(null)
    }
  }, [inputValue, options, isLoading, dropdownId, setActiveDropdownId])

  // Close this dropdown when clicking outside
  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, setActiveDropdownId])

  // Handle blur → validation for non-matching values
  const handleBlur = () => {
    const trimmedInput = inputValue.trim()

    // Case 1: Value is empty → clear
    if (!trimmedInput) {
      onChange(null)
      setInputValue('')
      setActiveDropdownId(null)
      return
    }

    // Case 2: Exact match in options → auto-save
    const exactMatch = options.find((opt) => opt.toLowerCase() === trimmedInput.toLowerCase())
    if (exactMatch) {
      onChange(exactMatch)
      setInputValue(exactMatch)
      setActiveDropdownId(null)
      return
    }

    // Case 3: No match
    if (!exactMatch) {
      if (allowOther) {
        // Show confirmation dialog for flexible fields
        setPendingValue(trimmedInput)
        setShowValidationDialog(true)
        // Keep dropdown open to show options
      } else {
        // For fixed lists, show "not found" message and reset
        // Reset to previous value
        setInputValue(value || '')
        setActiveDropdownId(null)
        // Could show toast here: "Value not found in options"
      }
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isActive && e.key !== 'Enter') return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev + 1
          return next >= filteredOptions.length ? 0 : next
        })
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev - 1
          return next < 0 ? filteredOptions.length - 1 : next
        })
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          // Select highlighted option
          const selected = filteredOptions[selectedIndex]
          onChange(selected)
          setInputValue(selected)
          setActiveDropdownId(null)
        } else {
          // No selection, trigger blur logic
          handleBlur()
        }
        break

      case 'Escape':
        e.preventDefault()
        setActiveDropdownId(null)
        setInputValue(value || '')
        setSelectedIndex(-1)
        break

      default:
        break
    }
  }

  // Handle option selection from dropdown
  const handleSelectOption = (option: string) => {
    onChange(option)
    setInputValue(option)
    setActiveDropdownId(null)
    setShowValidationDialog(false)
  }

  // Handle "Keep as Other" confirmation
  const handleConfirmOther = () => {
    if (pendingValue) {
      onChange('Other')
      if (onOtherChange) {
        onOtherChange(pendingValue)
      }
      setInputValue('Other')
      setShowValidationDialog(false)
      setPendingValue(null)
      setActiveDropdownId(null)
    }
  }

  // Handle "Cancel" on validation dialog
  const handleCancelValidation = () => {
    setShowValidationDialog(false)
    setPendingValue(null)
    setInputValue(value || '')
    setActiveDropdownId(null)
  }

  // Handle "Use selected" from suggestions (clicking a suggestion in validation dialog)
  const handleUseFromSuggestions = (option: string) => {
    handleSelectOption(option)
    setShowValidationDialog(false)
  }

  return (
    <div className="autocomplete-field" ref={containerRef}>
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => {
            if (filteredOptions.length > 0 || inputValue.length > 0) {
              setActiveDropdownId(dropdownId)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`autocomplete-input ${isLoading ? 'loading' : ''}`}
          autoComplete="off"
        />
        {isLoading && <span className="autocomplete-spinner">⟳</span>}
      </div>

      {/* Dropdown suggestions */}
      {isActive && !isLoading && filteredOptions.length > 0 && (
        <div className="autocomplete-dropdown" style={dropdownStyle}>
          {filteredOptions.map((option, idx) => (
            <div
              key={option}
              className={`autocomplete-option ${idx === selectedIndex ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault() // Prevent blur from firing
                handleSelectOption(option)
              }}
              role="option"
              aria-selected={idx === selectedIndex}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {/* "Add as Other" suggestion (when typing non-matching value) */}
      {isActive && !isLoading && inputValue.trim() && filteredOptions.length === 0 && allowOther && (
        <div className="autocomplete-dropdown" style={dropdownStyle}>
          <div
            className="autocomplete-option add-as-other"
            onMouseDown={(e) => {
              e.preventDefault() // Prevent blur from firing
              setPendingValue(inputValue.trim())
              setShowValidationDialog(true)
            }}
            role="option"
          >
            💡 Add "{inputValue.trim()}" as Other
          </div>
        </div>
      )}

      {/* Validation dialog for custom values */}
      {showValidationDialog && pendingValue && allowOther && (
        <div className="validation-dialog-overlay" onClick={handleCancelValidation}>
          <div className="validation-dialog" onClick={(e) => e.stopPropagation()}>
            <h4 className="validation-title">Confirm Custom Value</h4>

            <p className="validation-message">
              "{pendingValue}" is not in the predefined options.
            </p>

            {filteredOptions.length > 0 && (
              <div className="validation-suggestions">
                <p className="suggestions-label">Did you mean one of these?</p>
                <div className="suggestions-list">
                  {filteredOptions.slice(0, 3).map((option) => (
                    <button
                      key={option}
                      className="suggestion-button"
                      onClick={() => handleUseFromSuggestions(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="validation-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancelValidation}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmOther}
              >
                Use "{pendingValue}" as Other
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional "Other" text input (shown when value is "Other") */}
      {showOtherText && value === 'Other' && (
        <div className="other-text-input-wrapper">
          <input
            type="text"
            value={otherValue || ''}
            onChange={(e) => {
              if (onOtherChange) {
                onOtherChange(e.target.value || null)
              }
            }}
            onBlur={(e) => {
              // Auto-save on blur
              if (onOtherChange) {
                const finalValue = e.target.value || null
                onOtherChange(finalValue)
              }
            }}
            placeholder="Enter custom value..."
            disabled={disabled}
            className="other-text-input"
          />
        </div>
      )}
    </div>
  )
}
