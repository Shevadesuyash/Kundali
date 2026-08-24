import './GenderToggle.css';

/**
 * GenderToggle — segmented radio button for Male / Female selection.
 * Props:
 *   value: 'male' | 'female' | ''
 *   onChange: (value: 'male' | 'female') => void
 *   required?: boolean
 *   idPrefix?: string   — for aria linkage
 */
export default function GenderToggle({ value, onChange, required = false, idPrefix = 'g' }) {
  return (
    <div className="gender-toggle" role="group" aria-label="Gender">
      <button
        type="button"
        id={`${idPrefix}-male`}
        className={`gender-toggle__btn${value === 'male' ? ' is-active' : ''}`}
        onClick={() => onChange('male')}
        aria-pressed={value === 'male'}
      >
        <span className="gender-toggle__icon">♂</span>
        <span>Male</span>
      </button>
      <button
        type="button"
        id={`${idPrefix}-female`}
        className={`gender-toggle__btn${value === 'female' ? ' is-active' : ''}`}
        onClick={() => onChange('female')}
        aria-pressed={value === 'female'}
      >
        <span className="gender-toggle__icon">♀</span>
        <span>Female</span>
      </button>
      {required && !value && (
        <span className="gender-toggle__required" aria-live="polite">
          Please select a gender
        </span>
      )}
    </div>
  );
}
