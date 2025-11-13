import axios from 'axios';

export const fetchPanoramaxImages = async (latitude, longitude) => {
  const url = `https://api.panoramax.xyz/api/search?place_distance=0-30&place_fov_tolerance=90&limit=30&place_position=${longitude},${latitude}`;
  try {
    const response = await axios.get(url);
    return response.data.features
      .filter(feature => feature.assets?.thumb?.href)
      .map(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        const instanceName = feature.links.find(link => link.rel === "via")?.instance_name || "unknown";
        const providerName = feature.providers?.[0]?.name || "unknown";
        return {
          id: feature.id,
          lat,
          lng,
          thumbUrl: `https://api.panoramax.xyz/api/pictures/${feature.id}/thumb.jpg`,
          panoramaxUrl: `https://api.panoramax.xyz/#pic=${feature.id}&nav=none`,
          instanceName,
          providerName,
        };
      });
  } catch (error) {
    console.error("Erreur lors de la récupération des images Panoramax :", error);
    return [];
  }
};

export const getPanoramaxImage = async (pictureId) => {
  const url = `https://api.panoramax.xyz/api/pictures/${pictureId}`;
  try {
    const response = await axios.get(url);
    // On travaille directement sur la feature unique
    const feature = response.data;
    if (!feature.assets?.thumb?.href) {
      return [];
    }
    const [lng, lat] = feature.geometry.coordinates;
    const instanceName = feature.links.find(link => link.rel === "via")?.instance_name || "unknown";
    const providerName = feature.providers?.[0]?.name || "unknown";
    return [{
      id: feature.id,
      lat,
      lng,
      thumbUrl: `https://api.panoramax.xyz/api/pictures/${feature.id}/thumb.jpg`,
      panoramaxUrl: `https://api.panoramax.xyz/#pic=${feature.id}&nav=none`,
      instanceName,
      providerName,
    }];
  } catch (error) {
    console.error("Erreur lors de la récupération des images Panoramax :", error);
    return [];
  }
};

