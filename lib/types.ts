export type AccountMode = "HUTTSPOTTER" | "AGENT";
export type Intent = "RENT" | "BUY" | "ROOMMATE";
export type Gender = "male" | "female";
export type HowFoundUs = "Instagram" | "Twitter" | "Facebook" | "Referral";

// Renamed from SignupFormData → OnboardingFormData
export interface OnboardingFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountMode: AccountMode;
  intent?: Intent;
  gender?: Gender;
  phoneNumber?: string;
  countryCode?: string;
  howYouFoundUs?: HowFoundUs;
  capturedFaceImage?: File;
  isGoogleSignup?: boolean;
  idToken?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface OnboardingPayload {
  accountMode: AccountMode;
  intent?: Intent;
  gender: Gender;
  phoneNumber: string;
  howYouFoundUs: HowFoundUs;
  profilePhoto?: string;
  isOnboarded?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  accountMode: AccountMode;
  profilePhoto?: string;
  isOnboarded: boolean;
  profile: {
    completedSteps: string[];
    completionPercentage: number;
  };
  agentProfile?: {
    agencyName: string;
    operatingAreas: string[];
  };
  huttspotterProfile?: {
    budgetMin: number;
    budgetMax: number;
    preferredLocations: string[];
  };
  createdAt: string;
}

export type PropertyType =
  | string
  | "Apartment"
  | "Duplex"
  | "Land"
  | "Shop"
  | "Office";

export type PropertyPurpose = "For Rent" | "For Sale" | "Room Share";
export type PaymentType = "Monthly" | "Yearly" | "One-time";

// What we collect across the 4 steps
export interface ListingFormData {
  // Step 1
  propertyName: string;
  propertyType: PropertyType | string;
  listingFor: PropertyPurpose;
  price: string;
  paymentType: PaymentType;
  // Step 2
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  parkingSpaces: string;
  amenities: string[];
  additionalNotes: string;
  // Step 3
  state: string;
  city: string;
  street: string;
  // Step 4
  photos: File[];
  coverPhotoIndex: number;
  video?: File;
  // Persisted from backend after step 1
  propertyId?: string;
  // "full" property or "shared" (sent with step 1)
  listingType?: "full" | "shared";
  // Edit flow: media already on the listing
  existingPhotos?: string[];
  existingVideo?: string;
}

// Step payloads sent to backend
export interface ListingStep1Payload {
  step: 1;
  data: {
    title: string;
    type: PropertyType;
    purpose: PropertyPurpose;
    listingType: "full" | "shared"; // ← required by backend
    price: number;
    paymentType: PaymentType;
  };
}

export interface ListingStep2Payload {
  step: 2;
  propertyId: string;
  data: {
    state: string;
    city: string;
    street?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface ListingStep3Payload {
  step: 3;
  propertyId: string;
  data: {
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    parkingSpaces: number;
    features: string[];
    additionalNotes?: string | undefined;
  };
}

export interface ListingStep4Payload {
  step: 4;
  propertyId: string;
  data: {
    photos: string[];
    video?: string;
  };
}

export interface PropertyResponse {
  _id: string;
  agent: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  paymentType: string;
  listingType?: string;
  isPublished: boolean;
  currentStep?: number;
  location?: {
    state: string;
    city: string;
    street?: string;
    coordinates?: { lat: number; lng: number };
  };
  details?: {
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    parkingSpaces: number;
    features: string[];
  };
  media?: {
    photos: string[];
    video?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  _id: string;
  title: string;
  type: string;
  purpose: string;
  listingType?: string;
  price: number;
  paymentType: string;
  location?: {
    state: string;
    city: string;
    street?: string;
  };
  details?: {
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    parkingSpaces: number;
    features?: string[];
  };
  media?: {
    photos: string[];
    video?: string;
  };
  agent: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Property[];
}

/**
 * Public listing returned by GET /api/properties/featured (no auth).
 * Agent details, street address and coordinates are intentionally left out.
 */
export type FeaturedProperty = Omit<Property, "agent" | "updatedAt" | "location"> & {
  location?: { city: string; state: string };
};

/** Anything a listing card can render — full or public listing */
export type ListingCardData = Property | FeaturedProperty;

export interface FeaturedResponse {
  message: string;
  count: number;
  data: FeaturedProperty[];
}

export interface ListResponse {
  message: string;
  count: number;
  data: Property[];
}

export interface FilterParams {
  city?: string;
  type?: string;
  purpose?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
