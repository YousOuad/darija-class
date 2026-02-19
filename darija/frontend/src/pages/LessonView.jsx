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

function normalizeExercises(exercises) {
  return exercises.map((ex) => {
    if (ex.type === 'multiple_choice' && ex.correct_answer && !ex.options) {
      const allOptions = [ex.correct_answer, ...(ex.distractors || [])];
      const shuffled = shuffleArray(allOptions);
      return {
        ...ex,
        options: shuffled,
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
  const [fillAnswers, setFillAnswers] = useState({});
  const [fillChecked, setFillChecked] = useState({});
  const [fillCorrect, setFillCorrect] = useState({});
  const [lesson, setLesson] = useState(null);
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
        setLesson({
          ...data,
          level: (data.level || '').toUpperCase(),
          vocabulary: mapVocab(content.vocabulary || []),
          grammar: mapGrammar(content.grammar || []),
          phrases: mapPhrases(content.phrases || []),
          exercises: normalizeExercises(content.exercises || []).filter(
            (ex) => ex.type === 'multiple_choice' || ex.type === 'translation'
          ),
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

  // -- Exercise progress tracking --
  const totalExercises = lesson.exercises.length;
  const answeredMC = Object.keys(exerciseChecked).length;
  const answeredTranslation = Object.keys(fillChecked).length;
  const answeredCount = answeredMC + answeredTranslation;
  const allAnswered = totalExercises > 0 && answeredCount >= totalExercises;

  const mcCorrect = Object.entries(exerciseChecked).filter(([idx]) => {
    const exercise = lesson.exercises[Number(idx)];
    return exercise?.type === 'multiple_choice' && exerciseAnswers[Number(idx)] === exercise.correctIndex;
  }).length;
  const transCorrect = Object.values(fillCorrect).filter(Boolean).length;
  const totalCorrect = mcCorrect + transCorrect;
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

  const checkFillAnswer = (exerciseIndex) => {
    if (fillChecked[exerciseIndex]) return;
    const exercise = lesson.exercises[exerciseIndex];
    const userAnswer = (fillAnswers[exerciseIndex] || '').trim().toLowerCase();
    const correct = [
      exercise.correct_answer,
      exercise.romanized_answer,
      exercise.correct_answer_arabic,
      exercise.correct_answer_romanized,
    ].filter(Boolean).map((a) => a.toLowerCase());
    const isCorrect = correct.some((a) => userAnswer === a);
    setFillChecked((prev) => ({ ...prev, [exerciseIndex]: true }));
    setFillCorrect((prev) => ({ ...prev, [exerciseIndex]: isCorrect }));
  };

  const handleRetry = () => {
    setExerciseAnswers({});
    setExerciseChecked({});
    setFillAnswers({});
    setFillChecked({});
    setFillCorrect({});
    setLesson((prev) => ({
      ...prev,
      exercises: normalizeExercises(
        prev.exercises.map((ex) => {
          if (ex.type === 'multiple_choice') {
            const { options, correctIndex, ...rest } = ex;
            return rest;
          }
          return ex;
        })
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
                              <span className="text-sm font-medium">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Translation */}
                {exercise.type === 'translation' && (
                  <div>
                    <p className="font-bold text-dark mb-2">
                      {exerciseIndex + 1}. {exercise.question}
                    </p>
                    {exercise.hint && !fillChecked[exerciseIndex] && (
                      <p className="text-xs text-dark-300 italic mb-3">Hint: {exercise.hint}</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fillAnswers[exerciseIndex] || ''}
                        onChange={(e) => setFillAnswers((prev) => ({ ...prev, [exerciseIndex]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && !fillChecked[exerciseIndex] && checkFillAnswer(exerciseIndex)}
                        disabled={fillChecked[exerciseIndex]}
                        placeholder="Type your translation..."
                        className={`flex-1 px-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none text-sm ${
                          fillChecked[exerciseIndex]
                            ? fillCorrect[exerciseIndex]
                              ? 'border-green-400 bg-green-50'
                              : 'border-red-400 bg-red-50'
                            : 'border-sand-200 focus:border-teal-400'
                        }`}
                      />
                      {!fillChecked[exerciseIndex] && (
                        <Button variant="primary" size="sm" onClick={() => checkFillAnswer(exerciseIndex)}>
                          Check
                        </Button>
                      )}
                    </div>
                    {fillChecked[exerciseIndex] && (
                      <p className={`text-sm mt-2 font-medium ${fillCorrect[exerciseIndex] ? 'text-green-600' : 'text-red-600'}`}>
                        {fillCorrect[exerciseIndex]
                          ? 'Correct!'
                          : `Answer: ${exercise.correct_answer_arabic || exercise.correct_answer || ''}${exercise.correct_answer_romanized ? ` (${exercise.correct_answer_romanized})` : ''}`}
                      </p>
                    )}
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
