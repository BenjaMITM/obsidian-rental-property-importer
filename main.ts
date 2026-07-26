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

    if (file instanceof TFile) {
      await this.app.vault.modify(file, fileContent);
    } else {
      await this.app.vault.create(fileName, fileContent);
    }
  }
}
