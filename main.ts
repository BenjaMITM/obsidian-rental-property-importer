import { App, Plugin, TFile, normalizePath } from 'obsidian';

interface RentalData {
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  rentalPrice: string;
  rentalType: string;
  floorPlan: string;
  sqft: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  pets: string;
  inUnitLaundry: boolean;
  hasAC: boolean;
  hasDishwasher: boolean;
  availabilityDate: string;
  rating: string;
  propertyManagement: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  prerequisites: string;
  link: string;
  photos: string[];
}

export default class RentalPropertyImporter extends Plugin {
  async onload() {
    this.registerObsidianProtocolHandler('rental-import', async (params) => {
      if (params.action === 'rental-import' && params.data) {
        try {
          const decodedData = decodeURIComponent(params.data);
          const rentalData: RentalData = JSON.parse(decodedData);
          await this.createRentalNote(rentalData);
        } catch (error) {
          console.error("Failed to parse rental data", error);
        }
      }
    });
  }

  async createRentalNote(data: RentalData) {
    const folderPath = 'Rental Properties';
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    const safeTitle = data.address.replace(/[\\/:*?"<>|]/g, '-').trim() || `Unknown Property ${Date.now()}`;
    const fileName = normalizePath(`${folderPath}/${safeTitle}.md`);

    let body = `\n# [[${data.address}]]\n\n`;

    if (data.propertyManagement.toLowerCase().includes('owner')) {
      body += `> [!warning] For Sale / Rent By Owner\n\n`;
    }

    body += `## Description\n${data.description}\n\n## Photos\n`;
    data.photos.forEach(photo => {
      body += `![](${photo})\n`;
    });

    const existingFile = this.app.vault.getAbstractFileByPath(fileName);
    let file: TFile;

    if (existingFile instanceof TFile) {
      file = existingFile;
      await this.app.vault.modify(file, body);
    } else {
      file = await this.app.vault.create(fileName, body);
    }

    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
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
  }
}
