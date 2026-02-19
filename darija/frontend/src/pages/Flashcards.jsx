import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Layers,
  BookOpen,
  Users,
  Shuffle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import ScriptText from '../components/common/ScriptText';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { flashcardsAPI } from '../services/api';

const TABS = [
  { id: 'deck', label: 'My Deck', icon: Layers },
  { id: 'review', label: 'Review', icon: BookOpen },
  { id: 'explore', label: 'Explore', icon: Users },
];

export default function Flashcards() {
  const [activeTab, setActiveTab] = useState('deck');
  const [cards, setCards] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIds, setCopiedIds] = useState(new Set());

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ front_arabic: '', front_latin: '', back: '' });
  const [isCreating, setIsCreating] = useState(false);

  const loadMyDeck = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await flashcardsAPI.getMyDeck();
      setCards(res.data);
    } catch (err) {
      console.error('Failed to load deck:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await flashcardsAPI.getSuggestions();
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, []);

  const loadDecks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await flashcardsAPI.explore();
      setDecks(res.data);
    } catch (err) {
      console.error('Failed to load decks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyDeck();
  }, [loadMyDeck]);

  useEffect(() => {
    if (activeTab === 'explore') {
      loadDecks();
      loadSuggestions();
    }
  }, [activeTab, loadDecks, loadSuggestions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.front_latin.trim() || !formData.back.trim()) return;
    setIsCreating(true);
    try {
      const res = await flashcardsAPI.create(formData);
      setCards((prev) => [res.data, ...prev]);
      setFormData({ front_arabic: '', front_latin: '', back: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create flashcard:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await flashcardsAPI.delete(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
    }
  };

  const handleCopy = async (id) => {
    try {
      const res = await flashcardsAPI.copy(id);
      setCards((prev) => [res.data, ...prev]);
      setCopiedIds((prev) => new Set([...prev, id]));
    } catch (err) {
      console.error('Failed to copy flashcard:', err);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-dark">Flash Cards</h1>
          <p className="text-dark-400 text-sm mt-1">
            Build your personal deck, review, and discover cards from other learners.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-sand-100 rounded-xl p-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-dark-400 hover:text-dark'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'deck' && (
          <DeckTab
            cards={cards}
            showForm={showForm}
            setShowForm={setShowForm}
            formData={formData}
            setFormData={setFormData}
            isCreating={isCreating}
            isLoading={isLoading}
            onSubmit={handleCreate}
            onDelete={handleDelete}
          />
        )}
        {activeTab === 'review' && (
          <ReviewTab cards={cards} isLoading={isLoading} />
        )}
        {activeTab === 'explore' && (
          <ExploreTab
            suggestions={suggestions}
            decks={decks}
            isLoading={isLoading}
            copiedIds={copiedIds}
            onCopy={handleCopy}
            onRefreshSuggestions={loadSuggestions}
          />
        )}
      </div>
    </AppLayout>
  );
}


/* ── My Deck Tab ────────────────────────────────────────────── */

function DeckTab({ cards, showForm, setShowForm, formData, setFormData, isCreating, isLoading, onSubmit, onDelete }) {
  return (
    <div>
      {/* Create button / form */}
      {!showForm ? (
        <Button variant="primary" onClick={() => setShowForm(true)} className="mb-6">
          <Plus size={18} className="mr-2" />
          Create Card
        </Button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-sand-100 shadow-sm p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark">New Flashcard</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-dark-300 hover:text-dark">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Darija (Arabic script)</label>
              <input
                type="text"
                value={formData.front_arabic}
                onChange={(e) => setFormData({ ...formData, front_arabic: e.target.value })}
                placeholder="e.g. كيف داير"
                className="w-full px-4 py-2.5 rounded-xl border border-sand-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30 text-sm"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Darija (Romanized) *</label>
              <input
                type="text"
                value={formData.front_latin}
                onChange={(e) => setFormData({ ...formData, front_latin: e.target.value })}
                placeholder="e.g. kif dayer"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-sand-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">English *</label>
              <input
                type="text"
                value={formData.back}
                onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                placeholder="e.g. How are you doing?"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-sand-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary" size="sm" loading={isCreating}>
              Add Card
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.form>
      )}

      {/* Card list */}
      {isLoading ? (
        <LoadingSpinner text="Loading your deck..." />
      ) : cards.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={48} className="text-sand-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dark mb-2">No cards yet</h3>
          <p className="text-dark-400 text-sm">Create your first flashcard to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-dark-300 font-medium mb-3">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-xl border border-sand-100 shadow-sm px-5 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <ScriptText
                  arabic={card.front_arabic}
                  latin={card.front_latin}
                  className="font-semibold text-dark text-sm"
                />
                <p className="text-xs text-dark-400 mt-0.5 truncate">{card.back}</p>
              </div>
              <button
                onClick={() => onDelete(card.id)}
                className="p-2 rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ── Review Tab ─────────────────────────────────────────────── */

function ReviewTab({ cards, isLoading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [studyAgain, setStudyAgain] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);

  const startReview = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(0);
    setStudyAgain(0);
    setReviewComplete(false);
  }, [cards]);

  useEffect(() => {
    if (cards.length > 0 && shuffledCards.length === 0) {
      startReview();
    }
  }, [cards, shuffledCards.length, startReview]);

  const advance = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    } else {
      setReviewComplete(true);
    }
  }, [currentIndex, shuffledCards.length]);

  const handleKnow = () => {
    setKnown((prev) => prev + 1);
    advance();
  };

  const handleStudyAgain = () => {
    setStudyAgain((prev) => prev + 1);
    advance();
  };

  if (isLoading) return <LoadingSpinner text="Loading cards..." />;

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen size={48} className="text-sand-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-dark mb-2">No cards to review</h3>
        <p className="text-dark-400 text-sm">Add some cards to your deck first.</p>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-sand-100 p-8 max-w-sm mx-auto">
          <div className="text-5xl mb-4">
            {known >= shuffledCards.length * 0.8 ? '🎉' : known >= shuffledCards.length * 0.5 ? '👍' : '📚'}
          </div>
          <h3 className="text-xl font-bold text-dark mb-4">Review Complete!</h3>
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{known}</p>
              <p className="text-sm text-dark-300">Known</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-terracotta-500">{studyAgain}</p>
              <p className="text-sm text-dark-300">Study Again</p>
            </div>
          </div>
          <Button variant="primary" onClick={startReview} fullWidth>
            <RotateCcw size={16} className="mr-2" />
            Review Again
          </Button>
        </div>
      </motion.div>
    );
  }

  const card = shuffledCards[currentIndex];
  if (!card) return null;

  return (
    <div>
      {/* Progress */}
      <div className="text-center mb-4">
        <p className="text-sm text-dark-300">
          Card {currentIndex + 1} of {shuffledCards.length}
        </p>
        <div className="flex gap-1 mt-2 max-w-xs mx-auto">
          {shuffledCards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentIndex ? 'bg-teal-500' : i === currentIndex ? 'bg-teal-300' : 'bg-sand-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center mb-8">
        <motion.div
          onClick={() => setFlipped(!flipped)}
          className="relative w-80 h-48 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={flipped ? 'back' : 'front'}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 ${
                flipped
                  ? 'bg-gradient-to-br from-gold-300 to-gold-400 text-dark'
                  : 'bg-gradient-to-br from-teal-500 to-teal-400 text-white'
              }`}
            >
              {flipped ? (
                <>
                  <p className="text-sm opacity-70 mb-2">English</p>
                  <p className="text-2xl font-bold text-center">{card.back}</p>
                </>
              ) : (
                <>
                  <p className="text-sm opacity-70 mb-2">Darija</p>
                  <ScriptText
                    arabic={card.front_arabic}
                    latin={card.front_latin}
                    className="text-2xl font-bold text-center"
                  />
                </>
              )}
              <p className="text-xs mt-3 opacity-60">Tap to flip</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStudyAgain}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-terracotta-50 hover:bg-terracotta-100 transition-colors"
        >
          <ThumbsDown size={28} className="text-terracotta-500" />
          <span className="text-xs font-medium text-terracotta-500">Study Again</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFlipped(!flipped)}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-sand-100 hover:bg-sand-200 transition-colors"
        >
          <RotateCcw size={28} className="text-dark-400" />
          <span className="text-xs font-medium text-dark-400">Flip</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleKnow}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors"
        >
          <ThumbsUp size={28} className="text-green-500" />
          <span className="text-xs font-medium text-green-500">Know It</span>
        </motion.button>
      </div>
    </div>
  );
}


/* ── Explore Tab ────────────────────────────────────────────── */

function ExploreTab({ suggestions, decks, isLoading, copiedIds, onCopy, onRefreshSuggestions }) {
  const [expandedDeck, setExpandedDeck] = useState(null);

  return (
    <div>
      {/* Random Suggestions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-dark">Random Suggestions</h3>
          <button
            onClick={onRefreshSuggestions}
            className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            <Shuffle size={14} />
            Shuffle
          </button>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-dark-400 py-4 text-center">No suggestions available yet.</p>
        ) : (
          <div className="grid gap-2">
            {suggestions.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-sand-100 shadow-sm px-5 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <ScriptText
                    arabic={card.front_arabic}
                    latin={card.front_latin}
                    className="font-semibold text-dark text-sm"
                  />
                  <p className="text-xs text-dark-400 mt-0.5">{card.back}</p>
                  <p className="text-xs text-dark-300 mt-0.5">by {card.owner_name}</p>
                </div>
                <button
                  onClick={() => onCopy(card.id)}
                  disabled={copiedIds.has(card.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copiedIds.has(card.id)
                      ? 'bg-green-50 text-green-600'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                  }`}
                >
                  {copiedIds.has(card.id) ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIds.has(card.id) ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other Students' Decks */}
      <div>
        <h3 className="font-bold text-dark mb-3">Other Learners' Decks</h3>
        {isLoading ? (
          <LoadingSpinner text="Loading decks..." />
        ) : decks.length === 0 ? (
          <p className="text-sm text-dark-400 py-4 text-center">No public decks available yet.</p>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => (
              <div key={deck.user_id} className="bg-white rounded-xl border border-sand-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedDeck(expandedDeck === deck.user_id ? null : deck.user_id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-sand-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                      {deck.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-dark text-sm">{deck.display_name}</p>
                      <p className="text-xs text-dark-300">{deck.card_count} card{deck.card_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {expandedDeck === deck.user_id ? (
                    <ChevronUp size={18} className="text-dark-300" />
                  ) : (
                    <ChevronDown size={18} className="text-dark-300" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedDeck === deck.user_id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-sand-100"
                    >
                      <div className="p-3 space-y-1.5">
                        {deck.cards.map((card) => (
                          <div
                            key={card.id}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-sand-50"
                          >
                            <div className="flex-1 min-w-0">
                              <ScriptText
                                arabic={card.front_arabic}
                                latin={card.front_latin}
                                className="font-medium text-dark text-xs"
                              />
                              <p className="text-xs text-dark-400 truncate">{card.back}</p>
                            </div>
                            <button
                              onClick={() => onCopy(card.id)}
                              disabled={copiedIds.has(card.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
                                copiedIds.has(card.id)
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                              }`}
                            >
                              {copiedIds.has(card.id) ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
