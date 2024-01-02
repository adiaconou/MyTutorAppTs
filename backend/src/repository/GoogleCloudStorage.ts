import { Storage, Bucket, File } from '@google-cloud/storage'
import NotFoundError from '../error/NotFoundError';
import * as crypto from 'crypto';
import InternalError from '../error/InternalError';

/*
    This controller is in javascript because for some reason
    when using Typescript, the audio file is getting corrupted
    and I haven't figured out why yet. This also needs to be refactored,
    but since I got it working I'm going to commit it for now.
    Maybe I will try to figure out a typescript solution in the future.
*/
class GoogleCloudStorage {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage();
        this.bucketName = 'my-tutor-app';
    }

    async uploadAudioFile(buffer: Buffer, text: string) {
        const filePath: string = await this.getFilePath(text)
        const bucket: Bucket = this.storage.bucket(this.bucketName);
        const file: File = bucket.file(filePath);

        const stream = file.createWriteStream({
            metadata: {
                contentType: 'audio/mpeg',
            }
        });

        return new Promise<string>((resolve, reject) => {
            stream.on('error', (err: Error) => {
                reject(new InternalError(`Error uploading audio file: ${err.message}`));
            });

            stream.on('finish', () => {
                resolve(this.bucketName + "/" + filePath);
            });

            stream.end(buffer);
        });
    }

    async downloadAudioFile(text: string): Promise<Buffer> {
        const filePath: string = await this.getFilePath(text);
        const bucket: Bucket = this.storage.bucket(this.bucketName);
        const file: File = bucket.file(filePath);

        return new Promise<Buffer>((resolve, reject) => {
            file.download((err, content) => {
                if (err) {
                    if (err.code == '404') {
                        reject(new NotFoundError(`Downloading audio file failed: ${err.message}`));
                    } else {
                        reject(new InternalError(`Downloading audio file failed. Unrecognized Google Cloud Storage download error: ${err.message} with code ${err.code}`));
                    }
                } else {
                    resolve(content);
                }
            });
        });
    }

    async fileExists(text: string) {
        const filePath: string = await this.getFilePath(text);
        const bucket: Bucket = this.storage.bucket(this.bucketName);
        const file: File = bucket.file(filePath);
        const [exists]: [boolean] = await file.exists();
        
        return exists;
    }

    async getFilePath(text: string) {
        // Use the hash value of the translated text as the file name.
        // There could be collisions, but the audio files are short-lived
        // and this makes caching much easier across users who may be 
        // generating audio for the same text. Good enough solution for now.
        const hash = crypto.createHash('sha256');
        const hashText: string = hash.update(text).digest('hex'); // convert to string
        const destination: string = "text-to-speech/" + hashText + '.mp3';

        return destination;
    }
}

module.exports = { GoogleCloudStorage };
