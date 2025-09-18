"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get("tracking_code");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pengajuan Berhasil!
          </h1>
          <p className="text-gray-600">
            Pengajuan layanan Anda telah berhasil dikirim dan sedang diproses.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Kode Tracking
          </h2>
          <p className="text-2xl font-mono font-bold text-blue-600 mb-2">
            {trackingCode}
          </p>
          <p className="text-sm text-gray-600">
            Simpan kode ini untuk mengecek status pengajuan Anda
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href={`/public?tab=status&tracking_code=${trackingCode}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
          >
            Cek Status Sekarang
          </Link>

          <Link
            href="/public"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
          >
            Kembali ke Layanan
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Anda akan menerima notifikasi melalui WhatsApp</p>
          <p>ketika status pengajuan berubah.</p>
        </div>
      </div>
    </div>
  );
}
