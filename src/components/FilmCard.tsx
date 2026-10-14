import React from 'react';
import { FilmSubmission } from '../types/festival';
import { useFestival } from '../context/FestivalContext';
import { Play, CheckCircle } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/mockFilms';

interface FilmCardProps {
  film: FilmSubmission;
  onSelect: (film: FilmSubmission) => void;
}

export const FilmCard: React.FC<FilmCardProps> = ({ film, onSelect }) => {
  const { currentJudge, getJudgeScore, language } = useFestival();
  const isAr = language === 'ar';

  const myScore = getJudgeScore(currentJudge.id, film.id);
  const categoryLabel = CATEGORY_LABELS[film.category]?.[language] || film.category;

  const totalPoints = myScore
    ? myScore.visualCinematography +
      myScore.storytelling +
    myScore.directionPerformance +
    myScore.editing +
    myScore.soundDesign
    : null;

  return (
    <div
      onClick={() => onSelect(film)}
      className="group cursor-pointer bg-white rounded-2xl border border-stone-200 hover:border-[#9E7A2A] transition-all duration-200 overflow-hidden flex flex-col hover:shadow-lg"
    >
      {/* Poster Media Box */}
      <div className={`relative w-full aspect-[16/10] bg-gradient-to-br ${film.posterBgGradient} overflow-hidden p-4 flex flex-col justify-between text-white`}>
        {/* Top Kicker */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-200">
            <span>{categoryLabel}</span>
          </div>

          {myScore?.isCompleted ? (
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle className="w-3 h-3" />
              <span>SCORED</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-stone-300 bg-black/60 px-2 py-0.5 rounded border border-stone-700">
              PENDING
            </div>
          )}
        </div>

        {/* Center Hover Play Cue */}
        <div className="relative z-10 my-auto flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white text-stone-900 group-hover:bg-[#9E7A2A] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-lg">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Bottom Scrim */}
        <div className="relative z-10">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-300 mb-0.5">
            {film.country} · {film.aspectRatio}
          </div>
          <h3 className="font-['Cinzel'] text-base md:text-lg font-bold text-white group-hover:text-amber-200 transition-colors leading-tight line-clamp-1">
            {isAr ? film.titleAr : film.title}
          </h3>
        </div>
      </div>

      {/* Card Content & Metadata in Clean White Theme */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
            <span className="text-stone-800 font-medium">{film.director}</span>
            <span className="text-stone-300">·</span>
            <span className="font-mono text-stone-600 tabular-nums">{film.runtimeFormatted}</span>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {isAr ? film.synopsisAr : film.synopsis}
          </p>
        </div>

        {/* Card Footer: Score & CTA */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          <div>
            {totalPoints !== null ? (
              <span className="text-[#9E7A2A] font-mono font-bold tabular-nums">
                Score: {totalPoints}/50
              </span>
            ) : (
              <span className="text-stone-400 text-[11px] font-mono">
                {isAr ? 'لم يقيّم' : 'Unadjudicated'}
              </span>
            )}
          </div>

          <span className="text-xs text-[#9E7A2A] group-hover:underline font-semibold transition-colors">
            {isAr ? 'مشاهدة الفيلم ←' : 'Screen Film →'}
          </span>
        </div>
      </div>
    </div>
  );
};
