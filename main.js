"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class RentalPropertyImporter extends obsidian_1.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerObsidianProtocolHandler('rental-import', (params) => __awaiter(this, void 0, void 0, function* () {
                if (params.action === 'rental-import' && params.data) {
                    try {
                        const decodedData = decodeURIComponent(params.data);
                        const rentalData = JSON.parse(decodedData);
                        yield this.createRentalNote(rentalData);
                    }
                    catch (error) {
                        console.error("Failed to parse rental data", error);
                    }
                }
            }));
        });
    }
    createRentalNote(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderPath = 'Rental Properties';
            const folder = this.app.vault.getAbstractFileByPath(folderPath);
            if (!folder) {
                yield this.app.vault.createFolder(folderPath);
            }
            const safeTitle = data.address.replace(/[\\/:*?"<>|]/g, '-').trim() || `Unknown Property ${Date.now()}`;
            const fileName = (0, obsidian_1.normalizePath)(`${folderPath}/${safeTitle}.md`);
            let body = `\n# [[${data.address}]]\n\n`;
            if (data.propertyManagement.toLowerCase().includes('owner')) {
                body += `> [!warning] For Sale / Rent By Owner\n\n`;
            }
            body += `## Description\n${data.description}\n\n## Photos\n`;
            data.photos.forEach(photo => {
                body += `![](${photo})\n`;
            });
            const existingFile = this.app.vault.getAbstractFileByPath(fileName);
            let file;
            if (existingFile instanceof obsidian_1.TFile) {
                file = existingFile;
                yield this.app.vault.modify(file, body);
            }
            else {
                file = yield this.app.vault.create(fileName, body);
            }
            yield this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                frontmatter['address'] = data.address;
                frontmatter['city'] = data.city;
                frontmatter['state'] = data.state;
                frontmatter['zip'] = data.zip;
                frontmatter['neighborhood'] = data.neighborhood;
                frontmatter['rental_price'] = data.rentalPrice;
                frontmatter['rental_type'] = data.rentalType;
                frontmatter['floor_plan'] = data.floorPlan;
                frontmatter['sqft'] = data.sqft;
                frontmatter['bedrooms'] = data.bedrooms;
                frontmatter['bathrooms'] = data.bathrooms;
                frontmatter['amenities'] = data.amenities;
                frontmatter['pets'] = data.pets;
                frontmatter['in_unit_laundry'] = data.inUnitLaundry;
                frontmatter['ac'] = data.hasAC;
                frontmatter['dishwasher'] = data.hasDishwasher;
                frontmatter['availability_date'] = data.availabilityDate;
                frontmatter['rating'] = data.rating;
                frontmatter['property_management'] = data.propertyManagement;
                frontmatter['contact_email'] = data.contactEmail;
                frontmatter['contact_phone'] = data.contactPhone;
                frontmatter['prerequisites'] = data.prerequisites;
                frontmatter['link'] = data.link;
            });
        });
    }
}
exports.default = RentalPropertyImporter;
