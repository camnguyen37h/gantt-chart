/**
 * Script to transform Mock API/Business plan/ source files into
 * src/utils/mock-data/ destination files, adding mvvType to DU columns.
 *
 * Usage: node scripts/transformMockData.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'Mock API', 'Business plan')
const DST = path.join(ROOT, 'src', 'utils', 'mock-data')

/**
 * Assign mvvType to columnLabels entries based on view rules:
 *  - Total / OB: has two DELIVERY_UNIT_39 entries — first is Onsite, second is Offshore
 *  - Onsite: all DU columns are Onsite
 *  - Offshore: all DU columns are Offshore
 */
function addMvvTypes(data, view) {
  const cloned = JSON.parse(JSON.stringify(data))
  const labels = cloned.data.columnLabels

  if (view === 'Total' || view === 'OB') {
    // DU columns: DU1(Onsite), DU39(Onsite), DU39(Offshore), DU103(Offshore)
    // Identify by index order since columnKey alone is ambiguous for duplicates
    let du39Count = 0
    for (const col of labels) {
      if (!col.columnKey.startsWith('DELIVERY_UNIT')) continue
      if (col.columnKey === 'DELIVERY_UNIT_1') {
        col.mvvType = 'Onsite'
      } else if (col.columnKey === 'DELIVERY_UNIT_39') {
        du39Count++
        col.mvvType = du39Count === 1 ? 'Onsite' : 'Offshore'
      } else if (col.columnKey === 'DELIVERY_UNIT_103') {
        col.mvvType = 'Offshore'
      }
    }
  } else if (view === 'Onsite') {
    for (const col of labels) {
      if (!col.columnKey.startsWith('DELIVERY_UNIT')) continue
      col.mvvType = 'Onsite'
    }
  } else if (view === 'Offshore') {
    for (const col of labels) {
      if (!col.columnKey.startsWith('DELIVERY_UNIT')) continue
      col.mvvType = 'Offshore'
    }
  }

  return cloned
}

const viewMap = [
  { src: 'Total.json',   dst: 'businessPlanTotal.json',   view: 'Total' },
  { src: 'OB.json',      dst: 'businessPlanOB.json',      view: 'OB' },
  { src: 'Onsite.json',  dst: 'businessPlanOnsite.json',  view: 'Onsite' },
  { src: 'Offshore.json', dst: 'businessPlanOffshore.json', view: 'Offshore' },
]

for (const { src, dst, view } of viewMap) {
  const srcPath = path.join(SRC, src)
  const dstPath = path.join(DST, dst)

  const raw = JSON.parse(fs.readFileSync(srcPath, 'utf8'))
  const transformed = addMvvTypes(raw, view)
  fs.writeFileSync(dstPath, JSON.stringify(transformed, null, 2), 'utf8')
  console.log(`✔ ${dst} written (${JSON.stringify(transformed).length} chars, view=${view})`)
}

console.log('\nDone.')
