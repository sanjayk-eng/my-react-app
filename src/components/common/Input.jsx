const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  help,
  size = 'md',
  className = '',
  ...props
}) => {
  const inputClasses = [
    'form-input',
    size !== 'md' ? `form-input-${size}` : '',
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
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
      {help && !error && <span className="form-help">{help}</span>}
    </div>
  );
};

export default Input;