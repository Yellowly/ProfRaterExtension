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

let stored_responses = []
let curr_displayed = 0;

document.onkeydown = function(e) {
    if(e.keyCode==39){
        curr_displayed=Math.min(++curr_displayed,stored_responses.length-1)
        show_popup(stored_responses[curr_displayed]);
    }else if (e.keyCode==37){
        curr_displayed=Math.max(--curr_displayed, 0)
        show_popup(stored_responses[curr_displayed]);
    }else if (e.keyCode=="\\"){
        chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: [getSelectionText()] }, (response) => {
            console.log("Response from background:", response);
            stored_responses=response.all_data;
            curr_displayed=0;
            show_popup(stored_responses[0]);
        });
    }
}

