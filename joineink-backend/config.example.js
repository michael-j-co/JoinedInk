/**
 * JoinedInk Backend Configuration Example
 * 
 * Copy this file to create your .env file or set these environment variables:
 * 
 * # Database Configuration
 * DATABASE_URL="postgresql://username:password@localhost:5432/joineink_db"
 * 
 * # JWT Secret for authentication
 * JWT_SECRET="your-super-secret-jwt-key-here"
 * 
 * # Frontend URL (for CORS and link generation)
 * FRONTEND_URL="http://localhost:3000"
 * 
 * # Email Configuration (for development, you can use Ethereal Email)
 * SMTP_HOST="smtp.ethereal.email"
 * SMTP_PORT=587
 * SMTP_USER="your-ethereal-email@example.com"
 * SMTP_PASS="your-ethereal-password"
 * FROM_EMAIL="noreply@joineink.com"
 * 
 * # Server Configuration
 * PORT=5000
 * NODE_ENV="development"
 * 
 * Instructions:
 * 1. Create a PostgreSQL database
 * 2. Copy these variables to a .env file in the backend directory
 * 3. Update the DATABASE_URL with your actual database credentials
 * 4. Generate a strong JWT_SECRET
 * 5. For email testing, create a free account at https://ethereal.email/
 * 6. Run `npm run prisma:push` to set up the database schema
 * 7. Run `npm run dev` to start the development server
 */

// Example of setting up a local PostgreSQL database:
// 1. Install PostgreSQL on your system
// 2. Create a new database: createdb joineink_db
// 3. Update DATABASE_URL in your .env file

// For production deployment:
// - Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
// - Use a real email service (SendGrid, Mailgun, etc.)
// - Set NODE_ENV to "production"
// - Use a strong, randomly generated JWT_SECRET

module.exports = {
  // This file is just for documentation
  // The actual configuration should be in your .env file
}; 