<template>
  <div>
    <b-container fluid class="no-margins">
      <b-row no-gutters class="m-2">
        <b-col>
          <b-form id="pdf-reader-bar" inline @submit.stop.prevent>
            <b-button :disabled="pageNum <= 1" @click="previousPage"
              ><b-icon icon="arrow-left"
            /></b-button>
            <span>
              <b-form-input
                style="width: 50px"
                size="sm"
                :value="pageNum"
                v-on:submit.native.prevent=""
                @keypress.enter="onPageEnter"
              ></b-form-input
              >/ <span class="mr-2">{{ nbPages }}</span></span
            >
            <b-button :disabled="pageNum >= nbPages" @click="nextPage"
              ><b-icon icon="arrow-right"
            /></b-button>

            <b-button @click="zoomIn"><b-icon icon="zoom-in" /></b-button>
            <b-button @click="zoomOut"><b-icon icon="zoom-out" /></b-button>
            <b-button @click="resetZoom">Reset Zoom</b-button>
            <b-form-checkbox v-model="hideAreas" name="check-button">
              Hide boxes
            </b-form-checkbox>
          </b-form>
        </b-col>
      </b-row>
      <b-row
        no-gutters
        @wheel="zoomEvent"
        style="height: calc(100vh - 54px); overflow: scroll"
      >
        <b-col
          id="pdf-layer-parent"
          :style="{
            transformOrigin: 'top left',
            transform: 'scale(' + scale + ')',
          }"
        >
          <div id="blocks-layer" :class="{ 'hide-areas': hideAreas }">
            <div
              :id="area.id"
              :key="area.id"
              v-for="area in visibleBlocksArray"
              class="block"
              :style="getAreaCSS(area)"
            >
              <b-tooltip v-if="label" :target="area.id" triggers="hover">
                {{ label }}
              </b-tooltip>
            </div>
          </div>
          <div id="pdf-canvases">
            <canvas
              :style="{
                position: 'absolute',
                visibility: i == pageNum ? 'visible' : 'hidden',
              }"
              :key="i"
              v-for="i in nbPages"
            ></canvas>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import * as pdfjs from "pdfjs-dist/webpack";
import metsAltoRequests from "../utils/mets-alto-requests";

export default {
  name: "PdfReader",
  props: {
    mets: Object,
    tocData: Object,
  },
  components: {},
  computed: {
    visibleBlocksArray() {
      return this.areas.filter((area) => area.page === this.pageNum);
    },
    areaColor() {
      let element = metsAltoRequests.colorsTable.find(
        (el) => el.ENTITYNAME == this.type
      );
      return `rgb(${element.RCOLOR}, ${element.GCOLOR}, ${element.BCOLOR})`;
    },
  },

  data: () => ({
    pdf: null,
    pages: [],
    nbPages: 0,
    canvases: [],
    contexts: [],
    renderedPages: [],
    scale: 1,
    pageNum: 0,
    areas: [],
    type: null,
    label: null,
    hideAreas: false,
  }),
  watch: {
    tocData(data) {
      if (!data.pages.includes(this.pageNum)) {
        this.pageNum = data.pages[0];
      }
      // Load blocks
      this.type = data.type;
      this.areas = data.areas;
      this.label = data.label;
    },
    async pageNum(newPageNum) {
      if (newPageNum == 0) return;
      if (newPageNum > this.nbPages) this.pageNum = this.nbPages;
      this.$emit("page-changed", newPageNum);
      await this.loadPage(Number(newPageNum));
    },
    async mets() {
      //this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
      await this.loadPDF();
    },
  },
  methods: {
    onPageEnter(e) {
      this.pageNum = Number(e.target.value);
    },
    getAreaCSS(area) {
      return {
        top: `${area.vpos * this.canvases[this.pageNum - 1].height}px`,
        left: `${area.hpos * this.canvases[this.pageNum - 1].width}px`,
        height: `${area.height * this.canvases[this.pageNum - 1].height}px`,
        width: `${area.width * this.canvases[this.pageNum - 1].width}px`,
        backgroundColor: this.areaColor,
      };
    },
    async loadPDF() {
      this.scale = 1;
      this.renderedPages = [];
      this.pageNum = 0;
      let pdfData = await metsAltoRequests.getPDFFileData(this.mets);
      let loadingTask = pdfjs.getDocument(pdfData);
      this.pdf = await loadingTask.promise;
      this.nbPages = this.pdf.numPages;
      for (let i = 0; i < this.nbPages; i++) {
        this.pages[i] = await this.pdf.getPage(i + 1);
      }

      this.$nextTick(() => {
        this.canvases = Array.from(document.getElementsByTagName("canvas"));
        this.contexts = this.canvases.map((canvas) => canvas.getContext("2d"));
        this.pageNum = 1;
      });
    },

    async nextPage() {
      if (this.pageNum >= this.nbPages) return;
      this.pageNum++;
    },
    async previousPage() {
      if (this.pageNum <= 1) return;
      this.pageNum--;
    },
    zoomIn() {
      this.scale *= 1.25;
    },
    zoomOut() {
      this.scale /= 1.25;
    },
    resetZoom() {
      this.scale = 1;
    },
    zoomEvent(e) {
      if (e.ctrlKey) {
        if (e.deltaY < 0) {
          this.zoomIn();
        } else {
          this.zoomOut();
        }
        //   this.setPageScale();
      }
    },

    async setPageScale() {
      let viewport = this.pages[this.pageNum - 1].getViewport({ scale: 1 });
      this.canvases[this.pageNum - 1].width = viewport.width;
      this.canvases[this.pageNum - 1].height = viewport.height;
      this.pages[this.pageNum - 1].render({
        canvasContext: this.contexts[this.pageNum - 1],
        viewport: viewport,
      });
    },

    async loadPage(pageNb) {
      if (this.renderedPages.includes(pageNb)) return;
      this.scale = 1;
      let viewport = this.pages[this.pageNum - 1].getViewport({
        scale: this.scale,
      });
      this.canvases[this.pageNum - 1].width = viewport.width;
      this.canvases[this.pageNum - 1].height = viewport.height;
      await this.pages[pageNb - 1].render({
        canvasContext: this.contexts[this.pageNum - 1],
        viewport: viewport,
      });
      this.renderedPages.push(pageNb);
    },
  },
  async mounted() {},
};
</script>

<style>
.toc-element {
  margin: 2px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scrollable-xy {
  overflow: scroll;
}

.no-margins {
  margin: 0;
  padding: 0;
}

.block {
  position: absolute;
  z-index: 1;
  opacity: 0.3;
  border-style: solid;
  border-width: 2px;
}

#pdf-reader-bar > * {
  margin-right: 8px;
}

.hide-areas {
  display: none;
}
</style>