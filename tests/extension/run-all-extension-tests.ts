import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAllExtensionValidationSuites() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPLETE E2E EXTENSION VALIDATION SUITE');
  console.log('====================================================\n');

  const rootDir = path.resolve(__dirname, '../../');
  const jsonPath = path.join(rootDir, 'artifacts/extension-validation/reports/extension-test-results.json');
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
  }

  // 1. Rebuild extension to ensure dist is up to date

  console.log('[Runner] Rebuilding extension...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  const isMac = process.platform === 'darwin';
  const xvfbCmd = isMac ? '' : 'xvfb-run -a -s "-screen 0 1440x900x24"';

  // 2. Run Spec 1: Inventory Controls
  console.log('\n[Runner] Executing Spec 1: Inventory Controls...');
  execSync(`${xvfbCmd} tsx tests/extension/specs/inventory-controls.spec.ts`, { cwd: rootDir, stdio: 'inherit' });

  // 3. Run Spec 2: Extension Action Popup UI
  console.log('\n[Runner] Executing Spec 2: Extension Action Popup UI...');
  execSync(`${xvfbCmd} tsx tests/extension/specs/action-popup-validation.spec.ts`, { cwd: rootDir, stdio: 'inherit' });

  // 4. Run Spec 3: Negative & Robustness Tests
  console.log('\n[Runner] Executing Spec 3: Negative Tests...');
  execSync(`${xvfbCmd} tsx tests/extension/specs/negative-tests.spec.ts`, { cwd: rootDir, stdio: 'inherit' });

  // 5. Run Spec 4: Stability Loops & Responsive Viewports...
  console.log('\n[Runner] Executing Spec 4: Stability Loops & Responsive Viewports...');
  execSync(`${xvfbCmd} tsx tests/extension/specs/stability-loops.spec.ts`, { cwd: rootDir, stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('✅ ALL EXTENSION VALIDATION SUITES COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');
}

runAllExtensionValidationSuites().catch(err => {
  console.error('❌ Master Runner Error:', err);
  process.exit(1);
});
