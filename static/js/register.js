import { getCookie } from "./getCookie.js";

document.getElementById('google-signin').onclick = function(e){
    window.location.replace('accounts/google/login')
}

async function postdata(data){
    document.getElementById('loader').classList.add('loader')
    const response = await fetch('/api/register', {
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
      if(result.message != undefined){
        document.getElementById('loader').classList.remove('loader')
        document.getElementById('loader').innerHTML = '<p class="text-danger fs-5">'+result.message+'</p>'
        document.getElementById('email').classList.add('is-invalid')
      }
      else{
          window.location.replace('/mailsent')
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

function ispasswordvalid(password, re_password){
    if(password === re_password){
        document.querySelector('#password').classList.remove('is-invalid')
        document.querySelector('#re_password').classList.remove('is-invalid')
        if (password.match(/[a-z]/g) && password.match(
            /[A-Z]/g) && password.match(
            /[0-9]/g) && password.match(
            /[^a-zA-Z\d]/g) && password.length >= 8 && password.length <= 15){

            document.querySelector('#password').classList.add('is-valid')
            document.querySelector('#re_password').classList.add('is-valid')
            return true
        }
        else{
            document.querySelector('#password').classList.add('is-invalid')
            document.querySelector('#re_password').classList.add('is-invalid')
            document.getElementById('re_password_message').innerHTML="Your password must includes atleast 8-15 characters and combination of upper- and lower-case characters(*)<br>one or more digits(*) and a special character"
            return false
        }
        
    }
    else{
        document.querySelector('#password').classList.add('is-invalid')
        document.querySelector('#re_password').classList.add('is-invalid')
        document.getElementById('re_password_message').innerHTML="password does not match"
        return false
    }

}

document.querySelector('#re_password').onkeyup = function(e){
    e.preventDefault()
    if(e.keyCode === 13){
        document.querySelector("#submit").click();
    }
}

document.getElementById('submit').onclick = function(e) {
    e.preventDefault()
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    var re_password = document.getElementById('re_password').value
    var name = document.getElementById('name').value
    var about = document.getElementById('about').value

    if(isemailvalid(email)){
        if (ispasswordvalid(password, re_password)){
            postdata({"username":email, "password": password, "first_name": name, "email":email, 'about':about})
        }
    }
}