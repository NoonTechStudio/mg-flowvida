'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

// ── Contexts ─────────────────────────────────────────────────────────────────

interface SelectContextValue {
  value: string
  onChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  registerLabel: (value: string, label: string) => void
  labels: Record<string, string>
}

const SelectContext = React.createContext<SelectContextValue>({
  value: '',
  onChange: () => {},
  open: false,
  setOpen: () => {},
  registerLabel: () => {},
  labels: {},
})

// ── Select (root) ─────────────────────────────────────────────────────────────

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

function Select({ value, defaultValue, onValueChange, children, disabled }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const [open, setOpen] = React.useState(false)
  const [labels, setLabels] = React.useState<Record<string, string>>({})
  const ref = React.useRef<HTMLDivElement>(null)

  const controlled = value !== undefined
  const currentValue = controlled ? value! : internalValue

  const handleChange = (newValue: string) => {
    if (!controlled) setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  const registerLabel = React.useCallback((v: string, label: string) => {
    setLabels(prev => (prev[v] === label ? prev : { ...prev, [v]: label }))
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onChange: handleChange,
        open,
        setOpen: disabled ? () => {} : setOpen,
        registerLabel,
        labels,
      }}
    >
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// ── SelectTrigger ─────────────────────────────────────────────────────────────

function SelectTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
    </button>
  )
}

// ── SelectValue ───────────────────────────────────────────────────────────────

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, labels } = React.useContext(SelectContext)
  const display = value ? (labels[value] ?? value) : null
  return (
    <span className="flex-1 text-left truncate">
      {display ?? <span className="text-gray-400">{placeholder}</span>}
    </span>
  )
}

// ── SelectContent ─────────────────────────────────────────────────────────────

function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = React.useContext(SelectContext)

  // Always render items (hidden) so they can register their labels,
  // but only show the dropdown visually when open.
  return (
    <>
      {/* Hidden render to register labels even when closed */}
      <div className="hidden">{children}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg',
            className
          )}
        >
          {children}
        </div>
      )}
    </>
  )
}

// ── SelectItem ────────────────────────────────────────────────────────────────

function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selectedValue, onChange, registerLabel } = React.useContext(SelectContext)

  React.useEffect(() => {
    let label: string | undefined
    if (typeof children === 'string') {
      label = children
    } else if (React.isValidElement(children)) {
      const props = children.props as Record<string, unknown>
      if (typeof props.children === 'string') label = props.children
    }
    if (label) registerLabel(value, label)
  }, [value, children, registerLabel])

  return (
    <div
      onClick={() => onChange(value)}
      className={cn(
        'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-violet-50',
        selectedValue === value && 'bg-violet-50 text-violet-700 font-medium',
        className
      )}
    >
      {children}
    </div>
  )
}

// ── SelectGroup / SelectLabel ─────────────────────────────────────────────────

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider', className)}>
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel }
