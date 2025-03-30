export interface Movie {
  id: string;
  title: string;
  poster: string;
  year: number;
  rating: number;
  genre: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  connections: number;
  avatar: string;
}