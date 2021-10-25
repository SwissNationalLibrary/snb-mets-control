<template>
  <div v-if="!hasNothing">
      <p class="toc-element" v-if="showEntry">
        {{ formattedEntry }}
      </p>
      <div v-if="!isFinished">
        <TocTree
          v-for="div in metsDiv.children"
          :key="div.label"
          :metsDiv="div"
          :prefix="prefix + (showEntry ? '>' : '')"
        />
      </div>
  </div>
</template>

<script>
import TocTree from "./TocTree.vue";

export default {
  name: "TocTree",
  props: {
    prefix: {
      type: String,
      default: "",
    },
    metsDiv: Object,
  },
  components: {
    TocTree,
  },
  computed: {
    formattedEntry() {
      if (this.metsDiv.label) {
        return `${this.prefix}[${this.metsDiv.type}] ${this.metsDiv.label} `;
      } else {
        return `${this.prefix}[${this.metsDiv.type}]`;
      }
    },
    showEntry() {
      if (this.metsDiv.label == undefined && this.metsDiv.children == undefined)
        return true;

      switch (this.metsDiv.type) {
        case "SECTION":
        case "ARTICLE":
        case "Newspaper":
          return true;
      }

      return false;
    },
    hasNothing() {
      return this.metsDiv == undefined;
    },

    isFinished() {
      return this.metsDiv.children == undefined;
    },
  },
  methods: {},

  data: () => ({}),
};
</script>

<style>
.toc-element {
  margin: 2px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>