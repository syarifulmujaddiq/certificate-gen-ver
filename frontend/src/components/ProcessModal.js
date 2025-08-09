import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function ProcessModal({ isOpen, status, message, onClose }) {
    if (!isOpen) return null;

    const getStatusIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader2 className="animate-spin text-blue-600" size={48} />;
            case 'success':
                return <CheckCircle className="text-green-600" size={48} />;
            case 'error':
                return <AlertCircle className="text-red-600" size={48} />;
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading':
                return 'border-blue-200 bg-blue-50';
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-white';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 border-2 ${getStatusColor()}`}>
                <div className="text-center">
                    <div className="mb-4">
                        {getStatusIcon()}
                    </div>
                    <p className="text-gray-800 font-medium mb-4">{message}</p>
                    {status !== 'loading' && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                        >
                            Tutup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProcessModal;
