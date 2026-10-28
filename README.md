# Geotagged Attendance System

A location-based employee attendance system built with **React Native (Expo)**, **Node.js**, **Express**, **Prisma**, and **PostgreSQL (Neon)**.

The system allows employees to:

- Log in using their Employee ID
- Punch in using their current GPS location
- Punch out using their current GPS location
- Validate attendance against a configured workplace radius
- Provide a reason when punching in/out outside the workplace
- View today's attendance
- View attendance history
- Automatically get punched out when the maximum session duration is exceeded

Administrators can:

- Log in securely
- Manage employees
- Activate/deactivate employees
- Configure the workplace location and attendance radius
- View attendance records
- View out-of-range attendance
- View dashboard statistics

---

# 1. Run the Project Locally

## Prerequisites

Install the following before starting:

- **Node.js** (LTS recommended)
- **npm**
- **Git**
- **PostgreSQL / Neon account**
- **Expo / EAS CLI** for running and building the mobile application

You can verify Node and npm:

```bash
node --version
npm --version
```

Install Expo/EAS CLI if required:

```bash
npm install -g eas-cli
```

---

## Clone the Repository

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Enter the project:

```bash
cd geotagged_attendance
```

The project contains separate backend and mobile applications:

```text
geotagged_attendance/
│
├── backend/
│
└── mobile/
```

---

# Backend Setup

Open a terminal in the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
JWT_SECRET="YOUR_JWT_SECRET"
PORT=5000
```

Replace the values with your own configuration.

`DATABASE_URL` should point to your PostgreSQL/Neon database.

Do not commit `.env` to Git.

---

## Configure the Database

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the Prisma database schema:

```bash
npx prisma db push
```

If the project uses migrations, apply them with:

```bash
npx prisma migrate deploy
```

---

## Seed Development Data

For local development, run:

```bash
npx prisma db seed
```

The development seed creates the initial administrator, employee, and workplace data configured by the project.

---

## Start the Backend

Development:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# Mobile Setup

Open another terminal.

From the project root:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

---

## Configure Mobile Environment

Create:

```text
mobile/.env
```

Add:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000
```

For a physical Android device, do **not** normally use:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

Instead, use the local IP address of the computer running the backend.

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000
```

The phone and computer should be connected to the same network.

For the deployed backend, the value can be:

```env
EXPO_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN
```

---

## Start Expo

Run:

```bash
npx expo start -c
```

Then:

- Press `a` to open Android emulator
- Scan the QR code using Expo Go if supported by the project
- Or run the application using an installed development build

---

# Local Project Structure

```text
geotagged_attendance/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   └── .env
│
└── mobile/
    ├── app/
    ├── src/
    ├── assets/
    ├── package.json
    └── .env
```

---

# 2. Deploy the Project

The application consists of two independently deployed parts:

```text
Mobile App
    │
    ▼
Backend API
    │
    ▼
PostgreSQL / Neon
```

The recommended deployment flow is:

```text
Neon
  ↓
Backend → Render
  ↓
Mobile → EAS Build
```

---

# Deploy PostgreSQL

Create a production PostgreSQL database using Neon or another PostgreSQL provider.

Obtain the production database connection string.

Example:

```env
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL"
```

Keep this value private.

Do not put the production database URL inside the mobile application.

---

# Deploy Backend

The backend can be deployed to a Node.js hosting provider such as Render.

Create a new **Web Service** and connect the GitHub repository.

Set the backend's root directory to:

```text
backend
```

Install command:

```bash
npm install
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Add the required production environment variables:

```env
DATABASE_URL=YOUR_PRODUCTION_DATABASE_URL
JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET
PORT=10000
```

Use a strong, private JWT secret in production.

---

## Production Database Setup

After configuring the production database, apply the Prisma schema/migrations.

For a migration-based deployment:

```bash
npx prisma migrate deploy
```

If the deployment process requires Prisma Client generation:

```bash
npx prisma generate
```

Do not use development seed data in the production database unless it is intentionally required.

---

## Verify the Backend

After deployment, open:

```text
https://YOUR-BACKEND-DOMAIN/api/health
```

The API should return a successful health response.

The final backend URL will look similar to:

```text
https://your-application.onrender.com
```

---

# Deploy the Mobile Application

Before building the mobile application, update:

```text
mobile/.env
```

Set:

```env
EXPO_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN
```

Do not add `/api` to the end if the application API functions already include `/api/...`.

For example:

```env
EXPO_PUBLIC_API_URL=https://your-application.onrender.com
```

---

## Build Android Application

From the mobile directory:

```bash
cd mobile
```

Log in to EAS:

```bash
eas login
```

Build the Android application:

```bash
eas build --platform android --profile preview
```

For a production Android build:

```bash
eas build --platform android --profile production
```

The generated build can then be distributed to customers or published through the appropriate Android distribution channel.

---

# Production Architecture

The deployed system will look like:

```text
                    ┌─────────────────────┐
                    │   Android Mobile    │
                    │       App           │
                    └──────────┬──────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │      Render         │
                    └──────────┬──────────┘
                               │
                             Prisma
                               │
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL / Neon   │
                    └─────────────────────┘
```

---

# Important Security Notes

Never commit the following to Git:

```text
.env
DATABASE_URL
JWT_SECRET
production credentials
private API keys
```

Use environment variables on the deployment platform instead.

The mobile application should communicate with the backend API only. It should **never connect directly to the PostgreSQL database**.

For production, use:

- HTTPS
- A strong JWT secret
- A production PostgreSQL database
- Separate development and production environments
- Secure environment variables
- Regular database backups
- Production database migrations

---

# Current Deployment Model

The current version is designed as a **single-tenant attendance system**.

That means the current production setup is intended for one organization/workplace environment.

A future SaaS version can introduce:

```text
Organizations
    │
    ├── Admins
    ├── Employees
    ├── Workplaces
    └── Attendance
```

with tenant isolation so multiple customers can use the same application securely.
