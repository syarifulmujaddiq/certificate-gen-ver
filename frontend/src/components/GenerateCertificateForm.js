import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Hash, GraduationCap, Download, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

function GenerateCertificateForm() {
  const [form, setForm] = useState({ nama: '', nim: '', jurusan: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    // Show loading toast
    const loadingToast = toast.loading('Membuat sertifikat...', {
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/certificate/generate',
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setResult(res.data);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Sertifikat berhasil dibuat! 🎉', {
        duration: 4000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal membuat sertifikat';
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

  // Listen for clear generate form event from parent
  React.useEffect(() => {
    const handleClearGenerateForm = () => {
      // Clear all form data for generate form
      setForm({ nama: '', nim: '', jurusan: '' });
      setError('');
      // Keep result to show what was generated
    };

    window.addEventListener('clearGenerateForm', handleClearGenerateForm);
    return () => window.removeEventListener('clearGenerateForm', handleClearGenerateForm);
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <div className="relative">
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Masukkan nama lengkap mahasiswa"
            />
            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* NIM Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIM (Nomor Induk Mahasiswa)
          </label>
          <div className="relative">
            <input
              type="text"
              name="nim"
              value={form.nim}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Masukkan nomor induk mahasiswa"
            />
            <Hash className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Major Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jurusan / Program Studi
          </label>
          <div className="relative">
            <input
              type="text"
              name="jurusan"
              value={form.jurusan}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Masukkan jurusan mahasiswa"
            />
            <GraduationCap className="absolute left-3 top-3.5 text-gray-400" size={20} />
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

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="text-green-500 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-green-800">Sertifikat Berhasil Dibuat!</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hash Blockchain:</label>
              <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                {result.hash}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={result.ipfsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="mr-2" size={16} />
                Lihat di IPFS
              </a>
              <a
                href={`http://localhost:5000${result.downloadUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="mr-2" size={16} />
                Unduh Sertifikat
              </a>
              {/* Tambahkan Download QR */}
              <a
                href={`http://localhost:5000${result.downloadQrUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Download className="mr-2" size={16} />
                Unduh QR Code
              </a>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateCertificateForm;
