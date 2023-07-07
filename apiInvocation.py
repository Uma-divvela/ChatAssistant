#!/usr/bin/env python
# encoding: utf-8
import json
from flask import Flask, jsonify, request, render_template
from langchain.chains.api.prompt import API_RESPONSE_PROMPT
from langchain.chains import APIChain
from langchain.prompts.prompt import PromptTemplate
from langchain.chains.api import test_docs
from langchain.llms import OpenAI
import os
import json, requests
import smtplib, ssl
from flask_cors import CORS, cross_origin

app = Flask(__name__, template_folder='template')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#Putting in the OpenAI API Key
os.environ["OPENAI_API_KEY"] = "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"

# Initiating OpenAI class with the model we require and set temp based by monitoring the responses
llm = OpenAI(temperature=1, top_p=1 , model_name="text-davinci-003")


@app.route('/getData', methods=['POST'])
@cross_origin()
def index():
    
    try:
    
        template = """
        Can any of the following APIs assist in answering the question: "{question}"? Please provide a simple "Yes" or "No" response, and note that a partial yes is still considered a yes.

        API Endpoint 1: Provides you the details of user/employee information within an organization such as unique identifier (ID), name, email address, and Badge Id.

        API Endpoint 2: Facilitates clock initialization. Note that clock initialization and clock setup are distinct operations; this endpoint is solely responsible for initialization.

        API Endpoint 3: Enables the retrieval of user notifications.

        API Endpoint 4: Allows for the creation of Jira tickets.
        """
    
        prompt = PromptTemplate(
            input_variables=["question"], 
            template=template
        )

        print(prompt.format(
                question=request.json['prompt']
            ))

        proceed_further = llm(prompt.format(
                question=request.json['prompt']
            ))

        print("Proceed further : "+ proceed_further)
        


        if("Yes" in proceed_further or "yes" in proceed_further):
            
            # Use LLM Model which we set above and that picks the right URL based on the given prompts
            chain_new = APIChain.from_llm_and_api_docs(llm, test_docs.TEST_DOCS, verbose=True)

            # Will ask user for prompt and execute it.
            response = chain_new.run(request.json['prompt'])
        

            if("no specific information provided" in response or "no information provided" in response or "does not provide" in response ):
                return jsonify(
                                data="Unable to understand you.."
                            )

        else:
            return jsonify(
              data="Unable to understand you.."
            )

    except requests.exceptions.MissingSchema: 
        return jsonify(
          data="Unable to understand you.."
        )
        

    return jsonify(
          data=response
        )


@app.route('/employeeDetails', methods=['GET'])
@cross_origin()
def getEmployeeDetails(): 

    args = request.args
    # some JSON:
    x = '[{"id":123,"name":"John","email":"john.frost@gmail.com", "badge": "456787654"},{"id":234,"name":"William","email":"william.jeff@gmail.com", "badge": "456787654"},{"id":345,"name":"sam","email":"sam.paul@gmail.com", "badge": "456787654"},{"id":456,"name":"eva","email":"eva.lisa@gmail.com", "badge": "456787654"}]'

    # parse x:
    y = json.loads(x)

    name = args.get("name").lower()
    if name is not None:
        return [(data) for data in y if data.get("name").lower() == name]
    return y

@app.route('/initializeClock', methods=['GET'])
@cross_origin()
def initializeClock(): 

    # some JSON:
    x = '[{"organizationId":"xyz","deviceName":"OneWest-GroundFloor-Bay1"}]'

    # parse x:
    y = json.loads(x)

    return y


@app.route('/listNotifications', methods=['GET'])
@cross_origin()
def getListOfNotifications(): 

    # some JSON:
    x = '[{"associateId":"xyz","subject":"Its ok to take a day off from Work"}]'

    # parse x:
    y = json.loads(x)

    return y


def sendEmail(query):
    
    request_input = query
    
    input = "Write an email to person , that his model is unable to understand this context and ask them to feed this data to model along with subject. To name should be 'ADP' from name should be 'Uma'"+ request_input
    
    llm_response = llm(input)

    try:
        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        sender_email = "uma.divvela@gmail.com"
        receiver_email = "adpchatgpt2023@gmail.com"  
        password = "sejopjjefftvmzlg"
        
        message = llm_response

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)

        return jsonify(
          data="Sent Email!"            
        )           
    
    except:
        return jsonify(
          data= "Failed to send Email!"
        )
    



@app.route('/createJiraTicket', methods = ['GET'])
def createJiraTicket():
    
    request_input = request.args['query']
    input = "Give a very short description of the paragraph : "+ request_input 
    
    #llm_response = llm(input)

    post_data = {
        "fields": {
            "project": {
                "key": "TES"
            },
            "summary": request_input,
            "description": request_input,
            "issuetype": {
                "name": "Task"
            }
        }
    }

    # # The API endpoint to communicate with jira
    url_post = "https://maheswaridivvela.atlassian.net/rest/api/2/issue/"

    headers = {"content-type": "application/json", "Authorization": "Basic bWFoZXN3YXJpLmRpdnZlbGFAZ21haWwuY29tOkFUQVRUM3hGZkdGMFJ5bFlBLTlKVzZXQU5KZ0dva1FQRzVJWGlwa09WMUtyMWtFVnpwTzRCVzcxYUdrTEhpLVhtQWx0UEFpX0E0OFRhMmpNbVZFZGQzU0xGeF9QRTJObDJPZE9NcTB6SnMtNDNEUS1md3VhRXZIUExfbll1OWFmSTdvZnY5VndDSklCY1RIQVROWlJCVU81c1VzakdBdXhZRGVBeGVITjdxRGpKbGdaRGplS0t5Yz0zRUI0Q0ZERA=="}

    # A POST request to tthe API
    post_response = requests.post(url_post, json=post_data, headers = headers)

    # Print the response
    post_response_json = post_response.json()
    
    sendEmail(request_input)

    if post_response_json['key'] is not None:
        return jsonify(
          data= "Created!"
        )

    return jsonify(
          data= "Not Created!"
        )       

 
if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=5000)