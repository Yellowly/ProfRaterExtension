async function get_ratemyprof_link(prof_name){
  prof_name = prof_name.toLowerCase().replace(" ","%20")
  // fetch ratemyprofessor search results
  let response = await fetch("https://www.ratemyprofessors.com/search/professors/1513?q="+prof_name)
  if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
  }
  // unwrap the text of the response
  let contenttext = await response.text()
  // get professor "id" used in the ratemyprofessor link
  let idx = contenttext.indexOf("href=\"/professor/")
  let substr = contenttext.substring(idx+17,contenttext.indexOf("\"",idx+17))

  // append to link and return full link
  return "https://www.ratemyprofessors.com/professor/"+substr
}

async function get_ratemyprof_page(prof_name){
  // access the professors webpage
  let link = await get_ratemyprof_link(prof_name);
  let response = await fetch(link);

  // error check
  if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
  }

  // return the page's html content
  let pagetxt = await response.text();
  return pagetxt
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

const extensions = 'https://developer.chrome.com/docs/extensions';
const webstore = 'https://developer.chrome.com/docs/webstore';
let receivedArray;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SEND_ARRAY") {
       receivedArray = message.data;
       console.log("Received array in background script:", receivedArray)
      //  console.log("Link",get_ratemyprof_link(receivedArray[0]))
      
       get_ratemyprof_link(receivedArray[0]).then(res => console.log(res));

      // You can process or store the array as needed here
      sendResponse({ status: "Array received successfully!" });
    }
  });
//console.log("received Array", receivedArray)

chrome.action.onClicked.addListener(async (tab) => {
    
if (tab.url.startsWith('h') || tab.url.startsWith(webstore)) {
  // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
  tabId: tab.id,
  text: nextState,
  });
  if (nextState === "ON") {

      // Insert the CSS file when the user turns the extension on
      await chrome.scripting.insertCSS({
        files: ["focusmode.css"],
        target: { tabId: tab.id },
      });
      await chrome.scripting.executeScript({
        target : {tabId : tab.id},
        files : [ "myscript.js" ],
    }).then(()=> {
      console.log("Script injected");
      console.log("received Array", receivedArray);
  });
      
    } else if (nextState === "OFF") {
      // Remove the CSS file when the user turns the extension off
      await chrome.scripting.removeCSS({
        files: ["focusmode.css"],
        target: { tabId: tab.id },
      });
    }
  }
});