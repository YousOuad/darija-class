import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Flame, Home, GraduationCap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MultipleChoice from '../components/games/MultipleChoice';
import WordMatch from '../components/games/WordMatch';
import FillInBlank from '../components/games/FillInBlank';
import SentenceBuilder from '../components/games/SentenceBuilder';
import FlashcardSprint from '../components/games/FlashcardSprint';
import CulturalQuiz from '../components/games/CulturalQuiz';
import WordScramble from '../components/games/WordScramble';
import MemoryMatch from '../components/games/MemoryMatch';
import ConversationSim from '../components/games/ConversationSim';
import StoryGapFill from '../components/games/StoryGapFill';
import useGameStore from '../store/gameStore';
import useProgressStore from '../store/progressStore';

const gameComponents = {
  multiple_choice: MultipleChoice,
  word_match: WordMatch,
  fill_in_blank: FillInBlank,
  sentence_builder: SentenceBuilder,
  flashcard_sprint: FlashcardSprint,
  cultural_quiz: CulturalQuiz,
  word_scramble: WordScramble,
  memory_match: MemoryMatch,
  conversation_sim: ConversationSim,
  story_gap_fill: StoryGapFill,
};

export default function Session() {
  const navigate = useNavigate();
  const {
    currentSession,
    currentGameIndex,
    results,
    totalXPEarned,
    isSessionComplete,
    isLoading,
    startSession,
    submitAnswer,
    nextGame,
    resetSession,
    endSession,
  } = useGameStore();
  const { updateXP } = useProgressStore();

  useEffect(() => {
    if (!currentSession) {
      startSession();
    }
  }, []);

  const handleGameComplete = (result) => {
    submitAnswer(currentGameIndex, result);
    nextGame();
  };

  const handleFinishSession = async () => {
    const success = await endSession();
    if (success) {
      updateXP(totalXPEarned);
    }
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner size="lg" text="Preparing your session..." />
      </AppLayout>
    );
  }

  if (!currentSession) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-dark mb-4">No Session Available</h2>
          <p className="text-dark-400 mb-6">Start a new session to begin playing.</p>
          <Button variant="primary" onClick={startSession}>
            Start Session
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isSessionComplete) {
    const totalGames = currentSession.games.length;
    const correctGames = results.filter((r) => r.correct).length;

    return (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center py-8"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-sand-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-300 to-gold-400 flex items-center justify-center mx-auto mb-6"
            >
              <Trophy size={48} className="text-white" />
            </motion.div>

            <h2 className="text-3xl font-extrabold text-dark mb-2">Session Complete!</h2>
            {currentSession.level && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                style={{ backgroundColor: currentSession.levelColor || '#0d9488' }}
              >
                <GraduationCap size={14} />
                {currentSession.level.toUpperCase()} &middot; {currentSession.levelLabel}
              </span>
            )}
            <p className="text-dark-400 mb-8">Great job finishing today's practice!</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-sand-50 rounded-xl p-4">
                <Star size={24} className="text-gold-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-dark">{totalXPEarned}</p>
                <p className="text-xs text-dark-300">XP Earned</p>
              </div>
              <div className="bg-sand-50 rounded-xl p-4">
                <Trophy size={24} className="text-teal-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-dark">
                  {correctGames}/{totalGames}
                </p>
                <p className="text-xs text-dark-300">Games Won</p>
              </div>
              <div className="bg-sand-50 rounded-xl p-4">
                <Flame size={24} className="text-terracotta-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-dark">
                  {Math.round((correctGames / totalGames) * 100)}%
                </p>
                <p className="text-xs text-dark-300">Accuracy</p>
              </div>
            </div>

            {/* Game results */}
            <div className="space-y-2 mb-8">
              {currentSession.games.map((game, index) => {
                const result = results[index];
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                      result?.correct ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-dark">{game.title}</span>
                    <span className={`text-sm font-bold ${result?.correct ? 'text-green-500' : 'text-red-500'}`}>
                      {result ? `+${result.xpEarned} XP` : 'Skipped'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="primary" size="lg" fullWidth onClick={handleFinishSession}>
                <Home size={18} className="mr-2" />
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={async () => {
                  const success = await endSession();
                  if (success) {
                    updateXP(totalXPEarned);
                  }
                  startSession();
                }}
              >
                Play Again
              </Button>
            </div>
          </div>
        </motion.div>
      </AppLayout>
    );
  }

  // Current game
  const currentGame = currentSession.games[currentGameIndex];
  const GameComponent = gameComponents[currentGame.type];

  return (
    <AppLayout>
      {/* Session header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-dark-400 hover:text-dark transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Exit Session</span>
          </button>
          <div className="flex items-center gap-3">
            {currentSession.level && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: currentSession.levelColor || '#0d9488' }}
              >
                <GraduationCap size={14} />
                {currentSession.level.toUpperCase()} &middot; {currentSession.levelLabel}
              </span>
            )}
            <span className="text-sm font-medium text-dark-400">
              Game {currentGameIndex + 1} of {currentSession.games.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5">
          {currentSession.games.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                index < currentGameIndex
                  ? 'bg-teal-500'
                  : index === currentGameIndex
                  ? 'bg-teal-300'
                  : 'bg-sand-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Game */}
      {GameComponent ? (
        <GameComponent
          data={currentGame.data}
          onComplete={handleGameComplete}
        />
      ) : (
        <div className="text-center py-16">
          <p className="text-dark-400">Unknown game type: {currentGame.type}</p>
          <Button variant="primary" className="mt-4" onClick={() => nextGame()}>
            Skip
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
