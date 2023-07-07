const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const setupInstructions = `set up instructions:

for clock type Intouch clock

1. Unpack the clock and all its accessories from the box.
2. Connect the power adapter to the clock and plug it into a power outlet.
3. Connect the Ethernet cable to the clock and to your network router.
4. Turn on the clock by pressing the power button.
5. Follow the on-screen instructions to set up the clock, including selecting your language, time zone, and network settings.
6. Once the clock is connected to your network, you can access it through the UKG InTouch web interface to configure additional settings, such as user profiles, time and attendance rules, and reporting.

for clock type Intouch Dx clock
1. unpack the box.
2. plugin power adaptor.
3. plugin ethernet cable.
4. set server IP adress for communication.
5. set client indetifier.

do not intermix intouch clock steps with intouch dx clock steps. Both are different.
`;





export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  console.log('akhilesh' + req.body.query);

let queryText = `Use the below instructions to answer about instructions of kronos intouch clock"
steps: ${setupInstructions}
Question: ${req.body.query}
Answer: 


`


  if (queryText.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid query",
      }
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
       model: 'gpt-3.5-turbo',
       messages: [{role: 'user', content: queryText}]
    });
    
  console.log('chat result' + JSON.stringify(completion));

    res.status(200).json({ result: completion.choices[0].message });
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
}
