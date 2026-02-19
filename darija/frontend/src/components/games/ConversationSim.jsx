import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';
import { aiAPI } from '../../services/api';

const MAX_EXCHANGES = 8;

export default function ConversationSim({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <GameWrapper
        title="Conversation Practice"
        score={0}
        maxScore={0}
        gameComplete
        onNext={() => onComplete?.({ correct: false, score: 0, total: 0 })}
      >
        <div className="text-center py-8">
          <p className="text-dark-400">No game data available.</p>
        </div>
      </GameWrapper>
    );
  }

  const convo = data?.context ? data : {};
  const [messages, setMessages] = useState(convo.messages || []);
  const [suggestions, setSuggestions] = useState(convo.suggestions || []);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationOver, setConversationOver] = useState(false);
  const [messagesExchanged, setMessagesExchanged] = useState(0);
  const [correction, setCorrection] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendToAI = useCallback(async (text) => {
    setIsLoading(true);
    setCorrection(null);
    setSuggestions([]);

    // Build conversation history for the API
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'ai')
      .map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.role === 'ai'
          ? `${m.latin || ''} (${m.english || ''})`
          : m.text,
      }));

    try {
      const response = await aiAPI.sendConversation({
        message: text,
        history,
        scenario: convo.scenario || {
          context: convo.context,
          scenario_prompt: convo.scenario_prompt,
          target_vocabulary: convo.target_vocabulary,
        },
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
      setSuggestions(newSuggestions);

      if (newSuggestions.length === 0 || messagesExchanged + 1 >= MAX_EXCHANGES) {
        setConversationOver(true);
      }
    } catch (err) {
      console.error('AI conversation error:', err);
      setMessages((prev) => [...prev, {
        role: 'ai',
        arabic: '',
        latin: 'Smeh liya, kayn mouchkil tekni.',
        english: 'Sorry, there was a technical problem. Please try again.',
      }]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, convo, messagesExchanged]);

  const addUserMessage = useCallback((text) => {
    if (isLoading || conversationOver) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setMessagesExchanged((prev) => prev + 1);
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

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: true, score: messagesExchanged, total: messagesExchanged, bonus: 30 });
    }
  };

  return (
    <GameWrapper
      title="Conversation Practice"
      score={messagesExchanged}
      maxScore={MAX_EXCHANGES}
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
                    className="text-sm font-medium text-dark"
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

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white shadow-sm border border-sand-100 rounded-2xl rounded-bl-md px-4 py-3">
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
            className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2"
          >
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">{correction}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className="mb-4">
          <p className="text-xs text-dark-300 mb-2 font-medium">Suggested responses:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="px-3 py-2 bg-white border border-sand-200 rounded-xl text-sm text-dark
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

      {/* Text input */}
      {!conversationOver && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response in Darija..."
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
    </GameWrapper>
  );
}
