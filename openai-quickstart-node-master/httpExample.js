const axios = require('axios');

// Make a GET request to the API endpoint
axios.get('http://127.0.0.1:5000/getJson')
  .then(response => {
    // Handle the API response
    console.log(response.data);
  })
  .catch(error => {
    // Handle any errors that occurred during the request
    console.error(error);
  });
