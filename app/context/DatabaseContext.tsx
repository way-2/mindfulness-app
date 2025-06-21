import * as SQLite from 'expo-sqlite';
import React, { useContext, useEffect, useState } from 'react';
import { initDatabase } from '../utils/Database';

type DatabaseContextType = {
    db: SQLite.SQLiteDatabase | null;
    initialized: boolean;
}

const DatabaseContext = React.createContext<DatabaseContextType>({
    db: null,
    initialized: false,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dbInstance, setDbInstance] = useState<SQLite.SQLiteDatabase | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        (async () => {
            await initDatabase();
            setDbInstance((await SQLite.openDatabaseAsync('mindful.db')));
            setInitialized(true);
        })();
    }, []);

    return (
        <DatabaseContext.Provider value={{ db: dbInstance, initialized }}>
            {children}
        </DatabaseContext.Provider>
    );
}