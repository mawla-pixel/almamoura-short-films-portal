import { FilmSubmission } from '../types/festival';

export interface BunnyVideoItem {
  guid: string;
  videoLibraryId: number;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  width?: number;
  height?: number;
}

export interface BunnyLibraryResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideoItem[];
}

interface BunnyVideosApiResponse {
  libraryId: string;
  pullZoneHost: string;
  videos: BunnyLibraryResponse;
}

export const cleanFilmTitle = (rawTitle: string): { title: string; director: string } => {
  let clean = rawTitle.replace(/\.(mp4|mov|mkv|webm|avi|m4v)$/i, '').trim();
  clean = clean.replace(/^[0-9]+[_\s.-]+/, '');

  for (const separator of [' - ', ' by ', ' _ ']) {
    if (clean.includes(separator)) {
      const [title, director] = clean.split(separator);
      return { title: title.trim(), director: director.trim() };
    }
  }

  return { title: clean, director: '' };
};

const formatSecondsToMinutes = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const fetchBunnyLibraryVideos = async (): Promise<{ total: number; films: FilmSubmission[] }> => {
  const response = await fetch('/api/bunny/videos', { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Bunny Stream API returned error ${response.status}: ${response.statusText}`);
  }

  const result: BunnyVideosApiResponse = await response.json();
  const { libraryId, videos: data, pullZoneHost } = result;
  const gradients = [
    'from-amber-950/80 via-stone-900 to-black',
    'from-indigo-950/80 via-slate-900 to-black',
    'from-emerald-950/80 via-stone-900 to-black',
    'from-cyan-950/80 via-stone-900 to-black',
    'from-purple-950/80 via-stone-900 to-black',
    'from-stone-900 via-stone-950 to-black',
  ];

  const films: FilmSubmission[] = (data.items || []).map((item, idx) => {
    const { title, director } = cleanFilmTitle(item.title);
    const runtimeFormatted = formatSecondsToMinutes(item.length);
    const runtimeMinutes = Number.isFinite(item.length) ? Number((item.length / 60).toFixed(1)) : 0;
    let aspectRatio: FilmSubmission['aspectRatio'] = '16:9';

    if (item.width && item.height) {
      const ratio = item.width / item.height;
      if (ratio > 2.2) aspectRatio = '2.39:1';
      else if (ratio < 1.5) aspectRatio = '4:3';
    }

    return {
      id: `bunny-${item.guid}`,
      title: title || `Untitled Short Film #${idx + 1}`,
      titleAr: title || `فيلم قصير بلا عنوان #${idx + 1}`,
      director: director || 'Not provided',
      country: 'Not provided',
      countryCode: '',
      category: 'short_film',
      runtimeMinutes,
      runtimeFormatted,
      aspectRatio,
      synopsis: 'Official short film competition entry hosted on Bunny Stream.',
      synopsisAr: 'مشاركة رسمية في مسابقة الأفلام القصيرة، مستضافة عبر Bunny Stream.',
      posterBgGradient: gradients[idx % gradients.length],
      accentColor: '#C9A84C',
      bunnyStream: {
        libraryId: String(libraryId).trim(),
        videoId: item.guid,
        directIframeUrl: `https://iframe.mediadelivery.net/embed/${libraryId.trim()}/${item.guid}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`,
        directHlsUrl: `https://${pullZoneHost}/${item.guid}/playlist.m3u8`,
        cdnHostname: pullZoneHost,
      },
    };
  });

  return {
    total: data.totalItems || films.length,
    films,
  };
};
