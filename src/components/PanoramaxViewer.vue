<template>
  <div class="panoramax-viewer">
    <h3>Visualisation Panoramax</h3>
    <iframe
      v-if="selectedImageUrl"
      :src="selectedImageUrl"
      width="100%"
      height="100%"
      frameborder="0"
    ></iframe>
    <p v-else>Aucune image sélectionnée.</p>
  </div>
</template>

<script>
export default {
  props: {
    selectedImageUrl: String,
  },
};
</script>

<style scoped>
.panoramax-viewer {
  flex: 2;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  min-height: 0;
}

.panoramax-viewer h3 {
  margin-top: 0;
  font-size: 14px;
}

.panoramax-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
