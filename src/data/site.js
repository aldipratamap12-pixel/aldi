// Site-wide facts. Source of truth: F:\Career Ops\cv.md and brand/fondasi-brand.md.
// No phone number on the website (Aldi's rule).
export const site = {
  name: 'Aldi Pratama Putra',
  role: 'UI/UX Designer',
  location: 'Depok, Indonesia',
  timezone: 'GMT+7',
  email: 'aldipratamap12@gmail.com',
  linkedin: 'https://www.linkedin.com/in/aldipratamap',
  // Resume PDF without the phone number. Put the file in public/ and set the path, e.g. '/resume-aldi-pratama-putra.pdf'.
  resume: null,
  positioning:
    'I design B2B web apps and internal tools, like dashboards and admin panels, plus B2C mobile apps and service websites. Most of my work happens before the screens: deciding who each screen is for and what they need to see first.',
  description: 'UI/UX designer for B2B web apps and internal tools, plus B2C mobile apps and service websites. Case studies: FASTTRACK Legal, MineVISPERA, HRIS, Super App IoT, LPPOM, Zaco Law Firm and SimaksiKu. Coming soon: MBA Order Management.',
};

// Projects are shown on the live site only when permission is "granted".
// In `npm run dev` every project is shown, with a small dev-only marker.
export const SHOW_ALL = import.meta.env.DEV;
