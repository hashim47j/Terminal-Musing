// /home/hash/Documents/Terminal-Musing/backend/dailythougthsapi/helpers.js

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder paths
const pendingDir = path.join(__dirname, '..', 'data', 'pending');
const approvedDir = path.join(__dirname, '..', 'data', 'approved');

// Ensure folders exist
fs.ensureDirSync(pendingDir);
fs.ensureDirSync(approvedDir);

// 🔹 Generate a unique ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

// 🔹 Save a JSON object to file
export async function saveJSON(filePath, data) {
  await fs.writeJson(filePath, data, { spaces: 2 });
}

// 🔹 Load JSON from file
export async function loadJSON(filePath) {
  return await fs.readJson(filePath);
}

// 🔹 Get all files from a directory
export async function getAllFilesFromDir(dir) {
  const files = await fs.readdir(dir);
  const results = [];

  for (const file of files) {
    try {
      const filePath = path.join(dir, file);
      const json = await fs.readJson(filePath);
      results.push(json);
    } catch (err) {
      console.error(`❌ Failed to read file ${file}:`, err);
    }
  }

  return results;
}

// 🔹 Get file path for a thought
export function getThoughtFilePath(id, type = 'pending') {
  const dir = type === 'approved' ? approvedDir : pendingDir;
  return path.join(dir, `${id}.json`);
}

// 🔹 Delete a thought
export async function deleteThoughtFile(id, type = 'pending') {
  const filePath = getThoughtFilePath(id, type);
  await fs.remove(filePath);
}

// 🔹 Move a thought from pending to approved
export async function moveToApproved(id) {
  const from = getThoughtFilePath(id, 'pending');
  const to = getThoughtFilePath(id, 'approved');
  const data = await loadJSON(from);
  await saveJSON(to, data);
  await fs.remove(from);
}

// 🔹 Update a thought
export async function updateThoughtFile(id, updates, type = 'pending') {
  const filePath = getThoughtFilePath(id, type);
  const existing = await loadJSON(filePath);
  const updated = { ...existing, ...updates };
  await saveJSON(filePath, updated);
}