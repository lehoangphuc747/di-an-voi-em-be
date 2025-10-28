import { MonAn } from '@/types';

// Note: This file is now dynamic.
// It uses Vite's `import.meta.glob` feature to automatically find and
// import all .json files in this directory. You no longer need to
// manually add imports when you create a new food data file.

// The `eager: true` option imports all modules directly, making them
// available for immediate use.
const modules = import.meta.glob<MonAn>('./*.json', { eager: true });

const foodData: { [key: string]: MonAn } = {};

// Iterate over the found modules. The key (`path`) is the file path (e.g., './1.json').
for (const path in modules) {
  // Extract the filename without the extension to use as the object key (e.g., '1').
  const key = path.split('/').pop()?.replace('.json', '');

  if (key) {
    // The imported JSON content is the module itself.
    const foodItem = modules[path];
    foodData[key] = foodItem;
  }
}

export default foodData;