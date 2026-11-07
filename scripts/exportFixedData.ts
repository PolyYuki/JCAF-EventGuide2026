import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Node環境用の localStorage モック
if (typeof localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as Record<string, unknown>).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    length: 0,
    key: () => null
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main() {
  console.log('Fetching latest spreadsheet data...');
  // 動的インポート
  const { loadStallsData, loadStagesData, loadFacilitiesData } = await import('../src/services/sheetService.ts');

  const [stallsRes, stagesRes, facilitiesRes] = await Promise.all([
    loadStallsData(),
    loadStagesData(),
    loadFacilitiesData()
  ]);

  console.log(`Fetched:`);
  console.log(`- Stalls: ${stallsRes.data.length} items (from remote: ${stallsRes.isFromRemote})`);
  console.log(`- Stages: ${stagesRes.data.length} items (from remote: ${stagesRes.isFromRemote})`);
  console.log(`- Facilities: ${facilitiesRes.data.length} items (from remote: ${facilitiesRes.isFromRemote})`);

  if (!stallsRes.isFromRemote && stallsRes.data.length === 0) {
    console.error('Failed to fetch stalls from remote!');
    process.exit(1);
  }

  const outputDir = path.resolve(projectRoot, 'src/data');

  // JSONとして書き出し
  fs.writeFileSync(
    path.join(outputDir, 'fixedStalls.json'),
    JSON.stringify(stallsRes.data, null, 2),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(outputDir, 'fixedStages.json'),
    JSON.stringify(stagesRes.data, null, 2),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(outputDir, 'fixedFacilities.json'),
    JSON.stringify(facilitiesRes.data, null, 2),
    'utf-8'
  );

  console.log('Successfully saved fixed JSON data to src/data/ !');
}

main().catch(err => {
  console.error('Error during data export:', err);
  process.exit(1);
});
