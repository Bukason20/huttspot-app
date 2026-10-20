// Base skeleton building block
function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
  );
}

// ── Reusable skeleton shapes ──────────────────────────────────

export function SkeletonText({ className = "" }: { className?: string }) {
  return <SkeletonBox className={`h-3.5 rounded-full ${className}`} />;
}

export function SkeletonAvatar({ size = 14 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gray-200 animate-pulse flex-shrink-0"
      style={{ width: size * 4, height: size * 4 }}
    />
  );
}

// ── Page-specific skeletons ───────────────────────────────────

// Dashboard — agent
export function AgentDashboardSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      {/* Welcome row */}
      <div className="flex items-center gap-3 mb-6">
        <SkeletonAvatar size={14} />
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonText className="w-2/3" />
          <SkeletonText className="w-1/3" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-200 rounded-2xl px-4 py-5 h-24" />
        <div className="bg-gray-200 rounded-2xl px-4 py-5 h-24" />
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonText className="w-28" />
        <SkeletonText className="w-14" />
      </div>
      <div className="h-px bg-gray-200 mb-4" />

      {/* Listing cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-2xl overflow-hidden flex items-center gap-3 p-3 mb-3"
        >
          <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-2/3" />
            <div className="flex gap-2 mt-1">
              <div className="h-7 w-16 rounded-full bg-gray-200" />
              <div className="h-7 w-24 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard — huttspotter
export function HuttspotterDashboardSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 h-12 bg-gray-200 rounded-full" />
        <div className="w-11 h-11 bg-gray-200 rounded-full flex-shrink-0" />
      </div>

      {/* Map */}
      <div className="h-48 bg-gray-200 rounded-2xl mb-5" />

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonText className="w-28" />
        <SkeletonText className="w-12" />
      </div>

      {/* Listing grid */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden">
            <div className="h-28 bg-gray-200" />
            <div className="p-2.5 flex flex-col gap-2">
              <SkeletonText className="w-full" />
              <SkeletonText className="w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chat list
export function ChatListSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
        >
          <SkeletonAvatar size={14} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <SkeletonText className="w-28" />
              <SkeletonText className="w-12" />
            </div>
            <SkeletonText className="w-10 h-2.5" />
            <SkeletonText className="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Chat conversation messages
export function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 animate-pulse">
      {/* Date pill */}
      <div className="flex justify-center">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* Incoming */}
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="h-12 w-48 bg-gray-200 rounded-2xl rounded-bl-sm" />
      </div>

      {/* Outgoing */}
      <div className="flex items-end justify-end gap-2">
        <div className="h-12 w-56 bg-gray-200 rounded-2xl rounded-br-sm" />
      </div>

      {/* Incoming */}
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="h-8 w-36 bg-gray-200 rounded-2xl rounded-bl-sm" />
      </div>

      {/* Outgoing */}
      <div className="flex items-end justify-end gap-2">
        <div className="h-16 w-52 bg-gray-200 rounded-2xl rounded-br-sm" />
      </div>
    </div>
  );
}

// Listings page (agent my listings)
export function ListingsSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <SkeletonText className="w-28" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 h-11 bg-gray-200 rounded-full" />
        <div className="flex-1 h-11 bg-gray-200 rounded-full" />
      </div>

      {/* Listing cards */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-2xl flex items-center gap-3 p-3 mb-3"
        >
          <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-1/2" />
            <div className="flex gap-2 mt-1">
              <div className="h-6 w-14 rounded-full bg-gray-200" />
              <div className="h-6 w-20 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Saved listings
export function SavedListingsSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      <SkeletonText className="w-36 mb-6 h-5" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-2xl flex items-center gap-3 p-3 mb-3"
        >
          <div className="w-24 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-1/2" />
            <div className="flex gap-2 mt-1">
              <div className="h-6 w-14 rounded-full bg-gray-200" />
              <div className="h-6 w-24 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Listing detail page
export function ListingDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Main image */}
      <div className="h-56 bg-gray-200" />

      {/* Thumbnails */}
      <div className="flex gap-2 px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-20 h-16 rounded-xl bg-gray-200 flex-shrink-0"
          />
        ))}
      </div>

      <div className="px-5">
        {/* Title */}
        <SkeletonText className="w-3/4 h-5 mb-2" />
        <SkeletonText className="w-1/2 mb-4" />

        {/* CTA buttons */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 h-12 bg-gray-200 rounded-full" />
        </div>

        {/* Agent card */}
        <div className="bg-gray-100 rounded-2xl p-4 flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonText className="w-24" />
            <SkeletonText className="w-16" />
          </div>
        </div>

        {/* Detail chips */}
        <div className="flex gap-3 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 w-16 bg-gray-200 rounded-xl" />
          ))}
        </div>

        {/* Amenities */}
        <SkeletonText className="w-20 h-4 mb-3" />
        <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonText key={i} className="w-24" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile / Settings page
export function ProfileSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-3" />
        <SkeletonText className="w-28 mb-2" />
        <SkeletonText className="w-36" />
      </div>

      {/* Menu items */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-4 mb-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-200" />
          <SkeletonText className="flex-1" />
          <div className="w-4 h-4 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
