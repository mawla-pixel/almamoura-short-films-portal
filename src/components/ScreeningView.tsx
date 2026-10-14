import React, { useState, useEffect } from 'react';
import { useFestival } from '../context/FestivalContext';
import { BunnyPlayer } from './BunnyPlayer';
import { ScoreRubric } from '../types/festival';
import { 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Save, 
  CheckCircle2,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/mockFilms';

export const ScreeningView: React.FC = () => {
  const { 
    films, 
    activeFilm, 
    setActiveFilmId, 
    currentJudge, 
    getJudgeScore, 
    saveScore, 
    language 
  } = useFestival();

  const isAr = language === 'ar';

  if (!activeFilm) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-2">
        <h3 className="font-semibold text-stone-800 text-sm">
          {isAr ? 'لا يوجد فيلم محدد للعرض' : 'No film selected for screening'}
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          {isAr ? 'يرجى مراجعة قائمة الأفلام بعد تحميلها من Bunny Stream.' : 'Films will appear here once loaded from Bunny Stream.'}
        </p>
      </div>
    );
  }

  const currentIndex = films.findIndex((f) => f.id === activeFilm.id);
  const prevFilm = currentIndex > 0 ? films[currentIndex - 1] : null;
  const nextFilm = currentIndex < films.length - 1 ? films[currentIndex + 1] : null;

  // Simple Scorecard State
  const existingScore = getJudgeScore(currentJudge.id, activeFilm.id);

  const [visualCinematography, setVisualCinematography] = useState(existingScore?.visualCinematography ?? 8);
  const [storytelling, setStorytelling] = useState(existingScore?.storytelling ?? 8);
  const [directionPerformance, setDirectionPerformance] = useState(existingScore?.directionPerformance ?? 8);
  const [editing, setEditing] = useState(existingScore?.editing ?? 8);
  const [soundDesign, setSoundDesign] = useState(existingScore?.soundDesign ?? 7);
  const [recommendation, setRecommendation] = useState<ScoreRubric['recommendation']>(
    existingScore?.recommendation ?? 'official_selection'
  );
  const [writtenCritique, setWrittenCritique] = useState(existingScore?.writtenCritique ?? '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const s = getJudgeScore(currentJudge.id, activeFilm.id);
    if (s) {
      setVisualCinematography(s.visualCinematography);
      setStorytelling(s.storytelling);
      setDirectionPerformance(s.directionPerformance);
      setEditing(s.editing);
      setSoundDesign(s.soundDesign);
      setRecommendation(s.recommendation);
      setWrittenCritique(s.writtenCritique);
    } else {
      setVisualCinematography(8);
      setStorytelling(8);
      setDirectionPerformance(8);
      setEditing(8);
      setSoundDesign(7);
      setRecommendation('official_selection');
      setWrittenCritique('');
    }
    setSavedSuccess(false);
  }, [activeFilm.id, currentJudge.id, getJudgeScore]);

  const totalScore = visualCinematography + storytelling + directionPerformance + editing + soundDesign;

  const handleSave = () => {
    saveScore(activeFilm.id, {
      visualCinematography,
      storytelling,
      directionPerformance,
      editing,
      soundDesign,
      recommendation,
      writtenCritique,
      isCompleted: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Streamlined Film Switcher */}
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 text-xs">
        <button
          disabled={!prevFilm}
          onClick={() => prevFilm && setActiveFilmId(prevFilm.id)}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isAr ? 'الفيلم السابق' : 'Previous Film'}</span>
        </button>

        <div className="text-center font-medium text-stone-900 truncate max-w-md">
          <span className="text-[#9E7A2A] font-mono mr-2">#{currentIndex + 1} of {films.length}</span>
          <span className="font-semibold">{isAr ? activeFilm.titleAr : activeFilm.title}</span>
        </div>

        <button
          disabled={!nextFilm}
          onClick={() => nextFilm && setActiveFilmId(nextFilm.id)}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors font-medium"
        >
          <span>{isAr ? 'الفيلم التالي' : 'Next Film'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main 2-Column Split: Official Bunny Player (Left) & Minimal Jury Scorecard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Bunny Player (Spans 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <BunnyPlayer film={activeFilm} />

          {/* Film Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#9E7A2A] font-mono mb-1">
                  {CATEGORY_LABELS[activeFilm.category]?.[language] || activeFilm.category} · {activeFilm.country}
                </div>
                <h2 className="font-['Cinzel'] text-xl font-bold text-stone-900">
                  {isAr ? activeFilm.titleAr : activeFilm.title}
                </h2>
                <div className="text-xs text-stone-500">
                  Directed by {activeFilm.director}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2.5 py-1 rounded border border-stone-200 font-semibold">
                  {activeFilm.runtimeFormatted}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
              {isAr ? activeFilm.synopsisAr : activeFilm.synopsis}
            </p>

          </div>
        </div>

        {/* Right Column: Clean White Jury Scorecard (Spans 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-['Cinzel'] font-bold text-stone-900 text-base">
                {isAr ? 'تقييم لجنة التحكيم' : 'Jury Scorecard'}
              </h3>
              <div className="text-xs text-stone-500">
                Judge: {isAr ? currentJudge.nameAr : currentJudge.name}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-stone-400">Total</div>
              <div className="text-2xl font-bold font-mono text-[#9E7A2A]">
                {totalScore}<span className="text-sm text-stone-400">/50</span>
              </div>
            </div>
          </div>

          {/* 5 Clean Sliders */}
          <div className="space-y-3">
            {[
              { label: isAr ? 'التصوير السينمائي والتكوين البصري' : 'Cinematography & Visual Composition', val: visualCinematography, set: setVisualCinematography },
              { label: isAr ? 'السيناريو والسرد والإيقاع' : 'Screenplay, Story & Pacing', val: storytelling, set: setStorytelling },
              { label: isAr ? 'الإخراج والأداء' : 'Direction & Performances', val: directionPerformance, set: setDirectionPerformance },
              { label: isAr ? 'المونتاج والبناء' : 'Editing & Structure', val: editing, set: setEditing },
              { label: isAr ? 'التصميم الصوتي والموسيقى' : 'Sound Design & Music', val: soundDesign, set: setSoundDesign },
            ].map((item, idx) => (
              <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-stone-800">{item.label}</span>
                  <span className="font-mono font-bold text-[#9E7A2A]">{item.val}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={item.val}
                  onChange={(e) => item.set(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9E7A2A]"
                />
              </div>
            ))}
          </div>

          {/* Nomination Award Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isAr ? 'ترشيح الجائزة' : 'Award Nomination'}
            </label>
            <select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value as any)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9E7A2A]"
            >
              <option value="official_selection">Official Selection</option>
              <option value="grand_prize">🏆 Grand Jury Prize Nominee</option>
              <option value="best_director">🎬 Best Director</option>
              <option value="best_screenplay">✍️ Best Screenplay</option>
              <option value="best_cinematography">📷 Best Cinematography</option>
              <option value="best_editing">✂️ Best Editing</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isAr ? 'ملاحظات التحكيم (اختياري)' : 'Jury Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={writtenCritique}
              onChange={(e) => setWrittenCritique(e.target.value)}
              placeholder={isAr ? 'اكتب ملاحظاتك النقدية هنا...' : 'Enter critique notes...'}
              className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9E7A2A]"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully</span>
              </span>
            ) : (
              <span className="text-xs text-stone-400">Score ready</span>
            )}

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#9E7A2A] hover:bg-[#856521] text-white font-medium text-xs transition-colors shadow-xs"
            >
              {isAr ? 'حفظ التقييم' : 'Save Verdict'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
