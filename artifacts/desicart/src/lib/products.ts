import ultra3Img from "@/assets/ultra3-watch.png";
import airpodsImg from "@/assets/airpods-pro-2.png";
import kts1185Img from "@/assets/kts-1185-speaker.png";
import powerbankImg from "@/assets/powerbank.png";
import akgImg from "@/assets/akg-handsfree.png";
import solarSpeakerImg from "@/assets/solar-speaker.png";
import acFanImg from "@/assets/portable-ac-fan.png";
import pb10kImg from "@/assets/powerbank-10k-slim.png";
import pb20kImg from "@/assets/powerbank-20k-transparent.png";
import p9HeadphonesImg from "@/assets/p9-headphones.png";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  oldPrice?: string;
  img: string;
  tag?: string;
  category: string;
  description: string;
  features: string[];
};

export const products: Product[] = [
  {
    slug: "ultra-3-smartwatch",
    name: "Ultra 3 Smartwatch",
    tagline: "Pakistan's Most Versatile 7-Strap Luxury Watch",
    price: "Rs. 4,500",
    oldPrice: "Rs. 12,000",
    img: ultra3Img,
    tag: "7-in-1 Edition",
    category: "Smart Watch",
    description:
      "The ultimate smartwatch package for DesiCart customers. Featuring a stunning Super AMOLED display and 7 different interchangeable straps to match every outfit.",
    features: [
      "Big Full HD Infinite Display",
      "7 Premium Straps Included in Box",
      "Wireless Fast Charging",
      "Bluetooth Calling & Heart Rate Monitoring",
      "Sports Mode & Calculator Built-in",
    ],
  },
  {
    slug: "airpods-pro-2-black",
    name: "Airpods Pro 2 Black",
    tagline: "Master Copy | ANC & Deep Bass",
    price: "Rs. 1,500",
    oldPrice: "Rs. 3,500",
    img: airpodsImg,
    tag: "Best Seller",
    category: "Earbuds",
    description:
      "Experience premium sound with the sleek Airpods Pro 2 in a stunning matte black finish. Designed for comfort and high-quality audio, these are the perfect daily drivers for music and calls.",
    features: [
      "Active Noise Cancellation (ANC) support",
      "Superior Bass & Crisp Treble",
      "3-4 Hours Playback Time",
      "Touch Controls for Music & Calls",
      "Wireless Charging Case",
    ],
  },
  {
    slug: "portable-ac-cooling-fan",
    name: "Portable AC Cooling Fan",
    tagline: "3-in-1 Cooler, Humidifier & Air Purifier",
    price: "Rs. 1,999",
    oldPrice: "Rs. 4,500",
    img: acFanImg,
    tag: "Summer Deal",
    category: "Home & Cooling",
    description:
      "Beat the heat with this ultra-portable personal air cooler. Features whisper-quiet operation, built-in water tank for evaporative cooling, and 3 fan speeds. Perfect for your desk, bedroom, or anywhere you need instant relief from the heat.",
    features: [
      "3-in-1: Cooling Fan + Humidifier + Air Purifier",
      "Built-in Water Tank (up to 8 hours cooling)",
      "3 Fan Speed Settings",
      "Ultra-Quiet Night Mode",
      "USB Powered — No Electricity Required",
    ],
  },
  {
    slug: "powerbank-10000mah-slim",
    name: "10000mAh Slim Power Bank",
    tagline: "PD 22.5W Fast Charging | Ultra Slim Design",
    price: "Rs. 1,999",
    oldPrice: "Rs. 4,000",
    img: pb10kImg,
    tag: "New",
    category: "Accessories",
    description:
      "Never run out of battery with this sleek, pocket-sized 10000mAh power bank. Features a crystal-clear LED digital display showing exact battery percentage, and supports 22.5W PD fast charging for all smartphones.",
    features: [
      "22.5W PD Fast Charging (phones charged in 1hr)",
      "LED Digital Battery Percentage Display",
      "Ultra-Slim Pocket-Friendly Design",
      "Charges 2 Devices Simultaneously",
      "Aviation-Grade Battery Cell Protection",
    ],
  },
  {
    slug: "powerbank-20000mah-transparent",
    name: "20000mAh Transparent Power Bank",
    tagline: "66W Super Fast Charging | See-Through Tech",
    price: "Rs. 3,499",
    oldPrice: "Rs. 7,000",
    img: pb20kImg,
    tag: "Trending",
    category: "Accessories",
    description:
      "The most powerful power bank in the DesiCart lineup. With a stunning transparent body that shows off the internal circuit board, this 20000mAh beast supports 66W blazing-fast charging — enough to fully charge your phone in under 30 minutes.",
    features: [
      "66W Blazing Fast PD Charging",
      "Transparent Body — Show Off Your Tech",
      "Digital Display: Battery % + Output Current/Voltage",
      "20000mAh Capacity — Charges Phone 5-6 Times",
      "Multi-device Support: Type-C + USB-A Ports",
    ],
  },
  {
    slug: "kts-1185-speaker",
    name: "KTS-1185 Wireless Speaker",
    tagline: "3-Inch Drive | Built-in Emergency Torch",
    price: "Rs. 1,800",
    oldPrice: "Rs. 3,500",
    img: kts1185Img,
    tag: "New",
    category: "Speakers",
    description:
      "A portable powerhouse for music lovers. This wireless speaker features a 3-inch high-bass driver and a built-in emergency light, making it the perfect outdoor companion.",
    features: [
      "3\" Powerful Audio Drive",
      "Built-in High-Power Emergency Light",
      "FM Radio & USB/TF Card Support",
      "Wireless Bluetooth Connectivity",
      "Rugged, Portable Design with Handle",
    ],
  },
  {
    slug: "p9-wireless-headphones",
    name: "P9 Wireless Headphones",
    tagline: "Deep Bass | 20H Playtime | Foldable Design",
    price: "Rs. 1,499",
    oldPrice: "Rs. 3,500",
    img: p9HeadphonesImg,
    tag: "Hot Pick",
    category: "Headphones",
    description:
      "The P9 over-ear wireless headphones deliver studio-quality sound in a sleek, foldable design. With 20 hours of playtime, active noise isolation, and a built-in microphone, these are the perfect all-day companion for music, calls, and gaming.",
    features: [
      "Powerful Deep Bass Sound",
      "20-Hour Battery Life",
      "Foldable & Lightweight — Travel-Ready",
      "Built-in Mic for Hands-Free Calls",
      "Bluetooth 5.0 + 3.5mm Wired Mode",
    ],
  },
  {
    slug: "super-charger-powerbank",
    name: "Super Charger Power Bank",
    tagline: "LED Digital Display | PD Fast Charging",
    price: "Rs. 2,999",
    oldPrice: "Rs. 6,000",
    img: powerbankImg,
    tag: "Limited",
    category: "Accessories",
    description:
      "Never run out of juice again. This intelligent super-fast charging power bank features a digital percentage display and PD Type-C input/output.",
    features: [
      "Intelligent Super Fast Charging",
      "LED Digital Battery Percentage Display",
      "Type-C PD 20W Output",
      "Travel-Friendly Design (Check-in OK)",
      "Multiple Device Protection Circuit",
    ],
  },
  {
    slug: "akg-handsfree",
    name: "AKG Type-C Handsfree",
    tagline: "Best Sound and Bass | Samsung Optimized",
    price: "Rs. 600",
    oldPrice: "Rs. 1,200",
    img: akgImg,
    category: "Headphones",
    description:
      "Original-quality AKG tuned earphones featuring deep bass and crystal clear audio. Available in both Type-C and 3.5mm jack versions to fit any smartphone.",
    features: [
      "Tuned by AKG for Studio Quality Sound",
      "Tangle-free Fabric Cable",
      "In-line Mic with Volume Control",
      "Extra Bass Boost Technology",
      "Ergonomic In-ear Design",
    ],
  },
  {
    slug: "kts-1706-solar-speaker",
    name: "KTS-1706 Solar Speaker",
    tagline: "4-Inch Drive | Solar Powered Music",
    price: "Rs. 2,500",
    oldPrice: "Rs. 4,500",
    img: solarSpeakerImg,
    tag: "Outdoor",
    category: "Speakers",
    description:
      "A rugged outdoor speaker that never stops playing. With a built-in solar panel, you can charge it under the sun while enjoying your favorite hits with the massive 4-inch driver.",
    features: [
      "Built-in Solar Charging Panel",
      "Large 4\" High-Output Driver",
      "High-Power LED Flashlight",
      "Bluetooth, USB, and SD Card Support",
      "Long-lasting Rechargeable Battery",
    ],
  },
];

export const WHATSAPP_NUMBER = "923214028277";

export function waLinkFor(productName: string) {
  const text = `Hi! I want to order the ${productName} from DesiCart.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
