import type { ReactNode } from 'react'

interface SchematicPanelProps {
  label: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

const CORNER_BASE = 'absolute w-3 h-3 border-[var(--color-ink-faint)] pointer-events-none'

/**
 * Shared frame for the app's panels: corner registration marks and a small
 * caption tab, like a callout on a technical drawing, instead of a plain
 * rounded card.
 */
export function SchematicPanel({ label, children, className = '', action }: SchematicPanelProps) {
  return (
    <section className={`relative border border-[var(--color-line)] bg-[var(--color-surface)] ${className}`}>
      <span className={`${CORNER_BASE} -top-px -left-px border-t-2 border-l-2`} aria-hidden="true" />
      <span className={`${CORNER_BASE} -top-px -right-px border-t-2 border-r-2`} aria-hidden="true" />
      <span className={`${CORNER_BASE} -bottom-px -left-px border-b-2 border-l-2`} aria-hidden="true" />
      <span className={`${CORNER_BASE} -bottom-px -right-px border-b-2 border-r-2`} aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">
          {label}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
