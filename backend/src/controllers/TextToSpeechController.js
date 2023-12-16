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
        
        const fileExists = await googleCloudStorage.fileExists(text);
        if (fileExists) {
            console.log("File exists");
        }

        const request = {
            input: { text: text },
            // Different language codes support different voices.
            // Leaving out ssmlGender lets google choose for you
            // otherwise it requires additional lookup to get voices
            // for the language.
            voice: { languageCode: languageCode }, // ssmlGender: 'NEUTRAL' }, 
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await textToSpeechClient.synthesizeSpeech(request);
        // Check if audio content is available
        if (response.audioContent) {
            // Upload the audio content to Google Cloud Storage
            try {
                const filePath = await googleCloudStorage.uploadAudioFile(response.audioContent, text);
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

module.exports = { TextToSpeechController };
