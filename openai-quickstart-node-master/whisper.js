const fs = require("fs");
const { openai } = require("./utils/openaiConfig");



// Specify raw source file
let sourcePath = "./sourceData/audioFile.mp3";

//destination file
let destPath = "./generatedData/transcribed.txt";

const generateWhisperText = async () => {
  // listen from audio file
  console.log("audio transcription Started");

  // Generate timestamp
  var startTime = new Date().getTime();

  // Sending data over to whisper model
  try {
    console.log("Sent file over to OpenAI");

    const response = await openai.createTranscription(
      fs.createReadStream(sourcePath),
      "whisper-1"
    );

    let completionTime = new Date().getTime();

    // response data
    console.log("response = " + response.data.text);


    // Write text to destination file
    fs.writeFileSync(destPath, JSON.stringify(response.data.text));

    console.log("transcription finished");
    console.log(`Time taken : ${(completionTime - startTime) / 1000} seconds`);
  } catch (error) {
    console.log("Some error happened");
    // Error handling code
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.log(error);
    }
  }
};

generateWhisperText();
