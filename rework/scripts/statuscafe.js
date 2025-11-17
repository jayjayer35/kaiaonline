document.writeln('<div id="statuscafe">   <div id="statuscafe-date">    </div>    <div id="statuscafe-username">    </div>    <div id="statuscafe-content">   </div>    </div>');
fetch("https://status.cafe/users/kaiasei/status.json")
  .then( r => r.json() )
  .then( r => {
    if (!r.content.length) {
      document.getElementById("statuscafe-content").innerHTML = "No status yet."
      return
    }
    document.getElementById("statuscafe-name").innerHTML = r.author
    document.getElementById("statuscafe-content").innerHTML = r.content
    document.getElementById("statuscafe-date").innerHTML = r.timeAgo
  })
