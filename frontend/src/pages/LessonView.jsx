import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, MessageSquare, PenTool, Dumbbell, Check, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ScriptText from '../components/common/ScriptText';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useProgressStore from '../store/progressStore';
import { lessonsAPI } from '../services/api';
import { mapVocab, mapGrammar, mapPhrases } from '../utils/dataTransform';

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Detect if a string contains Arabic script characters
function hasArabic(str) {
  return /[\u0600-\u06FF]/.test(str || '');
}

// Build a comprehensive lookup map from arabic text to romanized.
// Sources: vocabulary, grammar examples, phrases, and example sentences.
function buildRomanizedLookup(content) {
  const lookup = {};

  function add(arabic, romanized) {
    if (!arabic || !romanized) return;
    lookup[arabic] = romanized;
    // Also store without trailing/leading punctuation
    const clean = arabic.replace(/[؟?!.،,]/g, '').trim();
    if (clean && !lookup[clean]) {
      lookup[clean] = romanized.replace(/[?!.,]/g, '').trim();
    }
  }

  for (const v of content.vocabulary || []) {
    add(v.arabic, v.romanized || v.latin);
    const es = v.example_sentence || {};
    add(es.arabic, es.romanized);
  }

  for (const g of content.grammar || []) {
    for (const ex of g.examples || []) {
      add(ex.arabic, ex.romanized || ex.latin);
    }
  }

  for (const p of content.phrases || []) {
    add(p.arabic, p.romanized || p.latin);
  }

  return lookup;
}

function normalizeExercises(exercises, content) {
  const romanizedLookup = buildRomanizedLookup(content);

  // Collect romanized answers from translation exercises for use as distractors
  const translationAnswers = exercises
    .filter((ex) => ex.type === 'translation')
    .map((ex) => ex.correct_answer_romanized || '')
    .filter(Boolean);

  // Resolve romanized text for an Arabic string using multiple strategies
  function resolveRomanized(arabic) {
    if (!arabic) return '';
    // 1. Exact match
    let r = romanizedLookup[arabic];
    if (r) return r;
    // 2. Strip punctuation
    const clean = arabic.replace(/[؟?!.،,]/g, '').trim();
    r = romanizedLookup[clean];
    if (r) return r;
    // 3. Word-by-word with Arabic definite article (ال) stripping
    const words = clean.split(/\s+/);
    if (words.length >= 1) {
      const parts = words.map((w) => {
        let found = romanizedLookup[w];
        if (found) return found;
        // Try stripping ال prefix
        if (w.startsWith('\u0627\u0644') && w.length > 2) {
          const base = romanizedLookup[w.slice(2)];
          if (base) return 'l' + base;
        }
        return '';
      });
      if (parts.every(Boolean)) return parts.join(' ');
    }
    return '';
  }

  // Turn an option string into {text, arabic, romanized} for ScriptText display.
  // Accepts an optional pre-resolved romanized hint (from curriculum data).
  function enrichOption(option, romanizedHint) {
    if (hasArabic(option)) {
      const romanized = romanizedHint || resolveRomanized(option);
      return { text: option, arabic: option, romanized };
    }
    return { text: option, arabic: '', romanized: '' };
  }

  return exercises.map((ex) => {
    // Convert translation exercises to multiple choice
    if (ex.type === 'translation') {
      const correctRomanized = ex.correct_answer_romanized || '';
      const otherAnswers = translationAnswers.filter((a) => a !== correctRomanized);
      const fallbackPool = ['salam', 'shukran', 'bslama', 'labas', 'wakha', 'safi', 'bzzaf', 'chwiya', 'yallah', 'inshallah', 'mr7ba', 'l7amdullah'];
      const availableDistractors = [...new Set([...otherAnswers, ...fallbackPool])]
        .filter((d) => d !== correctRomanized);
      const distractors = shuffleArray(availableDistractors).slice(0, 3);
      const allOptions = [correctRomanized, ...distractors];
      const shuffled = shuffleArray(allOptions);

      return {
        type: 'multiple_choice',
        question: ex.question,
        hint: ex.hint,
        options: shuffled.map((o) => enrichOption(o)),
        correctIndex: shuffled.indexOf(correctRomanized),
      };
    }

    // Standard multiple choice - use pre-stored romanized data when available
    if (ex.type === 'multiple_choice' && ex.correct_answer && !ex.options) {
      const distractors = ex.distractors || [];
      const distractorsRom = ex.distractors_romanized || [];
      const correctRom = ex.correct_answer_romanized || '';

      const allOptions = [ex.correct_answer, ...distractors];
      const allRom = [correctRom, ...distractorsRom];
      const shuffledIndices = shuffleArray(allOptions.map((_, i) => i));
      const shuffled = shuffledIndices.map((i) => allOptions[i]);
      const shuffledRom = shuffledIndices.map((i) => allRom[i] || '');

      return {
        ...ex,
        options: shuffled.map((o, i) => enrichOption(o, shuffledRom[i])),
        correctIndex: shuffled.indexOf(ex.correct_answer),
      };
    }

    return ex;
  });
}

const tabs = [
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
  { id: 'grammar', label: 'Grammar', icon: PenTool },
  { id: 'phrases', label: 'Phrases', icon: MessageSquare },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell },
];

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [exerciseChecked, setExerciseChecked] = useState({});
  const [lesson, setLesson] = useState(null);
  const [rawContent, setRawContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const { updateXP } = useProgressStore();

  useEffect(() => {
    const loadLesson = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await lessonsAPI.getById(id);
        const data = response.data;
        // Extract content from content_json and map field names
        const content = data.content_json || {};
        setRawContent(content);
        const rawVocabulary = content.vocabulary || [];
        const rawExercises = (content.exercises || []).filter(
          (ex) => ex.type === 'multiple_choice' || ex.type === 'translation'
        );
        setLesson({
          ...data,
          level: (data.level || '').toUpperCase(),
          vocabulary: mapVocab(rawVocabulary),
          grammar: mapGrammar(content.grammar || []),
          phrases: mapPhrases(content.phrases || []),
          exercises: normalizeExercises(rawExercises, content),
        });
      } catch {
        setError('Lesson not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };
    loadLesson();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner size="lg" text="Loading lesson..." />
      </AppLayout>
    );
  }

  if (error || !lesson) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-dark-300 mb-4" />
          <h2 className="text-xl font-bold text-dark mb-2">Lesson not found</h2>
          <p className="text-dark-400 mb-6">{error || "This lesson doesn't exist or isn't available yet."}</p>
          <Button variant="primary" onClick={() => navigate('/lessons')}>
            Back to Lessons
          </Button>
        </div>
      </AppLayout>
    );
  }

  // -- Exercise progress tracking (all exercises are multiple choice now) --
  const totalExercises = lesson.exercises.length;
  const answeredCount = Object.keys(exerciseChecked).length;
  const allAnswered = totalExercises > 0 && answeredCount >= totalExercises;

  const totalCorrect = Object.entries(exerciseChecked).filter(([idx]) => {
    const exercise = lesson.exercises[Number(idx)];
    return exerciseAnswers[Number(idx)] === exercise?.correctIndex;
  }).length;
  const scorePercent = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0;
  const passed = allAnswered && scorePercent >= 70;

  const handleCompleteLesson = async () => {
    if (!passed) return;
    setIsCompleting(true);
    try {
      const response = await lessonsAPI.complete(id, scorePercent / 100);
      const xpEarned = response.data?.xp_earned || 0;
      if (xpEarned > 0) {
        updateXP(xpEarned);
      }
      navigate('/lessons');
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      setIsCompleting(false);
    }
  };

  const handleExerciseAnswer = (exerciseIndex, answerIndex) => {
    if (exerciseChecked[exerciseIndex]) return;
    setExerciseAnswers((prev) => ({ ...prev, [exerciseIndex]: answerIndex }));
    setExerciseChecked((prev) => ({ ...prev, [exerciseIndex]: true }));
  };

  const handleRetry = () => {
    setExerciseAnswers({});
    setExerciseChecked({});
    setLesson((prev) => ({
      ...prev,
      exercises: normalizeExercises(
        prev.exercises.map((ex) => {
          const { options, correctIndex, ...rest } = ex;
          return rest;
        }),
        rawContent || {}
      ),
    }));
  };

  // Filter tabs to only show ones with content
  const availableTabs = tabs.filter((tab) => {
    if (tab.id === 'vocabulary') return lesson.vocabulary.length > 0;
    if (tab.id === 'grammar') return lesson.grammar.length > 0;
    if (tab.id === 'phrases') return lesson.phrases.length > 0;
    if (tab.id === 'exercises') return lesson.exercises.length > 0;
    return true;
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/lessons')}
          className="flex items-center gap-2 text-dark-400 hover:text-dark transition-colors mb-3"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Lessons</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded">
            {lesson.level}
          </span>
          <span className="text-xs text-dark-300">{lesson.module}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark">{lesson.title}</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 bg-sand-100 rounded-xl p-1">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              whitespace-nowrap transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'bg-white text-dark shadow-sm'
                  : 'text-dark-400 hover:text-dark'
              }
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Vocabulary Tab */}
        {activeTab === 'vocabulary' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {lesson.vocabulary.map((word, index) => (
              <motion.div
                key={word.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <ScriptText
                        arabic={word.arabic}
                        latin={word.latin}
                        className="text-xl font-bold text-teal-600"
                      />
                      <p className="text-sm text-dark-400 mt-0.5">{word.english}</p>
                    </div>
                  </div>
                  {(word.example_arabic || word.example_latin) && (
                    <div className="bg-sand-50 rounded-lg p-3">
                      <p className="text-xs text-dark-300 mb-1">Example:</p>
                      <ScriptText
                        arabic={word.example_arabic}
                        latin={word.example_latin}
                        className="text-sm font-medium text-dark"
                      />
                      {word.example_english && (
                        <p className="text-xs text-dark-400 mt-1">{word.example_english}</p>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Grammar Tab */}
        {activeTab === 'grammar' && (
          <div className="space-y-6">
            {lesson.grammar.map((rule, index) => (
              <Card key={index}>
                <h3 className="text-lg font-bold text-dark mb-3">{rule.title}</h3>
                <p className="text-dark-400 mb-4 leading-relaxed">{rule.explanation}</p>
                <div className="space-y-3">
                  {(rule.examples || []).map((example, i) => (
                    <div key={i} className="bg-sand-50 rounded-xl p-4">
                      <ScriptText
                        arabic={example.arabic}
                        latin={example.latin}
                        className="text-base font-bold text-teal-600"
                      />
                      <p className="text-sm text-dark-400 mt-1">{example.english}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Phrases Tab */}
        {activeTab === 'phrases' && (
          <div className="space-y-3">
            {lesson.phrases.map((phrase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex items-center gap-4">
                  <div className="flex-1">
                    <ScriptText
                      arabic={phrase.arabic}
                      latin={phrase.latin}
                      className="text-base font-bold text-dark"
                    />
                    <p className="text-sm text-dark-400">{phrase.english}</p>
                  </div>
                  {phrase.context && (
                    <span className="text-xs bg-sand-100 text-dark-300 px-2 py-1 rounded-lg flex-shrink-0">
                      {phrase.context}
                    </span>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {lesson.exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex}>
                {/* Multiple Choice */}
                {exercise.type === 'multiple_choice' && (
                  <div>
                    <p className="font-bold text-dark mb-4">
                      {exerciseIndex + 1}. {exercise.question}
                    </p>
                    {exercise.hint && !exerciseChecked[exerciseIndex] && (
                      <p className="text-xs text-dark-300 italic mb-3">Hint: {exercise.hint}</p>
                    )}
                    <div className="grid gap-2">
                      {(exercise.options || []).map((option, optIndex) => {
                        const isSelected = exerciseAnswers[exerciseIndex] === optIndex;
                        const isCorrect = exerciseChecked[exerciseIndex] && optIndex === exercise.correctIndex;
                        const isWrong = exerciseChecked[exerciseIndex] && isSelected && optIndex !== exercise.correctIndex;

                        // Option can be a string or enriched {text, arabic, romanized}
                        const optText = typeof option === 'string' ? option : option.text;
                        const optArabic = typeof option === 'object' ? option.arabic : '';
                        const optRomanized = typeof option === 'object' ? option.romanized : '';

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleExerciseAnswer(exerciseIndex, optIndex)}
                            className={`
                              text-left px-4 py-3 rounded-xl border-2 transition-all duration-200
                              ${isCorrect ? 'border-green-400 bg-green-50' : ''}
                              ${isWrong ? 'border-red-400 bg-red-50' : ''}
                              ${!exerciseChecked[exerciseIndex] ? 'border-sand-200 hover:border-teal-300 hover:bg-teal-50/30' : ''}
                              ${!isCorrect && !isWrong && exerciseChecked[exerciseIndex] ? 'border-sand-200 opacity-50' : ''}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect && <Check size={16} className="text-green-500" />}
                              {isWrong && <AlertCircle size={16} className="text-red-500" />}
                              {optArabic && optRomanized ? (
                                <ScriptText
                                  arabic={optArabic}
                                  latin={optRomanized}
                                  className="text-sm font-medium"
                                />
                              ) : (
                                <span className="text-sm font-medium">{optText}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </Card>
            ))}

            {/* Progress & Results */}
            {totalExercises > 0 && (
              <div className="mt-2">
                {!allAnswered && (
                  <div className="text-center py-4">
                    <p className="text-dark-400 text-sm font-medium">
                      {answeredCount} of {totalExercises} answered
                    </p>
                    <div className="w-full bg-sand-200 rounded-full h-2 mt-2 max-w-xs mx-auto">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(answeredCount / totalExercises) * 100}%` }}
                      />
                    </div>
                    <p className="text-dark-300 text-xs mt-2">You need at least 70% to pass</p>
                  </div>
                )}

                {allAnswered && (
                  <Card className={`text-center py-6 ${passed ? 'border-2 border-green-400 bg-green-50/50' : 'border-2 border-red-400 bg-red-50/50'}`}>
                    <p className={`text-4xl font-extrabold mb-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                      {scorePercent}%
                    </p>
                    <p className="text-base font-bold text-dark mb-1">
                      {totalCorrect}/{totalExercises} correct
                    </p>
                    <p className={`text-sm font-medium mb-5 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                      {passed ? 'You passed!' : 'You need at least 70% to pass.'}
                    </p>
                    {passed ? (
                      <Button variant="primary" size="lg" onClick={handleCompleteLesson} loading={isCompleting}>
                        <Check size={18} className="mr-2" />
                        Complete Lesson
                      </Button>
                    ) : (
                      <Button variant="primary" size="lg" onClick={handleRetry}>
                        Try Again
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Non-exercises tabs: show Go to Exercises button */}
        {activeTab !== 'exercises' && (
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setActiveTab('exercises')}
            >
              <Dumbbell size={18} className="mr-2" />
              Go to Exercises
            </Button>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
