<template>
  <div>
    <b-container fluid class="no-margins">
      <b-row no-gutters>
        <b-col>
          <b-form inline>
            <b-button :disabled="pageNum == 1" @click="previousPage"
              >Prev</b-button
            >
            <span>
              <b-form-input
                style="width: 50px"
                size="sm"
                v-model="pageNum"
              ></b-form-input
              >/ {{ nbPages }}</span
            >
            <b-button :disableD="pageNum == nbPages" @click="nextPage"
              >Next</b-button
            >
          </b-form>
        </b-col>
      </b-row>
      <b-row no-gutters>
        <b-col id="pdf-layer-parent" class="scrollable-xy">
          <div id="blocks-layer"></div>
          <canvas
            id="pdf-layer"
            @wheel="zoomEvent"
            :style="{ transform: 'scale(' + scale + ')' }"
          ></canvas>
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
  },
  components: {},
  computed: {},

  data: () => ({
    pdf: null,
    page: null,
    nbPages: 0,
    canvas: null,
    context: null,
    scale: 1,
    pageNum: 1,
    ro: null,
  }),
  watch: {
    async pageNum(newPageNum) {
      if (newPageNum > this.nbPages) this.pageNum = this.nbPages;
      this.$emit('page-changed', newPageNum);
      await this.loadPage(Number(newPageNum));

    },
    async mets() {
      await this.loadPDF();
    },

  },
  methods: {
    async loadPDF() {
      this.scale = 1;
      let pdfData = await metsAltoRequests.getPDFFileData(this.mets);
      let loadingTask = pdfjs.getDocument(pdfData);
      this.pdf = await loadingTask.promise;
      this.nbPages = this.pdf.numPages;
      this.canvas = document.getElementById("pdf-layer");
      this.context = this.canvas.getContext("2d");
      this.loadPage(1);
    },

    async nextPage() {
      if (this.pageNum == this.nbPages) return;
      this.pageNum++;
      await this.loadPage(this.pageNum);
    },
    async previousPage() {
      if (this.pageNum == 1) return;
      this.pageNum--;
      await this.loadPage(this.pageNum);
    },
    zoomEvent(e) {
      console.log(e);
      if (e.ctrlKey) {
        if (e.deltaY < 0) {
          this.scale *= 1.5;
        } else {
          this.scale /= 1.5;
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
  opacity: 0.5;
  border-style: solid;
  border-width: 2px;
}

.block.section {
}

.block.article {
  background-color: red;
  border-color: darkred;
}
</style>