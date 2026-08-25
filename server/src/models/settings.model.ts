import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurantSettings extends Document {
  restaurantName: string;
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  openingHoursRestaurant?: string;
  openingHoursStreetFood?: string;
  updatedAt: Date;
}

const RestaurantSettingsSchema = new Schema<IRestaurantSettings>(
  {
    restaurantName: {
      type: String,
      default: 'Lina Restaurant, Bar And Street Food',
    },
    whatsappNumber: {
      type: String,
      default: '2349165196622',
      required: true,
    },
    contactPhone: {
      type: String,
      default: '09165196622',
    },
    contactEmail: {
      type: String,
      default: 'linarestaurantandbar@gmail.com',
    },
    address: {
      type: String,
      default: '7/29 6th Avenue, Gwarinpa, Abuja',
    },
    tiktokUrl: {
      type: String,
      default: 'https://www.tiktok.com/@lina_restaurant?_r=1&_t=ZS-999dMxzyRjV',
    },
    instagramUrl: {
      type: String,
      default: 'https://www.instagram.com/lina_restaurant_and_streetfood?igsi=MTBndGluYnhyNDY5aA==',
    },
    facebookUrl: {
      type: String,
      default: 'https://www.facebook.com/share/1EjgzWAGvT/?mibextid=wwXIfr',
    },
    openingHoursRestaurant: {
      type: String,
      default: '12:00 PM – Late',
    },
    openingHoursStreetFood: {
      type: String,
      default: '5:00 PM – Late',
    },
  },
  {
    timestamps: true,
  }
);

export const RestaurantSettings = mongoose.model<IRestaurantSettings>(
  'RestaurantSettings',
  RestaurantSettingsSchema
);
