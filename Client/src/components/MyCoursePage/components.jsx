export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };
  
  export const Button = ({ children, onClick, variant = 'default', disabled, className = '', size = 'default' }) => {
    const baseStyles = 'rounded-md font-medium transition-colors focus:outline-none';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 hover:bg-gray-50',
      ghost: 'hover:bg-gray-100',
    };
    const sizes = {
      default: 'px-4 py-2',
      icon: 'p-2',
    };
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {children}
      </button>
    );
  };
  
 export const Badge = ({ children, variant = 'default' }) => {
    const variants = {
      default: 'bg-blue-100 text-blue-800',
      secondary: 'bg-gray-100 text-gray-800',
    };
  
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
        {children}
      </span>
    );
  };