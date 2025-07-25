import { getEmulatorsProcess } from './setup.js';


export default async function globalTeardown() {
  console.log('\n--- Global Test Teardown: Stopping Firebase Emulators ---');
  const emulatorsProcess = getEmulatorsProcess();
  if (emulatorsProcess && !emulatorsProcess.killed) {
    emulatorsProcess.kill('SIGINT'); // SIGINT to gracefully shut down emulators
    console.log('Firebase Emulators stopped.');
  } else {
    console.log('Firebase Emulators process not found or already killed.');
  }
}
