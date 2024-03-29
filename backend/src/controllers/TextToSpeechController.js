const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { GoogleCloudStorage } = require('../repository/GoogleCloudStorage');

const textToSpeechClient = new TextToSpeechClient();
const googleCloudStorage = new GoogleCloudStorage();
/*
    This controller is in javascript because for some reason
    when using Typescript, the audio file is getting corrupted
    and I haven't figured out why yet. This also needs to be refactored,
    but since I got it working I'm going to commit it for now.
    Maybe I will try to figure out a typescript solution in the future.
*/
class TextToSpeechController {

    async googleTextToSpeech(req, res) {
        const text = req.body.text;
        const languageCode = req.body.languageCode;

        // Check Google Cloud Storage to see if the file exists before
        // generating the audio. It's more expensive to generate audio
        // than download from GCS. There is some risk of a collision
        // because we're using the hashed text as the file key.
        const fileExists = await googleCloudStorage.fileExists(text);
        if (fileExists) {
            const buffer = await googleCloudStorage.downloadAudioFile(text);
            const base64Audio = buffer.toString('base64');
            res.json({ audioContent: base64Audio });

        } else {
            const request = {
                input: { text: text },
                // Different language codes support different voices.
                // Leaving out ssmlGender lets google choose for you
                voice: { languageCode: languageCode }, // ssmlGender: 'NEUTRAL' }, 
                audioConfig: { audioEncoding: 'MP3' },
            };

            // Convert text to speech
            const [response] = await textToSpeechClient.synthesizeSpeech(request);

            if (response.audioContent) {
                try {
                    // Upload audio to google cloud in case same text is requested again
                    const filePath = await googleCloudStorage.uploadAudioFile(response.audioContent, text);

                    // Send base64 encoded audio back to the client
                    const base64Audio = response.audioContent.toString('base64');
                    res.json({ filePath: filePath, audioContent: base64Audio });
                } catch (error) {
                    console.error('Error uploading to Google Cloud Storage:', error);
                }
            } else {
                console.error('No audio content received from text-to-speech service');
            }
        }
    }
}

module.exports = { TextToSpeechController };
