import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
    if (!db) {
        db = await SQLite.openDatabaseAsync('mindful.db');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY NOT NULL,
                value TEXT
            );
        `);

        // Try to create the reminders table and check if it was just created
        const result = await db.getFirstAsync<{ count: number }>(
            `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='reminders';`
        );
        if (!result || result.count === 0) {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS reminders (
                    id INTEGER PRIMARY KEY NOT NULL,
                    text TEXT
                );
            `);
            await db.execAsync(`
                INSERT INTO reminders (text) VALUES ('Pause. Breathe. Be.');
                INSERT INTO reminders (text) VALUES ('Just a gentle nudge to tune into the present moment.');
                INSERT INTO reminders (text) VALUES ('Take a mindful minute for yourself.');
                INSERT INTO reminders (text) VALUES ('Your mind could use a mini-vacation right now.');
                INSERT INTO reminders (text) VALUES ('What''s happening in this exact moment? Notice it.');
                INSERT INTO reminders (text) VALUES ('Time for a quick mindfulness break!');
                INSERT INTO reminders (text) VALUES ('Check in with your breath. It''s always there.');
                INSERT INTO reminders (text) VALUES ('A little moment of calm awaits you.');
                INSERT INTO reminders (text) VALUES ('Give your mind a mindful reset.');
                INSERT INTO reminders (text) VALUES ('Feeling overwhelmed? A mindful moment can help.');
                INSERT INTO reminders (text) VALUES ('Step back and observe for a moment.');
                INSERT INTO reminders (text) VALUES ('Let''s ground ourselves, just for a second.');
                INSERT INTO reminders (text) VALUES ('How about a mindful pause right now?');
                INSERT INTO reminders (text) VALUES ('Tune into your senses. What do you notice?');
                INSERT INTO reminders (text) VALUES ('Remember to breathe deeply and intentionally.');
                INSERT INTO reminders (text) VALUES ('A small moment of awareness can make a big difference.');
                INSERT INTO reminders (text) VALUES ('Find your center, even for a few seconds.');
                INSERT INTO reminders (text) VALUES ('Release the rush, embrace the present.');
                INSERT INTO reminders (text) VALUES ('Your mindful moment is calling!');
                INSERT INTO reminders (text) VALUES ('Let''s take a breath together.');
                INSERT INTO reminders (text) VALUES ('Be here now.');
                INSERT INTO reminders (text) VALUES ('Take a mental pause from your day.');
                INSERT INTO reminders (text) VALUES ('Cultivate calm, one moment at a time.');
                INSERT INTO reminders (text) VALUES ('Just a reminder to be present with yourself.');
                INSERT INTO reminders (text) VALUES ('Find your stillness in the midst of it all.');
            `);
        }
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS mood_journal (
                id TEXT PRIMARY KEY NOT NULL,
                mood TEXT
                notes TEXT
            );
        `);
    }
}

export async function setSetting(key: string, value: string) {
    if (!db) throw new Error('Database not initialized. Call initDatabase first.');
    await db.runAsync(
        `INSERT OR REPLACE INTO settings (id, value) VALUES (?, ?);`
        , key, value
    );
}

export async function getSetting(key: string): Promise<string | null> {
    if (!db) throw new Error('Database not initialized. Call initDatabase first.');
    const result = await db.getFirstAsync<{value: string}>(`SELECT value FROM settings WHERE id = ?;`, key);
    return result?.value ?? null;
}

export async function getAllReminders(): Promise<string[]> {
    if (!db) throw new Error('Database not initialized. Call initDatabase first.');
    const results = await db.getAllAsync<{ text: string }>(`SELECT text FROM reminders;`);
    return results.map(row => row.text);
}