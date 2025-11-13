import axios from 'axios';

const overpassCache = new Map();

export const fetchPOIs = async (bbox, filter) => {
  const cacheKey = `${bbox}-${filter}`;
  if (overpassCache.has(cacheKey)) {
    return overpassCache.get(cacheKey);
  }

  let overpassQuery;
  if (filter === "bike") {
    overpassQuery = `
      [out:json];
      (
        nwr["amenity"="bicycle_repair_station"](${bbox});
        nwr["amenity"="bicycle_parking"](${bbox});
      );
      out center qt;
    `;
  }

  try {
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: {
        data: overpassQuery,
      },
    });
    const pois = response.data.elements;
    overpassCache.set(cacheKey, pois);
    return pois;
  } catch (error) {
    console.error(`Erreur lors de la récupération des POI ${filter}:`, error);
    return [];
  }
};
