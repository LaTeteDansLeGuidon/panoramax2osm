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
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPOIs } from '@/services/overpassService';
import { fetchPanoramaxImages, getPanoramaxImage } from '@/services/panoramaxService';

export default {
  props: {
    selectedFilter: String,
  },
  setup(props, { emit }) {
    const map = ref(null);
    const mapContainer = ref(null);
    const mapZoomLevel = ref(0);
    const poiLayer = ref(L.layerGroup());
    const panoramaxLayer = ref(L.layerGroup());
    const selectedPOI = ref(null);
    const selectedPanoramaxImage = ref(null);
    const isLoading = ref(false);
    const errorMessage = ref("");
    let isFetching = false; // Flag pour bloquer les requêtes trop fréquentes

    // Fonction pour créer une icône personnalisée
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

    // Fonction pour choisir l'icône en fonction du POI
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

    // Fonction pour charger et afficher les images Panoramax
    const loadPanoramaxImages = async (lat, lng) => {
      panoramaxLayer.value.clearLayers();
      const images = await fetchPanoramaxImages(lat, lng);
      images.forEach(image => {
        const marker = L.circleMarker([image.lat, image.lng], {
          radius: 6,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 0.5,
          fillOpacity: 0.4,
          imageId: image.id,
        }).addTo(panoramaxLayer.value);
        marker.on('click', () => {
          emit('panoramax-image-selected', image);
        });
      });
    };

    // Fonction pour afficher les POI sur la carte
    const displayPOIsOnMap = (pois) => {
      poiLayer.value.clearLayers();
      pois.forEach(poi => {
        const lat = poi.lat || poi.center?.lat;
        const lng = poi.lon || poi.center?.lon;
        if (lat && lng) {
          const marker = L.marker([lat, lng], {
            icon: getIconForPOI(poi),
          }).addTo(poiLayer.value);

          // Contenu initial de la popup
          let popupContent = `
            <b>${poi.tags?.name || "POI"}</b><br>
            ${poi.tags?.amenity}<br>
            ${poi.tags?.capacity ? `Capacité : ${poi.tags.capacity}<br>` : ""}
            <span id="panoramax-link-${poi.id}" style="color: black; cursor: default;">
              Recherche des images Panoramax à proximité...
            </span>
          `;
          marker.bindPopup(popupContent);

          // Gestion du clic sur le marqueur
          marker.on('click', async () => {
            selectedPOI.value = { id: poi.id, name: poi.tags?.name || "POI", lat, lng ,tags: poi.tags };
            emit('poi-selected', selectedPOI.value);

            // Charge les images Panoramax autour du POI
            await loadPanoramaxImages(lat, lng);
            const images = await fetchPanoramaxImages(lat, lng);
            const panoramaxId = poi.tags?.panoramax; // ID de l'image associée dans OSM

            // Si une image est associée dans OSM, on l'affiche en priorité
            if (panoramaxId) {
              const associatedImage = images.find(img => img.id === panoramaxId);
              if (associatedImage) {
                emit('panoramax-image-selected', associatedImage);
              } else {
                // Sinon, on essaie de récupérer l'image directement depuis Panoramax
                const image = await getPanoramaxImage(panoramaxId);
                if (image) {
                  emit('panoramax-image-selected', image);
                } else if (images.length > 0) {
                  // Si aucune image associée, on prend la première disponible
                  emit('panoramax-image-selected', images[0]);
                } else {
                  emit('panoramax-image-selected', null);
                }
              }
            } else if (images.length > 0) {
              // Si pas d'image associée, on affiche la première disponible
              emit('panoramax-image-selected', images[0]);
            } else {
              emit('panoramax-image-selected', null);
            }
          });

          // Mise à jour du lien Panoramax quand la popup s'ouvre
          marker.on('popupopen', async () => {
            const linkElement = document.getElementById(`panoramax-link-${poi.id}`);
            if (!linkElement) return;

            try {
              const images = await fetchPanoramaxImages(lat, lng);
              const panoramaxId = poi.tags?.panoramax; // ID de l'image associée dans OSM

              if (images.length > 0) {
                // Si une image est associée dans OSM, on la met en avant
                const associatedImage = images.find(img => img.id === panoramaxId);
                if (associatedImage) {
                  linkElement.textContent = `✅ Image Panoramax déjà associée, postée par ${associatedImage.providerName || "un·e contributeur·rice"} sur l'instance ${associatedImage.instanceName || "Panoramax"}`;
                  linkElement.style.cursor = 'pointer';
                  linkElement.style.color = 'green';
                  linkElement.onclick = () => {
                    emit('open-panoramax-viewer', associatedImage);
                  };
                } else {
                  linkElement.textContent = `📷 ${images.length} image${images.length > 1 ? 's' : ''} Panoramax disponible${images.length > 1 ? 's' : ''} à proximité`;
                  linkElement.style.cursor = 'default';
                  linkElement.style.textDecoration = 'none';
                  linkElement.style.color = 'black';
                  linkElement.onclick = null;
                }
              } else {
                linkElement.textContent = '❌ Aucune image Panoramax disponible à proximité';
                linkElement.style.cursor = 'default';
                linkElement.style.textDecoration = 'none';
                linkElement.style.color = 'black';
                linkElement.onclick = null;
              }
            } catch (error) {
              console.error("Erreur lors de la vérification des images Panoramax :", error);
              linkElement.textContent = '⚠️ Erreur lors de la vérification des images Panoramax';
              linkElement.style.cursor = 'default';
              linkElement.style.textDecoration = 'none';
              linkElement.style.color = 'red';
              linkElement.onclick = null;
            }
          });
        }
      });
    };

    // Fonction pour récupérer et afficher les POI avec un délai de 3 secondes entre chaque requête
    const fetchAndDisplayPOIs = async () => {
      if (mapZoomLevel.value < 16 || isLoading.value || isFetching) return;

      const bounds = map.value.getBounds();
      const currentBbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

      isFetching = true; // Bloque les nouvelles requêtes
      isLoading.value = true;
      errorMessage.value = "";
      emit('loading', true);

      try {
        const pois = await fetchPOIs(currentBbox, props.selectedFilter);
        displayPOIsOnMap(pois);
      } catch (error) {
        console.error("Erreur lors de la récupération des POI :", error);
        errorMessage.value = `Erreur Overpass : ${error.message}`;
      } finally {
        isLoading.value = false;
        emit('loading', false);
        // Réactive les requêtes après 3 secondes
        setTimeout(() => {
          isFetching = false;
        }, 3000);
      }
    };

    let moveEndTimeout = null;
    onMounted(() => {
      if (mapContainer.value) {
        map.value = L.map(mapContainer.value, {
          maxZoom: 22,
        }).setView([48.8584, 2.2945], 12);
        L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
          attribution: 'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
          minZoom: 1,
          maxZoom: 20,
        }).addTo(map.value);
        poiLayer.value.addTo(map.value);
        panoramaxLayer.value.addTo(map.value);
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
      isLoading,
      errorMessage,
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
.error-message {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 1000;
  font-size: 14px;
}
</style>
