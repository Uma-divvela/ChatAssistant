import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import App from './app';

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [instructionInput, setInstructionInput] = useState("");
  const [chatSetupInput, setupQueryChatInput] = useState("");
  const [embeddingInput, setEmbeddingInput] = useState("");
  const [result, setResult] = useState();

  /*
   const [list, setList] = useState([{ id: 1, label: 'Item 1', checked: false }, { id: 2, label: 'Item 2', checked: false }]);

  
  const handleCheckboxChange = (id) => {
    setList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  */

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ animal: animalInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setAnimalInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSubmitQuery(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/olympicQuery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: queryInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setQueryInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }


  async function onSubmitInstructionsQuery(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/setupInstructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: instructionInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setQueryInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }


  async function onSubmitSetupChatQuery(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/setupChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: chatSetupInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setupQueryChatInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSubmitEmbeddingQuery(event) {
    event.preventDefault();
    try {

      const response = await fetch("http://localhost:5000/getData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ prompt: embeddingInput }),
      });



      /*
      const responseDocument = await fetch("/api/createEmbeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: embeddingInput }),
      });
      */
      const data = await response.json();

      // const data = await response.json();
      console.log("akki fetched result " + data.toString());
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      let documentResponse;

      if(data.data.includes('Unable to understand you') || data.data.includes('does not provide')){
        try {
          documentResponse = await fetch("/api/createEmbeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: embeddingInput }),
        });

        if (documentResponse.status !== 200) {
          throw data.error || new Error(`Request failed with status ${documentResponse.status}`);
        }

        const data2 = await documentResponse.json();
        setResult(data2.result);
      }
      catch (error) {
        // Consider implementing your own error handling logic here
        console.error(error);
        alert(error.message);
      }

      }
      else{
        setResult(data.data);
      }


     // setResult(data.result);

      //    setList(data.result);

      setEmbeddingInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }


  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>
      {/*
     
      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Name my pet</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="animal"
            placeholder="Enter an animal"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Generate names" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>

     <div  className={styles.main}>
      <h3>Seach a olympic query</h3>
      <form onSubmit={onSubmitQuery}>
          <input
            type="text"
            name="query"
            placeholder="search a olympic related query"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
          />
          <input type="submit" value="query" />
        </form>
     </div>


     <div  className={styles.main}>
      <h3>get instructions</h3>
      <form onSubmit={onSubmitInstructionsQuery}>
          <input
            type="text"
            name="query"
            placeholder="get instructions"
            value={instructionInput}
            onChange={(e) => setInstructionInput(e.target.value)}
          />
          <input type="submit" value="query" />
        </form>
     </div>

     <div  className={styles.main}>
      <h3>get instructions(chat model)</h3>
      <form onSubmit={onSubmitSetupChatQuery}> 
          <input
            type="text"
            name="query"
            placeholder="get instructions"
            value={chatSetupInput}
            onChange={(e) => setupQueryChatInput(e.target.value)}
          />
          <input type="submit" value="query" />
        </form>
     </div>
  */}

  
  {/*
      <div className={styles.main}>
        <h3>Get results from the document</h3>
        <form onSubmit={onSubmitEmbeddingQuery}>
          <input
            type="text"
            name="query"
            placeholder="enter your query"
            value={embeddingInput}
            onChange={(e) => setEmbeddingInput(e.target.value)}
          />
          <input type="submit" value="query" />
        </form>
      </div>
      <div className={styles.result}>{result}</div>


*/ }
      <App />


    </div>


  );
}


