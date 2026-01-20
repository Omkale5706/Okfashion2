# OK Fashion Database

## MongoDB Database Structure

This folder contains database schemas, seed data, and database-related utilities for the OK Fashion application.

## Collections

### 1. Users
- User authentication and profile information
- Preferences and saved outfits

### 2. Services
- AI fashion services offered by the platform
- Categories: style, analysis, recommendation

### 3. Newsletter
- Email subscribers for newsletter

### 4. Contact
- Contact form submissions

### 5. StyleScans
- User's style analysis and recommendations
- AI-generated fashion insights

## Setup

1. Install MongoDB on your system
2. Start MongoDB service:
   ```
   mongod
   ```

3. Create database:
   ```
   use ok-fashion
   ```

4. Run seed data (optional):
   ```
   node database/seed.js
   ```

## Connection String

Development: `mongodb://localhost:27017/ok-fashion`

Production: Set your MongoDB Atlas connection string in backend `.env` file
