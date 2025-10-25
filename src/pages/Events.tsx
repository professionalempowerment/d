import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, Star, Filter, Search, Share2, Users, Briefcase, Send, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reservation' | 'management'>('reservation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'social', 'networking', 'business'];

  function maskNumber(n: number): string {
    const digits = String(Math.max(1, Math.abs(Math.trunc(n)))).length;
    return '-'.repeat(digits);
  }
  function maskRating(r: number): string {
    return '-'.repeat((Number.isFinite(r) ? r : 0).toFixed(1).length);
  }

  // Live clock to drive countdowns
  const [nowTime, setNowTime] = useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  function CountdownDisplay({ date }: { date: string }) {
    const target = new Date(date + 'T00:00:00');
    const diff = target.getTime() - nowTime;
    if (diff <= 0) return <span className="text-sm text-rose-400">Happening now</span>;

    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
      <span className="text-rose-400 text-sm font-mono">{days} days, {String(hours).padStart(2,'0')}:{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</span>
    );
  }

  const handleShare = (event: any) => {
    const shareData = { title: event.title, text: event.description, url: window.location.href + '#event-' + event.id };
    if ((navigator as any).share) (navigator as any).share(shareData).catch(() => {});
    else navigator.clipboard?.writeText(shareData.url).then(() => alert('Event link copied to clipboard'));
  };

  // Calendar add toggle state
  const [calendarAdded, setCalendarAdded] = useState<Record<number, boolean>>({});

  const toggleCalendar = (eventId: number) => {
    setCalendarAdded(prev => {
      const added = !!prev[eventId];
      const next = { ...prev, [eventId]: !added };
      // Simulate adding to calendar and prompt for reminders
      if (!added) {
        setTimeout(() => {
          if (window.confirm('Added to calendar. Get reminders?')) {
            alert('Reminders enabled for this event.');
          }
        }, 10);
      } else {
        alert('Removed from calendar.');
      }
      return next;
    });
  };

  const events = [
    {
      id: 1,
      title: 'The Advertising Summit',
      category: 'business',
      date: '2025-11-15',
      time: '10:00 AM - 6:00 PM EAT',
      location: 'Virtual Event',
      organizer: 'Creative Arts Institute',
      image: 'https://tinuiti.com/wp-content/uploads/2024/12/2025-amazon-and-retail-media-summit-featured.webp?auto=compress&cs=tinysrgb&w=800',
      description: 'A momentous occasion of advertising insights, creative strategies, and networking.',
      price: 380000,
      rating: 4.8,
      features: ['Live Sessions', 'Networking', 'Certificates', 'Recordings'],
      speakers: ['Sarah Johnson', 'Mike Chen', 'Emma Wilson'],
      status: 'upcoming',
      livestream: false
    },
    {
      id: 2,
      title: 'Talent Show',
      category: 'social',
      date: '2025-11-20',
      time: '7:00 PM - 10:00 PM EAT',
      location: 'Kampala, Uganda',
      organizer: 'Creative Collective',
      image: 'https://static.vecteezy.com/system/resources/thumbnails/035/924/440/small_2x/show-talent-podium-3d-retro-talent-show-podium-with-microphone-show-scene-stage-studio-or-room-vector.jpg',
      description: 'Showcase your talent and compete for amazing prizes. Open to all creative professionals.',
      price: 95000,
      rating: 4.9,
      features: ['Live Judging', 'Prizes', 'Networking', 'Media Coverage'],
      speakers: ['Celebrity Judges Panel'],
      status: 'upcoming',
      livestream: false
    },
    {
      id: 3,
      title: "The Patrons' Forum",
      category: 'networking',
      date: '2025-11-25',
      time: '6:00 PM - 9:00 PM EAT',
      location: 'Kampala, Uganda',
      organizer: 'The Patrons',
      image: 'https://cassette.sphdigital.com.sg/image/thepeak/8895ea9e31e92e0644e57b997d762a1a209a9cbf171f5f3a9aed2e210c6d6333?auto=compress&cs=tinysrgb&w=800',
      description: 'Recognition for Patrons contributions to the flourishing Arts.',
      price: 285000,
      rating: 4.7,
      features: ['Networking', 'Panel Discussion', 'Cocktails', 'Business Cards'],
      speakers: ['Dr. Maria Rodriguez', 'Jedi Martinez'],
      status: 'upcoming',
      livestream: false
    },
    {
      id: 4,
      title: 'Brand Ambassador Masterclass',
      category: 'business',
      date: '2025-10-28',
      time: '2:00 PM - 5:00 PM EAT',
      location: 'Virtual Event',
      organizer: 'Creative Arts Institute',
      image: 'https://images.pexels.com/photos/6285080/pexels-photo-6285080.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Learn the secrets of successful brand ambassadorship from industry experts.',
      price: 560000,
      rating: 4.9,
      features: ['Interactive Sessions', 'Case Studies', 'Q&A', 'Certificate'],
      speakers: ['Ruby Nesda', 'Maya Chen'],
      status: 'past',
      livestream: false
    },
    // Happening now event with livestream
    {
      id: 5,
      title: 'Live Concert - Dawn Fever',
      category: 'social',
      date: new Date().toISOString().split('T')[0],
      time: 'Now',
      location: 'Main Auditorium',
      organizer: 'LiveEvents Ltd',
      image: 'https://images.pexels.com/photos/1190299/pexels-photo-1190299.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Never miss a beat. Attend or stream as a premium subscriber or on VIP ticket.',
      price: 150000,
      rating: 4.9,
      features: ['Live Performance', 'Merch', 'Meet & Greet'],
      speakers: ['Headline Artist'],
      status: 'happening',
      livestream: true
    }
  ];

  // Provider marketplace for Organize tab
  const providers = [
    { id: 1, name: 'Grand Hall Venues', category: 'venue', rating: 4.8, price: 2000000, reviews: 124, expertise: 'Large events, conferences' },
    { id: 2, name: 'Elite Tents & Decor', category: 'decor', rating: 4.7, price: 450000, reviews: 78, expertise: 'Weddings, gala' },
    { id: 3, name: 'Prime Ushers', category: 'ushering', rating: 4.6, price: 120000, reviews: 46, expertise: 'Friendly, trained staff' },
    { id: 4, name: 'SoundWorks Ltd', category: 'audio', rating: 4.9, price: 600000, reviews: 98, expertise: 'PA systems, mixing' },
    { id: 5, name: 'CaterPro', category: 'catering', rating: 4.5, price: 350000, reviews: 65, expertise: 'Buffet, plated service' }
  ];

  const [providerQuery, setProviderQuery] = useState('');
  const [providerSort, setProviderSort] = useState('rating');
  const [selectedProviders, setSelectedProviders] = useState<{ providerId: number; qty: number; price: number }[]>([]);

  const addProviderToBudget = (prov: any) => {
    setSelectedProviders(prev => {
      const exists = prev.find(p => p.providerId === prov.id);
      if (exists) return prev.map(p => p.providerId === prov.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { providerId: prov.id, qty: 1, price: prov.price }];
    });
  };

  const removeProviderFromBudget = (provId: number) => {
    setSelectedProviders(prev => prev.filter(p => p.providerId !== provId));
  };

  const updateProviderQty = (provId: number, qty: number) => {
    setSelectedProviders(prev => prev.map(p => p.providerId === provId ? { ...p, qty: Math.max(1, qty) } : p));
  };

  const totalBudget = selectedProviders.reduce((sum, p) => sum + p.price * p.qty, 0);

  const filteredEvents = events.filter(event => {
    const matchesTab = activeTab === 'reservation'
      ? (event.status === 'upcoming' || event.status === 'happening')
      : activeTab === 'management'
      ? event.status === 'past'
      : true;

    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleRegister = (eventId: number) => {
    if (!user) {
      alert('Please sign up or sign in to register for events.');
      navigate('/signin');
      return;
    }
    // In this demo, registration is simulated client-side.
    alert('Reservation successful! You will receive a confirmation email shortly.');
  };

  const handleSubmitEvent = () => {
    if (!user) {
      alert('Please sign up or sign in to submit events.');
      navigate('/signin');
      return;
    }
    alert('Event submission feature coming soon! Contact our team for now.');
  };

  const tabs = [
    { id: 'reservation', label: 'Join', icon: <Users className="w-4 h-4" /> },
    { id: 'management', label: 'Organize', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'more', label: 'More', icon: <MoreHorizontal className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-white mb-2">Events</h1>
            <p className="text-gray-300">Do not miss early bird tickets. Share with your crew, get more vibes and rewards.</p>
          </div>
          
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 glass-effect p-2 rounded-xl overflow-x-auto whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-800">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {activeTab === 'reservation' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="glass-effect rounded-2xl overflow-hidden hover-lift">
              {/* Event Image */}
              <div className="relative h-64 md:h-56 lg:h-72 bg-gray-800 flex items-center justify-center overflow-hidden">
                <img src={event.image} alt={event.title} className="max-h-full max-w-full object-contain" />
                <div className="absolute top-4 left-4 hidden">
                  <span className="px-3 py-1 bg-rose-500 text-white text-sm font-medium rounded-full">
                    {event.category.toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{maskRating(event.rating)}</span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-200 text-sm">by {event.organizer}</p>
                  </div>
                  <div className="text-right">
                  </div>
                </div>

                <p className="text-gray-200 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Event Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-3 text-gray-200 text-sm">
                    <Calendar className="w-4 h-4 text-rose-400" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-200 text-sm">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-200 text-sm">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{event.location}</span>
                  </div>
                  {/* removed registered count per requirements */}
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {event.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-400/20 text-purple-300 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Speakers */}
                <div className="mb-4">
                  <h4 className="text-white text-sm font-medium mb-2">Speakers</h4>
                  <div className="text-gray-300 text-sm">
                    {event.speakers.join(', ')}
                  </div>
                </div>

                {/* Registration-style progress bar reinstated. Label changed to 'Happening in' and countdown shown where % used to be */}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">{event.status === 'happening' && event.livestream ? 'Happening' : 'Happening in'}</div>
                  <div className="text-sm font-semibold text-white">
                    <CountdownDisplay date={event.date} />
                  </div>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-purple-600"
                    style={{ width: `${Math.min(100, Math.max(6, (event.id * 23) % 100))}%` }}
                  />
                </div>
              </div>

                {/* Action Button + calendar/share */}
                <div>
                  {(event.status === 'upcoming' || event.status === 'reservation') ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="flex-1 h-12 flex items-center justify-center px-4 font-semibold rounded-xl transition-all bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:shadow-xl"
                        >
                          <Ticket className="w-5 h-5 mr-2 inline" />
                          Book Now
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleCalendar(event.id)}
                            className={`h-12 w-12 flex items-center justify-center rounded-xl ${calendarAdded[event.id] ? 'bg-rose-500 text-white' : 'glass-effect text-gray-300 hover:text-white'}`}
                            title={calendarAdded[event.id] ? 'Added to calendar' : 'Add to calendar'}
                          >
                            <Calendar className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleShare(event)}
                            className="h-12 w-12 flex items-center justify-center rounded-xl glass-effect text-gray-300 hover:text-white"
                            title="Share event"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : event.status === 'happening' ? (
                    <>
                      {event.livestream ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              if (!user) { alert('Please sign in to access livestream.'); navigate('/signin'); return; }
                              if ((user as any).tier === 'elite' || (user as any).tier === 'premium') {
                                alert('Connecting to livestream...');
                              } else {
                                alert('Livestream is a premium feature. Upgrade to access.');
                              }
                            }}
                            className="flex-1 h-12 flex items-center justify-center px-4 font-semibold rounded-xl transition-all bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:shadow-xl"
                          >
                            <Ticket className="w-5 h-5 mr-2 inline" />
                            Stream Now
                          </button>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleCalendar(event.id)}
                              className={`h-12 w-12 flex items-center justify-center rounded-xl ${calendarAdded[event.id] ? 'bg-rose-500 text-white' : 'glass-effect text-gray-300 hover:text-white'}`}
                              title={calendarAdded[event.id] ? 'Added to calendar' : 'Add to calendar'}
                            >
                              <Calendar className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleShare(event)}
                              className="h-12 w-12 flex items-center justify-center rounded-xl glass-effect text-gray-300 hover:text-white"
                              title="Share event"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="flex-1 py-3 bg-gray-600 text-gray-400 font-semibold rounded-xl cursor-not-allowed">
                          Happening Now
                        </button>
                      )}

                    </>
                  ) : (
                    <button className="flex-1 py-3 bg-gray-600 text-gray-400 font-semibold rounded-xl cursor-not-allowed">
                      Event Ended
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          // Organize tab: Provider marketplace and budget planner
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Providers list */}
            <div className="md:col-span-2 glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Event Services Directory</h3>
                <div className="flex items-center space-x-2">
                  <input
                    className="px-3 py-2 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-400"
                    placeholder="Search providers..."
                    value={providerQuery}
                    onChange={(e) => setProviderQuery(e.target.value)}
                  />
                  <select
                    value={providerSort}
                    onChange={(e) => setProviderSort(e.target.value)}
                    className="px-3 py-2 bg-transparent border border-white/10 rounded-lg text-white"
                  >
                    <option value="rating">Top rated</option>
                    <option value="price">Price (low)</option>
                    <option value="reviews">Most reviewed</option>
                  </select>

                  <button
                    onClick={() => alert('Submit an Event: please provide event details. This will be sent to our team to follow up.')}
                    className="ml-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit an Event</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {providers
                  .filter(p => p.name.toLowerCase().includes(providerQuery.toLowerCase()) || p.expertise.toLowerCase().includes(providerQuery.toLowerCase()))
                  .sort((a,b) => providerSort === 'price' ? a.price - b.price : providerSort === 'reviews' ? b.reviews - a.reviews : b.rating - a.rating)
                  .map(prov => (
                    <div key={prov.id} className="flex items-center justify-between p-4 bg-white/3 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{prov.name}</div>
                        <div className="text-sm text-gray-300">{prov.expertise}</div>
                        <div className="text-sm text-gray-400 mt-1">{prov.reviews} reviews • {prov.rating} ★</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-white font-semibold">UGX {prov.price.toLocaleString()}</div>
                        <button
                          onClick={() => addProviderToBudget(prov)}
                          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Budget summary */}
            <div className="glass-effect p-6 rounded-2xl">
              <h4 className="text-lg font-semibold text-white mb-4">Budget Planner</h4>
              {selectedProviders.length === 0 ? (
                <div className="text-gray-400">Add providers to build your budget. Totals update automatically.</div>
              ) : (
                <div className="space-y-3">
                  {selectedProviders.map(sp => {
                    const prov = providers.find(p => p.id === sp.providerId)!;
                    return (
                      <div key={sp.providerId} className="flex items-center justify-between bg-white/5 p-3 rounded">
                        <div>
                          <div className="text-white">{prov.name}</div>
                          <div className="text-sm text-gray-400">UGX {prov.price.toLocaleString()} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="number" value={sp.qty} min={1} onChange={(e)=> updateProviderQty(sp.providerId, Number(e.target.value))} className="w-16 text-center bg-transparent border border-white/10 rounded px-2 py-1 text-white" />
                          <div className="text-white">UGX {(prov.price * sp.qty).toLocaleString()}</div>
                          <button onClick={()=> removeProviderFromBudget(sp.providerId)} className="text-rose-400">Remove</button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-300">Subtotal</div>
                      <div className="text-white font-semibold">UGX {totalBudget.toLocaleString()}</div>
                    </div>
                    <button onClick={()=> alert('Booking providers is a demo. Integrate with backend to finalize.')} className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-semibold">Book Providers</button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-400">
                Tips: Sort by rating and compare providers. Use reviews and expertise to select the best fit for your event.
              </div>
            </div>
          </div>
        )}
        {activeTab === 'reservation' && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or check back later for new events.</p>
          </div>
        )}
      </div>
    </div>
  );
}
