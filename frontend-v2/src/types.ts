// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'PLAYER' | 'OWNER' | 'ADMIN';
export type Zone = 'NORTE' | 'SUR' | 'ESTE' | 'OESTE' | 'CENTRO';
export type Sport = 'PADEL' | 'TENNIS' | 'FUTBOL' | 'BASQUET' | 'VOLEY';
export type BookingType = 'CASUAL' | 'COMPETITIVE';
export type BookingVisibility = 'PUBLIC' | 'PRIVATE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  zone: Zone;
  padelTag: string;
  points: number;
  isNewUser: boolean;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Venue & Court ────────────────────────────────────────────────────────────

export interface Court {
  id: string;
  name: string;
  sport: Sport;
  surface?: string;
  indoor: boolean;
  isActive: boolean;
  venueId: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  zone: Zone;
  description?: string;
  imageUrl?: string;
  rating: number;
  ratingCount: number;
  isActive: boolean;
  courts?: Court[];
  createdAt: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface BookingPlayer {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar' | 'padelTag'>;
  joinedAt: string;
}

export interface BookingResult {
  id: string;
  winnerIds: string[];
  score?: string;
  pointsAwarded: boolean;
}

export interface Booking {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  level: string;
  type: BookingType;
  visibility: BookingVisibility;
  status: BookingStatus;
  notes?: string;
  price: number;
  maxPlayers: number;
  organizerId: string;
  organizer: Pick<User, 'id' | 'name' | 'avatar' | 'padelTag'>;
  venue: Pick<Venue, 'id' | 'name' | 'address' | 'zone'>;
  court: Pick<Court, 'id' | 'name' | 'sport'>;
  players: BookingPlayer[];
  result?: BookingResult;
  createdAt: string;
}

// ─── Club ─────────────────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  tag: string;
  description?: string;
  imageUrl?: string;
  points: number;
  isActive: boolean;
  _count?: { members: number };
  createdAt: string;
}

// ─── Tournament ───────────────────────────────────────────────────────────────

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  date: string;
  level: string;
  prize?: string;
  maxPlayers: number;
  entryFee: number;
  status: TournamentStatus;
  venue: Pick<Venue, 'id' | 'name' | 'address' | 'zone'>;
  club?: Pick<Club, 'id' | 'name'>;
  _count?: { participants: number };
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
