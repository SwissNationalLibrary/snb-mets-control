import xml2js from 'xml2js';
import fs from 'fs/promises';
import dbRequests from "../utils/db-requests";
import jp from "jsonpath";

class MetsRequests {
    constructor() {
        this.dataPath = "";
        this.metsData = {};
        this.usableTOC = {};
        this.altoData = {};
        this.altoToPage = {}
    }

    get colorsTable() {
        return dbRequests.colorsTable;
    }

    get mets() {
        return this.metsData;
    }

    get metsLogicalStructure() {
        return this.usableTOC;
    }


    setDataPath(path) {
        this.dataPath = path;
    }

    startTransformToUsableTOC() {
        let root = this.metsData.mets.structMap.find(map => map.$.TYPE === "LOGICAL");
        this.usableTOC = this.transformToUsableTOC(root, {});
        console.log(this.usableTOC)
    }


    getAltoAreas(node) {
        let areasPath = jp.query(node, "$..area[*]");
        let areas = [];
        areasPath.forEach(area => {
            areas.push(this.altoData[area.$.FILEID][area.$.BEGIN])
        });

        return areas;
    }

    transformToUsableTOC(currentDiv, currentTree) {
        if (currentDiv == undefined) {
            return null;
        }

        console.log(currentDiv);
        let element = dbRequests.colorsTable.find(el => el.ENTITYNAME === currentDiv.$.TYPE);

        if (element) {
            currentTree['areas'] = this.getAltoAreas(currentDiv);
            currentTree['pages'] = [...new Set(currentTree['areas'].map(area => area.page))];
            currentTree['type'] = currentDiv.$.TYPE;
        }

        currentTree['label'] = currentDiv.$.LABEL;
        currentTree['id'] = currentDiv.$.ID;
        currentTree['children'] = [];
        currentDiv.div?.forEach(div => {
            let transformed = this.transformToUsableTOC(div, {});
            if (transformed) currentTree['children'].push(transformed);

        });


        return currentTree;
    }

    _transformToUsableTOC(currentDiv, currentTree) {
        if (currentDiv.div == undefined) {
            switch (currentDiv.$.TYPE) {
                case 'PUBLISHING_STMT':
                case 'TEXTBLOCK':
                case 'HEADLINE':
                case 'ADVERTISEMENT':
                    var areas = this.getAltoAreas(currentDiv);
                    return {
                        id: currentDiv.$.ID,
                        type: currentDiv.$.TYPE,
                        areas: areas,
                        pages: areas.map(area => area.page)
                    }
            }
            return null;
        }

        currentTree['type'] = currentDiv.$.TYPE;
        currentTree['label'] = currentDiv.$.LABEL;
        currentTree['id'] = currentDiv.$.ID;

        switch (currentDiv.$.TYPE) {
            case "SECTION":
            case "ARTICLE":
            case "Newspaper":
            case 'ILLUSTRATION':
                currentTree['areas'] = this.getAltoAreas(currentDiv);
                currentTree['pages'] = [...new Set(currentTree['areas'].map(area => area.page))];
                break;
        }

        currentTree['children'] = [];
        currentDiv.div.forEach(div => {
            let transformed = this.transformToUsableTOC(div, {});
            if (transformed) currentTree['children'].push(transformed);
        });

        return currentTree;
    }

    async parseMets(mets) {
        await this.parseAllAlto(mets);
        let parser = new xml2js.Parser();
        let path = `/${mets.PATH}/${mets.FILENAME}`;
        let xmlData = await fs.readFile(this.dataPath + path)
        this.metsData = await parser.parseStringPromise(xmlData);

        this.startTransformToUsableTOC();
    }

    async parseAllAlto(mets) {
        let filenames = await dbRequests.getAltoFilenames(mets.ID_METS)

        for (const filename of filenames) {
            let data = await fs.readFile(`${this.dataPath}/${mets.PATH}/${filename.FILENAME}`);
            this.altoData[filename.FILEID] = await this.parseAlto(filename.FILEID, data);
        }

    }

    async parseAlto(fileId, altoXmlData) {
        let parser = new xml2js.Parser();
        let data = await parser.parseStringPromise(altoXmlData);
        let width = data.alto.Layout[0].Page[0].$.WIDTH;
        let height = data.alto.Layout[0].Page[0].$.HEIGHT;
        let textBlocks = data.alto.Layout[0].Page[0].PrintSpace[0].TextBlock;
        let composedBlocks = data.alto.Layout[0].Page[0].PrintSpace[0].ComposedBlock;

        let blocks = {};
        this.altoToPage[fileId] = Number(data.alto.Layout[0].Page[0].$.PHYSICAL_IMG_NR);
        if (textBlocks) {
            textBlocks.forEach(textBlock => {
                blocks[textBlock.$.ID] = {
                    id: textBlock.$.ID,
                    vpos: textBlock.$.VPOS / height,
                    hpos: textBlock.$.HPOS / width,
                    width: textBlock.$.WIDTH / width,
                    height: textBlock.$.HEIGHT / height,
                    page: this.altoToPage[fileId],
                };
            });
        }

        if (composedBlocks) {
            composedBlocks.forEach(composedBlock => {
                blocks[composedBlock.$.ID] = {
                    id: composedBlock.$.ID,
                    vpos: composedBlock.$.VPOS / height,
                    hpos: composedBlock.$.HPOS / width,
                    width: composedBlock.$.WIDTH / width,
                    height: composedBlock.$.HEIGHT / height,
                    page: this.altoToPage[fileId],
                }
            });
        }

        return blocks;
    }

    async getPDFFileData(mets) {
        let filename = await dbRequests.getPDFFilename(mets.ID_METS);
        let path = `/${mets.PATH}/${filename}`;
        let pdfData = await fs.readFile(this.dataPath + path);
        return pdfData;
    }
}

export default new MetsRequests();