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
  } else if (filter === "commerce") {
    overpassQuery = `
      [out:json];
      (
        nwr["amenity"="supermarket"](${bbox});
        nwr["amenity"="bakery"](${bbox});
        nwr["amenity"="cafe"](${bbox});
        nwr["amenity"="restaurant"](${bbox});
      );
      out center qt;
    `;
  } else if (filter === "publicSpace") {
    overpassQuery = `
      [out:json];
      (
        nwr["amenity"="bench"](${bbox});
        nwr["amenity"="drinking_water"](${bbox});
        nwr["amenity"="toilets"](${bbox});
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
