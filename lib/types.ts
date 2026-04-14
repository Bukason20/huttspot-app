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
