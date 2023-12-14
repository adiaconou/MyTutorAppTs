const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');

/*
    This controller is in javascript because for some reason
    when using Typescript, the audio file is getting corrupted
    and I haven't figured out why yet. This also needs to be refactored,
    but since I got it working I'm going to commit it for now.
    Maybe I will try to figure out a typescript solution in the future.
*/
class GoogleCloudStorage {
    constructor() {
        this.storage = new Storage();
        this.bucketName = 'my-tutor-app';
    }

    async uploadAudioFile(buffer, text) {

        // Use the hash value of the translated text as the file name.
        // There could be collisions, but the audio files are short-lived
        // and this makes caching much easier across users who may be 
        // generating audio for the same text. Good enough solution for now.
        const hash = crypto.createHash('sha256');
        const hashText = hash.update(text).digest('hex'); // convert to string
        const destination = "text-to-speech/" + hashText + '.mp3';

        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(destination);
        
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'audio/mpeg',
            }
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (err) => {
                console.error('Upload failed.', err);
                reject(err);
            });

            stream.on('finish', () => {
                console.log(`${destination} uploaded to ${this.bucketName}.`);
                resolve(this.bucketName + "/" + destination);
            });

            stream.end(buffer);
        });
    }
}

module.exports = { GoogleCloudStorage };
