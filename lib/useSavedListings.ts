"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSavedProperties, toggleSaveProperty } from "./userProperties";
import { Property } from "./types";

/**
 * The signed-in user's saved listings.
 *
 * Loads the saved list from the API on mount, so hearts/bookmarks show the
 * right state after a refresh. toggle() updates the UI straight away and
 * rolls back if the request fails.
 */
export function useSavedListings() {
  const [savedListings, setSavedListings] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const pending = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const res = await getSavedProperties();
      const list = res.data ?? [];
      setSavedListings(list);
      setSavedIds(new Set(list.map((p) => p._id)));
    } catch (err) {
      console.error("Failed to load saved listings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  /** Save / unsave. Pass the listing when saving so the Saved list updates too. */
  const toggle = useCallback(
    async (id: string, listing?: Property) => {
      if (pending.current.has(id)) return;
      pending.current.add(id);

      const wasSaved = savedIds.has(id);
      // Keep the full listing so a failed unsave can put it back
      const item = listing ?? savedListings.find((p) => p._id === id);
      const apply = (saved: boolean) => {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(id);
          else next.delete(id);
          return next;
        });
        setSavedListings((prev) =>
          saved
            ? item && !prev.some((p) => p._id === id)
              ? [item, ...prev]
              : prev
            : prev.filter((p) => p._id !== id),
        );
      };

      apply(!wasSaved); // optimistic
      try {
        await toggleSaveProperty(id);
      } catch (err) {
        console.error("Failed to toggle save:", err);
        apply(wasSaved); // roll back
      } finally {
        pending.current.delete(id);
      }
    },
    [savedIds, savedListings],
  );

  return { savedListings, savedIds, isSaved, toggle, loading, refresh };
}
