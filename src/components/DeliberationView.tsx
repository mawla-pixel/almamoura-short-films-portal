import React from 'react';
import { useFestival } from '../context/FestivalContext';
import { 
  Trophy, 
  Download
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/mockFilms';

export const DeliberationView: React.FC = () => {
  const { films, currentJudge, scores, getAverageScore, setActiveFilmId, setActiveView, language } = useFestival();
  const isAr = language === 'ar';

  const rankedFilms = films.map((film) => {
    const avg = getAverageScore(film.id);
    const myScore = scores[currentJudge.id]?.[film.id];
    const totalMy = myScore 
      ? myScore.visualCinematography + myScore.storytelling + myScore.directionPerformance + myScore.editing + myScore.soundDesign
      : 0;

    return {
      film,
      avgOutOf50: avg.outOf50,
      judgeCount: avg.count,
      myScore,
      totalMy,
    };
  });

  rankedFilms.sort((a, b) => (b.avgOutOf50 || b.totalMy) - (a.avgOutOf50 || a.totalMy));

  const handleExportCSV = () => {
    const headers = ['Rank', 'Film Title', 'Director', 'Category', 'Runtime', 'Score (out of 50)', 'Nomination'];
    const rows = rankedFilms.map((item, idx) => [
      idx + 1,
      `"${item.film.title}"`,
      `"${item.film.director}"`,
      `"${item.film.category}"`,
      `"${item.film.runtimeFormatted}"`,
      item.avgOutOf50 || item.totalMy,
      `"${item.myScore?.recommendation || 'Official Selection'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Al_Mamoura_Jury_Scores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#9E7A2A]" />
            <h2 className="font-['Cinzel'] text-xl font-bold text-stone-900">
              {isAr ? 'ترتيب ونتائج لجنة التحكيم' : 'Jury Deliberation & Leaderboard'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAr
              ? 'ترتيب أفلام الرسوم المتحركة وفق تقييمات لجنة تحكيم مهرجان المعمورة.'
              : 'Short film standings based on jury evaluations.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 hover:border-stone-300 bg-white text-xs text-stone-700 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#9E7A2A]" />
          <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Table in White Mode */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Film & Director</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Runtime</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {rankedFilms.map((item, idx) => (
                <tr key={item.film.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-mono font-bold text-stone-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-900">
                      {isAr ? item.film.titleAr : item.film.title}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {item.film.director} ({item.film.country})
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {CATEGORY_LABELS[item.film.category]?.[language] || item.film.category}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-stone-600">
                    {item.film.runtimeFormatted}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#9E7A2A]">
                    {item.avgOutOf50 > 0 ? `${item.avgOutOf50}/50` : item.totalMy > 0 ? `${item.totalMy}/50` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setActiveFilmId(item.film.id);
                        setActiveView('screening');
                      }}
                      className="px-2.5 py-1 rounded bg-stone-100 hover:bg-[#9E7A2A] hover:text-white text-stone-800 text-xs transition-colors font-medium"
                    >
                      Screen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
