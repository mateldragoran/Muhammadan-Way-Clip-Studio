import fs from 'fs/promises';
import path from 'path';

// Base temporary directory inside the backend folder
const TMP_BASE_DIR = path.resolve(process.cwd(), '.tmp');

/**
 * Creates a unique, isolated workspace directory for a specific render job.
 * This prevents file conflicts if multiple people export clips at the exact same time.
 */
export const createTempWorkspace = async (jobId) => {
  const workspacePath = path.join(TMP_BASE_DIR, jobId);
  
  // recursive: true ensures the parent .tmp folder is also created if it doesn't exist
  await fs.mkdir(workspacePath, { recursive: true });
  
  return workspacePath;
};

/**
 * Generates a full file path inside the given workspace.
 */
export const getFilePath = (workspacePath, filename) => {
  return path.join(workspacePath, filename);
};

/**
 * STRICT CLEANUP: Deletes the entire job workspace and everything inside it.
 * This is the most important function in the backend to prevent server crashes from full disks.
 */
export const cleanupWorkspace = async (workspacePath) => {
  try {
    if (workspacePath) {
      // force: true ignores errors if the folder doesn't exist
      // recursive: true wipes all files inside it
      await fs.rm(workspacePath, { recursive: true, force: true });
      console.log(`🧹 Cleaned up temporary workspace: ${workspacePath}`);
    }
  } catch (error) {
    console.error(`❌ CRITICAL: Failed to clean workspace ${workspacePath}:`, error);
  }
};