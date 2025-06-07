# JoinedInk 💜

> Create & Cherish Collaborative Digital Keepsakes

JoinedInk is a sentimental yet modern web application that allows you to create beautiful, collaborative digital keepsake books. Whether it's a graduation tribute, farewell gift, or team appreciation exchange, JoinedInk transforms heartfelt messages, photos, and memories into personalized digital treasures.

## ✨ Features

### 🎯 Two Collaboration Modes

**Individual Tribute**
- Multiple contributors write for one special recipient
- Perfect for graduations, farewells, birthdays, appreciation events
- Anonymous or named contributions
- Beautiful compiled keepsake book delivered via email

**Circle Notes** ⭐ *New Feature*
- Everyone in a group writes notes to everyone else
- Each person receives their own personalized keepsake book
- Perfect for team exchanges, group farewells, class appreciations
- Comprehensive memory sharing experience

### 🎨 Creative Expression Tools

- **Rich Text Editor**: Custom fonts, formatting, and styling
- **Photo Upload**: Share meaningful images and memories
- **Hand Drawings**: Freehand sketches and doodles
- **Digital Signatures**: Personal touch with drawn or typed signatures
- **Custom Backgrounds**: Beautiful page themes and stationery
- **Stickers & Decorations**: Fun elements to enhance messages

### 📚 Beautiful Output

- **Interactive Web Viewer**: Stunning digital book experience
- **PDF Downloads**: High-quality printable keepsake books
- **Responsive Design**: Perfect viewing on any device
- **Email Delivery**: Automatic delivery to recipients

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd joineink
   ```

2. **Set up the backend**
   ```bash
   cd joineink-backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `joineink-backend` directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/joineink_db"
   
   # JWT Secret for authentication
   JWT_SECRET="your-super-secret-jwt-key-here"
   
   # Frontend URL (for CORS and link generation)
   FRONTEND_URL="http://localhost:3000"
   
   # Email Configuration (for development, you can use Ethereal Email)
   SMTP_HOST="smtp.ethereal.email"
   SMTP_PORT=587
   SMTP_USER="your-ethereal-email@example.com"
   SMTP_PASS="your-ethereal-password"
   FROM_EMAIL="noreply@joineink.com"
   
   # Server Configuration
   PORT=5000
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb joineink_db
   
   # Push database schema
   npm run prisma:push
   ```

5. **Set up the frontend**
   ```bash
   cd ../joineink-frontend
   npm install
   ```

6. **Start the development servers**
   
   Backend (in `joineink-backend` directory):
   ```bash
   npm run dev
   ```
   
   Frontend (in `joineink-frontend` directory):
   ```bash
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗 Project Structure

```
joineink/
├── joineink-backend/           # Node.js/Express API
│   ├── prisma/                 # Database schema and migrations
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Authentication and other middleware
│   ├── utils/                  # Utility functions (email, etc.)
│   └── uploads/                # File upload storage
├── joineink-frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React contexts (auth, etc.)
│   │   ├── utils/              # Frontend utilities
│   │   └── types/              # TypeScript type definitions
│   └── public/                 # Static assets
└── PLAN.md                     # Detailed project specification
```

## 📖 Usage Guide

### For Organizers

1. **Sign up** for a JoinedInk account
2. **Create an event** by choosing:
   - Event type (Individual Tribute or Circle Notes)
   - Recipients and their email addresses
   - Contribution deadline
3. **Share contributor links** with friends, family, or team members
4. **Monitor progress** through your dashboard
5. **Close the event** manually or let it auto-close at the deadline
6. **Recipients receive** their beautiful keepsake books via email

### For Contributors

1. **Click the contributor link** shared by the organizer
2. **Select recipient** (for Circle Notes) or write for the designated person
3. **Create your message** using:
   - Rich text with custom fonts
   - Photo uploads
   - Hand-drawn sketches
   - Digital signature
   - Custom page backgrounds
4. **Preview and submit** your contribution
5. **No account required** - completely anonymous contribution option

### For Recipients

1. **Receive email notification** when your keepsake book is ready
2. **View your digital book** in a beautiful web interface
3. **Download as PDF** for printing or archiving
4. **Share with loved ones** using secure shareable links

## 🛠 Technology Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **PostgreSQL** - Database
- **Prisma** - Database ORM and migrations
- **JWT** - Authentication
- **Multer** - File upload handling
- **Puppeteer** - PDF generation
- **Nodemailer** - Email delivery

### Frontend
- **React 18** with **TypeScript** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling and design system
- **Axios** - API communication
- **React Hook Form** - Form management
- **Heroicons** - Icon library

## 🎨 Design Philosophy

JoinedInk follows a **"Sentimental yet Modern"** design aesthetic:

- **Warm, inviting color palette** with purple as the primary brand color
- **Clean, minimalist layouts** with ample whitespace
- **Typography blend** of readable sans-serif and elegant script fonts
- **Subtle animations** and smooth transitions
- **Responsive design** for seamless cross-device experience

## 🔒 Security Features

- **JWT-based authentication** for organizers
- **Anonymous contributions** with secure token-based access
- **CORS protection** and rate limiting
- **Input validation** and sanitization
- **Secure file upload** with type restrictions
- **Time-limited access tokens** for contributors and recipients

## 📧 Email Configuration

For development, we recommend using [Ethereal Email](https://ethereal.email/) for testing email functionality:

1. Create a free Ethereal Email account
2. Use the provided SMTP credentials in your `.env` file
3. All emails will be captured in your Ethereal inbox for testing

For production, integrate with services like:
- SendGrid
- Mailgun
- AWS SES
- Postmark

## 🚢 Deployment

### Backend Deployment Options
- **Render** (recommended for simplicity)
- **Heroku**
- **AWS EC2/Lambda**
- **Google Cloud Run**

### Frontend Deployment Options
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**

### Database Options
- **AWS RDS**
- **Google Cloud SQL**
- **PlanetScale**
- **Supabase**

## 🤝 Contributing

We welcome contributions! Please see our [contribution guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💝 Acknowledgments

- Inspired by the desire to preserve meaningful human connections
- Built with love for creating lasting memories
- Special thanks to all the open-source libraries that made this possible

---

**Made with ♥ for meaningful connections**

*JoinedInk - Where memories become keepsakes* 