document.querySelector('#room-name-input').focus();

document.querySelector('#room-name-input').onkeyup = function(e){
    if(e.keyCode === 13){
        document.querySelector("room-name-submit").click();
    }
}

document.querySelector("room-name-submit").onclick = function(e){
    var roomname = document.querySelector("room-name-input").value;
    var username = document.querySelector("username-input").value;
    console.log("done")
    window.location.replace(roomname+'/?username'+username);
}
