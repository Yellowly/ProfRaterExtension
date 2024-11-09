function getSelectionText() {
    let text = "";

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text;
}

const popupthingy = document.createElement("div")

popupthingy.setAttribute("popover","")
popupthingy.setAttribute("class","ratemyprofpopup")
document.body.appendChild(popupthingy);

const popuplink = document.createElement("a");
popuplink.setAttribute("href","https://www.ratemyprofessors.com/")
popuplink.setAttribute("target","_blank")
popupthingy.appendChild(popuplink);

const popupheader = document.createElement("h3");
popupheader.textContent="name"
popuplink.appendChild(popupheader);

const popupscore = document.createElement("h1");
popupscore.textContent="5.0"
popupthingy.appendChild(popupscore);

const popupcontent = document.createElement("p");
popupcontent.textContent="none"
popupthingy.appendChild(popupcontent);


function show_popup(response){
    popupthingy.style.left=`${10}px`;
    popupthingy.style.top=`${10}px`;
    popupscore.textContent = response.prof_rating;
    popupheader.textContent = response.prof_name;
    popupcontent.textContent = response.summary;
    popuplink.setAttribute("href",response.link)
    popupthingy.showPopover();
}




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
        targetTd.querySelectorAll("div > div > div > span").forEach((result) => {
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

let stored_responses = []
let curr_displayed = 0;

chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: professorsList }, (response) => {
    console.log("Response from background:", response);
    stored_responses=response.all_data;
    curr_displayed=0;
    show_popup(stored_responses[0]);
});

document.onkeydown = function(e) {
    if(e.keyCode==39){
        curr_displayed=Math.min(++curr_displayed,stored_responses.length-1)
        show_popup(stored_responses[curr_displayed]);
    }else if (e.keyCode==37){
        curr_displayed=Math.max(--curr_displayed, 0)
        show_popup(stored_responses[curr_displayed]);
    }
}

