import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, File, CheckCircle, AlertCircle, ExternalLink, X, XCircle } from 'lucide-react';

function VerifyCertificateByFile() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
        setResult(null);
      } else {
        setError('Harap unggah file PDF saja');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
        setResult(null);
      } else {
        setError('Harap unggah file PDF saja');
        setFile(null);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError('');

    // Show loading toast
    const loadingToast = toast.loading('Memverifikasi sertifikat...', {
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'http://localhost:5000/api/certificate/verify-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setResult(res.data);

      // Dismiss loading toast and show result-based toast
      toast.dismiss(loadingToast);

      if (res.data.valid) {
        toast.success('Sertifikat valid! ✅', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });
      } else {
        toast.error('Sertifikat tidak valid ❌', {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memverifikasi sertifikat';
      setError(errorMessage);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen for clear verify form event from parent
  React.useEffect(() => {
    const handleClearVerifyForm = () => {
      // Clear file and error for verify form
      setFile(null);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Keep result to show what was verified
    };

    window.addEventListener('clearVerifyForm', handleClearVerifyForm);
    return () => window.removeEventListener('clearVerifyForm', handleClearVerifyForm);
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Unggah Sertifikat PDF
            </label>
            {file && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Hapus File
              </button>
            )}
          </div>

          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
              ? 'border-blue-400 bg-blue-50'
              : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="text-center">
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <File className="text-green-500" size={32} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                        Klik untuk mengunggah
                      </span>{' '}
                      atau seret dan lepas
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hanya file PDF, maksimal 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-500 mr-3" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Memverifikasi sertifikat...</span>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {result && (
        <div className={`border rounded-lg p-6 ${result.valid
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex items-center mb-4">
            {result.valid ? (
              <>
                <CheckCircle className="text-green-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-green-800">
                  Sertifikat Valid ✅
                </h3>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center w-full">
                  <XCircle className="text-red-500" size={40} />
                  <h2 className="text-lg font-semibold mt-2 text-red-700">
                    SERTIFIKAT TIDAK VALID
                  </h2>
                  <p className="text-gray-600 mt-1 text-center">
                    Sertifikat ini tidak ditemukan atau tidak terdaftar di blockchain.
                  </p>
                </div>
              </>
            )}
          </div>

          {result.valid && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hash Blockchain:
                </label>
                <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                  {result.hash}
                </div>
              </div>

              {result.issuer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diterbitkan oleh:
                  </label>
                  <div className="bg-white p-3 rounded font-mono border text-sm">
                    {result.issuer}
                  </div>
                </div>
              )}

              {result.ipfsCid && (
                <div className="pt-2">
                  <a
                    href={`https://ipfs.io/ipfs/${result.ipfsCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="mr-2" size={16} />
                    Lihat di IPFS
                  </a>
                </div>
              )}
            </div>
          )}

          {!result.valid && result.reason && (
            <div className="mt-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Alasan:</span> {result.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyCertificateByFile;
