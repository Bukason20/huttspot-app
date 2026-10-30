"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useListing } from "@/context/ListingContext";
import { getAgentProperties } from "@/lib/agent";
import { PropertyResponse } from "@/lib/types";
import { AgentDashboardSkeleton } from "@/components/ui";
import { Plus, Home, Inbox, FileText, Layers, MessageCircle } from "lucide-react";
import {
  getResumeRoute,
  resumeFormData,
} from "@/components/agent/listing/resume";
import { getConversations, getOtherParticipant, Conversation } from "@/lib/chat";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { setFormData, reset } = useListing();
  const [listings, setListings] = useState<PropertyResponse[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  // Conversations power "New Requests" and "Recent clients"
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch((err) => console.error("Failed to load conversations", err));
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getAgentProperties();
        setListings(res.properties);
      } catch (error) {
        console.error("Failed to load dashboard listings", error);
      } finally {
        setListingsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleResume = (listing: PropertyResponse) => {
    // Pre-populate context with existing data
    setFormData(resumeFormData(listing));
    router.push(getResumeRoute(listing.currentStep ?? 0));
  };

  if (userLoading || listingsLoading) {
    return <AgentDashboardSkeleton />;
  }

  const activeListingsCount = listings.filter((l) => l.isPublished).length;
  const draftsCount = listings.filter((l) => !l.isPublished).length;

  // Same steps as "Add new" on the My Listings page
  const handleAddNew = () => {
    reset();
    router.push("/agent/listings/add");
  };

  const stats = [
    {
      label: "Active Listings",
      value: activeListingsCount,
      icon: Home,
      className: "bg-secondary text-white",
      iconWrap: "bg-white/15 text-white",
      labelClass: "text-white/80",
    },
    {
      label: "Awaiting reply",
      value: conversations.filter((c) => c.awaitingMyReply).length,
      icon: Inbox,
      className: "bg-primary/10",
      iconWrap: "bg-white text-primary",
      labelClass: "text-tertiary",
    },
    {
      label: "Drafts",
      value: draftsCount,
      icon: FileText,
      className: "bg-[#f3efe6]",
      iconWrap: "bg-white text-[#1a1a1a]",
      labelClass: "text-tertiary",
    },
    {
      label: "Total Listings",
      value: listings.length,
      icon: Layers,
      className: "border border-gray-100 bg-white",
      iconWrap: "bg-[#f7f7f5] text-[#1a1a1a]",
      labelClass: "text-tertiary",
    },
  ];

  return (
    <div className="px-5">
      {/* Welcome */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
        <div className="flex items-center gap-3">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-bold text-white">
              {user?.name?.charAt(0) ?? "?"}
            </div>
          )}
          <div>
            <p className="font-poppins text-xl font-semibold tracking-tight sm:text-2xl">
              Welcome back, {user?.name?.split(" ")[0] ?? "..."}
            </p>
            <p className="text-sm text-gray-500">
              {user?.accountMode === "AGENT" ? "Agent" : "Huttspoter"}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-6 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          <Plus size={18} />
          New listing
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:mb-8">
        {stats.map(({ label, value, icon: Icon, className, iconWrap, labelClass }) => (
          <div key={label} className={`rounded-3xl p-4 sm:p-5 ${className}`}>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${iconWrap}`}
            >
              <Icon size={18} />
            </span>
            <p className="mt-5 font-poppins text-3xl font-semibold">{value}</p>
            <p className={`mt-0.5 text-sm font-semibold ${labelClass}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Recent Listings */}
        <section className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-poppins text-lg font-semibold">
              Recent Listings
            </h2>
            <button
              onClick={() => router.push("/agent/listings")}
              className="cursor-pointer text-sm font-semibold text-secondary hover:underline"
            >
              View all
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f5]">
                <Home size={22} className="text-gray-400" />
              </span>
              <p className="mt-4 font-semibold">
                You don&apos;t have any properties yet.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add your first listing to start meeting clients.
              </p>
              <button
                onClick={handleAddNew}
                className="mt-5 h-11 cursor-pointer rounded-full bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
              >
                Add a listing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listings.slice(0, 3).map((listing) => {
                const coverImage =
                  listing.media?.photos?.[0] ||
                  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";

                return (
                  <div
                    key={listing._id}
                    className="flex items-center gap-3 py-4 sm:gap-4"
                  >
                    <img
                      src={coverImage}
                      alt={listing.title}
                      className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover sm:h-24 sm:w-28"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            listing.isPublished
                              ? "bg-secondary/10 text-secondary"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {listing.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="truncate font-semibold leading-snug">
                        {listing.title}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">
                        ₦{listing.price.toLocaleString()}
                        {listing.paymentType ? (
                          <span className="font-semibold text-gray-500">
                            {` / ${listing.paymentType}`}
                          </span>
                        ) : (
                          ""
                        )}
                      </p>

                      <div className="mt-3 flex items-center gap-2 sm:hidden">
                        {listing.isPublished ? (
                          // Published → Edit
                          <button
                            onClick={() =>
                              router.push(`/agent/listings/${listing._id}/edit`)
                            }
                            className="h-8 cursor-pointer rounded-full bg-secondary px-4 text-xs font-semibold text-white"
                          >
                            Edit
                          </button>
                        ) : (
                          // Draft → Resume (pre-fills context, routes to correct step)
                          <button
                            onClick={() => handleResume(listing)}
                            className="h-8 cursor-pointer rounded-full bg-secondary px-4 text-xs font-semibold text-white"
                          >
                            Resume
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions — inline on tablet & desktop */}
                    <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
                      {listing.isPublished ? (
                        <button
                          onClick={() =>
                            router.push(`/agent/listings/${listing._id}/edit`)
                          }
                          className="h-9 cursor-pointer rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResume(listing)}
                          className="h-9 cursor-pointer rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Side column */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
            <h2 className="font-poppins text-lg font-semibold">
              Recent clients
            </h2>
            {conversations.length === 0 ? (
              <>
                <div className="mt-4 flex items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="-ml-2 h-12 w-12 rounded-full border-2 border-white bg-gray-200 first:ml-0"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  House hunters you chat with will show up here.
                </p>
              </>
            ) : (
              <ul className="mt-3 flex flex-col">
                {conversations.slice(0, 4).map((c) => {
                  const other = getOtherParticipant(c, user?.id ?? "");
                  return (
                    <li key={c._id}>
                      <button
                        onClick={() => router.push(`/agent/chat/${c._id}`)}
                        className="-mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-gray-50"
                      >
                        {other?.profilePhoto ? (
                          <img src={other.profilePhoto} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                            {other?.name?.charAt(0) ?? "?"}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{other?.name ?? "Huttspotter"}</span>
                          <span className="block truncate text-xs text-gray-500">
                            {c.propertySnapshot?.title ?? c.lastMessage}
                          </span>
                        </span>
                        {c.awaitingMyReply ? (
                          <span className="flex-shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-white">
                            Reply
                          </span>
                        ) : (
                          <MessageCircle size={16} className="flex-shrink-0 text-gray-400" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="theme-keep rounded-3xl bg-[#1a1a1a] p-5 text-white sm:p-6">
            <p className="font-poppins text-lg font-semibold leading-snug">
              Got a new property?
            </p>
            <p className="mt-1 text-sm text-white/70">
              Add it in a few steps and start getting requests.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#f25d27]"
            >
              <Plus size={16} />
              Add listing
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
