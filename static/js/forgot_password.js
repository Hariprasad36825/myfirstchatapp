import { getCookie } from "./getCookie.js";

document.getElementById('google-signin').onclick = function(e){
    window.location.replace('accounts/google/login')
}

async function postdata(data){
    document.getElementById('loader').classList.add('loader')
    const response = await fetch('/api/send_link', {
        method: "POST",
        mode: 'cors', 
        credentials: 'same-origin', 
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        // console.log(result)
      if(result.message != undefined){
        document.getElementById('loader').classList.remove('loader')
        document.getElementById('loader').innerHTML = '<p class="text-danger fs-5">'+result.message+'</p>'
        document.getElementById('email').classList.add('is-invalid')
      }
      else{
        document.getElementById('loader').classList.remove('loader')
        document.getElementById('loader').innerHTML = '<p class="text-success fs-5">'+result.success+'</p>'
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function isemailvalid(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const bool = re.test(String(email).toLowerCase());
    if(bool){
        document.querySelector('#email').classList.remove('is-invalid')
        document.querySelector('#email').classList.add('is-valid')
        return true
    }
    else{
        document.querySelector('#email').classList.add('is-invalid')
        document.getElementById('email_message').innerHTML="Invalid Email"
        return false
    }
}
document.querySelector('#email').onkeyup = function(e){
    e.preventDefault()
    if(e.keyCode === 13){
        document.querySelector("#submit").click();
    }
}

document.getElementById('submit').onclick = function(e) {
    e.preventDefault()
    var email = document.getElementById('email').value

    if(isemailvalid(email)){
        postdata({"email":email})
    }
}