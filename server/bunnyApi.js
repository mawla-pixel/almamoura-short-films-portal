export const createBunnyVideosHandler = (configuredEnv = {}) => async (req, res) => {
  const env = { ...configuredEnv, ...process.env };
  const apiKey = env.BUNNY_API_KEY;
  const libraryId = env.BUNNY_LIBRARY_ID;
  const collectionId = env.BUNNY_COLLECTION_ID;
  const configuredPullZone = env.BUNNY_PULL_ZONE;

  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Bunny Stream is not configured: set BUNNY_API_KEY on the server.' }));
    return;
  }

  if (!libraryId || !/^\d+$/.test(libraryId)) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Bunny Stream is not configured: set a valid BUNNY_LIBRARY_ID on the server.' }));
    return;
  }

  const itemsPerPage = 100;
  const maxConcurrentPages = 5;
  const params = new URLSearchParams({ itemsPerPage: String(itemsPerPage), orderBy: 'date' });
  if (collectionId?.trim()) params.set('collection', collectionId.trim());

  try {
    const fetchPage = async (page) => {
      params.set('page', String(page));
      const upstream = await fetch(
        `https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos?${params}`,
        {
          headers: {
            AccessKey: apiKey.trim(),
            Accept: 'application/json',
          },
        }
      );

      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: `Bunny Stream API returned error ${upstream.status}: ${upstream.statusText}`,
        }));
        return null;
      }

      return upstream.json();
    };

    const videos = await fetchPage(1);
    if (!videos) return;

    const allItems = Array.isArray(videos.items) ? [...videos.items] : [];
    const totalItems = Number(videos.totalItems);
    const pageSize = Number(videos.itemsPerPage) || itemsPerPage;

    if (!Number.isFinite(totalItems) || totalItems < 0) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Bunny Stream returned an invalid video count.' }));
      return;
    }

    const totalPages = Math.ceil(totalItems / pageSize);

    for (let firstPage = 2; firstPage <= totalPages; firstPage += maxConcurrentPages) {
      const pageNumbers = Array.from(
        { length: Math.min(maxConcurrentPages, totalPages - firstPage + 1) },
        (_, index) => firstPage + index
      );
      const nextPages = await Promise.all(pageNumbers.map(fetchPage));
      if (nextPages.some((page) => !page)) return;

      for (let index = 0; index < nextPages.length; index += 1) {
        const nextPage = nextPages[index];
        if (!Array.isArray(nextPage.items) || nextPage.items.length === 0) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Bunny Stream returned no videos for page ${pageNumbers[index]}.` }));
          return;
        }

        allItems.push(...nextPage.items);
      }
    }

    if (allItems.length < totalItems) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Bunny Stream returned an incomplete list of videos.' }));
      return;
    }

    const pullZoneHost = (configuredPullZone || `vz-${libraryId}.b-cdn.net`)
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      libraryId,
      pullZoneHost,
      videos: { ...videos, currentPage: 1, itemsPerPage: allItems.length, items: allItems },
    }));
  } catch (error) {
    console.error('Bunny Stream request failed:', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unable to connect to the Bunny Stream API.' }));
  }
};
