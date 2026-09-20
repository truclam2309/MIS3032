import React from 'react';

const baseControl =
'w-full rounded border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle transition-colors duration-150 ease-exp focus:border-brand-500 disabled:bg-canvas disabled:text-ink-subtle';

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FieldShell({ id, label, required, hint, error, children }: FieldShellProps) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-ink">
          {label}
          {required ? <span className="ml-1 text-danger-600">*</span> : null}
        </label>
        {hint ? <span className="text-2xs text-ink-subtle">{hint}</span> : null}
      </div>
      {children}
      {error ?
      <p id={`${id}-error`} className="mt-1 text-xs text-danger-600">
          {error}
        </p> :
      null}
    </div>);

}

export function TextField({
  id,
  label,
  value,
  onChange,
  required,
  hint,
  error,
  placeholder,
  type = 'text'










}: {id: string;label: string;value: string;onChange: (value: string) => void;required?: boolean;hint?: string;error?: string;placeholder?: string;type?: 'text' | 'date' | 'number';}) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseControl} ${error ? 'border-danger-200' : ''}`} />
      
    </FieldShell>);

}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  hint,
  error,
  placeholder = 'Select…'










}: {id: string;label: string;value: string;onChange: (value: string) => void;options: readonly string[];required?: boolean;hint?: string;error?: string;placeholder?: string;}) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <select
        id={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseControl} ${error ? 'border-danger-200' : ''}`}>
        
        <option value="">{placeholder}</option>
        {options.map((o) =>
        <option key={o} value={o}>
            {o}
          </option>
        )}
      </select>
    </FieldShell>);

}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  required,
  hint,
  error,
  placeholder,
  rows = 3










}: {id: string;label: string;value: string;onChange: (value: string) => void;required?: boolean;hint?: string;error?: string;placeholder?: string;rows?: number;}) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseControl} resize-y leading-relaxed ${error ? 'border-danger-200' : ''}`} />
      
    </FieldShell>);

}