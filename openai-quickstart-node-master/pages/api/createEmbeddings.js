const fs = require("fs");
const { openai } = require("../../utils/openaiConfig");

let embeddedPath = "././embeddedData/embeddedFile.txt";

// Config Variables
let embeddingStore = {};

const maxTokens = 500; // Just to save my money :')
const embeds_storage_prefix = "embeds:";
let embeddedQuestion;


export default async function (req, res) {

  let prompt = req.body.query;
  console.log('akhilesh input' + req.body.query);

  if (req.body.query.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid query",
      }
    });
    return;
  }

 // let result = generateCompletion(req.body.query);



  console.log(`Called completion function with prompt : ${prompt}`);

  try {
    // Retrieve embedding store and parse it
    let embeddingStoreJSON = fs.readFileSync(embeddedPath, { encoding: "utf-8", flag: "r", });

    embeddingStore = JSON.parse(embeddingStoreJSON);

    // Embed the prompt using embedding model
    let embeddedQuestionResponse = await openai.createEmbedding({
      input: prompt,
      model: "text-embedding-ada-002",
    });

    // Some error handling
    if (embeddedQuestionResponse.data.data.length) {
      embeddedQuestion = embeddedQuestionResponse.data.data[0].embedding;
    } else {
      throw Error("Question not embedded properly");
    }

    // Find the closest count(int) paragraphs
    let closestParagraphs = findClosestParagraphs(embeddedQuestion, 3); // Tweak this value for selecting paragraphs number

    let completionData = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: createPrompt(prompt, closestParagraphs),
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.2 // Tweak for more random answers
    });

    if (!completionData.data.choices) {
      throw new Error("No answer gotten");
    }

    console.log('akki =' + completionData.data.choices[0].message.content.trim());
    // return completionData.data.choices[0].message.content.trim().toString();

   // const formattedResult = getInstructionsDataFormat(completionData.data.choices[0].message.content.trim());

   // console.log("formatted result" + formattedResult);

    res.status(200).json({ result: completionData.data.choices[0].message.content.trim() });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }


  // res.status(200).json({ result: formattedResult });

  /*
    try {
      const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: 'akki'
      });
  
      console.log('akhilesh response' + response);
  
      
      res.status(200).json({ result: response.data[0].object });
    } catch (error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        res.status(500).json({
          error: {
            message: 'An error occurred during your request.',
          }
        });
      }
    }
    */

}

const createPrompt = (question, paragraph) => {
  return (
   "Answer the following question, also use your own knowledge when necessary :\n\n" +
   //  "Answer the following question from the context, if the answer can not be deduced from the context, say 'I dont know' :\n\n" +
    "Context :\n" +
    paragraph.join("\n\n") +
    "\n\nQuestion :\n" +
    question +
    "?" +
    "\n\nAnswer :" + " Note: present the answer in more readable manner and summarize it and rephrase as well and if answer include steps then use nemuration to identify them and question further what further assistence user wants" +
    "if you don't find any good answer in given context say you don't know this answer and ask if user want to raise a ticket to ADP support team if needed"
  );

  // A sample prompt if you don't want it to use its own knowledge
  // rather answer only from data you've provided

  // return (
  //   "Answer the following question from the context, if the answer can not be deduced from the context, say 'I dont know' :\n\n" +
  //   "Context :\n" +
  //   paragraph.join("\n\n") +
  //   "\n\nQuestion :\n" +
  //   question +
  //   "?" +
  //   "\n\nAnswer :"
  // );
};

// Removes the prefix from paragraph
const keyExtractParagraph = (key) => {
  return key.substring(embeds_storage_prefix.length);
};

// Calculates the similarity score of question and context paragraphs
const compareEmbeddings = (embedding1, embedding2) => {
  var length = Math.min(embedding1.length, embedding2.length);
  var dotprod = 0;

  for (var i = 0; i < length; i++) {
    dotprod += embedding1[i] * embedding2[i];
  }

  return dotprod;
};

// Loop through each context paragraph, calculates the score, sort using score and return top count(int) paragraphs
const findClosestParagraphs = (questionEmbedding, count) => {
  var items = [];

  for (const key in embeddingStore) {
    let paragraph = keyExtractParagraph(key);

    let currentEmbedding = JSON.parse(embeddingStore[key]).embedding;

    items.push({
      paragraph: paragraph,
      score: compareEmbeddings(questionEmbedding, currentEmbedding),
    });
  }

  items.sort(function (a, b) {
    return b.score - a.score;
  });

  return items.slice(0, count).map((item) => item.paragraph);
};


const getInstructionsDataFormat = (sentence) => {
  var sentences = sentence.split(/[0-9]+\. /).filter(Boolean);
  console.log("splitted sentences = "+ sentences);
  const outputArray = sentences.map((item, index) => {
    return {
      id: index + 1,
      label: item,
      checked: false
    };
  });

  return outputArray;
}

const generateCompletion = async (prompt) => {
  console.log(`Called completion function with prompt : ${prompt}`);

  try {
    // Retrieve embedding store and parse it
    let embeddingStoreJSON = fs.readFileSync(embeddedPath, { encoding: "utf-8", flag: "r", });

    embeddingStore = JSON.parse(embeddingStoreJSON);

    // Embed the prompt using embedding model
    let embeddedQuestionResponse = await openai.createEmbedding({
      input: prompt,
      model: "text-embedding-ada-002",
    });

    // Some error handling
    if (embeddedQuestionResponse.data.data.length) {
      embeddedQuestion = embeddedQuestionResponse.data.data[0].embedding;
    } else {
      throw Error("Question not embedded properly");
    }

    // Find the closest count(int) paragraphs
    let closestParagraphs = findClosestParagraphs(embeddedQuestion, 2); // Tweak this value for selecting paragraphs number

    let completionData = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: createPrompt(prompt, closestParagraphs),
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.2, // Tweak for more random answers
    });

    if (!completionData.data.choices) {
      throw new Error("No answer gotten");
    }

    console.log('akki =' + completionData.data.choices[0].message.content.trim());

    const formattedResult = getInstructionsDataFormat(completionData.data.choices[0].message.content.trim().toString());

    console.log('formatted result =' + formattedResult);

    return formattedResult;
  } catch (error) {
    console.log(error);
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
  }
};