import sqlite3 from 'sqlite3'
class DbRequests {
    constructor() {
        this.data = {};
        this.errorMetsData = [];
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

    async loadDatabase(dbPath) {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, async (err) => {
                if (err) reject(err);
                await this.loadMETS();
                await this.loadErrorsMets();
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