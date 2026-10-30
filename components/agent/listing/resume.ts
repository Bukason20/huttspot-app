import { ListingFormData, PropertyResponse } from "@/lib/types";

// Maps currentStep from backend to the correct page
// Step 1 = basic info done → resume at step 2 (location)
// Step 2 = location done → resume at step 3 (details)
// Step 3 = details done → resume at step 4 (media)
export const getResumeRoute = (currentStep: number) => {
  switch (currentStep) {
    case 1:
      return "/agent/listings/add/location";
    case 2:
      return "/agent/listings/add/details";
    case 3:
      return "/agent/listings/add/media";
    default:
      return "/agent/listings/add";
  }
};

/** Form data to pre-fill when resuming a draft */
export function resumeFormData(listing: PropertyResponse): Partial<ListingFormData> {
  return {
    propertyId: listing._id,
    propertyName: listing.title,
    propertyType: listing.type,
    listingFor: listing.purpose as any,
    listingType: listing.listingType === "shared" ? "shared" : "full",
    price: listing.price.toString(),
    paymentType: listing.paymentType as any,
    // Location if available
    ...(listing.location && {
      state: listing.location.state,
      city: listing.location.city,
      street: listing.location.street ?? "",
    }),
    // Details if available
    ...(listing.details && {
      bedrooms: listing.details.bedrooms.toString(),
      bathrooms: listing.details.bathrooms.toString(),
      toilets: listing.details.toilets.toString(),
      parkingSpaces: listing.details.parkingSpaces.toString(),
      amenities: listing.details.features,
      additionalNotes: (listing.details as any).additionalNotes ?? "",
    }),
  };
}

export const DRAFT_STEP_LABEL: Record<number, string> = {
  1: "Location next",
  2: "Details next",
  3: "Photos next",
};
