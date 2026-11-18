import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

// const { google } = require('googleapis');
// const stream = require('stream');
// const path = require('path');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}


// -------------------------- Images --------------------------------

export async function uploadAssetToDrive(fileObject){
  const drive = getDriveClient();

  const folderId = process.env.ISLAND_PICTURES_FOLDER_ID?.trim();
  

  if (!folderId) {
    throw new Error('ISLAND_PICTURES_FOLDER_ID is missing from .env');
  }

  const bufferStream = new Readable();
  bufferStream.push(fileObject.buffer);
  bufferStream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileObject.originalname,
      parents: [folderId], // The folder that the images will end up in 
    },
    media: {
      mimeType: fileObject.mimetype,
      body: bufferStream,
    },
    fields: 'id, name, mimeType',
  });

  return response.data;
}

export async function getAssetStreamFromDrive(fileId) {
  const drive = getDriveClient();
  const metadata = await drive.files.get({
    fileId,
    fields: 'mimeType, name, size',
  });

  const fileStream = await drive.files.get(
    {fileId, alt: 'media'},
    {responseType: 'stream'}
  );

  return {
    stream: fileStream.data,
    mimeType: metadata.data.mimeType,
  };

}

export async function listImagesFromDrive() {
  const drive = getDriveClient();
  const folderId = process.env.ISLAND_PICTURES_FOLDER_ID?.trim();

  if (!folderId) {
    throw new Error('ISLAND_PICTURES_FOLDER_ID is missing from .env');
  }

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: 'files(id, name, mimeType, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  // Normalize field names so your frontend works seamlessly
  return (response.data.files || []).map((file) => ({
    _id: file.id,
    driveFileId: file.id,
    name: file.name,
    mimeType: file.mimeType,
  }));

}

// -------------------------- Audio ------------------------------
export async function uploadAudioToDrive(fileObject) {
  const drive = getDriveClient();
  const folderId = process.env.ISLAND_AUDIO_FOLDER_ID?.trim();

  if (!folderId) {
    throw new Error('ISLAND_AUDIO_FOLDER_ID is missing from .env');
  }

  const bufferStream = new Readable();
  bufferStream.push(fileObject.buffer);
  bufferStream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileObject.originalname,
      parents: [folderId],
    },
    media: {
      mimeType: fileObject.mimetype,
      body: bufferStream,
    },
    fields: 'id, name, mimeType',
  });

  return response.data;
}

export async function listAudioFromDrive() {
  const drive = getDriveClient();
  const folderId = process.env.ISLAND_AUDIO_FOLDER_ID?.trim();

  if (!folderId) {
    throw new Error('ISLAND_AUDIO_FOLDER_ID is missing from .env');
  }

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType contains 'audio/'`,
    fields: 'files(id, name, mimeType, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  return (response.data.files || []).map((file) => ({
    _id: file.id,
    driveFileId: file.id,
    name: file.name,
    mimeType: file.mimeType,
  }));
}
