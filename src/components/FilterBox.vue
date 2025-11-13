<template>
  <div class="filter-box" :class="{ 'collapsed': isCollapsed }">
    <div class="filter-header" @click="toggleCollapse">
      <h3>Filtres</h3>
      <span>{{ isCollapsed ? '▼' : '▲' }}</span>
    </div>
    <div class="filter-content" v-if="!isCollapsed">
      <p class="filter-description">
        Sélectionnez une catégorie pour afficher les points d'intérêt (POI) sur la carte.
      </p>
      <select v-model="selectedFilter" @change="$emit('filter-changed', selectedFilter)">
        <option value="bike">Vélo</option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  emits: ['filter-changed'],
  setup() {
    const isCollapsed = ref(true);
    const selectedFilter = ref("bike");

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    return {
      isCollapsed,
      selectedFilter,
      toggleCollapse,
    };
  },
};
</script>

<style scoped>
.filter-box {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
}

.filter-box.collapsed {
  height: 40px;
}

.filter-header {
  padding: 10px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
}

.filter-content {
  padding: 15px;
}

.filter-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.filter-select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}
</style>
