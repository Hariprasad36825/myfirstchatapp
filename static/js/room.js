const roomName = JSON.parse(document.getElementById('json-roomname').textContent);
const userName = JSON.parse(document.getElementById('json-username').textContent);
const user = JSON.parse(document.getElementById('json-user').textContent);
console.log(user)
function connect(){
    const chatSocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/'
        + roomName
        + '/'
    );
    
    chatSocket.onmessage = function(e){
        console.log('onMessage');
        const data = JSON.parse(e.data);
    
        if (data.message) {
            if (data.username === userName){
            document.querySelector('.messages').innerHTML += (
            // '<div style="float: right; justify-content: space-between; margin-right: 1em; background: rgb(130, 212, 130, 0.5); border-radius:1em; padding: .3em .7em; max-width: 14em;"><b>'+ data.username +'</b>:'+ data.message +'</div><br><br>'
            `<li class="sent">
                <img src=`+data.image+` alt="Profile pic" />
                <p>`+data.message+`</p>
            </li>`
            );
            }
            else{
            document.querySelector('.messages').innerHTML += (
            `<li class="replies">
                <img src=`+data.image+` alt="Profile pic" />
                <p>`+data.message+`</p>
            </li>`
            );
            }
            var objDiv = document.getElementsByClassName("messages");
            objDiv.scrollTop = objDiv.scrollHeight;
        } else {
            alert('The message was empty!')
        }
        };
    
        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {
            document.querySelector('#chat-message-submit').click();
        }
        };
    
        document.querySelector('.send_btn').onclick = function(e) {
        const messageInputDom = document.querySelector('#chat-message-input');
        const message = messageInputDom.value;
    
        chatSocket.send(JSON.stringify({
            'message': message,
            'username': userName,
            'room': room_id,
            'user': user,
        }));
    
        messageInputDom.value = '';
    }
    chatSocket.onclose = function(e){
        console.error("closed")
        setTimeout(function() {
            connect();
          }, 1000);
    }
}
connect()

function scrollToBottom() {
    let objDiv = document.getElementById("chat-messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}

// Add this below the function to trigger the scroll on load.
scrollToBottom();