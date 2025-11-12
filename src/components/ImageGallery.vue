<template>
  <div class="image-gallery">
    <h3>Images Panoramax</h3>
    <div v-if="loading" class="loading-message">
      <p>Appel de l'API Panoramax en cours...</p>
      <p>URL : {{ apiUrl }}</p>
    </div>
    <div v-else-if="images.length > 0" class="gallery-container">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="gallery-item"
        @click="selectImage(image.hash)"
      >
        <img :src="image.thumbnail" />
      </div>
    </div>
    <p v-else-if="!loading && apiUrl">Pas d'images Panoramax à proximité (API appelée : {{ apiUrl }}).</p>
    <p v-else>Pas d'images Panoramax à proximité.</p>
  </div>
</template>


<script>
import { ref } from 'vue';

export default {
  props: {
    images: {
      type: Array,
      default: () => [],
    },
    apiUrl: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['image-selected'],
  setup(props, { emit }) {
    const selectImage = (hash) => {
      emit('image-selected', hash);
    };

    return {
      selectImage,
    };
  },
};
</script>


<style scoped>
.image-gallery {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
}

.image-gallery h3 {
  margin-top: 0;
  font-size: 14px;
}

.loading-message {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.loading-message p {
  margin: 5px 0;
  font-size: 12px;
}

.gallery-container {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 8px 0;
}

.gallery-item {
  flex: 0 0 auto;
}

.gallery-item img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}
</style>

