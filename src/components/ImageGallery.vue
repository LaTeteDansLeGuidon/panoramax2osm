<template>
  <div class="gallery-container">
    <h3>Nearby Panoramax Images</h3>
    <div class="gallery">
      <div
        v-for="image in images"
        :key="image.id"
        class="thumbnail"
        @click="$emit('image-selected', image)"
      >
        <img :src="image.thumbUrl" :alt="`Panoramax Image ${image.id}`" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    images: Array,
  },
};
</script>

<style scoped>
.gallery-container {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.gallery-container h3 {
  margin: 0;
  padding: 0 0 10px 0;
}

.gallery {
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px;
  min-height: 0;
}

.thumbnail {
  flex: 0 0 auto;
  height: 100%;
  width: 120px;
  cursor: pointer;
  border: 1px solid #ddd;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
