<template>
  <RecycleScroller
    class="scroller"
    :items="mets"
    :item-size="25"
    key-field="ID_METS"
  >
    <template v-slot="{ item }">
      <div
        class="mets-element"
        :class="{ 'mets-selected': item.ID_METS === currentIdMets }"
        @click="metsSelected(item)"
      >
        {{ item.FILENAME }}
      </div>
    </template>
  </RecycleScroller>
</template>

<script>
export default {
  props: {
    mets: Array,
  },
  computed: {
    metsFields() {
      return [
        { key: "ID_METS", sortable: true },
        { key: "FILENAME", sortable: true },
      ];
    },
  },
  data: () => ({
    currentIdMets: null,
  }),
  methods: {
    metsSelected(mets) {
      this.currentIdMets = mets.ID_METS;
      this.$emit("select", mets);
    },
  },
};
</script>

<style>
.scroller {
  height: 100%;
}

.mets-selected {
  background-color: var(--secondary);
  color: white;
}

.mets-element {
  border-top: 1px solid var(--secondary);
  border-bottom: 1px solid var(--secondary);
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0px 10px 0px 10px;
  cursor: pointer;
}

.mets-element:not(.mets-selected):hover {
  background-color: lightgray;
}
</style>