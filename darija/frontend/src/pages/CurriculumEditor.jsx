import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  BookOpen,
  Languages,
  MessageSquare,
  Dumbbell,
  Landmark,
  Gamepad2,
  AlertCircle,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { curriculumAPI } from '../services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LEVELS = ['a2', 'b1', 'b2'];
const LEVEL_LABELS = { a2: 'A2 - Beginner', b1: 'B1 - Intermediate', b2: 'B2 - Advanced' };

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Small reusable components
// ---------------------------------------------------------------------------

function Field({ label, value, onChange, placeholder, multiline, dir }) {
  const cls =
    'w-full px-3 py-2 rounded-lg border border-sand-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-sm transition-colors bg-white';
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-dark-400">{label}</label>}
      {multiline ? (
        <textarea
          className={cls + ' min-h-[80px] resize-y'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
        />
      ) : (
        <input
          className={cls}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
        />
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max = 10 }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-dark-400">{label}</label>
      <input
        type="number"
        className="w-20 px-3 py-2 rounded-lg border border-sand-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-sm"
        value={value ?? 0}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        min={min}
        max={max}
      />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count, isOpen, onToggle, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[color]} hover:opacity-90 transition-all`}
    >
      <Icon size={18} />
      <span className="font-semibold text-sm">{title}</span>
      <span className="ml-1 text-xs opacity-70">({count})</span>
      <span className="ml-auto">
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </span>
    </button>
  );
}

function DeleteButton({ onDelete, label = 'Delete' }) {
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-500">Are you sure?</span>
      <button
        onClick={() => { onDelete(); setConfirming(false); }}
        className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Yes
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-3 py-1 text-xs bg-sand-200 text-dark-400 rounded-lg hover:bg-sand-300"
      >
        No
      </button>
    </div>
  ) : (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 size={14} />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section editors
// ---------------------------------------------------------------------------

function VocabularyEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!next[idx][parent]) next[idx][parent] = {};
      next[idx][parent][child] = val;
    } else {
      next[idx][field] = val;
    }
    onChange(next);
  };
  const add = () => {
    onChange([
      ...items,
      { arabic: '', romanized: '', english: '', example_sentence: { arabic: '', romanized: '', english: '' }, category: '', difficulty: 1 },
    ]);
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {items.map((v, i) => (
        <div key={i} className="bg-white border border-sand-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dark-300">Word {i + 1}</span>
            <DeleteButton onDelete={() => remove(i)} label="Remove" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Arabic" value={v.arabic} onChange={(val) => update(i, 'arabic', val)} dir="rtl" />
            <Field label="Romanized" value={v.romanized} onChange={(val) => update(i, 'romanized', val)} />
            <Field label="English" value={v.english} onChange={(val) => update(i, 'english', val)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Example (Arabic)" value={v.example_sentence?.arabic} onChange={(val) => update(i, 'example_sentence.arabic', val)} dir="rtl" />
            <Field label="Example (Romanized)" value={v.example_sentence?.romanized} onChange={(val) => update(i, 'example_sentence.romanized', val)} />
            <Field label="Example (English)" value={v.example_sentence?.english} onChange={(val) => update(i, 'example_sentence.english', val)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Category" value={v.category} onChange={(val) => update(i, 'category', val)} placeholder="e.g. greeting" />
            <NumberField label="Difficulty" value={v.difficulty} onChange={(val) => update(i, 'difficulty', val)} min={1} max={5} />
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Word
      </button>
    </div>
  );
}

function GrammarEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    next[idx][field] = val;
    onChange(next);
  };
  const updateListItem = (idx, field, listIdx, val) => {
    const next = deepClone(items);
    next[idx][field][listIdx] = val;
    onChange(next);
  };
  const addListItem = (idx, field) => {
    const next = deepClone(items);
    if (!next[idx][field]) next[idx][field] = [];
    next[idx][field].push(field === 'examples' ? { arabic: '', romanized: '', english: '' } : '');
    onChange(next);
  };
  const removeListItem = (idx, field, listIdx) => {
    const next = deepClone(items);
    next[idx][field].splice(listIdx, 1);
    onChange(next);
  };
  const add = () => {
    onChange([...items, { rule: '', explanation: '', examples: [], common_mistakes: [] }]);
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {items.map((g, i) => (
        <div key={i} className="bg-white border border-sand-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dark-300">Rule {i + 1}</span>
            <DeleteButton onDelete={() => remove(i)} label="Remove" />
          </div>
          <Field label="Rule" value={g.rule} onChange={(val) => update(i, 'rule', val)} />
          <Field label="Explanation" value={g.explanation} onChange={(val) => update(i, 'explanation', val)} multiline />
          <div>
            <label className="text-xs font-medium text-dark-400 mb-1 block">Examples</label>
            {(g.examples || []).map((ex, j) => (
              <div key={j} className="flex gap-2 mb-2 items-start">
                {typeof ex === 'object' ? (
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" placeholder="Arabic" dir="rtl" value={ex.arabic || ''} onChange={(e) => { const next = deepClone(items); next[i].examples[j] = { ...ex, arabic: e.target.value }; onChange(next); }} />
                    <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" placeholder="Romanized" value={ex.romanized || ''} onChange={(e) => { const next = deepClone(items); next[i].examples[j] = { ...ex, romanized: e.target.value }; onChange(next); }} />
                    <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" placeholder="English" value={ex.english || ''} onChange={(e) => { const next = deepClone(items); next[i].examples[j] = { ...ex, english: e.target.value }; onChange(next); }} />
                  </div>
                ) : (
                  <input className="flex-1 px-2 py-1.5 text-sm border border-sand-200 rounded-lg" value={ex} onChange={(e) => updateListItem(i, 'examples', j, e.target.value)} />
                )}
                <button onClick={() => removeListItem(i, 'examples', j)} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => addListItem(i, 'examples')} className="text-xs text-teal-600 hover:underline">+ Add example</button>
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-1 block">Common Mistakes</label>
            {(g.common_mistakes || []).map((m, j) => (
              <div key={j} className="flex gap-2 mb-2">
                <input className="flex-1 px-2 py-1.5 text-sm border border-sand-200 rounded-lg" value={typeof m === 'string' ? m : m.mistake || ''} onChange={(e) => updateListItem(i, 'common_mistakes', j, e.target.value)} />
                <button onClick={() => removeListItem(i, 'common_mistakes', j)} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => addListItem(i, 'common_mistakes')} className="text-xs text-teal-600 hover:underline">+ Add mistake</button>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Grammar Rule
      </button>
    </div>
  );
}

function PhrasesEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    next[idx][field] = val;
    onChange(next);
  };
  const add = () => onChange([...items, { arabic: '', romanized: '', english: '', context: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <div key={i} className="bg-white border border-sand-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dark-300">Phrase {i + 1}</span>
            <DeleteButton onDelete={() => remove(i)} label="Remove" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Arabic" value={p.arabic} onChange={(val) => update(i, 'arabic', val)} dir="rtl" />
            <Field label="Romanized" value={p.romanized} onChange={(val) => update(i, 'romanized', val)} />
            <Field label="English" value={p.english} onChange={(val) => update(i, 'english', val)} />
          </div>
          <Field label="Context" value={p.context} onChange={(val) => update(i, 'context', val)} placeholder="When/how to use this phrase" />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Phrase
      </button>
    </div>
  );
}

function ExercisesEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    next[idx][field] = val;
    onChange(next);
  };
  const add = () => onChange([...items, { type: 'multiple_choice', question: '', options: [], correct_answer: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const updateOption = (exIdx, optIdx, val) => {
    const next = deepClone(items);
    next[exIdx].options[optIdx] = val;
    onChange(next);
  };
  const addOption = (exIdx) => {
    const next = deepClone(items);
    if (!next[exIdx].options) next[exIdx].options = [];
    next[exIdx].options.push('');
    onChange(next);
  };
  const removeOption = (exIdx, optIdx) => {
    const next = deepClone(items);
    next[exIdx].options.splice(optIdx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((ex, i) => (
        <div key={i} className="bg-white border border-sand-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dark-300">Exercise {i + 1}</span>
            <DeleteButton onDelete={() => remove(i)} label="Remove" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-dark-400">Type</label>
              <select
                className="px-3 py-2 rounded-lg border border-sand-200 text-sm bg-white"
                value={ex.type || 'multiple_choice'}
                onChange={(e) => update(i, 'type', e.target.value)}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="matching">Matching</option>
                <option value="fill_in_blank">Fill in the Blank</option>
                <option value="translation">Translation</option>
                <option value="ordering">Ordering</option>
              </select>
            </div>
            <Field label="Question" value={ex.question} onChange={(val) => update(i, 'question', val)} />
          </div>
          <Field label="Correct Answer" value={ex.correct_answer} onChange={(val) => update(i, 'correct_answer', val)} />
          {ex.instruction && (
            <Field label="Instruction" value={ex.instruction} onChange={(val) => update(i, 'instruction', val)} />
          )}
          {(ex.type === 'multiple_choice' || ex.options?.length > 0) && (
            <div>
              <label className="text-xs font-medium text-dark-400 mb-1 block">Options</label>
              {(ex.options || []).map((opt, j) => (
                <div key={j} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 px-2 py-1.5 text-sm border border-sand-200 rounded-lg"
                    value={typeof opt === 'string' ? opt : opt.text || ''}
                    onChange={(e) => updateOption(i, j, e.target.value)}
                    placeholder={`Option ${j + 1}`}
                  />
                  <button onClick={() => removeOption(i, j)} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => addOption(i)} className="text-xs text-teal-600 hover:underline">+ Add option</button>
            </div>
          )}
          {/* Show extra fields based on type */}
          {ex.type === 'fill_in_blank' && (
            <Field label="Sentence (with ___ for blank)" value={ex.sentence} onChange={(val) => update(i, 'sentence', val)} />
          )}
          {ex.type === 'translation' && (
            <Field label="Source Text" value={ex.source_text} onChange={(val) => update(i, 'source_text', val)} />
          )}
          {(ex.type === 'matching' && ex.pairs) && (
            <div>
              <label className="text-xs font-medium text-dark-400 mb-1 block">Matching Pairs</label>
              {(ex.pairs || []).map((pair, j) => (
                <div key={j} className="grid grid-cols-2 gap-2 mb-2">
                  <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" placeholder="Left" value={pair.left || pair.darija || ''} onChange={(e) => { const next = deepClone(items); next[i].pairs[j] = { ...pair, left: e.target.value }; onChange(next); }} />
                  <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" placeholder="Right" value={pair.right || pair.english || ''} onChange={(e) => { const next = deepClone(items); next[i].pairs[j] = { ...pair, right: e.target.value }; onChange(next); }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Exercise
      </button>
    </div>
  );
}

function CulturalNotesEditor({ items, onChange }) {
  const update = (idx, val) => {
    const next = [...items];
    if (typeof next[idx] === 'object') {
      next[idx] = { ...next[idx], note: val };
    } else {
      next[idx] = val;
    }
    onChange(next);
  };
  const add = () => onChange([...items, '']);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.map((note, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 text-sm border border-sand-200 rounded-lg"
            value={typeof note === 'string' ? note : note.note || note.text || ''}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Cultural note..."
          />
          <button onClick={() => remove(i)} className="p-2 text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Note
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game Content Editors
// ---------------------------------------------------------------------------

function WordMatchEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    next[idx][field] = val;
    onChange(next);
  };
  const add = () => onChange([...items, { darija_arabic: '', darija_latin: '', english: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-4 gap-3 px-4 text-xs font-medium text-dark-400">
        <span>Arabic</span><span>Latin</span><span>English</span><span></span>
      </div>
      {items.map((w, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white border border-sand-200 rounded-lg p-3 sm:p-2">
          <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" dir="rtl" value={w.darija_arabic || ''} onChange={(e) => update(i, 'darija_arabic', e.target.value)} placeholder="Arabic" />
          <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" value={w.darija_latin || ''} onChange={(e) => update(i, 'darija_latin', e.target.value)} placeholder="Latin" />
          <input className="px-2 py-1.5 text-sm border border-sand-200 rounded-lg" value={w.english || ''} onChange={(e) => update(i, 'english', e.target.value)} placeholder="English" />
          <button onClick={() => remove(i)} className="p-1 text-red-400 hover:text-red-600 justify-self-end"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Pair
      </button>
    </div>
  );
}

function FillBlanksEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    next[idx][field] = val;
    onChange(next);
  };
  const add = () => onChange([...items, { sentence_arabic: '', sentence_latin: '', answer_arabic: '', answer_latin: '', hint: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {items.map((fb, i) => (
        <div key={i} className="bg-white border border-sand-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dark-300">Question {i + 1}</span>
            <DeleteButton onDelete={() => remove(i)} label="Remove" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Sentence (Arabic)" value={fb.sentence_arabic} onChange={(val) => update(i, 'sentence_arabic', val)} dir="rtl" />
            <Field label="Sentence (Latin)" value={fb.sentence_latin} onChange={(val) => update(i, 'sentence_latin', val)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Answer (Arabic)" value={fb.answer_arabic} onChange={(val) => update(i, 'answer_arabic', val)} dir="rtl" />
            <Field label="Answer (Latin)" value={fb.answer_latin} onChange={(val) => update(i, 'answer_latin', val)} />
            <Field label="Hint" value={fb.hint} onChange={(val) => update(i, 'hint', val)} />
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}

function CulturalQuizEditor({ items, onChange }) {
  const update = (idx, field, val) => {
    const next = deepClone(items);
    next[idx][field] = val;
    onChange(next);
  };
  const updateDistractor = (qIdx, dIdx, val) => {
    const next = deepClone(items);
    next[qIdx].distractors[dIdx] = val;
    onChange(next);
  };
  const addDistractor = (qIdx) => {
    const next = deepClone(items);
    if (!next[qIdx].distractors) next[qIdx].distractors = [];
    next[qIdx].distractors.push('');
    onChange(next);
  };
  const removeDistractor = (qIdx, dIdx) => {
    const next = deepClone(items);
    next[qIdx].distractors.splice(dIdx, 1);
    onChange(next);
  };
  const add = () => onChange([...items, { question: '', correct_answer: '', distractors: ['', '', ''], explanation: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {items.map((q, i) => (
        <div key={i} className="bg-white border border-sand-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dark-300">Quiz {i + 1}</span>
            <DeleteButton onDelete={() => remove(i)} label="Remove" />
          </div>
          <Field label="Question" value={q.question} onChange={(val) => update(i, 'question', val)} />
          <Field label="Correct Answer" value={q.correct_answer} onChange={(val) => update(i, 'correct_answer', val)} />
          <div>
            <label className="text-xs font-medium text-dark-400 mb-1 block">Distractors (wrong answers)</label>
            {(q.distractors || []).map((d, j) => (
              <div key={j} className="flex gap-2 mb-2">
                <input className="flex-1 px-2 py-1.5 text-sm border border-sand-200 rounded-lg" value={d} onChange={(e) => updateDistractor(i, j, e.target.value)} placeholder={`Distractor ${j + 1}`} />
                <button onClick={() => removeDistractor(i, j)} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => addDistractor(i)} className="text-xs text-teal-600 hover:underline">+ Add distractor</button>
          </div>
          <Field label="Explanation" value={q.explanation} onChange={(val) => update(i, 'explanation', val)} multiline />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
        <Plus size={16} /> Add Quiz Question
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson Accordion
// ---------------------------------------------------------------------------

function LessonAccordion({ lesson, onChange, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const content = lesson.content_json || {};

  const toggleSection = (s) => setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const updateContent = (field, val) => {
    onChange({
      ...lesson,
      content_json: { ...content, [field]: val },
    });
  };

  const updateTitle = (val) => {
    onChange({ ...lesson, title: val, content_json: { ...content, title: val } });
  };

  const sections = [
    { key: 'vocabulary', label: 'Vocabulary', icon: Languages, color: 'teal', Editor: VocabularyEditor },
    { key: 'grammar', label: 'Grammar', icon: BookOpen, color: 'amber', Editor: GrammarEditor },
    { key: 'phrases', label: 'Phrases', icon: MessageSquare, color: 'violet', Editor: PhrasesEditor },
    { key: 'exercises', label: 'Exercises', icon: Dumbbell, color: 'rose', Editor: ExercisesEditor },
    { key: 'cultural_notes', label: 'Cultural Notes', icon: Landmark, color: 'blue', Editor: CulturalNotesEditor },
  ];

  return (
    <div className="border border-sand-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-sand-50 hover:bg-sand-100 transition-colors"
      >
        {isOpen ? <ChevronDown size={18} className="text-dark-300" /> : <ChevronRight size={18} className="text-dark-300" />}
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">#{lesson.order}</span>
        <span className="font-semibold text-dark text-sm">{lesson.title}</span>
        <span className="ml-auto text-xs text-dark-300">
          {(content.vocabulary || []).length}v / {(content.grammar || []).length}g / {(content.phrases || []).length}p / {(content.exercises || []).length}e
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4 bg-white">
              <Field label="Lesson Title" value={lesson.title} onChange={updateTitle} />

              {sections.map(({ key, label, icon, color, Editor }) => (
                <div key={key}>
                  <SectionHeader
                    icon={icon}
                    title={label}
                    count={(content[key] || []).length}
                    isOpen={openSections[key]}
                    onToggle={() => toggleSection(key)}
                    color={color}
                  />
                  <AnimatePresence>
                    {openSections[key] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pb-1 px-1">
                          <Editor items={content[key] || []} onChange={(val) => updateContent(key, val)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="pt-3 border-t border-sand-200">
                <DeleteButton onDelete={onDelete} label="Delete Lesson" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game Content Section
// ---------------------------------------------------------------------------

function GameContentEditor({ gameContent, onChange }) {
  const [openSections, setOpenSections] = useState({});
  const toggleSection = (s) => setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const gc = gameContent || { word_match: [], fill_blanks: [], cultural_quiz: [] };

  const updateField = (field, val) => {
    onChange({ ...gc, [field]: val });
  };

  return (
    <div className="border border-orange-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-orange-50">
        <Gamepad2 size={20} className="text-orange-600" />
        <span className="font-semibold text-orange-700 text-sm">Game Content</span>
      </div>
      <div className="p-5 space-y-4 bg-white">
        {/* Word Match */}
        <div>
          <SectionHeader
            icon={Languages}
            title="Word Match"
            count={(gc.word_match || []).length}
            isOpen={openSections.word_match}
            onToggle={() => toggleSection('word_match')}
            color="orange"
          />
          {openSections.word_match && (
            <div className="pt-3 pb-1 px-1">
              <WordMatchEditor items={gc.word_match || []} onChange={(val) => updateField('word_match', val)} />
            </div>
          )}
        </div>

        {/* Fill Blanks */}
        <div>
          <SectionHeader
            icon={Dumbbell}
            title="Fill in the Blanks"
            count={(gc.fill_blanks || []).length}
            isOpen={openSections.fill_blanks}
            onToggle={() => toggleSection('fill_blanks')}
            color="violet"
          />
          {openSections.fill_blanks && (
            <div className="pt-3 pb-1 px-1">
              <FillBlanksEditor items={gc.fill_blanks || []} onChange={(val) => updateField('fill_blanks', val)} />
            </div>
          )}
        </div>

        {/* Cultural Quiz */}
        <div>
          <SectionHeader
            icon={Landmark}
            title="Cultural Quiz"
            count={(gc.cultural_quiz || []).length}
            isOpen={openSections.cultural_quiz}
            onToggle={() => toggleSection('cultural_quiz')}
            color="blue"
          />
          {openSections.cultural_quiz && (
            <div className="pt-3 pb-1 px-1">
              <CulturalQuizEditor items={gc.cultural_quiz || []} onChange={(val) => updateField('cultural_quiz', val)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CurriculumEditor() {
  // Module list state
  const [modules, setModules] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('a2');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [loadingModules, setLoadingModules] = useState(true);

  // Module detail state
  const [lessons, setLessons] = useState([]);
  const [gameContent, setGameContent] = useState(null);
  const [gameLessonId, setGameLessonId] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error'
  const [hasChanges, setHasChanges] = useState(false);

  // Deleted lesson IDs to remove on save
  const [deletedLessonIds, setDeletedLessonIds] = useState([]);
  // Newly added lessons (no ID yet)
  const [newLessons, setNewLessons] = useState([]);

  // Fetch module list
  const fetchModules = useCallback(async () => {
    setLoadingModules(true);
    try {
      const res = await curriculumAPI.getModules();
      setModules(res.data.modules || []);
    } catch (err) {
      console.error('Failed to load modules', err);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  // Fetch module detail
  const loadModule = useCallback(async (moduleId) => {
    setSelectedModuleId(moduleId);
    setLoadingDetail(true);
    setHasChanges(false);
    setDeletedLessonIds([]);
    setNewLessons([]);
    setSaveStatus(null);
    try {
      const res = await curriculumAPI.getModule(moduleId);
      const data = res.data;
      setLessons(data.lessons || []);
      setGameContent(data.game_content || null);
      setGameLessonId(data.game_lesson_id || null);
      setOriginalData(deepClone(data));
    } catch (err) {
      console.error('Failed to load module', err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Track changes
  useEffect(() => {
    if (!originalData) return;
    const changed =
      JSON.stringify(lessons) !== JSON.stringify(originalData.lessons) ||
      JSON.stringify(gameContent) !== JSON.stringify(originalData.game_content) ||
      deletedLessonIds.length > 0 ||
      newLessons.length > 0;
    setHasChanges(changed);
  }, [lessons, gameContent, originalData, deletedLessonIds, newLessons]);

  // Lesson handlers
  const updateLesson = (idx, updated) => {
    setLessons((prev) => prev.map((l, i) => (i === idx ? updated : l)));
  };

  const deleteLesson = (idx) => {
    const lesson = lessons[idx];
    if (lesson.id) {
      setDeletedLessonIds((prev) => [...prev, lesson.id]);
    }
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const addLesson = () => {
    const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order || 0), 0);
    const newLesson = {
      _isNew: true,
      order: maxOrder + 1,
      title: 'New Lesson',
      content_json: {
        lesson_id: `${selectedModuleId}_l${String(maxOrder + 1).padStart(2, '0')}`,
        order: maxOrder + 1,
        title: 'New Lesson',
        vocabulary: [],
        grammar: [],
        phrases: [],
        exercises: [],
        cultural_notes: [],
      },
    };
    setLessons((prev) => [...prev, newLesson]);
    setNewLessons((prev) => [...prev, newLesson]);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      // 1. Delete removed lessons
      for (const id of deletedLessonIds) {
        await curriculumAPI.deleteLesson(id);
      }

      // 2. Update existing lessons
      for (const lesson of lessons) {
        if (lesson.id && !lesson._isNew) {
          await curriculumAPI.updateLesson(lesson.id, {
            title: lesson.title,
            content_json: lesson.content_json,
          });
        }
      }

      // 3. Create new lessons
      for (const lesson of lessons) {
        if (lesson._isNew) {
          await curriculumAPI.createLesson(selectedModuleId, {
            title: lesson.title,
            order: lesson.order,
            content_json: lesson.content_json,
          });
        }
      }

      // 4. Update game content
      if (gameLessonId && gameContent) {
        await curriculumAPI.updateLesson(gameLessonId, {
          content_json: { game_content: gameContent, type: 'game_content' },
        });
      }

      setSaveStatus('saved');
      setDeletedLessonIds([]);
      setNewLessons([]);

      // Reload to get fresh IDs
      await loadModule(selectedModuleId);
      await fetchModules();
    } catch (err) {
      console.error('Save failed', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (originalData) {
      setLessons(deepClone(originalData.lessons));
      setGameContent(deepClone(originalData.game_content));
      setDeletedLessonIds([]);
      setNewLessons([]);
      setHasChanges(false);
      setSaveStatus(null);
    }
  };

  const filteredModules = modules.filter((m) => m.level === selectedLevel);
  const selectedModule = modules.find((m) => m.module_id === selectedModuleId);

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-5rem)]">
        {/* Left panel: Module list */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-sand-200 p-4 sticky top-20">
            <h2 className="font-bold text-dark text-lg mb-4">Modules</h2>

            {/* Level tabs */}
            <div className="flex gap-1 mb-4 bg-sand-100 rounded-xl p-1">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setSelectedLevel(lvl); setSelectedModuleId(null); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedLevel === lvl
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-dark-400 hover:text-dark'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Module list */}
            {loadingModules ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-teal-500" />
              </div>
            ) : filteredModules.length === 0 ? (
              <p className="text-sm text-dark-300 py-4 text-center">No modules found</p>
            ) : (
              <div className="space-y-1">
                {filteredModules.map((m) => (
                  <button
                    key={m.module_id}
                    onClick={() => loadModule(m.module_id)}
                    className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${
                      selectedModuleId === m.module_id
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'hover:bg-sand-50 text-dark-400 border border-transparent'
                    }`}
                  >
                    <p className="font-medium truncate">{m.title}</p>
                    <p className="text-xs text-dark-300 mt-0.5">{m.lesson_count} lessons</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center panel: Editor */}
        <div className="flex-1 min-w-0">
          {!selectedModuleId ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-sand-300 mb-4" />
              <h3 className="text-lg font-semibold text-dark mb-2">Select a Module</h3>
              <p className="text-sm text-dark-300">Choose a module from the left panel to start editing its lessons, vocabulary, grammar, and game content.</p>
            </div>
          ) : loadingDetail ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-12 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-teal-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="bg-white rounded-2xl border border-sand-200 px-5 py-4 flex flex-wrap items-center gap-3 sticky top-20 z-10">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-dark truncate">{selectedModule?.title || selectedModuleId}</h2>
                  <p className="text-xs text-dark-300">{LEVEL_LABELS[selectedModule?.level || selectedLevel]}</p>
                </div>

                {hasChanges && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <AlertCircle size={14} /> Unsaved changes
                  </span>
                )}

                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <Check size={14} /> Saved
                  </span>
                )}

                {saveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                    <AlertCircle size={14} /> Save failed
                  </span>
                )}

                <button
                  onClick={addLesson}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-teal-600 border border-teal-200 hover:bg-teal-50 rounded-xl transition-colors"
                >
                  <Plus size={16} /> Add Lesson
                </button>

                <button
                  onClick={handleDiscard}
                  disabled={!hasChanges}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-dark-400 border border-sand-200 hover:bg-sand-50 rounded-xl transition-colors disabled:opacity-40"
                >
                  <RotateCcw size={16} /> Discard
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <LessonAccordion
                    key={lesson.id || `new-${idx}`}
                    lesson={lesson}
                    onChange={(updated) => updateLesson(idx, updated)}
                    onDelete={() => deleteLesson(idx)}
                  />
                ))}
              </div>

              {/* Game Content */}
              {(gameContent || gameLessonId) && (
                <GameContentEditor
                  gameContent={gameContent}
                  onChange={setGameContent}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
