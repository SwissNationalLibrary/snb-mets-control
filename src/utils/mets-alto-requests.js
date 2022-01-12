import xml2js from 'xml2js';
import fs from 'fs/promises';
import dbRequests from "../utils/db-requests";

class MetsRequests {
    constructor() {
        this.dataPath = "";
        this.metsData = {};
        this.usableTOC = {};
        this.altoData = {};
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
        let root;
        for (let i = 0; this.metsData.mets.structMap.length; i++) {
            if (this.metsData.mets.structMap[i].$.TYPE == "LOGICAL") {
                root = this.metsData.mets.structMap[i].div[0];
                break;
            }
        }
        this.usableTOC = this.transformToUsableTOC(root, {});
    }

    transformToUsableTOC(currentDiv, currentTree) {
        if (currentDiv.div == undefined) {
            switch (currentDiv.$.TYPE) {
                case 'PUBLISHING_STMT':
                case 'TEXTBLOCK':
                case 'HEADLINE':
                case 'ADVERTISEMENT':
                    return { type: currentDiv.$.TYPE }
            }
            return null;
        }

        currentTree['type'] = currentDiv.$.TYPE;
        currentTree['label'] = currentDiv.$.LABEL;
        currentTree['id'] = currentDiv.$.ID;

        currentTree['children'] = [];
        currentDiv.div.forEach(div => {
            let transformed = this.transformToUsableTOC(div, {});
            if (transformed) currentTree['children'].push(transformed);
        });

        return currentTree;
    }

    async parseMets(mets) {
        let parser = new xml2js.Parser();
        let path = `/${mets.PATH}/${mets.FILENAME}`;
        let xmlData = await fs.readFile(this.dataPath + path)
        this.metsData = await parser.parseStringPromise(xmlData);
        await this.parseAllAlto(mets);
        console.log(this.altoData);

        this.startTransformToUsableTOC();
    }

    async parseAllAlto(mets) {
        let filenames = await dbRequests.getAltoFilenames(mets.ID_METS)

        filenames.forEach(async filename => {
            let data = await fs.readFile(`${this.dataPath}/${mets.PATH}/${filename.FILENAME}`);
            this.altoData[filename.FILEID] = await this.parseAlto(data);
        });

    }

    async parseAlto(altoXmlData) {
        let parser = new xml2js.Parser();
        let data = await parser.parseStringPromise(altoXmlData);
        let width = data.alto.Layout[0].Page[0].$.WIDTH;
        let height = data.alto.Layout[0].Page[0].$.HEIGHT;
        let textBlocks = data.alto.Layout[0].Page[0].PrintSpace[0].TextBlock;
        let composedBlocks = data.alto.Layout[0].Page[0].PrintSpace[0].ComposedBlock;

        let blocks = {};

        if (textBlocks) {
            textBlocks.forEach(textBlock => {
                blocks[textBlock.$.ID] = {
                    vpos: textBlock.$.VPOS / height,
                    hpos: textBlock.$.HPOS / width,
                    width: textBlock.$.WIDTH / width,
                    height: textBlock.$.HEIGHT / height,
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
                }
            });
        }

        return blocks;
    }

    async getPDFFileData(mets) {
        console.log("asdfasdfasd")
        let filename = await dbRequests.getPDFFilename(mets.ID_METS);
        console.log("asdfasdfasd")
        let path = `/${mets.PATH}/${filename}`;
        let pdfData = await fs.readFile(this.dataPath + path);
        return pdfData;
    }
}

export default new MetsRequests();