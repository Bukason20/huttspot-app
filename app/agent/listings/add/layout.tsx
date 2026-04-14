import { ListingProvider } from "@/context/ListingContext";

export default function AddListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ListingProvider>{children}</ListingProvider>;
}
