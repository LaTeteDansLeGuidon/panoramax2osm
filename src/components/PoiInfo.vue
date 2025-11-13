<template>
  <div class="poi-info" v-if="poi">
    <h3>{{'POI Details' }}</h3>
    <table class="poi-tags">
      <tr v-for="(value, key) in poi.tags" :key="key">
        <td><strong>{{ key }}:</strong></td>
        <td>{{ value }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    poi: {
      type: Object,
      required: false,
      default: null,
    },
  },
};
</script>

<style scoped>
.poi-info {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.poi-tags {
  width: 100%;
  border-collapse: collapse;
}
.poi-tags tr {
  border-bottom: 1px solid #eee;
}
.poi-tags td {
  padding: 5px;
}
</style>
