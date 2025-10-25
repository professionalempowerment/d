import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Image as ImageIcon,
  Star,
  Calendar,
  MapPin,
  Send,
  Heart,
  MessageSquare,
  Filter,
  Camera,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, type Event, type EventMemory, type MemoryChat } from '../lib/supabase';

export default function MemoriesTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'journal' | 'chat'>('journal');
  const [memories, setMemories] = useState<(EventMemory & { event?: Event })[]>([]);
  const [chatMessages, setChatMessages] = useState<MemoryChat[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [memoryForm, setMemoryForm] = useState({
    event_id: '',
    content: '',
    highlights: '',
    rating: 5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [memoriesResult, eventsResult, chatResult] = await Promise.all([
        supabase
          .from('event_memories')
          .select('*, event:events(*)')
          .order('created_at', { ascending: false }),
        supabase.from('events').select('*').eq('status', 'past').order('date', { ascending: false }),
        supabase
          .from('memory_chat')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (memoriesResult.data) {
        setMemories(
          memoriesResult.data.map((m: any) => ({
            ...m,
            event: Array.isArray(m.event) ? m.event[0] : m.event,
          }))
        );
      }
      if (eventsResult.data) setPastEvents(eventsResult.data);
      if (chatResult.data) setChatMessages(chatResult.data);
    } catch (error) {
      console.error('Error fetching memories data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostMemory = async () => {
    if (!user) {
      alert('Please sign in to post memories.');
      navigate('/signin');
      return;
    }

    if (!memoryForm.event_id || !memoryForm.content) {
      alert('Please select an event and write your memory.');
      return;
    }

    try {
      const highlightsArray = memoryForm.highlights
        .split('\n')
        .filter((h) => h.trim())
        .map((h) => h.trim());

      const { error } = await supabase.from('event_memories').insert({
        event_id: memoryForm.event_id,
        user_id: user.id,
        content: memoryForm.content,
        highlights: highlightsArray,
        rating: memoryForm.rating,
        photos: [],
      });

      if (error) throw error;

      alert('Memory posted successfully!');
      setMemoryForm({ event_id: '', content: '', highlights: '', rating: 5 });
      setShowMemoryForm(false);
      fetchData();
    } catch (error) {
      console.error('Error posting memory:', error);
      alert('Failed to post memory. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      alert('Please sign in to chat.');
      navigate('/signin');
      return;
    }

    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('memory_chat').insert({
        user_id: user.id,
        message: newMessage,
        event_id: selectedEvent !== 'all' ? selectedEvent : null,
      });

      if (error) throw error;

      setNewMessage('');
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const filteredMemories =
    selectedEvent === 'all' ? memories : memories.filter((m) => m.event_id === selectedEvent);

  const filteredMessages =
    selectedEvent === 'all'
      ? chatMessages
      : chatMessages.filter((m) => m.event_id === selectedEvent || !m.event_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-300">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-rose-400" />
              <span>Event Memories</span>
            </h2>
            <p className="text-gray-300 text-sm">
              Share your experiences, highlights, and photos. Connect with others who attended the same events.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowMemoryForm(!showMemoryForm)}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Share Memory</span>
            </button>
          )}
        </div>

        {showMemoryForm && (
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4">Share Your Event Memory</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Select Event *</label>
                <select
                  value={memoryForm.event_id}
                  onChange={(e) => setMemoryForm({ ...memoryForm, event_id: e.target.value })}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400"
                >
                  <option value="" className="bg-gray-800">
                    Choose an event...
                  </option>
                  {pastEvents.map((event) => (
                    <option key={event.id} value={event.id} className="bg-gray-800">
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Your Experience *</label>
                <textarea
                  value={memoryForm.content}
                  onChange={(e) => setMemoryForm({ ...memoryForm, content: e.target.value })}
                  placeholder="Share your thoughts, experiences, and memorable moments..."
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-400 resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Key Highlights (one per line)</label>
                <textarea
                  value={memoryForm.highlights}
                  onChange={(e) => setMemoryForm({ ...memoryForm, highlights: e.target.value })}
                  placeholder="Amazing keynote speech&#10;Great networking opportunities&#10;Delicious catering"
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-400 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Your Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMemoryForm({ ...memoryForm, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= memoryForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handlePostMemory}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  Post Memory
                </button>
                <button
                  onClick={() => {
                    setShowMemoryForm(false);
                    setMemoryForm({ event_id: '', content: '', highlights: '', rating: 5 });
                  }}
                  className="px-6 py-3 glass-effect text-gray-300 rounded-xl hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveView('journal')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeView === 'journal'
                ? 'bg-gradient-to-r from-rose-500 to-blue-600 text-white'
                : 'glass-effect text-gray-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Memory Journal</span>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeView === 'chat'
                ? 'bg-gradient-to-r from-rose-500 to-blue-600 text-white'
                : 'glass-effect text-gray-300 hover:text-white'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Community Chat</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400"
            >
              <option value="all" className="bg-gray-800">
                All Events
              </option>
              {pastEvents.map((event) => (
                <option key={event.id} value={event.id} className="bg-gray-800">
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeView === 'journal' ? (
        <div className="space-y-6">
          {filteredMemories.length > 0 ? (
            filteredMemories.map((memory) => (
              <div key={memory.id} className="glass-effect p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Anonymous User</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(memory.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {memory.rating && (
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < memory.rating! ? 'text-yellow-400 fill-current' : 'text-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {memory.event && (
                  <div className="flex items-center space-x-4 mb-4 p-3 bg-white/5 rounded-xl">
                    <Calendar className="w-5 h-5 text-rose-400" />
                    <div>
                      <h4 className="text-white font-medium">{memory.event.title}</h4>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <span>{new Date(memory.event.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{memory.event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-300 mb-4 leading-relaxed">{memory.content}</p>

                {memory.highlights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      <span>Highlights</span>
                    </h4>
                    <ul className="space-y-2">
                      {memory.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-300">
                          <span className="text-rose-400 mt-1">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-rose-400 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm">Comment</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 glass-effect rounded-2xl">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Memories Yet</h3>
              <p className="text-gray-400">
                {user
                  ? 'Be the first to share memories from past events!'
                  : 'Sign in to share your event memories.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-effect rounded-2xl overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium text-sm">Anonymous User</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(message.created_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{message.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share your thoughts about the event..."
                className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
