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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size={14} />
          <div className="flex flex-col gap-2">
            <SkeletonText className="h-5 w-48" />
            <SkeletonText className="w-20" />
          </div>
        </div>
        <div className="h-12 w-full rounded-full bg-gray-200 sm:w-40" />
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[136px] rounded-3xl bg-gray-200" />
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Listing rows */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <SkeletonText className="w-32" />
            <SkeletonText className="w-14" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-4">
              <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-gray-200 sm:h-24 sm:w-28" />
              <div className="flex flex-1 flex-col gap-2">
                <SkeletonText className="w-16" />
                <SkeletonText className="w-3/4" />
                <SkeletonText className="w-1/3" />
              </div>
            </div>
          ))}
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <div className="h-44 rounded-3xl bg-gray-200" />
          <div className="h-44 rounded-3xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// Dashboard — huttspotter
export function HuttspotterDashboardSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      {/* Header + search */}
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonText className="w-20" />
          <SkeletonText className="h-7 w-56" />
        </div>
        <div className="flex w-full items-center gap-2 lg:max-w-md">
          <div className="h-12 flex-1 rounded-full bg-gray-200" />
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Map */}
        <div className="h-48 rounded-3xl bg-gray-200 sm:h-64 lg:order-2 lg:h-[calc(100vh-10rem)]" />

        <div className="lg:order-1">
          {/* Section header */}
          <div className="mb-4 flex items-center justify-between">
            <SkeletonText className="w-32" />
            <SkeletonText className="w-12" />
          </div>

          {/* Listing grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="flex flex-col gap-2 p-3 sm:p-4">
                  <SkeletonText className="w-full" />
                  <SkeletonText className="w-2/3" />
                  <SkeletonText className="w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
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

// Listing detail page — mirrors app/huttspotter/listing/[id]/page.tsx
export function ListingDetailSkeleton() {
  return (
    <div className="px-5 animate-pulse">
      {/* Back + breadcrumb */}
      <div className="mb-5 flex items-center gap-3 lg:mb-6">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <SkeletonText className="w-48" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] rounded-3xl bg-gray-200" />
          <div className="mt-3 flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-20 flex-shrink-0 rounded-xl bg-gray-200 sm:h-20 sm:w-28"
              />
            ))}
          </div>
        </div>

        {/* Summary card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-7">
          <div className="h-6 w-28 rounded-full bg-gray-200" />
          <SkeletonText className="mt-4 h-7 w-4/5" />
          <SkeletonText className="mt-3 w-1/2" />
          <SkeletonText className="mt-6 h-8 w-40" />
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[84px] rounded-2xl bg-gray-100" />
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <div className="h-[52px] flex-1 rounded-full bg-gray-200" />
            <div className="h-[52px] w-[52px] rounded-full bg-gray-200" />
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 p-4">
            <div className="h-11 w-11 rounded-full bg-gray-200" />
            <div className="flex flex-1 flex-col gap-2">
              <SkeletonText className="w-28" />
              <SkeletonText className="w-44" />
            </div>
          </div>
        </div>
      </div>

      {/* Details + amenities */}
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-10 lg:grid-cols-2">
        {[1, 2].map((card) => (
          <div
            key={card}
            className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-7"
          >
            <SkeletonText className="h-5 w-36" />
            <div className="mt-5 flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonText className="w-24" />
                  <SkeletonText className="w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
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
