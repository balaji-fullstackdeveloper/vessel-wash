# PG Vessel Manager - MongoDB Version

A duty management system with MongoDB database integration for persistent data storage.

## Setup Instructions

### Prerequisites
1. **Node.js** (v14 or higher)
2. **MongoDB** (installed and running)
3. **Git** (optional)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`
   - Database name: `pg-vessel-manager`

3. **Configure Environment**
   - The `.env` file is already configured with default settings
   - If needed, modify `MONGODB_URI` in `.env` file to match your MongoDB setup

4. **Start the Application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open your browser and go to: `http://localhost:3000`
   - The application will automatically redirect to the login page

## Features

### User Interface
- View today's duty assignments
- See weekly schedule table
- Set reminders
- View analytics and workload distribution

### Admin Panel
- Add new persons with availability preferences
- Edit existing persons' availability
- Remove persons from the system
- Automatic schedule regeneration
- Real-time workload tracking

### Database Features
- **Persistent Storage**: All data saved in MongoDB
- **Automatic Initialization**: Default 11 persons created on first run
- **Schedule Persistence**: Generated schedules stored in database
- **Real-time Updates**: Changes immediately reflected across all users

## Database Schema

### Persons Collection
```json
{
  "_id": ObjectId,
  "name": "person 1",
  "available": ["morning", "afternoon", "night"]
}
```

### Schedules Collection
```json
{
  "_id": ObjectId,
  "type": "current",
  "generatedAt": ISODate,
  "schedule": [
    {
      "date": "Mon Mar 13 2026",
      "morning": "person 1",
      "afternoon": "person 2", 
      "night": "person 3"
    }
  ]
}
```

## API Endpoints

### Persons
- `GET /api/persons` - Get all persons
- `POST /api/persons` - Add new person
- `PUT /api/persons/:name` - Update person availability
- `DELETE /api/persons/:name` - Remove person

### Schedule
- `GET /api/schedule` - Get current schedule
- `POST /api/schedule/regenerate` - Generate new schedule

## File Structure

```
pg app/
├── package.json          # Node.js dependencies
├── server.js            # Express server with MongoDB
├── .env                 # Environment variables
├── index.html           # Entry point (redirects to app)
├── app.html             # Main user interface
├── admin.html           # Admin panel interface
├── app-db.js            # User interface with database integration
├── admin-db.js          # Admin panel with database integration
├── style.css            # Styling
└── README.md            # This file
```

## Usage

1. **Login**: Use any user type to access the system
2. **View Schedule**: See current and upcoming duty assignments
3. **Admin Access**: Navigate to admin panel for management
4. **Manage Personnel**: Add, edit, or remove persons with their availability
5. **Automatic Scheduling**: System generates fair schedules based on availability and workload

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env` file
- Verify database permissions

### Server Not Starting
- Check if port 3000 is available
- Verify Node.js installation: `node --version`
- Check for missing dependencies: `npm install`

### Data Not Persisting
- Verify MongoDB is running
- Check database connection logs
- Ensure API calls are successful (check browser console)

## Development

The application uses:
- **Backend**: Node.js with Express
- **Database**: MongoDB with native driver
- **Frontend**: Vanilla JavaScript with HTML/CSS
- **API**: RESTful endpoints for CRUD operations
