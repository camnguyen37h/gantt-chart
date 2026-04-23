$root = 'E:\SourceCode\CMC\ReactJs\gantt-chart'
$files = @(
  'src\hooks\cmplan\useBulkRelationshipForm.js',
  'src\store\cmplan\index.js',
  'src\store\cmplan\asyncThunks\index.js',
  'src\store\cmplan\asyncThunks\ciClasses.js',
  'src\store\cmplan\reducers\index.js',
  'src\store\cmplan\reducers\ciClasses.js',
  'src\store\cmplan\reducers\configurationItems.js',
  'src\utils\cmplan\mockCMPlanData.js',
  'src\utils\cmplan\mockCMPlanApi.js',
  'src\utils\cmplan\cmplanConstants.js',
  'src\pages\CMPlan\RelationshipMapPage.jsx',
  'src\pages\CMPlan\ConfigurationItemsPage.jsx',
  'src\pages\CMPlan\AttributeSettingsPage.jsx',
  'src\pages\CMPlan\CMPlanDashboardPage.jsx',
  'src\pages\CMPlan\BulkAddRelationshipPage.jsx',
  'src\components\CMPlan\ConfigurationItems\CIDetailDrawer.jsx',
  'src\components\CMPlan\ConfigurationItems\CIFormModal.jsx',
  'src\components\CMPlan\ConfigurationItems\CIFilterBar.jsx',
  'src\components\CMPlan\ConfigurationItems\CITable.jsx',
  'src\components\CMPlan\Dashboard\RecentCITable.jsx',
  'src\components\CMPlan\Dashboard\CIClassDistributionChart.jsx',
  'src\components\CMPlan\AttributeSettings\CIClassFormModal.jsx',
  'src\components\CMPlan\AttributeSettings\AttributeFormModal.jsx',
  'src\components\CMPlan\AttributeSettings\AttributeDefinitionTable.jsx',
  'src\components\CMPlan\Relationships\CISelectionPanel.jsx'
)

$pairs = @(
  ,@('MOCK_CI_CLASSES','MOCK_CI_TYPES')
  ,@('CI_CLASS_ICONS','CI_TYPE_ICONS')
  ,@('CI_CLASS_COLORS','CI_TYPE_COLORS')
  ,@('CIClassFormModalInner','CITypeFormModalInner')
  ,@('CIClassFormModal','CITypeFormModal')
  ,@('CIClassDistributionChart','CITypeDistributionChart')
  ,@('fetchCIClasses','fetchCITypes')
  ,@('createCIClass','createCIType')
  ,@('updateCIClass','updateCIType')
  ,@('deleteCIClass','deleteCIType')
  ,@('ciClassesApi','ciTypesApi')
  ,@('ciClassesReducer','ciTypesReducer')
  ,@('ciClassesSlice','ciTypesSlice')
  ,@('ciClassesLoading','ciTypesLoading')
  ,@('ciClassesSubmitting','ciTypesSubmitting')
  ,@('viewingCIClassId','viewingCITypeId')
  ,@('modalCiClassLabel','modalCiTypeLabel')
  ,@('modalCiClassId','modalCiTypeId')
  ,@('ciClassMap','ciTypeMap')
  ,@('ciClassLabel','ciTypeLabel')
  ,@('ciClassId','ciTypeId')
  ,@('ciClasses','ciTypes')
  ,@('setFilterClassId','setFilterTypeId')
  ,@('filterClassId','filterTypeId')
  ,@('setSelectedClassId','setSelectedTypeId')
  ,@('selectedClassId','selectedTypeId')
  ,@('fromClassName','fromTypeName')
  ,@('toClassName','toTypeName')
  ,@('fromClassId','fromTypeId')
  ,@('toClassId','toTypeId')
  ,@('classLabel','typeLabel')
  ,@('classIcon','typeIcon')
  ,@('classColor','typeColor')
  ,@('classMap','typeMap')
  ,@('fromClass','fromType')
  ,@('toClass','toType')
  ,@('selectedClass','selectedType')
  ,@('ci_class_changed','ci_type_changed')
  ,@('ci_class_form','ci_type_form')
  ,@("'Class Changed'","'Type Changed'")
  ,@("'CI Class'","'CI Type'")
  ,@("'class-001'","'type-001'")
  ,@("'class-002'","'type-002'")
  ,@("'class-003'","'type-003'")
  ,@("'class-004'","'type-004'")
  ,@("'class-005'","'type-005'")
  ,@("'class-006'","'type-006'")
  ,@("'class-007'","'type-007'")
  ,@("'class-008'","'type-008'")
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
foreach ($rel in $files) {
  $path = Join-Path $root $rel
  if (-not (Test-Path $path)) { Write-Host "SKIP: $rel"; continue }
  $c = [System.IO.File]::ReadAllText($path, $utf8NoBom)
  foreach ($p in $pairs) { $c = $c.Replace($p[0], $p[1]) }
  $c = [regex]::Replace($c, '\bciClass\b', 'ciType')
  $c = [regex]::Replace($c, '\bCIClass\b', 'CIType')
  [System.IO.File]::WriteAllText($path, $c, $utf8NoBom)
  Write-Host "OK: $rel"
}
