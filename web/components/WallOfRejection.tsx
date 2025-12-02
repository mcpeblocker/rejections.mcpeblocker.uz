"use client";

import { useRouter } from "next/navigation";

interface Rejection {
  id: string;
  title: string;
  content?: string | null;
  sender?: string | null;
  emailId?: string | null;
  timestamp?: string | null;
  createdAt: string;
}

interface WallOfRejectionProps {
  rejections: Rejection[];
  isAuthenticated?: boolean;
  onAddRejection?: () => void;
}

const stickyNoteColors = [
  { bg: "#fef3c7", border: "#fbbf24", shadow: "#f59e0b" }, // Yellow
  { bg: "#fce7f3", border: "#f472b6", shadow: "#ec4899" }, // Pink
  { bg: "#dbeafe", border: "#60a5fa", shadow: "#3b82f6" }, // Blue
  { bg: "#d1fae5", border: "#34d399", shadow: "#10b981" }, // Green
  { bg: "#e0e7ff", border: "#818cf8", shadow: "#6366f1" }, // Indigo
  { bg: "#fde68a", border: "#fbbf24", shadow: "#f59e0b" }, // Amber
  { bg: "#fbcfe8", border: "#f472b6", shadow: "#ec4899" }, // Pink light
  { bg: "#bfdbfe", border: "#60a5fa", shadow: "#3b82f6" }, // Blue light
];

const rotations = [-3, -2, -1, 0, 1, 2, 3, 4, -4];

export default function WallOfRejection({ rejections, isAuthenticated = false, onAddRejection }: WallOfRejectionProps) {
  const router = useRouter();

  // Empty state
  if (rejections.length === 0) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
        {/* Cork board texture */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23964B00' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Blurred placeholder notes */}
        <div className="absolute inset-0 flex flex-wrap items-center justify-center p-8 gap-6 opacity-30 blur-sm pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const color = stickyNoteColors[i % stickyNoteColors.length];
            const rotation = rotations[i % rotations.length];
            return (
              <div
                key={i}
                className="w-48 h-48 p-6 rounded-sm shadow-xl"
                style={{
                  backgroundColor: color.bg,
                  borderTop: `3px solid ${color.border}`,
                  transform: `rotate(${rotation}deg)`,
                  boxShadow: `0 10px 25px -5px ${color.shadow}40`,
                }}
              >
                <div className="h-full flex flex-col gap-2">
                  <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational overlay */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 border-4 border-amber-200">
            <div className="text-center">
              <div className="text-6xl mb-6">📌</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Your Wall Awaits
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every rejection is a story worth telling. Start building your wall of resilience today!
              </p>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border-2 border-amber-200">
                <p className="text-gray-700 italic text-base mb-3">
                  💡 <strong>Did you know?</strong> The most successful people have the most rejections.
                </p>
                <p className="text-gray-600 text-sm">
                  Your first rejection note could be the beginning of an inspiring journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={onAddRejection}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                    >
                      📝 Add Your First Rejection
                    </button>
                    <button
                      onClick={() => router.push("/app")}
                      className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push("/")}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                    >
                      🚀 Join Now
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Join thousands who are turning rejections into growth 💪
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wall view with rejections
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
      {/* Cork board texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23964B00' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Rejection notes */}
      <div className="relative p-8 sm:p-12 flex flex-wrap gap-6 justify-center items-start">
        {rejections.map((rejection, index) => {
          const color = stickyNoteColors[index % stickyNoteColors.length];
          const rotation = rotations[index % rotations.length];
          const date = new Date(rejection.timestamp || rejection.createdAt);
          const isEmail = !!rejection.emailId;

          return (
            <div
              key={rejection.id}
              onClick={() => router.push(`/rejection/${rejection.id}`)}
              className="w-64 sm:w-72 h-64 sm:h-72 p-6 rounded-sm shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:z-50 relative group"
              style={{
                backgroundColor: color.bg,
                borderTop: `4px solid ${color.border}`,
                transform: `rotate(${rotation}deg)`,
                boxShadow: `0 10px 30px -5px ${color.shadow}40`,
              }}
            >
              {/* Push pin */}
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full shadow-md"
                style={{ 
                  background: `radial-gradient(circle, ${color.shadow}, ${color.border})`,
                  boxShadow: `0 2px 8px ${color.shadow}60`,
                }}
              >
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                />
              </div>

              {/* Source badge */}
              <div className="absolute top-3 right-3">
                <span className="text-xl">
                  {isEmail ? "📧" : "✍️"}
                </span>
              </div>

              {/* Content */}
              <div className="h-full flex flex-col" style={{ fontFamily: "'Permanent Marker', 'Comic Sans MS', cursive" }}>
                <h3 className="text-lg font-bold mb-3 line-clamp-2" style={{ color: color.shadow }}>
                  {rejection.title}
                </h3>
                
                {rejection.sender && (
                  <p className="text-sm mb-2 opacity-80 line-clamp-1" style={{ color: color.shadow }}>
                    From: {rejection.sender}
                  </p>
                )}

                {rejection.content && (
                  <p className="text-sm flex-1 overflow-hidden opacity-75 line-clamp-4" style={{ color: color.shadow }}>
                    {rejection.content}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t opacity-60" style={{ borderColor: color.border }}>
                  <p className="text-xs" style={{ color: color.shadow }}>
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all rounded-sm pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Add more prompt for authenticated users */}
      {isAuthenticated && onAddRejection && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={onAddRejection}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl transform hover:scale-110 cursor-pointer"
            title="Add rejection"
          >
            📌
          </button>
        </div>
      )}
    </div>
  );
}
