<template>
  <div class="app-container">
    <!-- Left panel -->
    <div class="left-panel">
      <MapContainer
        :selectedFilter="selectedFilter"
        @poi-selected="handlePOISelected"
        @panoramax-image-selected="handlePanoramaxImageSelected"
        @open-panoramax-viewer="handleOpenPanoramaxViewer"
        @panoramax-images-updated="handlePanoramaxImagesUpdated"
      >
        <FilterBox @filter-changed="handleFilterChange" />
      </MapContainer>
    </div>
    <!-- Right panel -->
    <div class="right-panel">
      <PoiInfo :poi="selectedPOI" />
      <PanoramaxViewer
        :selectedImageId="selectedPanoramaxImage?.id"
        :isImageAssociated="isImageAssociated"
        @photo-changed="handlePhotoChange"
      />
      <ImageGallery
        :images="panoramaxImages"
        @image-selected="handleImageSelected"
      />
      <button
        class="add-image-button"
        :disabled="!selectedPOI || !selectedPanoramaxImage || isImageAssociated"
        @click="addImageToPOI"
      >
        Add image {{ selectedPanoramaxImage?.id || '?' }} to POI
        <span v-if="!selectedPOI || !selectedPanoramaxImage || isImageAssociated">
          ({{
            !selectedPOI ? "Select a POI first" :
            !selectedPanoramaxImage ? "Select an image first" :
            "Image already associated"
          }})
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import MapContainer from '@/components/MapContainer.vue';
import FilterBox from '@/components/FilterBox.vue';
import PanoramaxViewer from '@/components/PanoramaxViewer.vue';
import ImageGallery from '@/components/ImageGallery.vue';
import { fetchPanoramaxImages } from '@/services/panoramaxService';
import PoiInfo from '@/components/PoiInfo.vue';

export default {
  components: {
    MapContainer,
    FilterBox,
    PanoramaxViewer,
    ImageGallery,
    PoiInfo,
  },
  setup() {
    const selectedFilter = ref("bike");
    const selectedPOI = ref(null);
    const selectedPanoramaxUrl = ref(null);
    const selectedPanoramaxImage = ref(null);
    const panoramaxImages = ref([]);

    const isImageAssociated = computed(() => {
      if (!selectedPOI.value || !selectedPanoramaxImage.value) return false;
      return selectedPOI.value.tags?.panoramax === selectedPanoramaxImage.value.id;
    });

    const handleFilterChange = (filter) => {
      selectedFilter.value = filter;
    };

    const handlePOISelected = async (poi) => {
      selectedPOI.value = poi;
      if (poi && poi.lat && poi.lng) {
        const images = await fetchPanoramaxImages(poi.lat, poi.lng);
        panoramaxImages.value = images;
      }
    };

    const handlePanoramaxImageSelected = (image) => {
      selectedPanoramaxImage.value = image;
    };

    const handleImageSelected = (image) => {
      selectedPanoramaxImage.value = image;
      selectedPanoramaxUrl.value = image.panoramaxUrl;
    };

    const handleOpenPanoramaxViewer = (image) => {
      selectedPanoramaxUrl.value = image.panoramaxUrl;
    };

    const handlePanoramaxImagesUpdated = (images) => {
      panoramaxImages.value = images;
    };

    const handlePhotoChange = (newPhotoId) => {
      const image = panoramaxImages.value.find(img => img.id === newPhotoId);
      if (image) {
        selectedPanoramaxImage.value = image;
      } else {
        selectedPanoramaxImage.value = { id: newPhotoId };
      }
    };

    const addImageToPOI = () => {
      if (selectedPOI.value && selectedPanoramaxUrl.value) {
        alert(`Image ${selectedPanoramaxUrl.value} added to POI ${selectedPOI.value.name}!`);
      }
    };

    return {
      selectedFilter,
      selectedPOI,
      selectedPanoramaxImage,
      isImageAssociated,
      selectedPanoramaxUrl,
      panoramaxImages,
      handlePhotoChange, // Assure-toi que c'est bien le même nom
      handleFilterChange,
      handlePOISelected,
      handlePanoramaxImageSelected,
      handleImageSelected,
      handleOpenPanoramaxViewer,
      handlePanoramaxImagesUpdated,
      addImageToPOI,
    };
  },
};
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}
.left-panel, .right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}
.left-panel {
  border-right: 1px solid #ccc;
}
.right-panel {
  border-left: 1px solid #ccc;
}
.add-image-button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: auto;
  font-size: 16px;
}
.add-image-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
