<template>
  <div v-if="!hasNothing">
    <p
      class="toc-element"
      :class="{
        'current-page': isCurrentPage,
        selected: metsDiv.id == currentSelected,
      }"
      v-if="showEntry"
      @click="onElementClicked"
    >
      {{ prefix }}<span @click="closed = !closed">{{ closedSign }}</span>
      {{ formattedEntry }}
    </p>
    <div v-if="!isFinished">
      <TocTree
        :newSelected="currentSelected"
        @entry-changed="onEntryChanged"
        :id="metsDiv.id"
        :class="{ 'is-closed': closed }"
        v-for="div in metsDiv.children"
        :pageNum="pageNum"
        :key="div.id"
        :metsDiv="div"
        :prefix="prefix + (showEntry ? '\xa0\xa0\xa0\xa0' : '')"
        @data-changed="$emit('data-changed', $event)"
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
    pageNum: Number,
    newSelected: String,
  },
  components: {
    TocTree: () => import("./TocTree.vue"),
  },
  watch: {
    newSelected(newValue) {
      this.currentSelected = newValue;
    },
    metsDiv() {

    }
  },
  computed: {
    isCurrentPage() {
      if (this.metsDiv.pages) {
        return this.metsDiv.pages.includes(this.pageNum);
      }
      return false;
    },
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
        case "ILLUSTRATION":
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
  methods: {
    onEntryChanged(metsId) {
      this.currentSelected = metsId;
      this.$emit("entry-changed", metsId);
      this.$emit("data-changed", {
        pages: this.metsDiv.pages,
        areas: this.metsDiv.areas,
      });
    },
    onElementClicked() {
      this.onEntryChanged(this.metsDiv.id);
    },
  },

  data: () => ({
    closed: false,
    currentSelected: "",
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

.current-page {
  font-weight: bold;
}

.toc-element.selected {
  background-color: lightblue;
}
</style>