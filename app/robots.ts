import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Agar aapka koi private folder hai jise Google pe nahi dikhana, toh usko disallow karein
      disallow: ['/api/', '/admin/'], 
    },
    sitemap: 'https://buyzze.in/sitemap.xml', // Aapki sitemap ka link
  }
}