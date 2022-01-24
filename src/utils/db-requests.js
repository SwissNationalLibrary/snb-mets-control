import sqlite3 from 'sqlite3'
class DbRequests {
    constructor() {
        this.data = {};
        this.errorMetsData = [];
        this.colors = [];
    }

    get colorsTable() {
        return this.colors;
    }

    get mets() {
        return this.data.mets;
    }

    get samplingMets() {
        return this.data.samplingMets;
    }

    get dataPath() {
        return this.dataPath;
    }

    get errorMets() {
        return this.errorMetsData;
    }

    get hashMets() {
        let hash = {};

        for (let metsElement in this.data.mets) {
            hash[metsElement.ID_METS] = metsElement;
        }

        return hash;
    }

    async loadColors() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT RCOLOR, GCOLOR, BCOLOR, ENTITYNAME, DOCTYPE FROM ENTITYCONFIGURATION WHERE USEDNAMALYS = 1", (err, data) => {
                if (err) reject(err);
                this.colors = data;
                resolve();
            })
        })
    }

    async loadDatabase(dbPath) {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, async (err) => {
                if (err) reject(err);
                await this.loadMETS();
                await this.loadErrorsMets();
                await this.loadColors();
                resolve();
            })
        })
    }
    async loadErrorsMets() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT ERRORTYPE.ERROR, COUNT(*) FROM METSERROR INNER JOIN ERRORTYPE ON METSERROR.ID_ERRORTYPE = ERRORTYPE.ID_TYPE GROUP BY ERRORTYPE.ID_TYPE', (err, data) => {
                if (err) reject(err);
                this.errorMetsData = data;
                console.log(this.errorMetsData)
                resolve();
            })
        });
    }
    async loadMETS() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM METS", async (err, data) => {
                if (err) reject(err);
                this.data['mets'] = data;
                await this._loadSampling();
                resolve();
            });
        });
    }


    async _loadSampling() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM METS NATURAL JOIN SAMPLING_STRUCTURE", async (err, data) => {
                if (err) reject(err);
                this.data['samplingMets'] = data;
                resolve();
            });
        });
    }

    async loadDataFromMETS() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM METS", (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    async getPDFFilename(metsID) {
        return new Promise((resolve, reject) => {
            console.log("first select")

            this.db.get("SELECT FILENAME FROM LINKEDFILES WHERE ID_METS = ? AND TYPE = 'ISSUEPDFGRP'", metsID, async (err, data) => {
                if (err) reject(err);
                console.log("after select")

                resolve(data.FILENAME);
            });

        });
    }

    async getAltoFilenames(metsID) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT FILEID, FILENAME FROM LINKEDFILES WHERE ID_METS = ? AND TYPE = 'ALTOGRP' ORDER BY FILEID", metsID, async (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    async closeDatabase() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                resolve();
            })
        })

    }
}

export default new DbRequests();