function getSelectionText() {
    let text = "";

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text;
}

document.onmouseup = document.onkeyup = document.onselectionchange = function() {
    console.log(getSelectionText());
    //console.log(document.body);
    const sectionLinks = document.getElementsByClassName('css-o4eziu-hoverStyles-hoverStyles-defaultStyle-hoverStyles-btnCss-editBtnCss')
    //const sectionLink = document.querySelector('a[aria-label="Sections for CompSci 220 – Programming Methodology"]');
    console.log(sectionLinks)
    // Select the main table element
    const table = document.querySelector("table");
    let professorsList = []

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
            const spanElement = targetTd.querySelector("div > div > div > span");

            // Check if span exists and has content
            const result = spanElement && spanElement.innerHTML.trim() ? spanElement.innerHTML : "";
            if (result !== "") {
                professorsList.push(result);
            }

            console.log(result); // Logs the innerHTML or "" if empty
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


    console.log("LIST OF PROFESSORS:", professorsList);

    chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: professorsList }, (response) => {
        console.log("Response from background:", response);
      });


};

document.addEventListener('DOMContentLoaded', (event) => {
    const sectionLink = document.querySelector('a[aria-label="Sections for CompSci 220 – Programming Methodology"]');
    console.log(sectionLink.href)

});