import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        
        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon className="toast-icon" size={24} />
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
