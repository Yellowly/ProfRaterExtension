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


let reply;
let typing = false;
async function show_popup(response,iter=10){
  
  popupthingy.style.left=`${10}px`;
  popupthingy.style.top=`${10}px`;
  console.log(reply)
  /*if(iter ===0){
      iter = 1;
  }*/
  popupNum.textContent = `Option ${iter} of ${reply.all_data.length}`
  popupscore.textContent = `${response.prof_rating}/5`;
  popupnumelements.textContent = `Based on ${response.prof_num_ratings}`;
  popupheader.textContent = response.prof_name;
  popupcontent.textContent = response.summary;

  typing = true;
  await typeText(response.summary); // Start the typing effect
   
  typing = false;
  console.log("DONE TYPING!",typing)

  popuplink.setAttribute("href",response.link)
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
          await new Promise(resolve => setTimeout(resolve, 20));
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

let stored_responses = []
let curr_displayed = 0;

document.onkeydown = function(e) {
  if(e.keyCode==39){
      curr_displayed=Math.min(++curr_displayed,stored_responses.length-1)
      show_popup(stored_responses[curr_displayed], curr_displayed+1);
  }else if (e.keyCode==37){
      curr_displayed=Math.max(--curr_displayed, 0)
      show_popup(stored_responses[curr_displayed], curr_displayed+1);
  }else if (e.key=="\\"){
    //show_loading_popup();
      chrome.runtime.sendMessage({ type: "SEND_ARRAY", data: [getSelectionText()] }, (response) => {
          console.log("Response from background:", response);
          stored_responses=response.all_data;
          reply = response;
          if(response.hasOwnProperty("message")){
            console.log("about to alert")
            show_loading_popup("This professor does not have a RateMyProfessor page.")
          } else {
            curr_displayed=0;
            show_popup(stored_responses[0], curr_displayed+1);
          }
          
      });
  }else if (e.keyCode==27){
      popupthingy.style.display="none";
  }
}

document.onmousedown = function(){
  if (getSelectionText()==""){
      popupthingy.style.display="none";
  }
}

popupthingy.onblur = function(){
  popupthingy.hidePopover()
  popupthingy.style.display = "none";
}

