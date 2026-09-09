import { ListingProvider } from "@/context/ListingContext";

export default function EditListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ListingProvider>{children}</ListingProvider>;
}
