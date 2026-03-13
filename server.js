import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config()


const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage (fallback when MongoDB is not available)
let persons = [];
let schedules = [];

// Day name helpers
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function getDayNameFromIndex(index) {
    return DAY_NAMES[index] || '';
}
function getDayNamesFromIndexes(indexes) {
    return (indexes || []).map(getDayNameFromIndex);
}

// MongoDB connection
let db;
let personsCollection;
let schedulesCollection;
let swapsCollection;
let useMongoDB = false;

async function connectToMongoDB() {
    try {
        // Try MongoDB Atlas first using Mongoose
        const url = process.env.atlas_URL;
        console.log('Attempting MongoDB connection with URL:', url);
        
        await mongoose.connect(url, {
           
        });
        
        console.log('MongoDB Atlas Connected with Mongoose');
        
        // Get collections using Mongoose connection
        const db = mongoose.connection.db;
        personsCollection = db.collection('persons');
        schedulesCollection = db.collection('schedules');
        swapsCollection = db.collection('swaps');
        useMongoDB = true;
        
        // Initialize default data
        await initializeDefaultData();
        
    } catch (err) {
        console.log("MongoDB Atlas connection error, trying local MongoDB:", err.message);
        try {
            // Fallback to local MongoDB using Mongoose
            await mongoose.connect("mongodb://localhost:27017/vessel", {
                useNewUrlparser: true,
                useUnifiedTopology: true
            });
            
            console.log('Local MongoDB Connected with Mongoose');
            
            // Get collections from local connection
            const db = mongoose.connection.db;
            personsCollection = db.collection('persons');
            schedulesCollection = db.collection('schedules');
            swapsCollection = db.collection('swaps');
            useMongoDB = true;
            
            // Initialize default data
            await initializeDefaultData();
        } catch (localErr) {
            console.log("Local MongoDB connection error, using in-memory storage:", localErr.message);
            useMongoDB = false;
            initializeDefaultDataInMemory();
        }
    }
}

async function initializeDefaultData() {
    const existingPersons = await personsCollection.countDocuments();
    
    if (existingPersons === 0) {
        const defaultPersons = [
            {
                name: "person 1", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "afternoon"],
                    restDays: [0, 6], // Sunday, Saturday
                    restDayNames: getDayNamesFromIndexes([0, 6]),
                    maxConsecutiveShifts: 5
                },
                createdAt: new Date()
            },
            {
                name: "person 2", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["afternoon", "night"],
                    restDays: [1, 5], // Monday, Friday
                    restDayNames: getDayNamesFromIndexes([1, 5]),
                    maxConsecutiveShifts: 4
                },
                createdAt: new Date()
            },
            {
                name: "person 3", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "night"],
                    restDays: [2, 6], // Tuesday, Saturday
                    restDayNames: getDayNamesFromIndexes([2, 6]),
                    maxConsecutiveShifts: 6
                },
                createdAt: new Date()
            },
            {
                name: "person 4", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "afternoon"],
                    restDays: [3, 0], // Wednesday, Sunday
                    restDayNames: getDayNamesFromIndexes([3, 0]),
                    maxConsecutiveShifts: 5
                },
                createdAt: new Date()
            },
            {
                name: "person 5", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["afternoon", "night"],
                    restDays: [4, 1], // Thursday, Monday
                    restDayNames: getDayNamesFromIndexes([4, 1]),
                    maxConsecutiveShifts: 4
                },
                createdAt: new Date()
            },
            {
                name: "person 6", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "night"],
                    restDays: [5, 2], // Friday, Tuesday
                    restDayNames: getDayNamesFromIndexes([5, 2]),
                    maxConsecutiveShifts: 6
                },
                createdAt: new Date()
            },
            {
                name: "person 7", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "afternoon"],
                    restDays: [6, 3], // Saturday, Wednesday
                    restDayNames: getDayNamesFromIndexes([6, 3]),
                    maxConsecutiveShifts: 5
                },
                createdAt: new Date()
            },
            {
                name: "person 8", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["afternoon", "night"],
                    restDays: [0, 4], // Sunday, Thursday
                    restDayNames: getDayNamesFromIndexes([0, 4]),
                    maxConsecutiveShifts: 4
                },
                createdAt: new Date()
            },
            {
                name: "person 9", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "night"],
                    restDays: [1, 5], // Monday, Friday
                    restDayNames: getDayNamesFromIndexes([1, 5]),
                    maxConsecutiveShifts: 6
                },
                createdAt: new Date()
            },
            {
                name: "person 10", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["morning", "afternoon"],
                    restDays: [2, 6], // Tuesday, Saturday
                    restDayNames: getDayNamesFromIndexes([2, 6]),
                    maxConsecutiveShifts: 5
                },
                createdAt: new Date()
            },
            {
                name: "person 11", 
                available: ["morning", "afternoon", "night"],
                preferences: {
                    preferredShifts: ["afternoon", "night"],
                    restDays: [3, 0], // Wednesday, Sunday
                    restDayNames: getDayNamesFromIndexes([3, 0]),
                    maxConsecutiveShifts: 4
                },
                createdAt: new Date()
            }
        ];
        
        await personsCollection.insertMany(defaultPersons);
        console.log('Default persons initialized with preferences');
    }
}

function initializeDefaultDataInMemory() {
    persons = [
        {
            name: "person 1", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "afternoon"],
                restDays: [0, 6], // Sunday, Saturday
                restDayNames: getDayNamesFromIndexes([0, 6]),
                maxConsecutiveShifts: 5
            },
            createdAt: new Date()
        },
        {
            name: "person 2", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["afternoon", "night"],
                restDays: [1, 5], // Monday, Friday
                restDayNames: getDayNamesFromIndexes([1, 5]),
                maxConsecutiveShifts: 4
            },
            createdAt: new Date()
        },
        {
            name: "person 3", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "night"],
                restDays: [2, 6], // Tuesday, Saturday
                restDayNames: getDayNamesFromIndexes([2, 6]),
                maxConsecutiveShifts: 6
            },
            createdAt: new Date()
        },
        {
            name: "person 4", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "afternoon"],
                restDays: [3, 0], // Wednesday, Sunday
                restDayNames: getDayNamesFromIndexes([3, 0]),
                maxConsecutiveShifts: 5
            },
            createdAt: new Date()
        },
        {
            name: "person 5", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["afternoon", "night"],
                restDays: [4, 1], // Thursday, Monday
                restDayNames: getDayNamesFromIndexes([4, 1]),
                maxConsecutiveShifts: 4
            },
            createdAt: new Date()
        },
        {
            name: "person 6", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "night"],
                restDays: [5, 2], // Friday, Tuesday
                restDayNames: getDayNamesFromIndexes([5, 2]),
                maxConsecutiveShifts: 6
            },
            createdAt: new Date()
        },
        {
            name: "person 7", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "afternoon"],
                restDays: [6, 3], // Saturday, Wednesday
                restDayNames: getDayNamesFromIndexes([6, 3]),
                maxConsecutiveShifts: 5
            },
            createdAt: new Date()
        },
        {
            name: "person 8", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["afternoon", "night"],
                restDays: [0, 4], // Sunday, Thursday
                restDayNames: getDayNamesFromIndexes([0, 4]),
                maxConsecutiveShifts: 4
            },
            createdAt: new Date()
        },
        {
            name: "person 9", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "night"],
                restDays: [1, 5], // Monday, Friday
                restDayNames: getDayNamesFromIndexes([1, 5]),
                maxConsecutiveShifts: 6
            },
            createdAt: new Date()
        },
        {
            name: "person 10", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["morning", "afternoon"],
                restDays: [2, 6], // Tuesday, Saturday
                restDayNames: getDayNamesFromIndexes([2, 6]),
                maxConsecutiveShifts: 5
            },
            createdAt: new Date()
        },
        {
            name: "person 11", 
            available: ["morning", "afternoon", "night"],
            preferences: {
                preferredShifts: ["afternoon", "night"],
                restDays: [3, 0], // Wednesday, Sunday
                restDayNames: getDayNamesFromIndexes([3, 0]),
                maxConsecutiveShifts: 4
            },
            createdAt: new Date()
        }
    ];
    console.log('Default persons initialized in memory with preferences');
}

// API Routes

// Get all persons
app.get('/api/persons', async (req, res) => {
    try {
        if (useMongoDB) {
            const personsData = await personsCollection.find({}).toArray();
            res.json(personsData);
        } else {
            res.json(persons);
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Add person
app.post('/api/persons', async (req, res) => {
    try {
        const { name, available, preferences } = req.body;
        const basePreferences = preferences || {
            preferredShifts: available,
            restDays: [0, 6], // Default weekend (sun, sat)
            maxConsecutiveShifts: 5
        };
        const personData = { 
            name, 
            available, 
            preferences: {
                ...basePreferences,
                restDayNames: basePreferences.restDayNames || getDayNamesFromIndexes(basePreferences.restDays)
            },
            createdAt: new Date()
        };
        
        if (useMongoDB) {
            const result = await personsCollection.insertOne(personData);
            res.json({ success: true, _id: result.insertedId });
        } else {
            persons.push(personData);
            res.json({ success: true });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Update person
app.put('/api/persons/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { available, preferences } = req.body;
        
        if (useMongoDB) {
            const updateData = { $set: {} };
            if (available) updateData.$set.available = available;
            if (preferences) updateData.$set.preferences = preferences;
            updateData.$set.updatedAt = new Date();
            
            const result = await personsCollection.updateOne(
                { name: name },
                updateData
            );
            res.json({ success: true, modifiedCount: result.modifiedCount });
        } else {
            const personIndex = persons.findIndex(p => p.name === name);
            if (personIndex !== -1) {
                if (available) persons[personIndex].available = available;
                if (preferences) persons[personIndex].preferences = preferences;
                persons[personIndex].updatedAt = new Date();
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Person not found' });
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Remove person
app.delete('/api/persons/:name', async (req, res) => {
    try {
        const { name } = req.params;
        if (useMongoDB) {
            const result = await personsCollection.deleteOne({ name });
            res.json({ success: true, deletedCount: result.deletedCount });
        } else {
            const personIndex = persons.findIndex(p => p.name === name);
            if (personIndex !== -1) {
                persons.splice(personIndex, 1);
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Person not found' });
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get person details by name
app.get('/api/persons/:name', async (req, res) => {
    try {
        const { name } = req.params;
        if (useMongoDB) {
            const person = await personsCollection.findOne({ name });
            if (person) {
                res.json(person);
            } else {
                res.status(404).json({ error: 'Person not found' });
            }
        } else {
            const person = persons.find(p => p.name === name);
            if (person) {
                res.json(person);
            } else {
                res.status(404).json({ error: 'Person not found' });
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Initialize default data command
app.post('/api/init-default-data', async (req, res) => {
    try {
        if (useMongoDB) {
            // Clear existing data
            await personsCollection.deleteMany({});
            await schedulesCollection.deleteMany({});
            
            // Initialize default persons with preferences
            const defaultPersons = [
                {
                    name: "person 1", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "afternoon"],
                        restDays: [0, 6], // Sunday, Saturday
                        restDayNames: getDayNamesFromIndexes([0, 6]),
                        maxConsecutiveShifts: 5
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 2", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["afternoon", "night"],
                        restDays: [1, 5], // Monday, Friday
                        restDayNames: getDayNamesFromIndexes([1, 5]),
                        maxConsecutiveShifts: 4
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 3", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "night"],
                        restDays: [2, 6], // Tuesday, Saturday
                        restDayNames: getDayNamesFromIndexes([2, 6]),
                        maxConsecutiveShifts: 6
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 4", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "afternoon"],
                        restDays: [3, 0], // Wednesday, Sunday
                        restDayNames: getDayNamesFromIndexes([3, 0]),
                        maxConsecutiveShifts: 5
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 5", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["afternoon", "night"],
                        restDays: [4, 1], // Thursday, Monday
                        restDayNames: getDayNamesFromIndexes([4, 1]),
                        maxConsecutiveShifts: 4
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 6", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "night"],
                        restDays: [5, 2], // Friday, Tuesday
                        restDayNames: getDayNamesFromIndexes([5, 2]),
                        maxConsecutiveShifts: 6
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 7", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "afternoon"],
                        restDays: [6, 3], // Saturday, Wednesday
                        restDayNames: getDayNamesFromIndexes([6, 3]),
                        maxConsecutiveShifts: 5
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 8", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["afternoon", "night"],
                        restDays: [0, 4], // Sunday, Thursday
                        restDayNames: getDayNamesFromIndexes([0, 4]),
                        maxConsecutiveShifts: 4
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 9", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "night"],
                        restDays: [1, 5], // Monday, Friday
                        restDayNames: getDayNamesFromIndexes([1, 5]),
                        maxConsecutiveShifts: 6
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 10", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["morning", "afternoon"],
                        restDays: [2, 6], // Tuesday, Saturday
                        restDayNames: getDayNamesFromIndexes([2, 6]),
                        maxConsecutiveShifts: 5
                    },
                    createdAt: new Date()
                },
                {
                    name: "person 11", 
                    available: ["morning", "afternoon", "night"],
                    preferences: {
                        preferredShifts: ["afternoon", "night"],
                        restDays: [3, 0], // Wednesday, Sunday
                        restDayNames: getDayNamesFromIndexes([3, 0]),
                        maxConsecutiveShifts: 4
                    },
                    createdAt: new Date()
                }
            ];
            
            await personsCollection.insertMany(defaultPersons);
            res.json({ 
                success: true, 
                message: 'Default data initialized in MongoDB',
                personsInserted: defaultPersons.length
            });
        } else {
            res.status(400).json({ 
                error: 'MongoDB not connected. Using in-memory storage.' 
            });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Clear all data command
app.delete('/api/clear-all-data', async (req, res) => {
    try {
        if (useMongoDB) {
            await personsCollection.deleteMany({});
            await schedulesCollection.deleteMany({});
            res.json({ 
                success: true, 
                message: 'All data cleared from MongoDB' 
            });
        } else {
            persons = [];
            schedules = [];
            res.json({ 
                success: true, 
                message: 'All in-memory data cleared' 
            });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get all history from schedule collection
app.get('/api/history', async (req, res) => {
    try {
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.history) {
                const history = schedule.history.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
                res.json(history);
            } else {
                res.json([]);
            }
        } else {
            res.json([]); // No history in memory mode
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Add history entry to schedule collection
app.post('/api/history', async (req, res) => {
    try {
        const { person, date, shift } = req.body;
        
        const historyEntry = {
            person,
            date,
            shift,
            recordedAt: new Date()
        };
        
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule) {
                if (!schedule.history) {
                    schedule.history = [];
                }
                schedule.history.push(historyEntry);
                await schedulesCollection.replaceOne(
                    { type: 'current' },
                    schedule
                );
                res.json({ success: true });
            } else {
                res.status(400).json({ error: 'No schedule found' });
            }
        } else {
            res.status(400).json({ error: 'MongoDB not available for history storage' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get person's history from schedule collection
app.get('/api/history/:person', async (req, res) => {
    try {
        const { person } = req.params;
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.history) {
                const personHistory = schedule.history
                    .filter(entry => entry.person === person)
                    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
                res.json(personHistory);
            } else {
                res.json([]);
            }
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Delete all history from schedule collection
app.delete('/api/history', async (req, res) => {
    try {
        if (useMongoDB) {
            await schedulesCollection.updateOne(
                { type: 'current' },
                { $set: { history: [] } }
            );
            res.json({ success: true, message: 'History cleared' });
        } else {
            res.status(400).json({ error: 'MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get work history from schedule collection
app.get('/api/work-history', async (req, res) => {
    try {
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.history) {
                const history = schedule.history.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
                res.json(history);
            } else {
                res.json([]);
            }
        } else {
            res.json([]); // No history in memory mode
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Add work history entry to schedule collection
app.post('/api/work-history', async (req, res) => {
    try {
        const { date, person, shift, scheduleData } = req.body;
        const historyEntry = {
            date,
            person,
            shift,
            scheduleData,
            recordedAt: new Date()
        };
        
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule) {
                if (!schedule.history) {
                    schedule.history = [];
                }
                schedule.history.push(historyEntry);
                await schedulesCollection.replaceOne(
                    { type: 'current' },
                    schedule
                );
                res.json({ success: true });
            } else {
                res.status(400).json({ error: 'No schedule found' });
            }
        } else {
            res.status(400).json({ error: 'MongoDB not available for history storage' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get person's work history from schedule collection
app.get('/api/work-history/:person', async (req, res) => {
    try {
        const { person } = req.params;
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.history) {
                const personHistory = schedule.history
                    .filter(entry => entry.person === person)
                    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
                res.json(personHistory);
            } else {
                res.json([]);
            }
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Clear work history from schedule collection
app.delete('/api/work-history', async (req, res) => {
    try {
        if (useMongoDB) {
            await schedulesCollection.updateOne(
                { type: 'current' },
                { $set: { history: [] } }
            );
            res.json({ success: true, message: 'History cleared' });
        } else {
            res.status(400).json({ error: 'MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Initialize default history data in schedule collection
app.post('/api/history/initialize', async (req, res) => {
    try {
        if (useMongoDB) {
            // Get current schedule
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.schedule) {
                const historyEntries = [];
                
                // Create history entries for each assigned person
                schedule.schedule.forEach(day => {
                    ['morning', 'afternoon', 'night'].forEach(shift => {
                        const person = day[shift];
                        if (person && person !== "UNASSIGNED") {
                            historyEntries.push({
                                date: day.date,
                                person: person,
                                shift: shift,
                                scheduleData: {
                                    date: day.date,
                                    month: day.month,
                                    day: day.day,
                                    dayOfWeek: day.dayOfWeek,
                                    dayName: day.dayName || getDayNameFromIndex(day.dayOfWeek)
                                },
                                recordedAt: new Date()
                            });
                        }
                    });
                });
                
                if (historyEntries.length > 0) {
                    // Update schedule with history
                    await schedulesCollection.updateOne(
                        { type: 'current' },
                        { $set: { history: historyEntries } }
                    );
                }
            }
            
            res.json({ success: true, entriesCreated: historyEntries.length });
        } else {
            res.status(400).json({ error: 'MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get all swaps
app.get('/api/swaps', async (req, res) => {
    try {
        if (useMongoDB) {
            const swaps = await swapsCollection.find({}).sort({ createdAt: -1 }).toArray();
            res.json(swaps);
        } else {
            res.json([]); // No swaps in memory mode
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get person's swap count
app.get('/api/swaps/count/:person', async (req, res) => {
    try {
        const { person } = req.params;
        if (useMongoDB) {
            const swapCount = await swapsCollection.countDocuments({ 
                $or: [{ fromPerson: person }, { toPerson: person }] 
            });
            res.json({ count: swapCount });
        } else {
            res.json({ count: 0 });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Perform shift swap
app.post('/api/swaps', async (req, res) => {
    try {
        const { date, shift, fromPerson, toPerson, swapNote, reciprocalDate, reciprocalShift } = req.body;
        
        // Check swap limits
        if (useMongoDB) {
            const fromPersonSwaps = await swapsCollection.countDocuments({ 
                $or: [{ fromPerson: fromPerson }, { toPerson: fromPerson }] 
            });
            const toPersonSwaps = await swapsCollection.countDocuments({ 
                $or: [{ fromPerson: toPerson }, { toPerson: toPerson }] 
            });
            
            if (fromPersonSwaps >= 3) {
                return res.status(400).json({ 
                    error: 'Maximum swap limit (3) reached for ' + fromPerson 
                });
            }
            if (toPersonSwaps >= 3) {
                return res.status(400).json({ 
                    error: 'Maximum swap limit (3) reached for ' + toPerson 
                });
            }
        }
        
        // Create swap record
        const swapRecord = {
            date,
            shift,
            fromPerson,
            toPerson,
            swapNote,
            swapNumber: 0, // Will be set below
            reciprocalDate,
            reciprocalShift,
            createdAt: new Date()
        };
        
        if (useMongoDB) {
            // Get swap count for numbering
            const totalSwaps = await swapsCollection.countDocuments();
            swapRecord.swapNumber = totalSwaps + 1;
            
            // Save swap record
            await swapsCollection.insertOne(swapRecord);
            
            // Update current schedule - primary swap
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.schedule) {
                const dayToUpdate = schedule.schedule.find(day => day.date === date);
                if (dayToUpdate && dayToUpdate[shift] === fromPerson) {
                    const originalPerson = dayToUpdate[shift];
                    dayToUpdate[shift] = toPerson;
                    
                    // Handle reciprocal swap if Person 2 has a future shift
                    let reciprocalNote = null;
                    if (reciprocalDate && reciprocalShift) {
                        const reciprocalDay = schedule.schedule.find(day => day.date === reciprocalDate);
                        if (reciprocalDay && reciprocalDay[reciprocalShift] === toPerson) {
                            reciprocalDay[reciprocalShift] = fromPerson;
                            
                            // Create reciprocal note
                            const reciprocalDateObj = new Date(reciprocalDate);
                            const formattedReciprocalDate = `${reciprocalDateObj.getDate().toString().padStart(2, '0')}/${(reciprocalDateObj.getMonth() + 1).toString().padStart(2, '0')}/${reciprocalDateObj.getFullYear()}`;
                            reciprocalNote = `Reschedule ${totalSwaps + 2}: ${toPerson} to ${fromPerson} | Date: ${formattedReciprocalDate} | Shift: ${reciprocalShift.charAt(0).toUpperCase() + reciprocalShift.slice(1)}`;
                            
                            // Save reciprocal swap record
                            const reciprocalSwapRecord = {
                                date: reciprocalDate,
                                shift: reciprocalShift,
                                fromPerson: toPerson,
                                toPerson: fromPerson,
                                swapNote: reciprocalNote,
                                swapNumber: totalSwaps + 2,
                                reciprocalDate: date,
                                reciprocalShift: shift,
                                isReciprocal: true,
                                createdAt: new Date()
                            };
                            await swapsCollection.insertOne(reciprocalSwapRecord);
                        }
                    }
                    
                    await schedulesCollection.replaceOne(
                        { type: 'current' },
                        { 
                            type: 'current', 
                            schedule: schedule.schedule, 
                            generatedAt: new Date() 
                        }
                    );
                    
                    // Update history for primary swap
                    const historyEntry = {
                        date,
                        person: toPerson,
                        shift,
                        scheduleData: {
                            date: dayToUpdate.date,
                            month: dayToUpdate.month,
                            day: dayToUpdate.day,
                            dayOfWeek: dayToUpdate.dayOfWeek,
                            dayName: dayToUpdate.dayName || getDayNameFromIndex(dayToUpdate.dayOfWeek)
                        },
                        recordedAt: new Date(),
                        isSwap: true,
                        originalPerson: fromPerson
                    };
                    
                    // Add to schedule history
                    if (!schedule.history) {
                        schedule.history = [];
                    }
                    schedule.history.push(historyEntry);
                    
                    // Update history for reciprocal swap if it happened
                    if (reciprocalDate && reciprocalShift) {
                        const reciprocalDay = schedule.schedule.find(day => day.date === reciprocalDate);
                        if (reciprocalDay) {
                            const reciprocalHistoryEntry = {
                                date: reciprocalDate,
                                person: fromPerson,
                                shift: reciprocalShift,
                                scheduleData: {
                                    date: reciprocalDay.date,
                                    month: reciprocalDay.month,
                                    day: reciprocalDay.day,
                                    dayOfWeek: reciprocalDay.dayOfWeek,
                                    dayName: reciprocalDay.dayName || getDayNameFromIndex(reciprocalDay.dayOfWeek)
                                },
                                recordedAt: new Date(),
                                isSwap: true,
                                originalPerson: toPerson,
                                isReciprocal: true
                            };
                            
                            schedule.history.push(reciprocalHistoryEntry);
                        }
                    }
                }
            }
            
            const message = reciprocalDate && reciprocalShift ? 
                `Mutual reschedule completed: ${fromPerson} ↔ ${toPerson}` :
                `Shift rescheduled from ${fromPerson} to ${toPerson}`;
            
            res.json({ 
                success: true, 
                swap: swapRecord,
                reciprocalDate,
                reciprocalShift,
                message
            });
        } else {
            res.status(400).json({ error: 'MongoDB not available for swap functionality' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Find replacement person with workload balancing
function findReplacement(availablePersons, schedule, date, shift, excludePerson) {
    const workload = {};
    const candidates = availablePersons.filter(p => p.name !== excludePerson);
    
    // Initialize workload for all candidates
    candidates.forEach(person => {
        workload[person.name] = 0;
    });
    
    // Calculate current workload from entire schedule
    schedule.forEach(day => {
        ['morning', 'afternoon', 'night'].forEach(s => {
            if (workload[day[s]] !== undefined) {
                workload[day[s]]++;
            }
        });
    });
    
    // Sort by workload (least busy first) for equal distribution
    candidates.sort((a, b) => workload[a.name] - workload[b.name]);
    
    // Get the least busy person
    const selectedPerson = candidates.length > 0 ? candidates[0].name : null;
    
    console.log('Workload balancing:', {
        available: candidates.map(c => `${c.name}: ${workload[c.name]}`),
        selected: selectedPerson,
        workload: workload[selectedPerson]
    });
    
    return selectedPerson;
}

// Update workload after schedule changes
async function updateWorkloadBalance() {
    try {
        if (!useMongoDB) return;
        
        const schedule = await schedulesCollection.findOne({ type: 'current' });
        if (!schedule || !schedule.schedule) return;
        
        const allPersons = await personsCollection.find({}).toArray();
        const availablePersons = allPersons.filter(p => p.available && p.name !== "UNASSIGNED");
        
        // Calculate current workload
        const workload = {};
        availablePersons.forEach(person => {
            workload[person.name] = 0;
        });
        
        schedule.schedule.forEach(day => {
            ['morning', 'afternoon', 'night'].forEach(shift => {
                if (workload[day[shift]] !== undefined) {
                    workload[day[shift]]++;
                }
            });
        });
        
        console.log('Current workload distribution:', workload);
        
        // Find average workload
        const totalShifts = Object.values(workload).reduce((sum, count) => sum + count, 0);
        const avgWorkload = totalShifts / availablePersons.length;
        
        console.log(`Average workload: ${avgWorkload.toFixed(2)} shifts per person`);
        
        // Check for workload imbalance (more than 2 shifts difference)
        const imbalancedPersons = Object.entries(workload)
            .filter(([name, count]) => Math.abs(count - avgWorkload) > 2)
            .map(([name, count]) => ({ name, count, diff: count - avgWorkload }));
        
        if (imbalancedPersons.length > 0) {
            console.log('Workload imbalance detected:', imbalancedPersons);
            
            // Try to balance by reassigning some shifts
            let balanced = await balanceWorkload(schedule, availablePersons, workload, avgWorkload);
            
            if (balanced) {
                // Save balanced schedule
                await schedulesCollection.replaceOne(
                    { type: 'current' },
                    { 
                        type: 'current', 
                        schedule: schedule.schedule,
                        history: schedule.history || [],
                        generatedAt: new Date()
                    }
                );
                console.log('Workload balanced and schedule updated');
            }
        }
        
        return workload;
    } catch (error) {
        console.error('Error updating workload balance:', error);
    }
}

// Balance workload by reassigning shifts
async function balanceWorkload(schedule, availablePersons, currentWorkload, targetAvg) {
    let changesMade = false;
    
    // Find overworked and underworked persons
    const overworked = Object.entries(currentWorkload)
        .filter(([name, count]) => count > targetAvg + 1)
        .sort((a, b) => b[1] - a[1]); // Most overworked first
    
    const underworked = Object.entries(currentWorkload)
        .filter(([name, count]) => count < targetAvg - 1)
        .sort((a, b) => a[1] - b[1]); // Least worked first
    
    console.log('Balancing - Overworked:', overworked, 'Underworked:', underworked);
    
    // Try to reassign shifts from overworked to underworked
    for (const [overworkedName, overworkedCount] of overworked) {
        for (const [underworkedName, underworkedCount] of underworked) {
            if (Math.abs(overworkedCount - targetAvg) <= 1 || 
                Math.abs(underworkedCount - targetAvg) <= 1) {
                continue; // Already balanced enough
            }
            
            // Find a shift to reassign
            for (const day of schedule.schedule) {
                for (const shift of ['morning', 'afternoon', 'night']) {
                    if (day[shift] === overworkedName) {
                        // Check if underworked person is available for this shift
                        const underworkedPerson = availablePersons.find(p => p.name === underworkedName);
                        if (underworkedPerson && isPersonAvailableForShift(underworkedPerson, shift, day.date)) {
                            // Reassign the shift
                            const originalPerson = day[shift];
                            day[shift] = underworkedName;
                            
                            // Update workload
                            currentWorkload[overworkedName]--;
                            currentWorkload[underworkedName]++;
                            
                            // Add to history
                            if (!schedule.history) schedule.history = [];
                            schedule.history.push({
                                date: day.date,
                                person: underworkedName,
                                shift: shift,
                                scheduleData: {
                                    date: day.date,
                                    month: day.month,
                                    day: day.day,
                                    dayOfWeek: day.dayOfWeek,
                                    dayName: day.dayName || getDayNameFromIndex(day.dayOfWeek)
                                },
                                recordedAt: new Date(),
                                isWorkloadBalance: true,
                                originalPerson: originalPerson
                            });
                            
                            console.log(`Reassigned ${day.date} ${shift} from ${originalPerson} to ${underworkedName} for workload balance`);
                            changesMade = true;
                            break;
                        }
                    }
                }
                
                if (Math.abs(currentWorkload[overworkedName] - targetAvg) <= 1) break;
            }
        }
    }
    
    return changesMade;
}

// Check if person is available for specific shift
function isPersonAvailableForShift(person, shift, date) {
    // Check person's preferred shifts
    if (person.preferredShifts && !person.preferredShifts.includes(shift)) {
        return false;
    }
    
    // Check rest days
    if (person.restDays) {
        const dayOfWeek = new Date(date).getDay();
        if (person.restDays.includes(dayOfWeek)) {
            return false;
        }
    }
    
    // Check consecutive shifts limit
    // (This would need more complex logic to track recent assignments)
    
    return true;
}

// Balance workload endpoint
app.post('/api/workload/balance', async (req, res) => {
    try {
        console.log('Manual workload balancing requested');
        const workload = await updateWorkloadBalance();
        
        res.json({ 
            success: true, 
            message: 'Workload balancing completed',
            workload: workload
        });
    } catch (error) {
        console.error('Workload balancing error:', error);
        res.status(500).json({error: error.message});
    }
});

// Get workload statistics
app.get('/api/workload/stats', async (req, res) => {
    try {
        if (!useMongoDB) {
            return res.json({});
        }
        
        const schedule = await schedulesCollection.findOne({ type: 'current' });
        if (!schedule || !schedule.schedule) {
            return res.json({});
        }
        
        const allPersons = await personsCollection.find({}).toArray();
        const availablePersons = allPersons.filter(p => p.available && p.name !== "UNASSIGNED");
        
        // Calculate current workload
        const workload = {};
        availablePersons.forEach(person => {
            workload[person.name] = 0;
        });
        
        schedule.schedule.forEach(day => {
            ['morning', 'afternoon', 'night'].forEach(shift => {
                if (workload[day[shift]] !== undefined) {
                    workload[day[shift]]++;
                }
            });
        });
        
        // Calculate statistics
        const totalShifts = Object.values(workload).reduce((sum, count) => sum + count, 0);
        const avgWorkload = availablePersons.length > 0 ? totalShifts / availablePersons.length : 0;
        const maxWorkload = Math.max(...Object.values(workload));
        const minWorkload = Math.min(...Object.values(workload));
        
        res.json({
            workload,
            statistics: {
                totalShifts,
                averageWorkload: avgWorkload,
                maxWorkload,
                minWorkload,
                imbalance: maxWorkload - minWorkload
            }
        });
    } catch (error) {
        console.error('Error getting workload stats:', error);
        res.status(500).json({error: error.message});
    }
});

// Get past schedules from history (stored in schedule collection)
app.get('/api/past-schedules', async (req, res) => {
    try {
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (schedule && schedule.history) {
                // Group history by date to create schedule view
                const pastSchedules = {};
                schedule.history.forEach(entry => {
                    const date = entry.date;
                    if (!pastSchedules[date]) {
                        pastSchedules[date] = {
                            date: date,
                            morning: "No one assigned",
                            afternoon: "No one assigned", 
                            night: "No one assigned"
                        };
                    }
                    pastSchedules[date][entry.shift] = entry.person;
                });
                
                // Convert to array and sort by date (most recent first)
                const scheduleArray = Object.values(pastSchedules).sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                
                res.json(scheduleArray);
            } else {
                res.json([]);
            }
        } else {
            res.json([]); // No past schedules in memory mode
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get schedule statistics
app.get('/api/schedule/stats', async (req, res) => {
    try {
        let schedule;
        if (useMongoDB) {
            const scheduleDoc = await schedulesCollection.findOne({ type: 'current' });
            schedule = scheduleDoc ? scheduleDoc.schedule : [];
        } else {
            schedule = schedules.length > 0 ? schedules[0].schedule : [];
        }
        
        const stats = {};
        const shifts = ["morning", "afternoon", "night"];
        
        shifts.forEach(shift => {
            stats[shift] = {};
            schedule.forEach(day => {
                const person = day[shift];
                if (person && person !== "UNASSIGNED") {
                    stats[shift][person] = (stats[shift][person] || 0) + 1;
                }
            });
        });
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get schedule
app.get('/api/schedule', async (req, res) => {
    try {
        if (useMongoDB) {
            const schedule = await schedulesCollection.findOne({ type: 'current' });
            if (!schedule) {
                const personsData = await personsCollection.find({}).toArray();
                const newSchedule = generateSchedule(personsData);
                // Limit to 30 days to prevent memory issues
                const limitedSchedule = newSchedule.slice(0, 30);
                await schedulesCollection.replaceOne(
                    { type: 'current' },
                    { type: 'current', schedule: limitedSchedule, generatedAt: new Date() },
                    { upsert: true }
                );
                res.json(limitedSchedule);
            } else {
                // Limit to 30 days to prevent memory issues
                const limitedSchedule = schedule.schedule.slice(0, 30);
                res.json(limitedSchedule);
            }
        } else {
            if (schedules.length === 0) {
                const newSchedule = generateSchedule(persons);
                const limitedSchedule = newSchedule.slice(0, 30);
                schedules.push({ type: 'current', schedule: limitedSchedule, generatedAt: new Date() });
                res.json(limitedSchedule);
            } else {
                const limitedSchedule = schedules[0].schedule.slice(0, 30);
                res.json(limitedSchedule);
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Generate and save new schedule
app.post('/api/schedule/regenerate', async (req, res) => {
    try {
        if (useMongoDB) {
            const personsData = await personsCollection.find({}).toArray();
            const newSchedule = generateSchedule(personsData);
            
            // Save the new schedule
            await schedulesCollection.replaceOne(
                { type: 'current' },
                { type: 'current', schedule: newSchedule, generatedAt: new Date() },
                { upsert: true }
            );
            
            // Save to history collection
            const historyEntries = [];
            newSchedule.forEach(day => {
                ['morning', 'afternoon', 'night'].forEach(shift => {
                    const person = day[shift];
                    if (person && person !== "UNASSIGNED") {
                        historyEntries.push({
                            date: day.date,
                            person: person,
                            shift: shift,
                            scheduleData: {
                                date: day.date,
                                month: day.month,
                                day: day.day,
                                dayOfWeek: day.dayOfWeek,
                                dayName: day.dayName || getDayNameFromIndex(day.dayOfWeek)
                            },
                            recordedAt: new Date()
                        });
                    }
                });
            });
            
            if (historyEntries.length > 0) {
                // Get current schedule and add history to it
                const currentSchedule = await schedulesCollection.findOne({ type: 'current' });
                if (currentSchedule) {
                    if (!currentSchedule.history) {
                        currentSchedule.history = [];
                    }
                    currentSchedule.history.push(...historyEntries);
                    await schedulesCollection.replaceOne(
                        { type: 'current' },
                        currentSchedule
                    );
                }
            }
            
            res.json({ success: true, schedule: newSchedule });
        } else {
            const newSchedule = generateSchedule(persons);
            schedules = [{ type: 'current', schedule: newSchedule, generatedAt: new Date() }];
            res.json({ success: true, schedule: newSchedule });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Helper function to generate schedule
function generateSchedule(persons) {
    const shifts = ["morning", "afternoon", "night"];
    const schedule = [];
    const workload = {};
    const consecutiveShifts = {};
    
    // Initialize workload and consecutive shift tracking
    persons.forEach(person => {
        workload[person.name] = 0;
        consecutiveShifts[person.name] = 0;
    });
    
    // Generate 30-day schedule
    for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const month = date.toLocaleString('default', { month: 'short' });
        const dayOfMonth = date.getDate();
        const dayName = getDayNameFromIndex(dayOfWeek);
        
        const daySchedule = { 
            date: dateStr,
            month: month,
            day: dayOfMonth,
            dayOfWeek: dayOfWeek,
            dayName: dayName
        };
        
        shifts.forEach(shift => {
            // Filter available persons for this shift
            let availablePersons = persons.filter(person => 
                person.available.includes(shift) &&
                !person.preferences.restDays.includes(dayOfWeek) &&
                consecutiveShifts[person.name] < person.preferences.maxConsecutiveShifts
            );
            
            // If no one meets all criteria, relax the consecutive shift constraint
            if (availablePersons.length === 0) {
                availablePersons = persons.filter(person => 
                    person.available.includes(shift) &&
                    !person.preferences.restDays.includes(dayOfWeek)
                );
            }
            
            // If still no one, relax rest day constraint
            if (availablePersons.length === 0) {
                availablePersons = persons.filter(person => 
                    person.available.includes(shift) &&
                    consecutiveShifts[person.name] < person.preferences.maxConsecutiveShifts
                );
            }
            
            // If still no one, just use available persons
            if (availablePersons.length === 0) {
                availablePersons = persons.filter(person => 
                    person.available.includes(shift)
                );
            }
            
            if (availablePersons.length > 0) {
                // Sort by preference and workload
                availablePersons.sort((a, b) => {
                    // Prefer preferred shifts
                    const aPrefers = a.preferences.preferredShifts.includes(shift);
                    const bPrefers = b.preferences.preferredShifts.includes(shift);
                    
                    if (aPrefers && !bPrefers) return -1;
                    if (!aPrefers && bPrefers) return 1;
                    
                    // Then by workload
                    return workload[a.name] - workload[b.name];
                });
                
                let bestPerson = availablePersons[0];
                
                // Reset consecutive shifts if person had a break
                if (consecutiveShifts[bestPerson.name] === 0) {
                    consecutiveShifts[bestPerson.name] = 1;
                } else {
                    consecutiveShifts[bestPerson.name]++;
                }
                
                daySchedule[shift] = bestPerson.name;
                workload[bestPerson.name]++;
            } else {
                daySchedule[shift] = "UNASSIGNED";
            }
        });
        
        // Reset consecutive shifts for people who got rest days
        persons.forEach(person => {
            if (person.preferences.restDays.includes(dayOfWeek)) {
                consecutiveShifts[person.name] = 0;
            }
        });
        
        schedule.push(daySchedule);
    }
    
    return schedule;
}

import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import mongoose from 'mongoose';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: process.env.NODE_ENV !== 'production' });

// Set webhook for production
if (process.env.NODE_ENV === 'production') {
    bot.setWebHook(`https://vessel-wash.onrender.com/telegram-webhook`);
}

const chatId = "-1003892174501";

async function checkSchedule() {

 const today = new Date().toISOString().split("T")[0];

 if (!schedulesCollection) {
   console.log('Schedules collection not available in checkSchedule');
   return null;
 }

 const data = await schedulesCollection.findOne({ type: "current" });

 if (!data || !data.schedule) {
   console.log('No schedule data found in checkSchedule');
   return null;
 }

 const todaySchedule = data.schedule.find(s => s.date === today);

 if (!todaySchedule) return;

 return todaySchedule;

}


cron.schedule("47 5 * * *", async () => {

 const schedule = await checkSchedule();

 if (!schedule) return;

 const person = schedule.morning;

 bot.sendMessage(chatId,
 `🌅 Vessel Cleaning Reminder

Morning Duty: ${person}
Time: 9:00 AM`);

});

cron.schedule("0 14 * * *", async () => {

 const schedule = await checkSchedule();

 if (!schedule) return;

 const person = schedule.afternoon;

 bot.sendMessage(chatId,
 `🌤 Vessel Cleaning Reminder

Afternoon Duty: ${person}
Time: 2:00 PM`);

});

cron.schedule("0 21 * * *", async () => {

 const schedule = await checkSchedule();

 if (!schedule) return;

 const person = schedule.night;

 bot.sendMessage(chatId,
 `🌙 Vessel Cleaning Reminder

Night Duty: ${person}
Time: 9:00 PM`);

});

bot.onText(/\/today/, async(msg) => {
   const chatId= "-1003892174501";
   console.log("Today command received"); 
});

async function getTodaySchedule(){

 const today = new Date().toISOString().split("T")[0];

 if (!schedulesCollection) {
   console.log('Schedules collection not available');
   return null;
 }

 const data = await schedulesCollection.findOne({ type:"current" });

 if (!data || !data.schedule) {
   console.log('No schedule data found');
   return null;
 }

 const todaySchedule = data.schedule.find(
   s => s.date === today
 );

 return todaySchedule;

}
bot.onText(/\/today/, async (msg) => {

 const chatId = msg.chat.id;

 const schedule = await getTodaySchedule();

 if(!schedule){
   bot.sendMessage(chatId,"No duty schedule today");
   return;
 }

 bot.sendMessage(chatId,

`📅 Vessel Cleaning Duty Today

🌅 Morning: ${schedule.morning}
🌤 Afternoon: ${schedule.afternoon}
🌙 Night: ${schedule.night}`

 );

});



const today = new Date().toISOString().split("T")[0];


bot.on("message", (msg) => {

 const chatId = msg.chat.id;

 const text = msg.text?.toLowerCase();

 if(text === "hi" || text === "hello"){

  bot.sendMessage(chatId,

`👋 Vanakkam!

Welcome to *Vessel Cleaning Reminder Group*.

Inga namma vessel cleaning duty reminder and schedule share pannuvom.

📅 Daily duties:
🌅 Morning
🌤 Afternoon
🌙 Night

Bot commands use pannalaam:

/today → Inniku duty yaar nu kaamikum  



🙏 Please follow duty schedule and support each other.`,

{ parse_mode: "Markdown" });

 }

});
bot.on("message", (msg) => {

 if (msg.new_chat_members) {

   msg.new_chat_members.forEach((member) => {

     const chatId = msg.chat.id;
     const name = member.first_name;

     bot.sendMessage(chatId,

`🎉 Welcome ${name}!

Indha group vessel cleaning duty reminder kaaga create pannirukom.

👉 Inniku duty paakanum na:
 /today

Please follow duty schedule 🙏`);

   });

 }

});
bot.onText(/\/week/, async (msg) => {

 const chatId = msg.chat.id;

 if (!schedulesCollection) {
   bot.sendMessage(chatId, "❌ Schedule data not available. Please try again later.");
   return;
 }

 const data = await schedulesCollection.findOne({ type:"current" });

 if (!data || !data.schedule) {
   bot.sendMessage(chatId, "❌ No schedule data found. Please contact admin.");
   return;
 }

 const weekSchedule = data.schedule.slice(0,7);

 let message = "📅 Weekly Vessel Cleaning Duty\n\n";

 weekSchedule.forEach((day) => {

   const date = new Date(day.date).toDateString();

   message += `📆 ${date}

🌅 Morning: ${day.morning}
🌤 Afternoon: ${day.afternoon}
🌙 Night: ${day.night}

`;

 });

 bot.sendMessage(chatId,message);

});

// Start server
connectToMongoDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });


}).catch(err => {
    console.error('Failed to start server:', err);
});
