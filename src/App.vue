<template>
  <div id="app">
    <init-view v-if="!dbLoaded" @loaded="dbLoaded = true" />
    <doc-viewer v-else @unload="dbLoaded = false" />
  </div>
</template>

<script>
import InitView from "./views/InitView.vue";
import DocViewer from "./views/DocViewer.vue";

export default {
  name: "App",
  components: { InitView, DocViewer },
  data: () => ({
    dbLoaded: false
  })
};
</script>

<style>
</style>
