const fs = require("fs");
const { openai } = require("./utils/openaiConfig");

// Config Variables

let embeddingStore = {}; // Contains embedded data for future use
const min_para_words = 5; // We will ignore paragraphs that have less than 5 words
const embeds_storage_prefix = "embeds:";
const maxTokens = 500; // Just to save my money :')

// Specify raw source file and embedded destination file path
// let sourcePath = "./generatedData/transcribed.txt";
// let sourcePath2 = "./sourceData/sourceFile2.txt";

// Specify raw source file
let sourcePath = "./sourceData/audioFile.mp3";

//destination file
let trancribedDestPath = "./generatedData/transcribed.txt";

let destPath = "./embeddedData/embeddedFile.txt";

const generateEmbedding = async () => {
  let completionResultWithoutNewline;

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

    console.log("transcription finished");
    console.log(`Time taken : ${(completionTime - startTime) / 1000} seconds`);


    /*
  let rawText = fs.readFileSync(sourcePath, {
    encoding: "utf-8",
    flag: "r",
  });
  */

    completionData = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: createPrompt(response.data.text),
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.1, // Tweak for more random answers
    });

    if (!completionData.data.choices) {
      throw new Error("No answer gotten");
    }

    let completionResult = completionData.data.choices[0].message.content.trim();
    completionResultWithoutNewline = completionResult.replace(/[\r\n]+/g, "");

    console.log('summary of the conversation = ' + completionResultWithoutNewline);

    // Write text to destination file
    fs.writeFileSync(trancribedDestPath, JSON.stringify(completionResultWithoutNewline));

  } catch (error) {
    console.log("Some error happened");
    // Error handling code
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.log(error);
    }
  }

  let rawText = completionResultWithoutNewline;

  // Paragraph store after splitting
  let paras = [];

  // Spliting text into paragraphs
  let rawParas = rawText.split(/\n\s*\n/);

  // Some more formatting and pushing each paragraph to paras[]
  for (let i = 0; i < rawParas.length; i++) {
    let rawPara = rawParas[i].trim().replaceAll("\n", " ").replace(/\r/g, "");

    // Check of it is a question and has greater length than minimum
    if (rawPara.charAt(rawPara.length - 1) != "?") {
      if (rawPara.split(/\s+/).length >= min_para_words) {
        paras.push(rawPara);
      }
    }
  }

  var countParas = paras.length;

  // Generate timestamp
  var startTime = new Date().getTime();

  // Sending data over to embedding model
  try {
    console.log("Sent file over to OpenAI");

    const response = await openai.createEmbedding({
      input: paras,
      model: "text-embedding-ada-002",
    });

    let completionTime = new Date().getTime();

    // Retrieve embedding store and parse it
    let embeddingStoreFile = fs.readFileSync(destPath, { encoding: "utf-8", flag: "r", });
    embeddingStoreJson = JSON.parse(embeddingStoreFile);

    // Check if data recieved correctly
    if (response.data.data.length >= countParas) {
      for (let i = 0; i < countParas; i++) {
        // Adding each embedded para to embeddingStore
        embeddingStoreJson[embeds_storage_prefix + paras[i]] = JSON.stringify({
          embedding: response.data.data[i].embedding,
          created: startTime,
        });
      }
    }

    // Write embeddingStore to destination file
    fs.writeFileSync(destPath, JSON.stringify(embeddingStoreJson));

    console.log("Embedding finished");
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

const createPrompt = (data) => {
  return (
    "give the most important issue and its solution provided in a line, don't use any new line character in response\n" +
    "data = " + data +
    "\n\n this solution has to be generic so that it can be used as a document." +
    "give solution in one line only don't mention anything other than issue and solution"
  );
};

generateEmbedding();
