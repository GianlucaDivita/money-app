interface GlassSkeletonProps {
  className?: string;
  rows?: number;
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass p-6 ${className}`}>
      <div className="skeleton h-3 w-24 mb-5" />
      <div className="skeleton h-8 w-32 mb-3" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="skeleton h-7 w-36 mb-2" />
        <div className="skeleton h-4 w-44" />
      </div>

      {/* Hero row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard className="h-[200px]" />
        <SkeletonCard className="h-[200px]" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard className="h-[180px]" />
        <SkeletonCard className="h-[180px]" />
        <SkeletonCard className="h-[180px]" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard className="h-[280px]" />
        <SkeletonCard className="h-[280px]" />
      </div>
    </div>
  );
}

export function GlassSkeleton({ className = '', rows = 3 }: GlassSkeletonProps) {
  return (
    <div className={`glass p-6 ${className}`}>
      <div className="skeleton h-3 w-24 mb-5" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
          <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-3 w-2/3 mb-2" />
            <div className="skeleton h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
