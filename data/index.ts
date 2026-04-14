import { room } from "@/assets";

export interface Listing {
  id: number;
  image: string;
  uploadedTime: string;
  isFavorite: boolean;
}

export const listings: Listing[] = [
  {
    id: 1,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    id: 2,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    id: 3,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    id: 4,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    id: 5,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    id: 6,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  //   {
  //     id: 7,
  //     image: room,
  //     uploadedTime: "Uploaded 6hrs ago",
  //     isFavorite: false,
  //   },
  //   {
  //     id: "8",
  //     image: room,
  //     uploadedTime: "Uploaded 6hrs ago",
  //     isFavorite: false,
  //   },
  //   {
  //     id: "9",
  //     image: room,
  //     uploadedTime: "Uploaded 6hrs ago",
  //     isFavorite: false,
  //   },
];
