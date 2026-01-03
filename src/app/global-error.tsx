"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Critical Application Error
            </h2>
            <button
              onClick={() => reset()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
