import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Image as ImageIcon,
  Send,
  Camera,
  Sparkles,
  User,
  Heart,
  Calendar,
  MapPin,
  Star,
  Reply,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Memory {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  content: string;
  highlights: string[];
  photos: string[];
  rating: number;
  timestamp: string;
  likes: number;
}

interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: string;
  eventTitle?: string;
  parentId?: string;
  replies?: ChatMessage[];
}

export default function MemoriesTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'journal' | 'chat'>('journal');
  const [newMessage, setNewMessage] = useState('');
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [memoryForm, setMemoryForm] = useState({
    eventTitle: '',
    content: '',
    highlights: '',
    rating: 5,
  });

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      eventTitle: 'Brand Ambassador Masterclass',
      eventDate: '2025-10-28',
      eventLocation: 'Virtual Event',
      userName: 'Sarah Johnson',
      content: 'What an incredible experience! The masterclass exceeded all my expectations. The insights shared by Ruby Nesda and Maya Chen were invaluable. I learned so much about building authentic relationships with brands and creating compelling content that resonates.',
      highlights: [
        'Outstanding presentation techniques',
        'Practical case studies',
        'Excellent networking opportunities',
        'Professional Q&A session'
      ],
      photos: [],
      rating: 5,
      timestamp: '2025-10-29T10:30:00Z',
      likes: 24,
    },
    {
      id: '2',
      eventTitle: 'Brand Ambassador Masterclass',
      eventDate: '2025-10-28',
      eventLocation: 'Virtual Event',
      userName: 'Michael Torres',
      content: 'Highly recommend this masterclass! The interactive sessions made complex concepts easy to understand. Ruby\'s real-world examples were particularly helpful. Already implementing the strategies I learned.',
      highlights: [
        'Clear and engaging delivery',
        'Actionable takeaways',
        'Great value for money'
      ],
      photos: [],
      rating: 5,
      timestamp: '2025-10-29T14:15:00Z',
      likes: 18,
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userName: 'Emma Wilson',
      message: 'Just attended the Brand Ambassador Masterclass - absolutely blown away! Anyone else there?',
      timestamp: '2025-10-29T09:00:00Z',
      eventTitle: 'Brand Ambassador Masterclass',
      replies: [
        {
          id: '1-1',
          userName: 'James Carter',
          message: 'Yes! The case studies were amazing. Really helped me understand the industry better.',
          timestamp: '2025-10-29T09:15:00Z',
        },
        {
          id: '1-2',
          userName: 'Lisa Park',
          message: 'Agreed! Ruby Nesda\'s insights were invaluable. Already implementing some strategies.',
          timestamp: '2025-10-29T09:30:00Z',
        },
      ],
    },
    {
      id: '2',
      userName: 'David Chen',
      message: 'Can\'t wait for the Advertising Summit next month! Who else is going?',
      timestamp: '2025-10-29T11:00:00Z',
      eventTitle: 'The Advertising Summit',
      replies: [],
    },
    {
      id: '3',
      userName: 'Sophie Martinez',
      message: 'The Talent Show registrations are open! Don\'t miss out on this opportunity to showcase your skills.',
      timestamp: '2025-10-29T13:00:00Z',
      eventTitle: 'Talent Show',
      replies: [
        {
          id: '3-1',
          userName: 'Alex Kim',
          message: 'Already registered! Super excited to perform!',
          timestamp: '2025-10-29T13:20:00Z',
        },
      ],
    },
  ]);

  const pastEvents = [
    { id: '4', title: 'Brand Ambassador Masterclass', date: '2025-10-28' },
  ];

  const handlePostMemory = () => {
    if (!user) {
      alert('Please sign in to share memories.');
      navigate('/signin');
      return;
    }

    if (!memoryForm.eventTitle || !memoryForm.content) {
      alert('Please select an event and write your memory.');
      return;
    }

    const highlightsArray = memoryForm.highlights
      .split('\n')
      .filter((h) => h.trim())
      .map((h) => h.trim());

    const newMemory: Memory = {
      id: Date.now().toString(),
      eventTitle: memoryForm.eventTitle,
      eventDate: '2025-10-28',
      eventLocation: 'Virtual Event',
      userName: user.email?.split('@')[0] || 'Anonymous',
      content: memoryForm.content,
      highlights: highlightsArray,
      photos: [],
      rating: memoryForm.rating,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setMemories([newMemory, ...memories]);
    setMemoryForm({ eventTitle: '', content: '', highlights: '', rating: 5 });
    setShowMemoryForm(false);
    alert('Memory posted successfully!');
  };

  const handleSendMessage = (parentId?: string) => {
    if (!user) {
      alert('Please sign in to chat.');
      navigate('/signin');
      return;
    }

    if (!newMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userName: user.email?.split('@')[0] || 'Anonymous',
      message: newMessage,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    if (parentId) {
      setChatMessages(chatMessages.map(msg => {
        if (msg.id === parentId) {
          return {
            ...msg,
            replies: [...(msg.replies || []), newMsg],
          };
        }
        return msg;
      }));
      setReplyingTo(null);
    } else {
      setChatMessages([...chatMessages, newMsg]);
    }

    setNewMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

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
              className="px-6 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Share Memory</span>
            </button>
          )}
        </div>

        {showMemoryForm && (
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Share Your Event Memory</h3>
              <button
                onClick={() => setShowMemoryForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Select Event *</label>
                <select
                  value={memoryForm.eventTitle}
                  onChange={(e) => setMemoryForm({ ...memoryForm, eventTitle: e.target.value })}
                  className="w-full px-4 py-3 glass-effect rounded-xl border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-rose-400"
                >
                  <option value="" className="bg-gray-800">
                    Choose an event...
                  </option>
                  {pastEvents.map((event) => (
                    <option key={event.id} value={event.title} className="bg-gray-800">
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Post Memory
                </button>
                <button
                  onClick={() => {
                    setShowMemoryForm(false);
                    setMemoryForm({ eventTitle: '', content: '', highlights: '', rating: 5 });
                  }}
                  className="px-6 py-3 glass-effect text-gray-300 rounded-lg hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView('journal')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeView === 'journal'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white'
                : 'glass-effect text-gray-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Memory Journal</span>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeView === 'chat'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white'
                : 'glass-effect text-gray-300 hover:text-white'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Community Chat</span>
          </button>
        </div>
      </div>

      {activeView === 'journal' ? (
        <div className="space-y-6">
          {memories.length > 0 ? (
            memories.map((memory) => (
              <div key={memory.id} className="glass-effect p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{memory.userName}</h3>
                      <p className="text-gray-400 text-sm">{formatTimestamp(memory.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < memory.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4 p-3 bg-white/5 rounded-xl">
                  <Calendar className="w-5 h-5 text-rose-400" />
                  <div>
                    <h4 className="text-white font-medium">{memory.eventTitle}</h4>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <span>{new Date(memory.eventDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{memory.eventLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

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
                    <span className="text-sm">{memory.likes > 0 ? memory.likes : 'Like'}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors">
                    <MessageCircle className="w-5 h-5" />
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
            {chatMessages.length > 0 ? (
              chatMessages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">{message.userName}</span>
                        <span className="text-gray-500 text-xs">{formatTimestamp(message.timestamp)}</span>
                        {message.eventTitle && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                            {message.eventTitle}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{message.message}</p>
                      <button
                        onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                        className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 text-xs transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Reply</span>
                      </button>

                      {message.replies && message.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-white/10">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-white font-medium text-xs">{reply.userName}</span>
                                  <span className="text-gray-500 text-xs">{formatTimestamp(reply.timestamp)}</span>
                                </div>
                                <p className="text-gray-300 text-xs">{reply.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyingTo === message.id && (
                        <div className="mt-3 flex items-center space-x-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(message.id)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 glass-effect rounded-lg border border-white/20 text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={() => handleSendMessage(message.id)}
                            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setNewMessage('');
                            }}
                            className="px-4 py-2 glass-effect text-gray-300 rounded-lg hover:text-white transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
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
                onKeyPress={(e) => e.key === 'Enter' && !replyingTo && handleSendMessage()}
                placeholder="Share your thoughts about the event..."
                className="flex-1 px-4 py-3 glass-effect rounded-xl border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
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
