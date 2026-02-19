import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Coffee,
  ShoppingBag,
  MapPin,
  Car,
  Phone,
  Stethoscope,
  GraduationCap,
  Home,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import ScriptText from '../components/common/ScriptText';
import Button from '../components/common/Button';
import { aiAPI } from '../services/api';

const MAX_MESSAGES = 5;

const TOPICS = [
  { id: 'cafe', label: 'At the Cafe', icon: Coffee, description: 'Order coffee and chat with the waiter', prompt: 'You are a friendly waiter at a Moroccan cafe. The student just sat down and you greet them warmly. Help them order a drink and make small talk.' },
  { id: 'souk', label: 'At the Souk', icon: ShoppingBag, description: 'Bargain for goods at the market', prompt: 'You are a shopkeeper at a Moroccan souk selling spices, clothes, and souvenirs. The student approaches your stand. Greet them and try to sell them something, be ready to bargain.' },
  { id: 'directions', label: 'Asking Directions', icon: MapPin, description: 'Find your way around the city', prompt: 'You are a friendly local Moroccan. The student approaches you on the street to ask for directions. Help them find their way, giving clear simple directions to a nearby landmark like the mosque, train station, or a restaurant.' },
  { id: 'taxi', label: 'Taxi Ride', icon: Car, description: 'Negotiate a taxi fare and chat', prompt: 'You are a taxi driver in Morocco. The student gets into your taxi. Ask them where they want to go, negotiate the fare, and have a friendly chat during the ride about the city.' },
  { id: 'phone', label: 'Phone Call', icon: Phone, description: 'Call a friend to make plans', prompt: 'You are a Moroccan friend of the student. They call you on the phone. Answer warmly and make plans together for the evening — maybe go out to eat, watch a football match, or visit someone.' },
  { id: 'pharmacy', label: 'At the Pharmacy', icon: Stethoscope, description: 'Explain symptoms and buy medicine', prompt: 'You are a pharmacist in Morocco. The student comes in feeling a bit sick (headache, cold, stomach ache). Ask them what is wrong and recommend something, keeping it simple and helpful.' },
  { id: 'school', label: 'At School', icon: GraduationCap, description: 'Chat with a classmate', prompt: 'You are a Moroccan classmate of the student at school or university. You bump into them between classes. Chat about studies, exams, what you did last weekend, and make plans to study together.' },
  { id: 'neighbor', label: 'Meeting a Neighbor', icon: Home, description: 'Greet and chat with your neighbor', prompt: 'You are the student\'s Moroccan neighbor. You run into them in the building stairway or outside. Greet them warmly, ask about their family, and share some neighborhood news or invite them for tea.' },
];

export default function Conversation() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const messagesEndRef = useRef(null);

  const conversationOver = messagesUsed >= MAX_MESSAGES;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendToAI = useCallback(async (text) => {
    setIsLoading(true);
    setCorrection(null);
    setSuggestions([]);

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'ai')
      .map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.role === 'ai' ? `${m.latin || ''} (${m.english || ''})` : m.text,
      }));

    try {
      const response = await aiAPI.sendOpenConversation({
        message: text,
        history,
        topic: selectedTopic.prompt,
      });

      const ai = response.data;

      setMessages((prev) => [...prev, {
        role: 'ai',
        arabic: ai.arabic,
        latin: ai.latin,
        english: ai.english,
      }]);

      if (ai.correction) {
        setCorrection(ai.correction);
      }

      const newSuggestions = ai.suggestions || [];
      if (messagesUsed + 1 >= MAX_MESSAGES) {
        setSuggestions([]);
      } else {
        setSuggestions(newSuggestions);
      }
    } catch (err) {
      console.error('Conversation error:', err);
      setMessages((prev) => [...prev, {
        role: 'ai',
        arabic: '',
        latin: 'Smeh liya, kayn mouchkil tekni.',
        english: 'Sorry, there was a technical problem.',
      }]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedTopic, messagesUsed]);

  const addUserMessage = useCallback((text) => {
    if (isLoading || conversationOver) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setMessagesUsed((prev) => prev + 1);
    sendToAI(text);
  }, [isLoading, conversationOver, sendToAI]);

  const handleSuggestionClick = (suggestion) => {
    const text = `${suggestion.latin} (${suggestion.english})`;
    addUserMessage(text);
  };

  const handleSend = () => {
    if (!userInput.trim() || isLoading) return;
    addUserMessage(userInput);
    setUserInput('');
  };

  const resetConversation = () => {
    setSelectedTopic(null);
    setMessages([]);
    setSuggestions([]);
    setUserInput('');
    setCorrection(null);
    setMessagesUsed(0);
  };

  // Topic picker
  if (!selectedTopic) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-dark">Conversation Practice</h1>
            <p className="text-dark-400 text-sm mt-1">
              Pick a topic and have a short conversation in Darija. You have {MAX_MESSAGES} messages per session.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOPICS.map((topic) => (
              <motion.button
                key={topic.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedTopic(topic)}
                className="bg-white rounded-2xl border border-sand-100 shadow-sm p-5 text-left hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                  <topic.icon size={20} className="text-teal-600" />
                </div>
                <p className="font-semibold text-dark text-sm">{topic.label}</p>
                <p className="text-xs text-dark-400 mt-1">{topic.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Chat interface
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={resetConversation}
            className="flex items-center gap-2 text-dark-400 hover:text-dark transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Change Topic</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-dark-300">
              {MAX_MESSAGES - messagesUsed} message{MAX_MESSAGES - messagesUsed !== 1 ? 's' : ''} left
            </span>
            <div className="flex gap-1">
              {Array.from({ length: MAX_MESSAGES }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < messagesUsed ? 'bg-teal-500' : 'bg-sand-200'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Topic banner */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl px-5 py-4 mb-4 text-white">
          <div className="flex items-center gap-3">
            <selectedTopic.icon size={24} />
            <div>
              <p className="font-bold">{selectedTopic.label}</p>
              <p className="text-sm opacity-80">{selectedTopic.description}</p>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="bg-white rounded-2xl border border-sand-100 shadow-sm">
          <div className="p-4 h-80 overflow-y-auto space-y-3">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Bot size={32} className="text-sand-300 mx-auto mb-2" />
                <p className="text-sm text-dark-400">Start the conversation! Say something in Darija.</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-teal-500 text-white rounded-br-md'
                      : 'bg-sand-50 border border-sand-100 rounded-bl-md'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div>
                      <ScriptText
                        arabic={msg.arabic}
                        latin={msg.latin}
                        className="text-sm font-medium text-dark"
                      />
                      <p className="text-xs mt-1 text-dark-300">{msg.english}</p>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-terracotta-500 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-sand-50 border border-sand-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 size={16} className="text-teal-500 animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Correction banner */}
          <AnimatePresence>
            {correction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-4 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2"
              >
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{correction}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          {suggestions.length > 0 && !isLoading && !conversationOver && (
            <div className="px-4 mb-3">
              <p className="text-xs text-dark-300 mb-2 font-medium">Suggested responses:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-sand-50 border border-sand-200 rounded-xl text-sm text-dark
                      hover:border-teal-300 hover:bg-teal-50 transition-colors text-left
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ScriptText arabic={suggestion.arabic} latin={suggestion.latin} className="font-medium text-xs" />
                    <p className="text-xs text-dark-300 mt-0.5">{suggestion.english}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input / Conversation over */}
          <div className="border-t border-sand-100 p-4">
            {conversationOver ? (
              <div className="text-center">
                <p className="text-sm text-dark-400 mb-3">Conversation complete!</p>
                <Button variant="primary" onClick={resetConversation} size="sm">
                  <RefreshCw size={14} className="mr-2" />
                  New Conversation
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type in Darija..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!userInput.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-teal-500 text-white hover:bg-teal-600
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
