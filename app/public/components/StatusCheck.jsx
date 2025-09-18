"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function StatusCheck() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    tracking_code: "",
    last4_nik: "",
  });
  const [errors, setErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    // Pre-fill tracking code from URL parameter
    const trackingCode = searchParams.get("tracking_code");
    if (trackingCode) {
      setFormData((prev) => ({
        ...prev,
        tracking_code: trackingCode,
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tracking_code.trim()) {
      newErrors.tracking_code = "Kode tracking wajib diisi";
    }

    if (!formData.last4_nik.trim()) {
      newErrors.last4_nik = "4 digit terakhir NIK wajib diisi";
    } else if (formData.last4_nik.length !== 4) {
      newErrors.last4_nik = "Masukkan 4 digit terakhir NIK";
    } else if (!/^\d+$/.test(formData.last4_nik)) {
      newErrors.last4_nik = "Hanya boleh berisi angka";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsChecking(true);
    setStatusData(null);

    try {
      const response = await fetch(
        `/api/submissions/${formData.tracking_code}?last4_nik=${formData.last4_nik}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setStatusData(result);
      } else {
        setErrors({ submit: result.message || "Data tidak ditemukan" });
      }
    } catch (error) {
      setErrors({ submit: "Terjadi kesalahan jaringan" });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENGAJUAN_BARU":
        return "bg-yellow-100 text-yellow-800";
      case "DIPROSES":
        return "bg-blue-100 text-blue-800";
      case "SELESAI":
        return "bg-green-100 text-green-800";
      case "DITOLAK":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENGAJUAN_BARU":
        return "Pengajuan Baru";
      case "DIPROSES":
        return "Sedang Diproses";
      case "SELESAI":
        return "Selesai";
      case "DITOLAK":
        return "Ditolak";
      default:
        return status;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Cek Status Pengajuan
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tracking Code */}
        <div>
          <label
            htmlFor="tracking_code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kode Tracking *
          </label>
          <input
            type="text"
            id="tracking_code"
            name="tracking_code"
            value={formData.tracking_code}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.tracking_code ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan kode tracking"
          />
          {errors.tracking_code && (
            <p className="mt-1 text-sm text-red-600">{errors.tracking_code}</p>
          )}
        </div>

        {/* Last 4 NIK */}
        <div>
          <label
            htmlFor="last4_nik"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            4 Digit Terakhir NIK *
          </label>
          <input
            type="text"
            id="last4_nik"
            name="last4_nik"
            value={formData.last4_nik}
            onChange={handleChange}
            maxLength={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.last4_nik ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="xxxx"
          />
          {errors.last4_nik && (
            <p className="mt-1 text-sm text-red-600">{errors.last4_nik}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isChecking}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          {isChecking ? "Mencari..." : "Cek Status"}
        </button>
      </form>

      {/* Status Result */}
      {statusData && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hasil Pencarian
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nama</p>
                <p className="text-base text-gray-900">{statusData.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Jenis Layanan
                </p>
                <p className="text-base text-gray-900">
                  {statusData.jenis_layanan}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Kode Tracking
                </p>
                <p className="text-base font-mono text-gray-900">
                  {statusData.tracking_code}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    statusData.status
                  )}`}
                >
                  {getStatusText(statusData.status)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Tanggal Pengajuan
              </p>
              <p className="text-base text-gray-900">
                {new Date(statusData.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {statusData.updated_at !== statusData.created_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Terakhir Diupdate
                </p>
                <p className="text-base text-gray-900">
                  {new Date(statusData.updated_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
