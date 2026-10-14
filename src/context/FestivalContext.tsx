import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FilmSubmission, JudgeProfile, ScoreRubric } from '../types/festival';
import { INITIAL_JUDGES } from '../data/mockFilms';
import { fetchBunnyLibraryVideos } from '../services/bunnyApi';

export type PortalView = 'screening' | 'catalog' | 'deliberation';

interface FestivalContextType {
  films: FilmSubmission[];
  isLoadingBunny: boolean;
  bunnyError: string | null;
  refetchBunnyFilms: () => Promise<void>;
  judges: JudgeProfile[];
  currentJudge: JudgeProfile;
  setCurrentJudge: (judge: JudgeProfile) => void;
  activeFilm: FilmSubmission | null;
  setActiveFilmId: (id: string | null) => void;
  activeView: PortalView;
  setActiveView: (view: PortalView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  scores: Record<string, Record<string, ScoreRubric>>; // [judgeId][filmId]
  saveScore: (filmId: string, score: Partial<ScoreRubric>) => void;
  getJudgeScore: (judgeId: string, filmId: string) => ScoreRubric | undefined;
  getAverageScore: (filmId: string) => { average: number; count: number; outOf50: number };
  resetAllData: () => void;
}

const DEFAULT_RUBRIC: ScoreRubric = {
  visualCinematography: 8,
  storytelling: 8,
  directionPerformance: 8,
  editing: 8,
  soundDesign: 7,
  recommendation: 'official_selection',
  writtenCritique: '',
  isCompleted: false,
};

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Films state (strictly sourced from Bunny Stream)
  const [films, setFilms] = useState<FilmSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('almamoura_short_films');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [isLoadingBunny, setIsLoadingBunny] = useState<boolean>(false);
  const [bunnyError, setBunnyError] = useState<string | null>(null);

  // Single official judge
  const [judges] = useState<JudgeProfile[]>(INITIAL_JUDGES);
  const [currentJudge, setCurrentJudge] = useState<JudgeProfile>(INITIAL_JUDGES[0]);

  const [activeFilmId, setActiveFilmId] = useState<string | null>(films[0]?.id || null);
  const [activeView, setActiveView] = useState<PortalView>('catalog');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Scores state: judgeId -> filmId -> rubric
  const [scores, setScores] = useState<Record<string, Record<string, ScoreRubric>>>(() => {
    try {
      const saved = localStorage.getItem('almamoura_short_film_scores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Save state to localStorage
  useEffect(() => {
    if (films.length > 0) {
      localStorage.setItem('almamoura_short_films', JSON.stringify(films));
    }
  }, [films]);

  useEffect(() => {
    localStorage.setItem('almamoura_short_film_scores', JSON.stringify(scores));
  }, [scores]);

  // Function to load live films from Bunny Stream
  const refetchBunnyFilms = useCallback(async () => {
    setIsLoadingBunny(true);
    setBunnyError(null);

    try {
      const result = await fetchBunnyLibraryVideos();

      if (result.films.length > 0) {
        setFilms(result.films);
        setActiveFilmId((prev) => {
          if (prev && result.films.some((f) => f.id === prev)) return prev;
          return result.films[0].id;
        });
      } else {
        setFilms([]);
        setBunnyError('No videos found in the configured Bunny Stream collection or library.');
      }
    } catch (err) {
      console.error('Error fetching from Bunny Stream:', err);
      setBunnyError(err instanceof Error ? err.message : 'Failed to connect to Bunny Stream.');
    } finally {
      setIsLoadingBunny(false);
    }
  }, []);

  // Fetch at runtime so deployed server environment variables are available without a frontend rebuild.
  useEffect(() => {
    refetchBunnyFilms();
  }, [refetchBunnyFilms]);

  // Synchronize active film
  const activeFilm = films.find((f) => f.id === activeFilmId) || films[0] || null;

  const saveScore = (filmId: string, partial: Partial<ScoreRubric>) => {
    setScores((prev) => {
      const judgeScores = prev[currentJudge.id] || {};
      const existing = judgeScores[filmId] || { ...DEFAULT_RUBRIC };
      const updated = {
        ...existing,
        ...partial,
        verdictDate: new Date().toISOString().split('T')[0],
      };
      return {
        ...prev,
        [currentJudge.id]: {
          ...judgeScores,
          [filmId]: updated,
        },
      };
    });
  };

  const getJudgeScore = (judgeId: string, filmId: string): ScoreRubric | undefined => {
    return scores[judgeId]?.[filmId];
  };

  const getAverageScore = (filmId: string) => {
    let total = 0;
    let count = 0;
    Object.values(scores).forEach((judgeDict) => {
      const s = judgeDict[filmId];
      if (s && s.isCompleted) {
        const sum = s.visualCinematography + s.storytelling + s.directionPerformance + s.editing + s.soundDesign;
        total += sum;
        count += 1;
      }
    });

    if (count === 0) return { average: 0, count: 0, outOf50: 0 };
    const outOf50 = Number((total / count).toFixed(1));
    const average = Number(((outOf50 / 50) * 100).toFixed(1));
    return { average, count, outOf50 };
  };

  const resetAllData = () => {
    localStorage.removeItem('almamoura_short_films');
    localStorage.removeItem('almamoura_short_film_scores');
    localStorage.removeItem('almamoura_short_film_notes');
    localStorage.removeItem('almamoura_short_film_bunny_settings');
    setFilms([]);
    setScores({});
    refetchBunnyFilms();
  };

  return (
    <FestivalContext.Provider
      value={{
        films,
        isLoadingBunny,
        bunnyError,
        refetchBunnyFilms,
        judges,
        currentJudge,
        setCurrentJudge,
        activeFilm,
        setActiveFilmId,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        language,
        setLanguage,
        scores,
        saveScore,
        getJudgeScore,
        getAverageScore,
        resetAllData,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
