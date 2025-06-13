const http = require('http');

// Test the API connection
async function testApi() {
  try {
    console.log('Testing API connection to http://localhost:5000/api/templates');
    
    // Create a promise to handle the HTTP request
    const requestPromise = new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/api/templates', (res) => {
        console.log('Response status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            console.log('Response data:', jsonData);
            resolve(jsonData);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', data);
            reject(e);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Error connecting to API:', error);
        reject(error);
      });
      
      req.end();
    });
    
    await requestPromise;
  } catch (error) {
    console.error('Error in test function:', error);
  }
}

testApi();
