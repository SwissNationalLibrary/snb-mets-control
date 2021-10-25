<template>
  <b-container>
    <b-row>
      <b-col>
        <h1 class="text-center">SNB METS Controller</h1>
      </b-col>
    </b-row>
    <b-row class="justify-content-center">
      <b-col lg="6" md="8">
        <b-form>
          <b-form-group
            id="input-group-1"
            label="Path to .db file"
            label-for="file-input-db"
          >
            <b-input-group size="sm">
              <b-form-input
                size="sm"
                id="file-input-db"
                v-model="dbPath"
                type="text"
                placeholder="DB file"
                required
              ></b-form-input>
              <b-input-group-append>
                <b-button @click="chooseFile" variant="secondary"
                  >Choose file</b-button
                >
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-form-group
            id="input-group-1"
            label="Path to data folder"
            label-for="file-input-folder"
          >
            <b-input-group>
              <b-form-input
                size="sm"
                id="file-input-folder"
                v-model="dataPath"
                type="text"
                placeholder="Data path"
                required
              ></b-form-input>
              <b-input-group-append>
                <b-button @click="chooseFolder" size="sm" variant="secondary"
                  >Choose folder</b-button
                >
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-button
            :disabled="!pathCorrect || loading"
            @click="loadDB"
            size="sm"
            block
          >
            <span v-if="!loading">NEXT</span>
            <span v-else>
              <b-spinner small></b-spinner>
              Loading...
            </span>
          </b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { ipcRenderer } from "electron";
import dbRequests from "../utils/db-requests";
import metsAltoRequests from "../utils/mets-alto-requests";

export default {
  computed: {
    pathCorrect() {
      return this.dbPath !== "" && this.dataPath !== "";
    },
  },
  data: () => ({
    dbPath: "",
    dataPath: "",
    loading: false,
  }),
  methods: {
    async loadDB() {
      this.loading = true;
      try {
        await dbRequests.loadDatabase(this.dbPath);
        metsAltoRequests.setDataPath(this.dataPath);
        this.$emit("loaded");
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },
    async chooseFile() {
      let path = await ipcRenderer.invoke("choose-file", [
        { name: "Namalysator DB", extensions: ["db"] },
      ]);
      if (path) this.dbPath = path;
    },
    async chooseFolder() {
      let path = await ipcRenderer.invoke("choose-folder");
      if (path) this.dataPath = path;
    },
  },
};
</script>

<style>
</style>