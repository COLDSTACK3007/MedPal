import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

// For Expo SDK 50+, use SQLite.openDatabaseSync or openDatabaseAsync
// We are using a basic synchronous setup for the MVP
let db: SQLite.SQLiteDatabase;

export function useDatabase() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function initDb() {
            try {
                db = await SQLite.openDatabaseAsync('gramcare.db');

                // Create tables
                await db.execAsync(`
          CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            village TEXT,
            lastVisit TEXT,
            synced INTEGER DEFAULT 0
          );
        `);

                setIsReady(true);
            } catch (e) {
                console.error('Error initializing database', e);
            }
        }
        initDb();
    }, []);

    const addPatient = async (patient: any) => {
        if (!db) return;
        await db.runAsync(
            'INSERT INTO patients (id, name, age, gender, village, lastVisit, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patient.id, patient.name, patient.age, patient.gender, patient.village, patient.lastVisit, 0]
        );
    };

    const getPatients = async () => {
        if (!db) return [];
        const allRows = await db.getAllAsync('SELECT * FROM patients');
        return allRows;
    };

    const syncRecords = async () => {
        if (!db) return;
        const unsynced = await db.getAllAsync('SELECT * FROM patients WHERE synced = 0');
        if (unsynced.length === 0) return { success: true, count: 0 };

        try {
            const response = await fetch('http://10.0.2.2:3000/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records: unsynced })
            });

            if (response.ok) {
                // Mark as synced
                await db.execAsync('UPDATE patients SET synced = 1 WHERE synced = 0');
                return { success: true, count: unsynced.length };
            }
            return { success: false, error: 'Server error' };
        } catch (e) {
            console.error('Sync failed', e);
            return { success: false, error: 'Network error' };
        }
    };

    return { isReady, addPatient, getPatients, syncRecords };
}
