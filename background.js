let toptags = []
async function get_ratemyprof_link(prof_name){
  console.log("INSIDE GET LINK FUNCTION")
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
  return {link: link, pagetext: pagetxt}
}

// get the rating from the ratemyprofessor page given the page html
function get_ratemyprof_rating(page){
  return get_div_content(page,"\"RatingValue__Numerator").content
}

function get_div_content(page, search, start=0){
  let startidx = page.indexOf(search,start);
  if (startidx==-1){return {content: "", end: -1}}
  startidx = page.indexOf(">",startidx)+1;
  let endidx = page.indexOf("<",startidx);
  return {content: page.substring(startidx,endidx), end: endidx};
}

function get_ratemyprof_takeagain_and_difficulty(page) {
  let startidx = page.indexOf("\"FeedbackItem__FeedbackNumber-uof32n-1 kkESWs")
  startidx = page.indexOf(">", startidx)+1
  let endidx = page.indexOf("<", startidx);
  const takeagain = page.substring(startidx, endidx)
  startidx = page.indexOf("\"FeedbackItem__FeedbackNumber-uof32n-1 kkESWs", endidx)+1
  startidx = page.indexOf(">", startidx)+1
  endidx = page.indexOf("<", startidx);
  const difficulty = page.substring(startidx, endidx);
  return [takeagain, difficulty]
}

function get_ratemyprof_reviews(page, max=10){
  let temp = get_div_content(page,"\"Comments__StyledComments");
  let curr_idx=temp.end;
  let results = [temp.content];
  let maxcount = max;
  while (temp.content!="" && maxcount>1){
    temp = get_div_content(page,"\"Comments__StyledComments",start=curr_idx);
    results.push(temp.content)
    curr_idx=temp.end+100;
    maxcount--;
  }

  return results;
}


function get_ratemyprof_toptags(page) {
  let startidx = page.indexOf("\"Tag-bs9vf4-0 hHOVKF");
  startidx = page.indexOf(">", startidx) + 1

  const permanentEnd = page.indexOf("</div>", startidx)
  

  while (startidx < permanentEnd) {
    endidx = page.indexOf("<", startidx);
    tag = page.substring(startidx, endidx);
    toptags.push(tag)
    startidx = page.indexOf("\"Tag-bs9vf4-0 hHOVKF", endidx);
    startidx = page.indexOf(">", startidx) + 1
  }

  return toptags;
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

let receivedArray;
let profLinks;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {(async () => {
    if (message.type === "SEND_ARRAY") {
      const receivedArray = message.data;
      let profLinks = "";
      let responses = []
      // Define an async function to process each professor
      for (const profName of receivedArray) {
        try {
          // const link = await get_ratemyprof_link(profName);
          // console.log("Link:", link);
          // profLinks += `${link},`;

          
          const pageData = await get_ratemyprof_page(profName);
          const profPage = pageData.pagetext;
          profLinks += `${pageData.link},`;
          

          const professor = await get_div_content(pageData.pagetext, "title data-react-helmet=\"true\"").content.trim().split(" at")[0];
          if (profName !== professor.trim().toLowerCase()) {
            continue;
          }

          const rating = await get_ratemyprof_rating(profPage);
          //console.log("Overall Rating:", rating);
          const reviews = await get_ratemyprof_reviews(profPage);
          //console.log("Reviews:", reviews);
          

          const takeAgainAndDifficulty = await get_ratemyprof_takeagain_and_difficulty(profPage);
          // console.log("Take Again + Difficulty:", takeAgainAndDifficulty);

          const toptags = await get_ratemyprof_toptags(profPage);
          //console.log("Top tags:", toptags);

          // console.log("Link:",pageData.link);


          let prompt = `I need to summarize the reviews of professor ${professor}. I have scraped the following data: They have an average rating of ${rating} out of 5, ${takeAgainAndDifficulty[0]} of students would take the course again and students rated the professor's average difficulty as ${takeAgainAndDifficulty[1]} out of 5. Here are the most common attributes/tags about the professor ${toptags}. Finally, here are some written reviews that students had about the professors: ${reviews}\n\n Write a short blurb that uses all of this information to summarize the reviews and what you can expect from the class. Please do not sugarcoat your review as it will be the primary factor in students' course selection.`
          
          const apiKey = "AIzaSyAEK-YG3823HWIMcqUBFh4ys4pnNs0SUdA";
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          
          let response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          });
          let data = await response.json()
          console.log(data)
          let summary = data.candidates[0].content.parts[0].text;
          responses.push({prof_rating: rating, prof_name: professor, link: pageData.link, summary: summary})
          

        } catch (error) {
          console.error("Error processing professor:", profName, error);
        }
        //profName/name toptags, takeAgainAndDifficulty, reviews, rating
    }
    console.log(responses)
    sendResponse({all_data: responses});
}
})(); return true;});
//console.log("received Array", receivedArray)

chrome.action.onClicked.addListener(async (tab) => {

injected_list = {}

if (tab.url.startsWith('https://umass.collegescheduler.com') && tab.url.includes("courses")) {
  console.log("Inside courses page")
  // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === 'ON' ? 'OFF' : 'SCAN';

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
  tabId: tab.id,  
  text: nextState,
  });
  if (nextState === "SCAN") {
      // Insert the CSS file when the user turns the extension on
      await chrome.scripting.insertCSS({
        files: ["focusmode.css"],
        target: { tabId: tab.id },
      });
      
      if (!injected_list[tab.id] || injected_list[tab.id]===undefined){
        console.log("Injecting courses page")
        await chrome.scripting.executeScript({
        target : {tabId : tab.id},
        files : [ "myscript.js" ],
        }).then(()=> {
        console.log("Script injected");
        });
        injected_list[tab.id]=true;
      }
      
    }
  }else{

    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === 'ON' ? 'ON' : 'ON';

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
      if (!injected_list[tab.id] || injected_list[tab.id]===undefined){
      await chrome.scripting.executeScript({
        target : {tabId : tab.id},
        files : [ "myscript2.js" ],
        }).then(()=> {
        console.log("Script injected");
        });
        injected_list[tab.id]=true;
      }
      
    }

  }
   



});


