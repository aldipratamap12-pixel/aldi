// Site-wide facts. Source of truth: F:\Career Ops\cv.md and brand/fondasi-brand.md.
// No phone number on the website (Aldi's rule).
export const site = {
  name: 'Aldi Pratama Putra',
  role: 'UI/UX Designer',
  location: 'Depok, Indonesia',
  timezone: 'GMT+7',
  email: 'aldipratamap12@gmail.com',
  linkedin: 'https://www.linkedin.com/in/aldi-pratama-putra-3349931b5',
  // Resume PDF without the phone number. Put the file in public/ and set the path, e.g. '/resume-aldi-pratama-putra.pdf'.
  resume: null,
  positioning:
    'I help software teams turn complex business systems (dashboards, admin panels and internal tools) into clear UI that users understand and developers can build.',
  description: 'UI/UX designer for dashboards, web apps and internal systems. Case studies: FASTTRACK Legal, MineVISPERA, HRIS, Super App IoT, LPPOM, Zaco Law Firm and SimaksiKu.',
};

// Projects are shown on the live site only when permission is "granted".
// In `npm run dev` every project is shown, with a small dev-only marker.
export const SHOW_ALL = import.meta.env.DEV;
