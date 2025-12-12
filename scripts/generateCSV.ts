import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateExampleCSV, convertToCSVString } from '../lib/csvGenerator';

const sales = generateExampleCSV();
const csvString = convertToCSVString(sales);

const publicPath = join(process.cwd(), 'public', 'example-sales.csv');
writeFileSync(publicPath, csvString, 'utf-8');

console.log(`Generated ${sales.length} sales records`);
console.log(`CSV saved to: ${publicPath}`);
