<template>
  <div class="app-container">
    <!-- Left panel -->
    <div class="left-panel">
      <MapContainer
        :selectedFilter="selectedFilter"
        @poi-selected="handlePOISelected"
        @panoramax-images-found="handlePanoramaxImagesFound"
      >
        <FilterBox @filter-changed="handleFilterChange" />
      </MapContainer>
    </div>
    <!-- Right panel -->
    <div class="right-panel">
      <PanoramaxViewer :selectedImageUrl="selectedImageUrl" />
      <ImageGallery
        :images="panoramaxImages"
        @image-selected="handleImageSelected"
      />
      <button
        class="add-image-button"
        :disabled="!selectedPOI || !selectedImageUrl"
        @click="addImageToPOI"
      >
        Add this image to POI
        <span v-if="!selectedPOI || !selectedImageUrl">
          ({{ !selectedPOI ? "Select a POI first" : "Select an image first" }})
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import MapContainer from '@/components/MapContainer.vue';
import FilterBox from '@/components/FilterBox.vue';
import PanoramaxViewer from '@/components/PanoramaxViewer.vue';
import ImageGallery from '@/components/ImageGallery.vue';

export default {
  components: {
    MapContainer,
    FilterBox,
    PanoramaxViewer,
    ImageGallery,
  },
  setup() {
    const selectedFilter = ref("bike");
    const selectedPOI = ref(null);
    const selectedImageUrl = ref(null);
    const panoramaxImages = ref([]);

    const handleFilterChange = (filter) => {
      selectedFilter.value = filter;
    };

    const handlePOISelected = (poi) => {
      selectedPOI.value = poi;
    };

    const handlePanoramaxImagesFound = (images) => {
      panoramaxImages.value = images.map(image => ({
        hash: image.properties.id,
        thumbnail: image.properties.thumbnail,
        url: `https://api.panoramax.xyz/#pic=${image.properties.id}`,
      }));
      if (images.length > 0) {
        selectedImageUrl.value = `https://api.panoramax.xyz/#pic=${images[0].properties.id}`;
      } else {
        selectedImageUrl.value = null;
      }
    };

    const handleImageSelected = (hash) => {
      selectedImageUrl.value = `https://api.panoramax.xyz/#pic=${hash}`;
    };

    const addImageToPOI = () => {
      if (selectedPOI.value && selectedImageUrl.value) {
        alert(`Image ${selectedImageUrl.value} added to POI ${selectedPOI.value.name}!`);
      }
    };

    return {
      selectedFilter,
      selectedPOI,
      selectedImageUrl,
      panoramaxImages,
      handleFilterChange,
      handlePOISelected,
      handlePanoramaxImagesFound,
      handleImageSelected,
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
