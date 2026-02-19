import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, MessageSquare, PenTool, Dumbbell, Check, Volume2, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ScriptText from '../components/common/ScriptText';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useProgressStore from '../store/progressStore';
import { lessonsAPI } from '../services/api';
import { mapVocab, mapGrammar, mapPhrases } from '../utils/dataTransform';

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
  const [fillAnswer, setFillAnswer] = useState('');
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
          exercises: content.exercises || [],
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

  const handleCompleteLesson = async () => {
    setIsCompleting(true);
    try {
      // Calculate score from exercises
      const totalExercises = lesson.exercises.length || 1;
      const correctAnswers = Object.entries(exerciseChecked).filter(([idx]) => {
        const exercise = lesson.exercises[Number(idx)];
        if (!exercise) return false;
        return exerciseAnswers[Number(idx)] === exercise.correct;
      }).length;
      const score = Math.round((correctAnswers / totalExercises) * 100) || 80;

      const response = await lessonsAPI.complete(id, score);
      const xpEarned = response.data?.xp_earned || 50;
      updateXP(xpEarned);
      navigate('/lessons');
    } catch {
      // Still navigate back even if submit fails
      updateXP(50);
      navigate('/lessons');
    }
  };

  const handleExerciseAnswer = (exerciseIndex, answerIndex) => {
    if (exerciseChecked[exerciseIndex]) return;
    setExerciseAnswers((prev) => ({ ...prev, [exerciseIndex]: answerIndex }));
    setExerciseChecked((prev) => ({ ...prev, [exerciseIndex]: true }));
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
                    <button className="p-2 rounded-lg hover:bg-sand-100 transition-colors text-dark-300">
                      <Volume2 size={16} />
                    </button>
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
                {exercise.type === 'multiple_choice' && (
                  <div>
                    <p className="font-bold text-dark mb-4">
                      {exerciseIndex + 1}. {exercise.question}
                    </p>
                    <div className="grid gap-2">
                      {(exercise.options || []).map((option, optIndex) => {
                        const isSelected = exerciseAnswers[exerciseIndex] === optIndex;
                        const isCorrect = exerciseChecked[exerciseIndex] && optIndex === exercise.correct;
                        const isWrong = exerciseChecked[exerciseIndex] && isSelected && optIndex !== exercise.correct;

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
                              <span className="text-sm font-medium">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {exercise.type === 'fill_blank' && (
                  <div>
                    <p className="font-bold text-dark mb-2">
                      {exerciseIndex + 1}. Fill in the blank:
                    </p>
                    <p className="text-dark-400 text-sm mb-4">{exercise.english}</p>
                    <div className="bg-sand-50 rounded-xl p-4 mb-3">
                      <p className="text-lg font-medium text-dark">{exercise.sentence}</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fillAnswer}
                        onChange={(e) => setFillAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 px-4 py-2 rounded-xl border border-sand-200 focus:outline-none focus:border-teal-400 text-sm"
                      />
                      <Button variant="primary" size="sm" onClick={() => {}}>
                        Check
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCompleteLesson}
              loading={isCompleting}
            >
              <Check size={18} className="mr-2" />
              Complete Lesson
            </Button>
          </div>
        )}

        {/* If active tab has no content, show complete button */}
        {activeTab !== 'exercises' && (
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCompleteLesson}
              loading={isCompleting}
            >
              <Check size={18} className="mr-2" />
              Complete Lesson
            </Button>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
