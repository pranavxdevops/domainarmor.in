<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
</p>

# 🛡️ ShieldMail — Email Security Monitoring SaaS

A production-ready **Email Security Monitoring** platform that helps you monitor the security posture of your email domains. Track **SPF**, **DMARC**, **DKIM**, **MX records**, **blacklist status**, and **domain expiry** — all from a beautiful dark-themed dashboard.

---

## ✨ Features

- 🔐 **Authentication** — Register & login with JWT-based auth and bcrypt password hashing
- 🌐 **Domain Management** — Add and monitor multiple email domains
- 🔍 **Full Security Scans** — One-click scan checks:
  - **SPF** record verification (`v=spf1`)
  - **DMARC** policy detection (`_dmarc.domain`)
  - **DKIM** signing check (`selector1._domainkey.domain`)
  - **MX** record enumeration
  - **WHOIS** domain expiry date
  - **Blacklist** lookup against 3 major RBL servers
- 📊 **Scoring System** — 0-100 security score with automatic deductions
- 📈 **Scan History** — Chart.js visual history of score trends over time
- 🎨 **Premium Dark UI** — Glassmorphism design with animations and glow effects
- 🔒 **Security** — Rate limiting, input validation, centralized error handling, hidden stack traces in production

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Chart.js, React Router v6, Axios |
| **Backend** | Vercel Serverless Functions (Node.js), Mongoose, Nodemailer |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **DNS** | Node.js `dns/promises` module |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
email-security-saas/
├── api/                          # Vercel Serverless API Routes
│   ├── auth/
│   │   ├── register.js           # POST /api/auth/register
│   │   └── login.js              # POST /api/auth/login
│   └── domain/
│       ├── add.js                # POST /api/domain/add
│       ├── list.js               # GET  /api/domain/list
│       ├── check.js              # POST /api/domain/check
│       └── [id].js               # GET  /api/domain/:id
├── lib/                          # Service Libraries
│   ├── db.js                     # MongoDB connection (cached for serverless)
│   ├── dnsService.js             # SPF, DMARC, DKIM, MX lookups
│   ├── blacklistService.js       # RBL blacklist checking
│   ├── scoringService.js         # Security score calculator
│   ├── mailService.js            # Nodemailer alert emails
│   └── authMiddleware.js         # JWT auth, rate limiter, validators
├── models/                       # Mongoose Models
│   ├── User.js                   # User (email, password, plan)
│   ├── Domain.js                 # Domain (userId, domain, lastScore)
│   └── ScanLog.js                # ScanLog (domainId, spf, dmarc, dkim, ...)
├── src/                          # React Frontend
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── ProtectedRoute.jsx    # Auth route guard
│   │   ├── ScoreBadge.jsx        # Color-coded score badge
│   │   ├── ScoreMeter.jsx        # Animated SVG score gauge
│   │   └── ScanChart.jsx         # Chart.js score history
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   └── DomainDetail.jsx      # Domain detail view
│   ├── api.js                    # Axios instance with JWT interceptor
│   ├── App.jsx                   # App routes
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind + custom design system
├── index.html                    # HTML entry
├── package.json
├── vercel.json                   # Vercel deployment config
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example                  # Environment variable template
```

---

## 📊 Scoring System

The security score starts at **100** and deducts points for each issue found:

| Check | Deduction |
|-------|-----------|
| SPF record missing | **-25** |
| DMARC policy missing | **-25** |
| DKIM signing missing | **-20** |
| Blacklisted on RBL | **-30** |
| Domain expiring < 30 days | **-20** |

**Score Thresholds:**
- 🟢 **> 80** — Healthy
- 🟡 **60–80** — Warning
- 🔴 **< 60** — Critical

---

## 🔍 Blacklist Servers Checked

| RBL Server | Provider |
|------------|----------|
| `zen.spamhaus.org` | Spamhaus |
| `bl.spamcop.net` | SpamCop |
| `b.barracudacentral.org` | Barracuda |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | `{ email, password }` | Register a new user |
| `POST` | `/api/auth/login` | `{ email, password }` | Login and get JWT token |

### Domains (Requires `Authorization: Bearer <token>`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/domain/add` | `{ domain }` | Add a domain to monitor |
| `GET` | `/api/domain/list` | — | List all your domains |
| `POST` | `/api/domain/check` | `{ domainId }` | Run a full security scan |
| `GET` | `/api/domain/:id` | — | Get domain details + scan history |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas))
- **Vercel** account ([free tier](https://vercel.com))

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/email-security-saas.git
cd email-security-saas

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/email-security?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## ☁️ Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/email-security-saas.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the Vite framework

### 3. Set Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | SMTP email |
| `SMTP_PASS` | SMTP app password |

### 4. MongoDB Atlas Network Access

Whitelist `0.0.0.0/0` in MongoDB Atlas → **Network Access** to allow Vercel's dynamic IPs.

### 5. Deploy

```bash
vercel --prod
```

---

## 🗃️ Database Models

### User
```javascript
{
  email: String,        // unique, validated
  password: String,     // bcrypt hashed (12 rounds)
  plan: "free" | "pro", // default: "free"
  createdAt: Date,
  updatedAt: Date
}
```

### Domain
```javascript
{
  userId: ObjectId,                              // ref: User
  domain: String,                                // e.g., "example.com"
  lastScore: Number,                             // 0-100
  lastStatus: "healthy" | "warning" | "critical",
  createdAt: Date,
  updatedAt: Date
}
```

### ScanLog
```javascript
{
  domainId: ObjectId,  // ref: Domain
  spf: Boolean,        // SPF record found
  dmarc: Boolean,      // DMARC policy found
  dkim: Boolean,       // DKIM signing found
  mx: [String],        // MX records list
  expiryDate: Date,    // Domain expiry
  blacklisted: Boolean,// RBL listed
  score: Number,       // Computed score
  createdAt: Date
}
```

---

## 🔒 Security Features

- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Authentication** — 7-day token expiry, Bearer scheme
- **Rate Limiting** — 30 requests/minute per IP (in-memory)
- **Input Validation** — Email and domain format validation
- **Error Handling** — Centralized with production stack trace hiding
- **MongoDB Injection Prevention** — Mongoose schema validation
- **Connection Caching** — Global MongoDB connection reuse for serverless

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Email/password login with error handling |
| **Register** | `/register` | Account creation with password confirmation |
| **Dashboard** | `/dashboard` | Stats cards, domain table, add domain, scan buttons |
| **Domain Detail** | `/domain/:id` | Score meter, detailed results, scan history chart |

---

## 📦 Dependencies

### Production
| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `chart.js`, `react-chartjs-2` | Score history charts |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `nodemailer` | Email alerts |
| `whois-json` | Domain expiry lookup |

### Development
| Package | Purpose |
|---------|---------|
| `vite` | Build tool |
| `@vitejs/plugin-react` | React support for Vite |
| `tailwindcss` | Utility-first CSS |
| `autoprefixer`, `postcss` | CSS processing |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, Vercel & MongoDB Atlas
</p>
