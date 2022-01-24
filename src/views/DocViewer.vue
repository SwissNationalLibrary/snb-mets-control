<template>
  <div style="height: 100vh">
    <splitpanes class="default-theme" horizontal>
      <pane>
        <splitpanes>
          <pane size="15" min-size="5">
            <b-overlay style="height: 100%" :show="loadingMets" rounded="sm"
              ><toc-tree
                @data-changed="tocData = $event"
                :pageNum="pageNum"
                class="scrollable"
                :metsDiv="metsDiv"
              /> </b-overlay
          ></pane>
          <pane min-size="5">
            <b-overlay style="height: 100%" :show="loadingMets" rounded="sm">
              <PdfReader
                @page-changed="pageNum = $event"
                :tocData="tocData"
                :mets="selectedMets"
              ></PdfReader
            ></b-overlay>
          </pane>
          <pane size="15" min-size="5">
            <b-container style="height: 100%" class="p-0">
              <b-row class="mt-3 ml-1 mr-1 justify-content-center">
                <b-col>
                  <b-form-radio-group
                    size="sm"
                    id="btn-radios-1"
                    v-model="samplesOnly"
                    :options="[
                      { text: 'All', value: false },
                      { text: 'Samples only', value: true },
                    ]"
                    buttons
                  ></b-form-radio-group>
                </b-col>
              </b-row>
              <hr />
              <b-row style="height: calc(100% - 47px)">
                <b-col style="height: 100%; overflow-y: auto"
                  ><mets-list @select="onMetsSelected" :mets="metsOffered"
                /></b-col>
              </b-row>
            </b-container>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import dbRequests from "../utils/db-requests";
import metsAltoRequests from "../utils/mets-alto-requests";

import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

import MetsList from "../components/MetsList.vue";
import TocTree from "../components/TocTree.vue";
import PdfReader from "../components/PdfReader.vue";

export default {
  components: {
    Splitpanes,
    Pane,
    MetsList,
    TocTree,
    PdfReader,
  },
  data() {
    return {
      mets: [],
      samplingMets: [],
      selectedMets: null,
      hashMets: {},
      samplesOnly: true,
      loadingMets: false,
      metsDiv: null,
      pageNum: 0,
      tocData: null,
    };
  },
  watch: {
    async selectedMets(selected) {
      this.loadingMets = true;
      this.metsDiv = null;
      this.pageNum = 0;
      this.tocData = null;
      await metsAltoRequests.parseMets(selected);
      this.metsDiv = metsAltoRequests.metsLogicalStructure;

      this.loadingMets = false;
    },
  },
  computed: {
    metsOffered() {
      return this.samplesOnly ? this.samplingMets : this.mets;
    },
  },
  mounted() {
    this.mets = dbRequests.mets;
    this.samplingMets = dbRequests.samplingMets;
    this.hashMets = dbRequests.hashMets;
  },
  methods: {
    onMetsSelected(mets) {
      this.selectedMets = mets;
    },
  },
};
</script>

<style>
.scrollable {
  height: 100vh;
  overflow-x: auto;
}

.scrollable-xy {
  /*overflow: scroll;*/
}
</style>