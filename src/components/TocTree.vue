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
      {{ prefix }}<span @click="closeSelected">{{ closedSign }}</span>
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
import metsAltoRequests from "../utils/mets-alto-requests";

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
    metsDiv() {},
  },
  computed: {
    isCurrentPage() {
      if (this.metsDiv.pages) {
        return this.metsDiv.pages.includes(this.pageNum);
      }
      return false;
    },
    closedSign() {
      if (this.isFinished || this.metsDiv.children.length == 0) return "\xa0";
      return this.closed ? "▲" : "▼";
    },
    formattedEntry() {
      return `[${this.metsDiv.pages.join(", ")}][${this.metsDiv.type}] ${
        this.metsDiv.label ? this.metsDiv.label : ""
      }`;
    },
    showEntry() {
      let element = metsAltoRequests.colorsTable.find(
        (el) => el.ENTITYNAME === this.metsDiv.type
      );
      return element !== undefined;
    },
    hasNothing() {
      return this.metsDiv == undefined;
    },

    isFinished() {
      return this.metsDiv.children == undefined;
    },
  },
  methods: {
    closeSelected(e) {
      e.stopPropagation();

      this.closed = !this.closed;
    },
    onEntryChanged(metsId) {
      this.currentSelected = metsId;
      this.$emit("entry-changed", metsId);
      this.$emit("data-changed", {
        pages: this.metsDiv.pages,
        areas: this.metsDiv.areas,
        type: this.metsDiv.type,
        label: this.metsDiv.label,
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