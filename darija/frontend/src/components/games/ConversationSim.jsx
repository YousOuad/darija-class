import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';
import { aiAPI } from '../../services/api';

const MOCK_CONVERSATION = {
  context: 'You are at a Moroccan cafe ordering tea.',
  messages: [
    {
      role: 'ai',
      arabic: 'مرحبا! أهلا وسهلا فالقهوة ديالنا. شنو بغيتي تشرب؟',
      latin: 'Merhba! Ahlan w sahlan f l9ahwa dyalna. Chnou bghiti tchrob?',
      english: 'Welcome! What would you like to drink?',
    },
  ],
  suggestions: [
    { arabic: 'بغيت أتاي عافاك', latin: 'Bghit atay 3afak', english: 'I want tea please' },
    { arabic: 'واش عندكم قهوة نص نص؟', latin: 'Wach 3ndkom qahwa noss noss?', english: 'Do you have half-half coffee?' },
    { arabic: 'عطيني الما عافاك', latin: '3tini lma 3afak', english: 'Give me water please' },
  ],
};

const AI_RESPONSES = [
  {
    arabic: 'واخا! أتاي بالنعناع ولا بلا نعناع؟',
    latin: 'Wakha! Atay b na3na3 wla bla na3na3?',
    english: 'Okay! Mint tea or without mint?',
    nextSuggestions: [
      { arabic: 'بالنعناع عافاك', latin: 'B na3na3 3afak', english: 'With mint please' },
      { arabic: 'بلا نعناع', latin: 'Bla na3na3', english: 'Without mint' },
    ],
  },
  {
    arabic: 'مزيان بزاف! غادي نجيبها ليك دابا. بغيتي شي حاجة تاكلها مع الأتاي؟',
    latin: 'Mezyan bzzaf! Ghadi njibha lik daba. Bghiti chi haja takelha m3a latay?',
    english: 'Very good! I will bring it right away. Would you like something to eat with the tea?',
    nextSuggestions: [
      { arabic: 'إيه، عندكم مسمن؟', latin: 'Iyeh, 3ndkom msemen?', english: 'Yes, do you have msemen?' },
      { arabic: 'لا شكرا، غير الأتاي', latin: 'La choukran, ghir latay', english: 'No thanks, just tea' },
    ],
  },
  {
    arabic: 'تفضل! بالصحة والراحة!',
    latin: 'Tfddal! Bsseha w rraha!',
    english: 'Here you go! Enjoy! (Health and comfort)',
    nextSuggestions: [],
  },
];

export default function ConversationSim({ data, onComplete }) {
  const convo = MOCK_CONVERSATION;
  const [messages, setMessages] = useState(convo.messages);
  const [suggestions, setSuggestions] = useState(convo.suggestions);
  const [userInput, setUserInput] = useState('');
  const [responseIndex, setResponseIndex] = useState(0);
  const [conversationOver, setConversationOver] = useState(false);
  const [messagesExchanged, setMessagesExchanged] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setMessagesExchanged((prev) => prev + 1);

    // Simulate AI response
    setTimeout(() => {
      if (responseIndex < AI_RESPONSES.length) {
        const aiResponse = AI_RESPONSES[responseIndex];
        setMessages((prev) => [...prev, {
          role: 'ai',
          arabic: aiResponse.arabic,
          latin: aiResponse.latin,
          english: aiResponse.english,
        }]);
        setSuggestions(aiResponse.nextSuggestions || []);
        setResponseIndex((prev) => prev + 1);
        if (!aiResponse.nextSuggestions?.length) {
          setConversationOver(true);
        }
      }
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    const text = suggestion.english;
    addUserMessage(text);
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    addUserMessage(userInput);
    setUserInput('');
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: true, score: messagesExchanged, total: messagesExchanged, bonus: 30 });
    }
  };

  return (
    <GameWrapper
      title="Conversation Practice"
      score={messagesExchanged}
      maxScore={AI_RESPONSES.length}
      gameComplete={conversationOver}
      onNext={handleComplete}
    >
      {/* Context */}
      <div className="bg-gold-300/20 rounded-lg px-4 py-2 mb-4">
        <p className="text-sm text-dark-400">
          <strong>Scenario:</strong> {convo.context}
        </p>
      </div>

      {/* Chat messages */}
      <div className="bg-sand-50 rounded-xl p-4 mb-4 h-72 overflow-y-auto space-y-3">
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
              className={`
                max-w-[75%] rounded-2xl px-4 py-2.5
                ${msg.role === 'user'
                  ? 'bg-teal-500 text-white rounded-br-md'
                  : 'bg-white shadow-sm border border-sand-100 rounded-bl-md'
                }
              `}
            >
              {msg.role === 'ai' ? (
                <div>
                  <ScriptText
                    arabic={msg.arabic}
                    latin={msg.latin}
                    className={`text-sm font-medium ${msg.role === 'user' ? 'text-white' : 'text-dark'}`}
                  />
                  <p className="text-xs mt-1 opacity-60">{msg.english}</p>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-dark-300 mb-2 font-medium">Suggested responses:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 bg-white border border-sand-200 rounded-xl text-sm text-dark
                  hover:border-teal-300 hover:bg-teal-50 transition-colors text-left"
              >
                <ScriptText arabic={suggestion.arabic} latin={suggestion.latin} className="font-medium text-xs" />
                <p className="text-xs text-dark-300 mt-0.5">{suggestion.english}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      {!conversationOver && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-sand-200
              focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
              text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!userInput.trim()}
            className="p-2.5 rounded-xl bg-teal-500 text-white hover:bg-teal-600
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </motion.button>
        </div>
      )}
    </GameWrapper>
  );
}
