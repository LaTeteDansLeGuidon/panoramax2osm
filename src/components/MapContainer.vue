<template>
  <div class="map-container" ref="mapContainer">
    <slot></slot>
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Exécution de la requête Overpass...</span>
    </div>
    <div v-else-if="mapZoomLevel < 16" class="zoom-prompt">
      Zoomez pour charger les POI
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPOIs } from '@/services/overpassService';

export default {
  props: {
    selectedFilter: String,
  },
  setup(props, { emit }) {
    const map = ref(null);
    const mapContainer = ref(null);
    const mapZoomLevel = ref(0);
    const poiLayer = ref(L.layerGroup());
    const selectedPOI = ref(null);
    const isLoading = ref(false);
    const bboxCache = ref({});
    const allPoisCache = ref([]);
    const coveredBboxes = ref([]);
    const MAX_CACHE_SIZE = 5;

    // Fonction pour convertir un point et une distance en bbox
    const pointToBbox = (lat, lng, distance) => {
      const latDelta = distance / 111320;
      const lngDelta = distance / (111320 * Math.cos(lat * (Math.PI / 180)));

      const lonMin = lng - lngDelta;
      const latMin = lat - latDelta;
      const lonMax = lng + lngDelta;
      const latMax = lat + latDelta;

      return `${lonMin},${latMin},${lonMax},${latMax}`;
    };

    // Fonction pour récupérer les images Panoramax
    const fetchPanoramaxImages = async (lat, lng, distance = 50) => {
      const bbox = pointToBbox(lat, lng, distance);
      const url = `https://panoramax.xyz/api/v1/pictures/?limit=10&bbox=${bbox}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        return data.features || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des images Panoramax :", error);
        return [];
      }
    };

    const createCustomDivIcon = (iconPath, hasPanoramax = false) => {
      return L.divIcon({
        html: `
          <div style="
            position: relative;
            background: white;
            border-radius: 50%;
            padding: 6px;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ccc;
          ">
            <img src="${iconPath}" style="width: 18px; height: 18px;" />
            ${hasPanoramax ?
              `<img src="/images/panoramax-logo.png" style="
                position: absolute;
                bottom: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: white;
                border: 1px solid #ccc;
              "/>` : ''}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    const getIconForPOI = (poi) => {
      const tags = poi.tags || {};
      let iconPath = "/osm-symbols/amenity/point.svg";
      let hasPanoramax = false;

      if (tags.panoramax) {
        hasPanoramax = true;
      }

      const tagToIcon = {
        "amenity": {
          "bicycle_parking": "/osm-symbols/amenity/bicycle_parking.svg",
          "bicycle_repair_station": "/osm-symbols/amenity/bicycle_repair_station.svg",
          "bicycle_pump": "/osm-symbols/amenity/bicycle_repair_station.svg",
        },
      };

      for (const [key, values] of Object.entries(tagToIcon)) {
        if (tags[key]) {
          const value = tags[key];
          if (values[value]) {
            iconPath = values[value];
            break;
          }
        }
      }

      return createCustomDivIcon(iconPath, hasPanoramax);
    };

    const isBboxCovered = (currentBbox) => {
      const [cSouth, cWest, cNorth, cEast] = currentBbox.split(',').map(Number);
      return coveredBboxes.value.some(cachedBbox => {
        const [sSouth, sWest, sNorth, sEast] = cachedBbox.split(',').map(Number);
        return (
          cSouth >= sSouth &&
          cWest >= sWest &&
          cNorth <= sNorth &&
          cEast <= sEast
        );
      });
    };

    const getPoisForBbox = (currentBbox) => {
      const [cSouth, cWest, cNorth, cEast] = currentBbox.split(',').map(Number);
      return allPoisCache.value
        .filter(item => {
          const { lat, lon } = item.poi;
          return (
            lat >= cSouth && lat <= cNorth &&
            lon >= cWest && lon <= cEast
          );
        })
        .map(item => item.poi);
    };

    const fetchAndDisplayPOIs = async () => {
      if (mapZoomLevel.value < 16 || isLoading.value) return;

      const bounds = map.value.getBounds();
      const currentBbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

      if (isBboxCovered(currentBbox)) {
        const pois = getPoisForBbox(currentBbox);
        displayPOIsOnMap(pois);
        return;
      }

      isLoading.value = true;
      emit('loading', true);

      try {
        const pois = await fetchPOIs(currentBbox, props.selectedFilter);
        bboxCache.value[currentBbox] = pois;
        allPoisCache.value.push(...pois.map(poi => ({ poi, sourceBbox: currentBbox })));
        coveredBboxes.value.push(currentBbox);

        if (coveredBboxes.value.length > MAX_CACHE_SIZE) {
          const oldestBbox = coveredBboxes.value.shift();
          delete bboxCache.value[oldestBbox];
          allPoisCache.value = allPoisCache.value.filter(item => item.sourceBbox !== oldestBbox);
        }

        displayPOIsOnMap(pois);
      } catch (error) {
        console.error("Erreur lors de la récupération des POI :", error);
      } finally {
        setTimeout(() => {
          isLoading.value = false;
          emit('loading', false);
        }, 3000);
      }
    };

    const displayPOIsOnMap = (pois) => {
      poiLayer.value.clearLayers();
      pois.forEach(poi => {
        const lat = poi.lat || poi.center?.lat;
        const lng = poi.lon || poi.center?.lon;
        if (lat && lng) {
          const marker = L.marker([lat, lng], {
            icon: getIconForPOI(poi),
          }).addTo(poiLayer.value);
          marker.bindPopup(`
            <b>${poi.tags?.name || "POI"}</b><br>
            ${poi.tags?.amenity}<br>
            ${poi.tags?.capacity ? `Capacité : ${poi.tags.capacity}` : ""}
          `);
          marker.on('click', async () => {
            selectedPOI.value = { id: poi.id, name: poi.tags?.name || "POI", lat, lng };
            emit('poi-selected', selectedPOI.value);

            // Récupère les images Panoramax à proximité
            const images = await fetchPanoramaxImages(lat, lng, 50);
            emit('panoramax-images-found', images);
          });
        }
      });
    };

    let moveEndTimeout = null;

    onMounted(() => {
      if (mapContainer.value) {
        map.value = L.map(mapContainer.value, {
          maxZoom: 22,
        }).setView([48.8584, 2.2945], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.value);

        poiLayer.value.addTo(map.value);

        map.value.on('moveend', () => {
          clearTimeout(moveEndTimeout);
          moveEndTimeout = setTimeout(() => {
            if (map.value.getZoom() >= 16) {
              fetchAndDisplayPOIs();
            }
          }, 500);
        });

        map.value.on('zoomend', () => {
          mapZoomLevel.value = map.value.getZoom();
        });
      }
    });

    return {
      mapContainer,
      mapZoomLevel,
      selectedPOI,
      isLoading,
    };
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  flex: 1;
  min-height: 300px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}
.leaflet-container {
  width: 100%;
  height: 100%;
}
.loading-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 1000;
  font-size: 14px;
}
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.zoom-prompt {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 1000;
  font-size: 14px;
}
</style>
