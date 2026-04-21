# Picture Perfect Tones

A professional e-commerce and portfolio website for a photography preset brand, specializing in Indian wedding photography Lightroom presets.

## Tech Stack

- **Frontend:** React 18 with Vite 5
- **Styling:** Tailwind CSS 4.0 (via `@tailwindcss/vite` plugin)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** Wouter
- **State Management:** React Context API (CartContext, ContentContext)

## Project Structure

- `src/components/` - Shared UI components (Navbar, Footer, CartDrawer)
- `src/context/` - Global state providers (cart, content)
- `src/hooks/` - Custom React hooks (useSEO, useWindowSize)
- `src/lib/` - Utility functions and API client
- `src/pages/` - Page components (LandingPage, ShopPage, AdminPage, etc.)
- `public/` - Static assets (images, videos, robots.txt, sitemap.xml)

## Development

- Dev server runs on port 5000 via `npm run dev`
- Workflow: "Start application" → `npm run dev`

## Deployment

- Configured as a **static** deployment
- Build command: `npm run build` → outputs to `dist/`
- No backend server required (pure client-side SPA)

## Key Features

- Before/after image comparison slider
- Shopping cart with preset products
- Admin dashboard for content management
- Image protection (right-click/drag disabled)
- WhatsApp floating contact button
- SEO with sitemap and robots.txt
