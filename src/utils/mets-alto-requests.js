import xml2js from 'xml2js';
import fs from 'fs/promises';
class MetsRequests {
    constructor() {
        this.dataPath = "";
        this.metsData = {};
        this.usableTOC = {};
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
        this.usableTOC = this.transformToUsableTOC(this.metsData.mets.structMap[2].div[0], {});
        console.log(this.usableTOC);
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

        currentTree['children'] = [];
        currentDiv.div.forEach(div => {
            let transformed = this.transformToUsableTOC(div, {});
            if (transformed) currentTree['children'].push(transformed);
        });

        return currentTree;
    }

    async parseMets(mets) {
        this.parser = new xml2js.Parser();
        let path = `/${mets.PATH}/${mets.FILENAME}`;
        let xmlData = await fs.readFile(this.dataPath + path)
        this.metsData = await this.parser.parseStringPromise(xmlData);
        this.startTransformToUsableTOC();
        console.log(this.metsData);
    }
}

export default new MetsRequests();