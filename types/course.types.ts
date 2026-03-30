export interface Instructor {
  id: number;
  name: {
    title: string;
    first: string;
    last: string;
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
}

export interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface RawUser {
  id: number;
  name: { title: string; first: string; last: string };
  picture: { large: string; medium: string; thumbnail: string };
  email: string;
  location: { city: string; country: string };
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  images: string[];
  instructor: Instructor;
  // Synthetic fields generated deterministically from id
  rating: number;
  reviewCount: number;
  duration: string;
  studentsCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
}

export type CourseLevel = Course["level"];
