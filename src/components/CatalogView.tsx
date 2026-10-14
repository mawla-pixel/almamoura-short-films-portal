import React, { useState } from 'react';
import { useFestival } from '../context/FestivalContext';
import { FilmSubmission } from '../types/festival';
import { FilmCard } from './FilmCard';
import { 
  Search, 
  Film, 
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { 
    films, 
    isLoadingBunny,
    bunnyError,
    refetchBunnyFilms,
    searchQuery, 
    setSearchQuery, 
    setActiveFilmId, 
    setActiveView,
    currentJudge,
    scores,
    language 
  } = useFestival();

  const isAr = language === 'ar';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter films
  const filteredFilms = films.filter((film) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = film.title.toLowerCase().includes(q) || film.titleAr.includes(q);
      const matchDirector = film.director.toLowerCase().includes(q);
      const matchCountry = film.country.toLowerCase().includes(q);
      if (!matchTitle && !matchDirector && !matchCountry) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage) || 1;
  const paginatedFilms = filteredFilms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectFilm = (film: FilmSubmission) => {
    setActiveFilmId(film.id);
    setActiveView('screening');
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-mono text-[#9E7A2A] uppercase tracking-wider font-semibold">
            Al Mamoura Film Festival · Official Short Film Competition
          </div>

          <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
            {isAr ? 'أفلام مسابقة الأفلام القصيرة' : 'Short Film Competition'}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {isAr
              ? 'الأفلام القصيرة الرسمية المشاركة في المسابقة، مستضافة عبر Bunny Stream للتحكيم.'
              : 'Official short film entries streamed from Bunny Stream for festival jury evaluation.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500 font-mono">
            <span>
              <strong className="text-stone-900">{films.length}</strong> Short Films Loaded from Bunny Stream
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#9E7A2A]">{Object.keys(scores[currentJudge.id] || {}).length}</strong> Scored by You
            </span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingBunny && (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-[#9E7A2A] animate-spin" />
          <p className="text-sm font-medium text-stone-800">
            {isAr ? 'جاري جلب الفيديوهات من Bunny Stream...' : 'Loading films from Bunny Stream...'}
          </p>
        </div>
      )}

      {/* Empty / Error state if no films found */}
      {!isLoadingBunny && films.length === 0 && (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <Film className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="text-base font-semibold text-stone-800">
            {isAr ? 'في انتظار تحميل الفيديوهات من Bunny Stream' : 'Ready to load films from Bunny Stream'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {bunnyError ? (
              <span className="text-rose-600 block">{bunnyError}</span>
            ) : (
              <span>
                Please ensure <code>BUNNY_API_KEY</code>, <code>BUNNY_LIBRARY_ID</code>, and (optionally) <code>BUNNY_COLLECTION_ID</code> are configured in your server environment.
              </span>
            )}
          </p>
          <button
            onClick={() => refetchBunnyFilms()}
            className="px-4 py-2 rounded-xl bg-[#9E7A2A] hover:bg-[#856521] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة المحاولة' : 'Fetch from Bunny Stream'}</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar Controls (when films exist) */}
      {films.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isAr ? 'بحث في الأفلام...' : 'Search films or directors...'}
                className="w-full bg-white border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9E7A2A]"
              />
            </div>
          </div>

          {/* Films Grid */}
          {filteredFilms.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
              <Film className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs text-stone-500">No films match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-xs text-[#9E7A2A] font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedFilms.map((film) => (
                  <FilmCard key={film.id} film={film} onSelect={handleSelectFilm} />
                ))}
              </div>

              {/* Simple Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-stone-200 text-xs text-stone-600">
                  <div>
                    Showing{' '}
                    <strong className="text-stone-900 font-mono">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-stone-900 font-mono">
                      {Math.min(currentPage * itemsPerPage, filteredFilms.length)}
                    </strong>{' '}
                    of{' '}
                    <strong className="text-stone-900 font-mono">
                      {filteredFilms.length}
                    </strong>{' '}
                    films
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40 hover:bg-stone-50 text-stone-700 transition-colors"
                    >
                      Previous
                    </button>

                    <span className="px-2 text-stone-500 font-mono">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40 hover:bg-stone-50 text-stone-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
