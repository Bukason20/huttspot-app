import { room } from "@/assets";

export interface Listing {
  _id: number;
  image: string;
  uploadedTime: string;
  isFavorite: boolean;
  title?: string;
  price?: number;
}

export const listings: Listing[] = [
  {
    _id: 1,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    _id: 2,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    _id: 3,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    _id: 4,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    _id: 5,
    image: room,
    uploadedTime: "Uploaded 6hrs ago",
    isFavorite: false,
  },
  {
    _id: 6,
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
