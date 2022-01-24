<template>
  <div>
    <b-container fluid class="no-margins">
      <b-row no-gutters class="m-2">
        <b-col>
          <b-form id="pdf-reader-bar" inline @submit.stop.prevent>
            <b-button :disabled="pageNum <= 1" @click="previousPage"
              >Prev</b-button
            >
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
              >Next</b-button
            >

            <b-button @click="zoomIn">Zoom In</b-button>
            <b-button @click="zoomOut">Zoom Out</b-button>
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
        style="height: 95vh; overflow: scroll"
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
              :key="area.id"
              v-for="area in visibleBlocksArray"
              class="block"
              :style="getAreaCSS(area)"
            ></div>
          </div>
          <canvas id="pdf-layer"></canvas>
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
    page: null,
    nbPages: 0,
    canvas: null,
    context: null,
    scale: 1,
    pageNum: 0,
    areas: [],
    type: null,
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
    },
    async pageNum(newPageNum) {
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
        top: `${area.vpos * this.canvas.height}px`,
        left: `${area.hpos * this.canvas.width}px`,
        height: `${area.height * this.canvas.height}px`,
        width: `${area.width * this.canvas.width}px`,
        backgroundColor: this.areaColor,
      };
    },
    async loadPDF() {
      this.scale = 1;
      let pdfData = await metsAltoRequests.getPDFFileData(this.mets);
      let loadingTask = pdfjs.getDocument(pdfData);
      this.pdf = await loadingTask.promise;
      this.nbPages = this.pdf.numPages;
      this.canvas = document.getElementById("pdf-layer");
      this.context = this.canvas.getContext("2d");
      this.pageNum = 1;
    },

    async nextPage() {
      if (this.pageNum >= this.nbPages) return;
      this.pageNum++;
      await this.loadPage(this.pageNum);
    },
    async previousPage() {
      if (this.pageNum <= 1) return;
      this.pageNum--;
      await this.loadPage(this.pageNum);
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
      let viewport = this.page.getViewport({ scale: 1 });
      this.canvas.width = viewport.width;
      this.canvas.height = viewport.height;
      this.page.render({
        canvasContext: this.context,
        viewport: viewport,
      });
    },

    async loadPage(pageNb) {
      this.scale = 1;
      this.page = await this.pdf.getPage(pageNb);
      let viewport = this.page.getViewport({ scale: this.scale });
      this.canvas.width = viewport.width;
      this.canvas.height = viewport.height;
      this.page.render({
        canvasContext: this.context,
        viewport: viewport,
      });
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

#blocks-layer {
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