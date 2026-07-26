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
            const frontmatter = [
                '---',
                `address: "${data.address}"`,
                `city: "${data.city}"`,
                `state: "${data.state}"`,
                `zip: ${data.zip}"`,
                `neighborhood: "${data.neighborhood}"`,
                `rental_price: "${data.rentalPrice}"`,
                `rental_type: "${data.rentalType}"`,
                `floor_plan: "${data.floorPlan}"`,
                `sqft: "${data.sqft}"`,
                `bedrooms: "${data.bedrooms}"`,
                `bathrooms: "${data.bathrooms}"`,
                'amenities:',
                ...data.amenities.map(a => ` - "${a}"`),
                `pets: "${data.pets}"`,
                `in_unit_laundry: ${data.inUnitLaundry}`,
                `ac: ${data.hasAC}`,
                `dishwasher: ${data.hasDishwasher}`,
                `availability_date: "${data.availabilityDate}"`,
                `rating: "${data.rating}"`,
                `property_management: "${data.propertyManagement}"`,
                `contact_email: "${data.contactEmail}"`,
                `contact_phone: "${data.contactPhone}"`,
                `prerequisites: "${data.prerequisites}"`,
                `link: "${data.link}"`,
                '---'
            ].join('\n');
            let body = `\n# [[${data.address}]]\n\n`;
            if (data.propertyManagement.toLowerCase().includes('owner')) {
                body += `> [!warning] For Sale / Rent By Owner\n\n`;
            }
            body += `## Description\n${data.description}\n\n## Photos\n`;
            data.photos.forEach(photo => {
                body += `![](${photo})\n`;
            });
            const fileContent = `{$frontmatter}\n${body}`;
            const file = this.app.vault.getAbstractFileByPath(fileName);
            if (file instanceof obsidian_1.TFile) {
                yield this.app.vault.modify(file, fileContent);
            }
            else {
                yield this.app.vault.create(fileName, fileContent);
            }
        });
    }
}
exports.default = RentalPropertyImporter;
