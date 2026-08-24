# nova-browserDev

**nova-browserDev** is a premium, high-performance code sharing and publishing platform designed for teams and developers. It transforms raw HTML into beautiful, auto-themed webpages and provides a centralized repository for your organization's most valuable code assets.


![nova-browserDev Banner](https://i.ibb.co/39MmWh7Y/image.png)


## 🚀 Features

-   **HTML Publishing Engine**: Upload raw HTML and watch it instantly transform into a premium, dark-mode webpage with our custom "Glassmorphism" theme engine.
-   **Auto-Theming**: No CSS required. The platform injects professional typography (Outfit), colors, and component styles automatically.
-   **Staff Dashboard**: Secure "Restricted Access" portal for staff to manage, edit, and delete projects.
-   **Security First**:
    -   Timing-attack mitigation on login.
    -   Credential rotation scripts.
    -   Hardened security headers (CSP, X-Frame-Options).
-   **Fast & SEO Ready**: Built on Next.js 16 with server-side rendering and dynamic metadata for rich social embeds (Discord/Twitter cards).

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Database**: MongoDB Atlas (Mongoose)
-   **Styling**: Vanilla CSS (Premium Glassmorphism Theme)
-   **Auth**: Custom JWT + Bcrypt (HttpOnly Cookies)

## ⚡ Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/devrock07/nova-browserDev.git
cd nova-browserDev
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_secret
```

### 3. Database Setup
Run the seed script to create the initial Admin user:
```bash
node scripts/seed-user.js
```
*Note: This creates the secure admin user `devrock69`.*

### 4. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000` to browse the library.

## 🌍 Deployment

This project is optimized for deployment on **Netlify** or **Vercel**.

1.  Push code to GitHub.
2.  Import project in Netlify/Vercel.
3.  Add `MONGODB_URI` and `JWT_SECRET` to the Environment Variables.
4.  Deploy!

## 🫡 Credits & Authors

**Made with ❤️ by [devrock07](https://github.com/devrock07)** for **nova-browserDev**.

---
*© 2025 nova-browserDev. All rights reserved.*
