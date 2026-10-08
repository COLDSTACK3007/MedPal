const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'gramcare.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create necessary tables
        db.serialize(() => {
            // Patient Records table
            db.run(`CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER,
        gender TEXT,
        village TEXT,
        contact TEXT
      )`);

            // Health Records table
            db.run(`CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        date TEXT,
        symptoms TEXT,
        diagnosis TEXT,
        risk_level TEXT,
        notes TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
      )`);
        });
    }
});

module.exports = db;
