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
        <span>{{ item.FILENAME }} </span>
        <span>
          <b-icon icon="folder" @click="openFolder($event, item)"></b-icon
        ></span>
      </div>
    </template>
  </RecycleScroller>
</template>

<script>
import { ipcRenderer } from "electron";
import metsAltoRequests from "../utils/mets-alto-requests";
export default {
  props: {
    mets: Array,
  },
  computed: {},
  data: () => ({
    currentIdMets: null,
  }),
  methods: {
    metsSelected(mets) {
      this.currentIdMets = mets.ID_METS;
      this.$emit("select", mets);
    },
    async openFolder(event, item) {
      event.stopPropagation();

      await ipcRenderer.invoke(
        "open-folder-with-file",
        `${metsAltoRequests.dataPath}/${item.PATH}/${item.FILENAME}`
      );
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