<template>
  <div v-if="!hasNothing">
    <p class="toc-element" v-if="showEntry">
      {{ prefix }}<span @click="closed = !closed">{{ closedSign }}</span>
      {{ formattedEntry }}
    </p>
    <div v-if="!isFinished" :id="metsDiv.id" :class="{ 'is-closed': closed }">
      <TocTree
        v-for="div in metsDiv.children"
        :key="div.id"
        :metsDiv="div"
        :prefix="prefix + (showEntry ? '\xa0\xa0\xa0\xa0' : '')"
      />
    </div>
  </div>
</template>

<script>
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
    TocTree: () => import("./TocTree.vue"),
  },
  computed: {
    closedSign() {
      if (this.isFinished) return "";
      return this.closed ? "▲" : "▼";
    },
    formattedEntry() {
      if (this.metsDiv.label) {
        return `[${this.metsDiv.type}] ${this.metsDiv.label} `;
      } else {
        return `[${this.metsDiv.type}]`;
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

  data: () => ({
    closed: false,
  }),
};
</script>

<style>
.toc-element {
  font-size: small;
  padding-bottom: 2px;
  border-bottom: 1px solid black;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

.is-closed {
  display: none;
}
</style>