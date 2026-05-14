// onionring.js is made up of four files - onionring-widget.js (this one!), onionring-index.js, onionring-variables.js and onionring.css
// it's licensed under the cooperative non-violent license (CNPL) v4+ (https://thufie.lain.haus/NPL.html)
// it was originally made by joey + mord of allium (è’œ) house, last updated 2020-11-24

// === ONIONRING-WIDGET ===
//this file contains the code which builds the widget shown on each page in the ring. ctrl+f 'EDIT THIS' if you're looking to change the actual html of the widget

var tag = document.getElementById(ringID); //find the widget on the page

thisSite = window.location.href; //get the url of the site we're currently on
thisIndex = null;

// go through the site list to see if this site is on it and find its position
for (i = 0; i < sites.length; i++) {
  if (thisSite.startsWith(sites[i])) {
    //we use startswith so this will match any subdirectory, users can put the widget on multiple pages
    thisIndex = i;
    break; //when we've found the site, we don't need to search any more, so stop the loop
  }
}

function randomSite() {
  otherSites = sites.slice(); //create a copy of the sites list
  otherSites.splice(thisIndex, 1); //remove the current site so we don't just land on it again
  randomIndex = Math.floor(Math.random() * otherSites.length);
  location.href = otherSites[randomIndex];
}

//if we didn't find the site in the list, the widget displays a warning instead
if (thisIndex == null) {
  tag.insertAdjacentHTML(
    "afterbegin",
    `
<table>
  <tr>
    <td>${ringName} webring's webmaster is a lazy ass and hasn't added me yet! >:( </td>
  </tr>
</table>
  `
  );
} else {
  //find the 'next' and 'previous' sites in the ring. this code looks complex
  //because it's using a shorthand version of an if-else statement to make sure
  //the first and last sites in the ring join together correctly
  previousIndex = thisIndex - 1 < 0 ? sites.length - 1 : thisIndex - 1;
  nextIndex = thisIndex + 1 >= sites.length ? 0 : thisIndex + 1;

  indexText = "";
  //if you've chosen to include an index, this builds the link to that
  if (useIndex) {
    indexText = `<a href='${indexPage}' target="_parent" >index</a> | `;
  }

  randomText = "";
  //if you've chosen to include a random button, this builds the link that does that
  if (useRandom) {
    randomText = `<a href='javascript:void(0)' target="_parent" onclick='randomSite()'>?!?</a> | `;
  }

  //this is the code that displays the widget - EDIT THIS if you want to change the structure
  tag.insertAdjacentHTML(
    "afterbegin",
    `
  <div class="kwtfaw-div">
  
    <a href="${indexPage}" class="kwtfaw-top target="_parent" ">
    
      <img class="kwtfaw-img" src="https://fabstarotcorner.neocities.org/webring/assets/button/webringbutton.png">
      
      <img class="kwtfaw-img" src="https://fabstarotcorner.neocities.org/webring/assets/button/bubble.svg" alt="kris where tf are we"/>
      
    </a>
    <div class="kwtfaw-controls">
    <a class="kwtfaw-button" href="${sites[previousIndex]}" target="_parent" > 
      <img class="kwtfaw-control" src="https://fabstarotcorner.neocities.org/webring/assets/button/prev.svg" alt="prev"/> 
    </a>
    <a class="kwtfaw-button" href='javascript:void(0)' target="_parent" onclick='randomSite()' >
      <img class="kwtfaw-control" src="https://fabstarotcorner.neocities.org/webring/assets/button/what.svg" alt="prev"/> </a>
    <a class="kwtfaw-button" href="${sites[nextIndex]}" target="_parent" > 
      <img class="kwtfaw-control" src="https://fabstarotcorner.neocities.org/webring/assets/button/next.svg" alt="prev"/>  </a>
    </div>

  </div>

  <style>
 /*@font-face { font-family: deltarune; src: url('https://fabstarotcorner.neocities.org/webring/deltarune.ttf'); } 
 @font-face { font-family: determination; src: url('https://fabstarotcorner.neocities.org/webring/DTM-Mono.otf'); } 
 @font-face { font-family: mercy; src: url('https://fabstarotcorner.neocities.org/webring/MERCY.otf'); } */
    


    .kwtfaw-img{
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        margin:0px;
        width:100%;
    }
 
    
    
    .kwtfaw-top{
    display:flex;
    flex-direction:column;
    gap:0px;
    }


    .kwtfaw-div{
      font-family:determination;
      display:flex;
      flex-direction:column;
      justify-content:center;
      justify-items:center;
      align-items:center;
      gap:0px;
      max-width:150px;
      
    }
    
    #gfdkris{
    display:flex;
    justify-content:center;
    }

    kwtfaw-top{
      > *{
      gap:0px;
      margin:0px;
      padding:0px;}
    }

    .kwtfaw-controls{
      display:flex;
      flex-direction:row;
      justify-content:space-around;
      gap:5px;
      margin-top:2px;
      max-width:200px;
    }
    .kwtfaw-text{
      font-size:8px;
      letter-spacing:-1px;
      border: 1px solid white;
      background-color:black;
      padding:1px 3px 1px 3px;
      color:white;
    }

    .kwtfaw-button{
      font-size:9px;
      font-family:determination;
      color: #fb7f26 !important;
      border:solid 1px black;
      background-color:black;
      width:30%;
    }
       
    .kwtfaw-control{
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        width:100%;
    }

    .kwtfaw-button:visited{
     color: #fb7f26 !important;

    }

    .kwtfaw-button:hover{
      border:solid 1px #fb7f26;
    }
  </style>
  `
  );
}