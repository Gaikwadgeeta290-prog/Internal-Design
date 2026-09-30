# Atelier Noire — Luxury Interior Website + Admin

React + Vite + Framer Motion + Express. The public luxury website and the protected admin system share the same backend.

## Run

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173/` (or the next available port if 5173 is busy).

API: `http://localhost:5050`

## Admin

Open:

`http://localhost:5173/admin/login`

Credentials:

- Email: `admin@gmail.com`
- Password: `admin123`

The admin login creates a server-side session token. The dashboard is protected and redirects unauthenticated users back to the login page.

## Admin features

- Dashboard overview and live counts
- Project library: add/delete projects
- Contact enquiries from the public Contact page
- Consultation requests from the public booking form
- Protected logout/session handling

## Motion update

The public website uses staged, section-by-section motion: headings, copy, images and controls reveal in sequence instead of entering at the same time. The Contact page has additional staggered form choreography and the admin login has its own cinematic entrance/orb animation.

## Video

The public site uses editorial image backgrounds and sequential motion; no local video asset is required.
