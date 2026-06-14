import localforage from 'localforage';

// Configurar bases de datos locales
export const dbLocal = localforage.createInstance({ name: 'TortasBO_DB' });
