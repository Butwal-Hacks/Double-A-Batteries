'use client';
// loading placeholder that looks like content
// makes it feel faster even tho its not lol

export default function SkeletonLoader({ theme = 'light' }) {
  const bgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  const containerBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';

  // show 3 fake cards while loading
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`rounded-lg shadow p-6 ${containerBg}`}>
          <div className={`w-32 h-5 ${bgClass} rounded animate-pulse mb-3`} />
          {[...Array(i === 2 ? 2 : 4)].map((_, j) => (
            <div key={j} className={`${i === 2 ? 'w-full h-3' : j === 3 ? 'w-4/6 h-4' : 'w-full h-4'} ${bgClass} rounded animate-pulse mb-2`} />
          ))}
        </div>
      ))}
    </div>
  );
}
