/*
  # Events System - Comprehensive Schema

  ## Overview
  This migration creates a complete events management system with livestreaming, 
  provider marketplace, and memories/journal functionality.

  ## New Tables
  
  ### 1. `events`
  Core events table storing all event information
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event name
  - `description` (text) - Event description
  - `category` (text) - Event category (social, networking, business)
  - `date` (date) - Event date
  - `time` (text) - Event time string
  - `location` (text) - Event location
  - `organizer` (text) - Event organizer name
  - `organizer_id` (uuid, foreign key to auth.users) - User who created the event
  - `image_url` (text) - Event image URL
  - `price` (numeric) - Ticket price
  - `rating` (numeric) - Event rating
  - `features` (text[]) - Array of event features
  - `speakers` (text[]) - Array of speaker names
  - `status` (text) - Event status (upcoming, happening, past)
  - `is_livestream` (boolean) - Whether event has livestream
  - `livestream_url` (text) - URL for livestream
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `service_providers`
  Directory of event service providers
  - `id` (uuid, primary key) - Provider identifier
  - `name` (text) - Provider business name
  - `category` (text) - Service category (venue, decor, catering, etc.)
  - `description` (text) - Provider description
  - `expertise` (text) - Areas of expertise
  - `base_price` (numeric) - Base service price
  - `rating` (numeric) - Provider rating
  - `reviews_count` (integer) - Number of reviews
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `portfolio_images` (text[]) - Array of portfolio image URLs
  - `available` (boolean) - Availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `event_bookings`
  Track user event bookings/registrations
  - `id` (uuid, primary key) - Booking identifier
  - `event_id` (uuid, foreign key to events) - Related event
  - `user_id` (uuid, foreign key to auth.users) - User who booked
  - `booking_date` (timestamptz) - Booking timestamp
  - `status` (text) - Booking status (confirmed, cancelled, pending)
  - `payment_status` (text) - Payment status
  - `ticket_quantity` (integer) - Number of tickets

  ### 4. `provider_bookings`
  Track provider bookings for event organization
  - `id` (uuid, primary key) - Booking identifier
  - `provider_id` (uuid, foreign key to service_providers) - Booked provider
  - `user_id` (uuid, foreign key to auth.users) - User who booked
  - `event_id` (uuid, foreign key to events, nullable) - Related event if any
  - `quantity` (integer) - Quantity/units booked
  - `total_cost` (numeric) - Total booking cost
  - `booking_date` (timestamptz) - Booking timestamp
  - `event_date` (date) - Date provider services needed
  - `status` (text) - Booking status
  - `notes` (text) - Additional notes

  ### 5. `event_memories`
  Event journal entries and memories
  - `id` (uuid, primary key) - Memory identifier
  - `event_id` (uuid, foreign key to events) - Related event
  - `user_id` (uuid, foreign key to auth.users) - User who posted
  - `content` (text) - Memory content/description
  - `highlights` (text[]) - Key highlights array
  - `photos` (text[]) - Photo URLs array
  - `rating` (numeric) - User's event rating
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `memory_chat`
  Chat forum for discussing events and memories
  - `id` (uuid, primary key) - Chat message identifier
  - `event_id` (uuid, foreign key to events, nullable) - Related event
  - `user_id` (uuid, foreign key to auth.users) - Message author
  - `message` (text) - Chat message content
  - `parent_id` (uuid, foreign key to memory_chat, nullable) - For threaded replies
  - `created_at` (timestamptz) - Message timestamp

  ### 7. `provider_reviews`
  Reviews for service providers
  - `id` (uuid, primary key) - Review identifier
  - `provider_id` (uuid, foreign key to service_providers) - Reviewed provider
  - `user_id` (uuid, foreign key to auth.users) - Reviewer
  - `rating` (numeric) - Rating out of 5
  - `comment` (text) - Review text
  - `created_at` (timestamptz) - Review timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only modify their own data
  - Public read access for events and providers
  - Authenticated users can create bookings and memories
  - Users can only view their own bookings
  
  ## Important Notes
  - All tables use proper foreign key constraints
  - Indexes added on frequently queried columns
  - Default values set for timestamps and status fields
  - Arrays used for flexible multi-value storage
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('social', 'networking', 'business')),
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  organizer text NOT NULL,
  organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  features text[] DEFAULT '{}',
  speakers text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'happening', 'past')),
  is_livestream boolean DEFAULT false,
  livestream_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('venue', 'decor', 'catering', 'audio', 'ushering', 'photography', 'entertainment', 'security', 'transport')),
  description text NOT NULL,
  expertise text NOT NULL,
  base_price numeric NOT NULL CHECK (base_price >= 0),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  contact_email text,
  contact_phone text,
  portfolio_images text[] DEFAULT '{}',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create event_bookings table
CREATE TABLE IF NOT EXISTS event_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
  ticket_quantity integer DEFAULT 1 CHECK (ticket_quantity > 0),
  UNIQUE(event_id, user_id)
);

-- Create provider_bookings table
CREATE TABLE IF NOT EXISTS provider_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  booking_date timestamptz DEFAULT now(),
  event_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('confirmed', 'cancelled', 'pending', 'completed')),
  notes text
);

-- Create event_memories table
CREATE TABLE IF NOT EXISTS event_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  highlights text[] DEFAULT '{}',
  photos text[] DEFAULT '{}',
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create memory_chat table
CREATE TABLE IF NOT EXISTS memory_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  parent_id uuid REFERENCES memory_chat(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create provider_reviews table
CREATE TABLE IF NOT EXISTS provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_livestream ON events(is_livestream);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON service_providers(rating);
CREATE INDEX IF NOT EXISTS idx_event_bookings_user_id ON event_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_event_id ON event_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_provider_bookings_user_id ON provider_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_event_memories_event_id ON event_memories(event_id);
CREATE INDEX IF NOT EXISTS idx_memory_chat_event_id ON memory_chat(event_id);
CREATE INDEX IF NOT EXISTS idx_memory_chat_parent_id ON memory_chat(parent_id);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;

-- Events Policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Service Providers Policies
CREATE POLICY "Anyone can view service providers"
  ON service_providers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create provider listings"
  ON service_providers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Event Bookings Policies
CREATE POLICY "Users can view their own bookings"
  ON event_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create bookings"
  ON event_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON event_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON event_bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Provider Bookings Policies
CREATE POLICY "Users can view their own provider bookings"
  ON provider_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create provider bookings"
  ON provider_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider bookings"
  ON provider_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider bookings"
  ON provider_bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Event Memories Policies
CREATE POLICY "Anyone can view event memories"
  ON event_memories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create memories"
  ON event_memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON event_memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON event_memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Memory Chat Policies
CREATE POLICY "Anyone can view chat messages"
  ON memory_chat FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can post messages"
  ON memory_chat FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON memory_chat FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON memory_chat FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Provider Reviews Policies
CREATE POLICY "Anyone can view provider reviews"
  ON provider_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON provider_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON provider_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON provider_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample data for service providers
INSERT INTO service_providers (name, category, description, expertise, base_price, rating, reviews_count, contact_email, contact_phone, available) VALUES
  ('Grand Hall Venues', 'venue', 'Premier event venues for conferences, weddings, and corporate events', 'Large events, conferences, weddings', 2000000, 4.8, 124, 'info@grandhall.com', '+256-700-123456', true),
  ('Elite Tents & Decor', 'decor', 'Professional event decoration and tent rental services', 'Weddings, gala, corporate events', 450000, 4.7, 78, 'elite@tents.com', '+256-700-234567', true),
  ('Prime Ushers', 'ushering', 'Trained and professional ushering staff for all event types', 'Friendly, trained staff, crowd management', 120000, 4.6, 46, 'contact@primeushers.com', '+256-700-345678', true),
  ('SoundWorks Ltd', 'audio', 'Complete audio solutions including PA systems and mixing', 'PA systems, mixing, live sound', 600000, 4.9, 98, 'hello@soundworks.com', '+256-700-456789', true),
  ('CaterPro', 'catering', 'Full-service catering for events of all sizes', 'Buffet, plated service, dietary options', 350000, 4.5, 65, 'catering@caterpro.com', '+256-700-567890', true),
  ('LightUp Studios', 'photography', 'Professional event photography and videography', 'Weddings, corporate events, portraits', 800000, 4.9, 112, 'book@lightupstudios.com', '+256-700-678901', true),
  ('StarDJ Entertainment', 'entertainment', 'DJs, MCs, and live entertainment for events', 'Weddings, parties, corporate events', 500000, 4.7, 89, 'info@stardj.com', '+256-700-789012', true),
  ('SafeGuard Security', 'security', 'Professional event security and crowd control', 'Large events, VIP protection, access control', 400000, 4.8, 73, 'security@safeguard.com', '+256-700-890123', true),
  ('RideShare Transport', 'transport', 'Event transportation and shuttle services', 'Guest shuttles, VIP transport, logistics', 300000, 4.6, 54, 'ride@rideshare.com', '+256-700-901234', true)
ON CONFLICT DO NOTHING;