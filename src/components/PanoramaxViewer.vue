<template>
  <div class="panoramax-viewer">
    <h3>Panoramax Viewer</h3>
    <div class="iframe-container">
      <div v-if="isImageAssociated" class="associated-banner">
        ⚠️ Cette image est déjà associée à ce POI.
      </div>
      <iframe
        v-if="selectedImageUrl"
        :src="selectedImageUrl"
        width="100%"
        height="100%"
        frameborder="0"
        ref="panoramaxIframe"
      ></iframe>
      <p v-else>
        Aucune image Panoramax associée à ce POI. Veuillez choisir une image dans la galerie.
      </p>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    selectedImageUrl: String,
    isImageAssociated: Boolean,
  },
};
</script>

<style scoped>
.panoramax-viewer {
  flex: 3;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.iframe-container {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.iframe-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}
.associated-banner {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background-color: rgba(255, 204, 0, 0.9);
  color: #333;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  z-index: 10;
  border-radius: 4px;
}
.panoramax-viewer p {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #666;
  margin: 0;
}
</style>
