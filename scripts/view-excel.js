'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const targetArg = process.argv[2] || 'Beds';
let filePath = targetArg;

if (!fs.existsSync(filePath)) {
  const baseDir = path.join(__dirname, '..', 'output', 'excel_versions');
  const catDirs = fs.existsSync(baseDir) ? fs.readdirSync(baseDir) : [];
  const matchedCat = catDirs.find((d) => d.toLowerCase() === targetArg.toLowerCase().replace(/\s+/g, '_'));

  if (matchedCat) {
    const files = fs.readdirSync(path.join(baseDir, matchedCat)).filter((f) => f.endsWith('.xlsx'));
    if (files.length > 0) {
      files.sort();
      filePath = path.join(baseDir, matchedCat, files[files.length - 1]);
    }
  }
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  console.log('\nAvailable categories in output/excel_versions/:');
  const baseDir = path.join(__dirname, '..', 'output', 'excel_versions');
  if (fs.existsSync(baseDir)) {
    console.log(fs.readdirSync(baseDir).join('\n'));
  }
  process.exit(1);
}

console.log('========================================================================');
console.log(`  EXCEL FILE INSPECTOR: ${path.basename(filePath)}`);
console.log(`  Path: ${filePath}`);
console.log('========================================================================\n');

const wb = XLSX.readFile(filePath);
console.log(`Sheets in workbook: ${wb.SheetNames.join(', ')}\n`);

for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);
  console.log(`------------------------------------------------------------------------`);
  console.log(`  SHEET: [${sheetName}] (Total Rows: ${rows.length})`);
  console.log(`------------------------------------------------------------------------`);

  const previewRows = rows.slice(0, 3);
  for (let i = 0; i < previewRows.length; i++) {
    const r = previewRows[i];
    console.log(`\n  [Row ${i + 1}] Product: ${r.Product_Name || r.Product_ID}`);
    if (sheetName === 'Generated Data') {
      console.log(`    Mood Line:    ${r.Mood_Line}`);
      console.log(`    Intro:        ${r.Intro}`);
      console.log(`    Story:        ${r.Story}`);
      console.log(`    Close:        ${r.Close}`);
      console.log(`    Summary:      ${r.Full_Summary}`);
      console.log(`    Status:       ${r.Row_Status} (Valid: ${r.Validation_Valid})`);
    } else {
      console.log(`    Category:     ${r.Category} / ${r.Subcategory}`);
      console.log(`    Material:     ${r.Primary_Material}`);
      console.log(`    Color/Finish: ${r.Color_Finish}`);
      console.log(`    Dimensions:   ${r.Dimensions}`);
      console.log(`    Price:        ₹${r.Price}`);
    }
  }
  console.log('');
}
