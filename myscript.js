let stored_responses = []
let curr_displayed = 0;
let reply;
function getSelectionText() {
    let text = "";

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text;
}

function dragElement(elmnt) {
  var offsetX = 0, offsetY = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    offsetX = e.clientX - elmnt.getBoundingClientRect().left;
    offsetY = e.clientY - elmnt.getBoundingClientRect().top;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    // set the element's new position:
    elmnt.style.left=newX+"px";
    elmnt.style.top=newY+"px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

const popupthingy = document.createElement("div")

popupthingy.setAttribute("popover","")
popupthingy.setAttribute("class","ratemyprofpopup")
popupthingy.setAttribute("tabindex","0")
popupthingy.style.display="none"
document.body.appendChild(popupthingy);

const popupdata = document.createElement("div")
popupdata.setAttribute("class","profpopupdata")
popupthingy.appendChild(popupdata);

const popuplink = document.createElement("a");
popuplink.setAttribute("href","https://www.ratemyprofessors.com/")
popuplink.setAttribute("target","_blank")
const popupNum = document.createElement("p")
popupdata.appendChild(popupNum)
popupdata.appendChild(popuplink);

const popupheader = document.createElement("h3");
popupheader.textContent="name"
popuplink.appendChild(popupheader);

const popupscore = document.createElement("h1");
popupscore.textContent="5.0"
popupdata.appendChild(popupscore);

const popupicon = document.createElement("img");
popupicon.setAttribute("src","https://i.pinimg.com/736x/8b/c7/6d/8bc76db022e08779c4eb5f27cc2f49ac.jpg")
popupthingy.appendChild(popupicon);

const popupnumelements = document.createElement("p");


popupnumelements.textContent = "0";

popupdata.appendChild(popupnumelements)


const popupcontent = document.createElement("p");

popupcontent.textContent="none"
popupcontent.setAttribute("class","profpopupcontent")
popupthingy.appendChild(popupcontent);

let typing = false;
async function show_popup(response, iter = 10) {
    popupthingy.style.left = `${10}px`;
    popupthingy.style.top = `${10}px`;
    console.log(reply);

    if (iter === 0) {
        iter = 1;
    }
    popupNum.textContent = `Option ${iter} of ${reply.all_data.length}`;
    popupscore.textContent = `${response.prof_rating}/5`;
    popupnumelements.textContent = `Based on ${response.prof_num_ratings}`;
    popupheader.textContent = response.prof_name;
    popupcontent.textContent = ""; // Clear existing text before typing
    typing = true;
    await typeText(response.summary); // Start the typing effect
   
    typing = false;
    console.log("DONE TYPING!",typing)

    popuplink.setAttribute("href", response.link);
    popuplink.focus();
    popupthingy.showPopover();
    popupthingy.style.display = "grid";
}
async function typeText(text) {
    typing = true;
    let index = 0;

   
    async function typeCharacter() {
        typing = true;
        if (index < text.length) {
            popupcontent.textContent += text.charAt(index);
            index++;
            await new Promise(resolve => setTimeout(resolve, 10));
            await typeCharacter();
          
            
        }else{
            typing = false
        }
        
    }

    await typeCharacter(); // Start typing
}


function show_loading_popup(content="Loading"){
    popupthingy.style.left=`${10}px`;
    popupthingy.style.top=`${10}px`;

    popupNum.textContent = ""
    popupscore.textContent = "";
    popupnumelements.textContent = "";
    popupheader.textContent = content;
    popupcontent.textContent = "";
    popuplink.setAttribute("href","")
    popuplink.focus();
    popupthingy.showPopover();
    popupthingy.style.display = "grid";


  }

dragElement(popupthingy);



console.log(getSelectionText());
//console.log(document.body);
const sectionLinks = document.getElementsByClassName('css-o4eziu-hoverStyles-hoverStyles-defaultStyle-hoverStyles-btnCss-editBtnCss')
//const sectionLink = document.querySelector('a[aria-label="Sections for CompSci 220 – Programming Methodology"]');
console.log(sectionLinks)
// Select the main table element
const table = document.querySelector("table");
let professorsList = [];

if (table) {
// Loop through each tbody in the table
table.querySelectorAll("tbody").forEach((tbody) => {
    // Select the first row in the tbody
    const firstRow = tbody.querySelector("tr");
    if (firstRow) {
    // Select the 9th td with the specified class
    const targetTd = firstRow.querySelectorAll("td")[8]; // Index 8 for the 9th td (0-based)
    
    if (targetTd && targetTd.classList.contains("css-1p12g40-cellCss-hideOnMobileCss")) {
        // Navigate to the innermost div -> div -> div -> span
        //const spanElement = targetTd.querySelectorAll("div > div > div > span");

        // Check if span exists and has content
        console.log("About to scrape teachers from schedule builder")
        targetTd.querySelectorAll("div > div > div > span, .ReactCollapse--content > div > div > span").forEach((result) => {
            result = result.innerHTML.trim() ? result.innerHTML : "";
            if (result !== "") {
                if (!professorsList.includes(result.trim().toLowerCase())){
                    professorsList.push(result.trim().toLowerCase());
                    console.log(professorsList);
                }
            }

            console.log(result); // Logs the innerHTML or "" if empty
        })

        // Check for ReactCollapse--content
        /*targetTd.querySelectorAll(".ReactCollapse--content > div > div > span").forEach((result) => {
            const result = spanElement && spanElement.innerHTML.trim() ? spanElement.innerHTML : "";
            if (result !== "") {
                if (!professorsList.includes(result.trim().toLowerCase())){
                    professorsList.push(result.trim().toLowerCase());
                    console.log(professorsList);
                }
            }

            console.log(result); // Logs the innerHTML or "" if empty
        })*/
       
        
    } else {
        console.log("Target td not found or class does not match.");
    }
    } else {
    console.log("First row not found in tbody.");
    }
});
} else {
console.log("Table element not found.");
}

// TODO: Take care of case with multiple professors teaching same lecture
console.log("LIST OF PROFESSORS:", professorsList);
show_loading_popup()
chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: professorsList }, (response) => {
    reply = response;
    console.log("Response from background:", response);
    if(response.hasOwnProperty("message")){
        console.log("about to alert")
        show_loading_popup(response.message)
    }else{
        stored_responses=response.all_data;
        curr_displayed=0;
        show_popup(stored_responses[0],1);

    }

});

/*document.onkeydown = function(e) {
    if(e.keyCode==39){
        console.log("right",typing)
        if (typing == true){
            curr_displayed=Math.min(++curr_displayed,stored_responses.length-1)
            show_popup(stored_responses[curr_displayed]);
        }
    }else if (e.keyCode==37){
        curr_displayed=Math.max(--curr_displayed, 0)
        show_popup(stored_responses[curr_displayed]);
    }else if (e.key=="\\"){
        show_loading_popup();
        chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: [getSelectionText()] }, (response) => {
            console.log("Response from background:", response);
            stored_responses=response.all_data;
            reply = response;
            curr_displayed=0;
            show_popup(stored_responses[0]);
        });
    }else if (e.keyCode==27){
        popupthingy.style.display="none";
    }
}*/

document.onkeydown = function(e) {
    if (typing) return; 

    if (e.keyCode == 39) { // Right arrow key
        console.log("right", typing);
        curr_displayed = Math.min(++curr_displayed, stored_responses.length - 1);
        show_popup(stored_responses[curr_displayed]);
    } else if (e.keyCode == 37) { // Left arrow key
        curr_displayed = Math.max(--curr_displayed, 0);
        show_popup(stored_responses[curr_displayed]);
    } else if (e.key == "\\") { // Backslash key
        show_loading_popup();
        chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: [getSelectionText()] }, (response) => {
            console.log("Response from background:", response);
            stored_responses = response.all_data;
            reply = response;
            curr_displayed = 0;
            show_popup(stored_responses[0]);
        });
    } else if (e.keyCode == 27) { // Escape key
        popupthingy.style.display = "none";
    }
};

popupthingy.onblur = function(){
    popupthingy.hidePopover()
    popupthingy.style.display = "none";
}




