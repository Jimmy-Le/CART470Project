const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');

// Authenticate using your Service Account JSON key
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'google-drive-key.json'),
  scopes: ['https://googleapis.com'],
});

const drive = google.drive({ version: 'v3', auth });

const uploadToDrive = async (fileObject, folderId) => {
  // Convert the memory buffer into a readable stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);

  // 1. Upload the file to your shared Google Drive folder
  const { data } = await drive.files.create({
    media: {
      mimeType: fileObject.mimetype,
      body: bufferStream,
    },
    requestBody: {
      name: `${Date.now()}-${fileObject.originalname}`,
      parents: [folderId],
    },
    fields: 'id, name',
  });

  // 2. Make the file publicly viewable so React can render it
  await drive.permissions.create({
    fileId: data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // 3. Return the file ID and a reliable thumbnail URL for <img> tags
  return {
    fileId: data.id,
    imageUrl: `https://google.com{data.id}&sz=w1000`,
  };
};

module.exports = { uploadToDrive };
