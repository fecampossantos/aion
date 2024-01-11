// force the state to clear with fast refresh in Expo (remove DONTs for it to work)
// DONT@DONTrefresh DONTreset
import { useState, useEffect } from "react";

import { database } from "./database";

const useDatabase = () => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    async function loadDataAsync() {
      try {
        // database.cleanTables();
        // database.dropTables();
        // database.createTables();
        // database.insertExamples();
        // database.getTableNames();

        setIsDatabaseReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    loadDataAsync();
  }, []);

  useEffect(() => {
    if (isDatabaseReady) console.log("isDatabaseReady", isDatabaseReady);
  }, [isDatabaseReady]);

  return { isDatabaseReady, database };
};

export default useDatabase;
