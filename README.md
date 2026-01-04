# Nexuz Monorepo

This is a monorepo containing the Telegram bot and mini-app projects, with shared codebase.

## Structure

-  `packages/shared`: Shared code (Prisma, lib, messages, etc.)
-  `packages/bot`: Telegram bot
-  `packages/mini-app`: Next.js mini-app

## Installation

```bash
pnpm install
```

## Running

### Mini-app

```bash
pnpm run dev:mini-app
```

### Bot

```bash
pnpm run start:bot
```

## Building

### Mini-app

```bash
pnpm run build:mini-app
```

-  **Database & ORM:** [Prisma](https://www.prisma.io/) & PostgreSQL
-  **Style & UI:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-  **Form Management:** React Hook Form & Zod

## ✨ Features

-  **Product Listing:** Display products with detailed filtering.
-  **Product Management Panel (/myproducts):**
-  Users can manage the products they added.
-  Options to Edit, Delete, Pause/Activate the Listing.
-  View incoming comments.
-  **Comment and Review System:** Users can give star ratings and leave comments on products.
-  **Responsive Design:** Mobile-friendly interface (Full-screen Drawer and modals).
-  **Secure Authentication:** (in the Telegram environment)

## 🛠️ Installation

Follow the steps below to run the project on your local machine:

1. **Clone the repository:**

```bash
git clone [https://github.com/PalwanSaryyew/pubg-app.git](https://github.com/PalwanSaryyew/pubg-app.git)
cd pubg-app
```
