const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  help,
  size = 'md',
  className = '',
  ...props
}) => {
  const selectClasses = [
    'form-select',
    size !== 'md' ? `form-select-${size}` : '',
    error ? 'error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label 
          htmlFor={name} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
      {help && !error && <span className="form-help">{help}</span>}
    </div>
  );
};

export default Select;