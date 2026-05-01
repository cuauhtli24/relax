{
import { BackendStorage } from './contracts/BackendStorage';

// Importamos los archivos JSON directamente
// Esto hace que Vercel los incluya en el paquete final sí o sí
import en from '../translations/en.json';
import fr from '../translations/fr.json';
import no from '../translations/no.json';

const translationsMap: Record<string, any> = {
    en,
    fr,
    no
};

const toFlatPropertyMap = (obj: any, keySeparator = '.') => {
    const flattenRecursive = (obj: any, parentProperty?: string, propertyMap: Record<string, unknown> = {}) => {
        for (const [key, value] of Object.entries(obj)) {
            const property = parentProperty ? `${parentProperty}${keySeparator}${key}` : key;
            if (value && typeof value === 'object') {
                flattenRecursive(value, property, propertyMap);
            } else {
                propertyMap[property] = value;
            }
        }
        return propertyMap;
    };
    return flattenRecursive(obj);
};

export default async (storage: BackendStorage, memoryStorage: BackendStorage, language: string) => {
    const key = `translations-${language}`;
    const memoryCachedFlat = await memoryStorage.get(key);

    if (!memoryCachedFlat) {
        const cachedFlat = await storage.get(key);

        if (!cachedFlat) {
            // En lugar de leer el disco, usamos el mapa que ya importamos arriba
            const rawData = translationsMap[language] || translationsMap['en'];
            const flat = toFlatPropertyMap(rawData);
            
            memoryStorage.set(key, JSON.stringify(flat), 3600 * 4);
            storage.set(key, JSON.stringify(flat), 3600 * 4);
            
            return flat;
        }
        
        memoryStorage.set(key, cachedFlat, 3600 * 4);
        return JSON.parse(cachedFlat);
    }
    
    return JSON.parse(memoryCachedFlat);
};

};
