import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Event = {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'networking' | 'business';
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizer_id: string | null;
  image_url: string | null;
  price: number;
  rating: number;
  features: string[];
  speakers: string[];
  status: 'upcoming' | 'happening' | 'past';
  is_livestream: boolean;
  livestream_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceProvider = {
  id: string;
  name: string;
  category: 'venue' | 'decor' | 'catering' | 'audio' | 'ushering' | 'photography' | 'entertainment' | 'security' | 'transport';
  description: string;
  expertise: string;
  base_price: number;
  rating: number;
  reviews_count: number;
  contact_email: string | null;
  contact_phone: string | null;
  portfolio_images: string[];
  available: boolean;
  created_at: string;
};

export type EventMemory = {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  highlights: string[];
  photos: string[];
  rating: number | null;
  created_at: string;
};

export type MemoryChat = {
  id: string;
  event_id: string | null;
  user_id: string;
  message: string;
  parent_id: string | null;
  created_at: string;
};

export type ProviderBooking = {
  id: string;
  provider_id: string;
  user_id: string;
  event_id: string | null;
  quantity: number;
  total_cost: number;
  booking_date: string;
  event_date: string;
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed';
  notes: string | null;
};
