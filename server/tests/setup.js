import { spawn } from 'child_process';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(process.cwd(), '..', '.env') });

let emulatorsProcess;


export default async function globalSetup() {
  console.log('\n--- Global Test Setup: Starting Firebase Emulators ---');

 
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.NODE_ENV = 'test'; 

  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set in .env. Cannot start emulators.');
  }

  
  emulatorsProcess = spawn(
    'firebase',
    ['emulators:start', '--only', 'firestore,auth', '--project', projectId], 
    {
      stdio: 'pipe', // Pipe stdout/stderr to capture output
      cwd: process.cwd(), 
      shell: true 
    }
  );

  // Listen for emulator output to know when they are ready
  return new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => {
      console.error('Firebase Emulators did not start in time. Output:\n', output);
      
      if (emulatorsProcess && !emulatorsProcess.killed) {
        emulatorsProcess.kill('SIGINT');
      }
      reject(new Error('Firebase Emulators startup timed out.'));
    }, 20000); 

    emulatorsProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      if (output.includes('Firestore running') && output.includes('Authentication running')) {
        clearTimeout(timeout);
        console.log('Firebase Emulators are ready!');
        resolve();
      }
    });

    emulatorsProcess.stderr.on('data', (data) => {
      output += data.toString();
      console.error(`Emulator stderr: ${data}`);
    });

    emulatorsProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Firebase Emulators exited with code ${code}. Output:\n`, output);
        clearTimeout(timeout);
        reject(new Error(`Firebase Emulators exited unexpectedly. Code: ${code}`));
      }
    });

    emulatorsProcess.on('error', (err) => {
      console.error('Failed to start Firebase Emulators process:', err);
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Store the process reference for teardown
export const getEmulatorsProcess = () => emulatorsProcess;
