import { getCookie } from "./getCookie.js";

document.getElementById('google-signin').onclick = function(e){
    window.location.replace('accounts/google/login')
}

async function postdata(data){
    document.getElementById('loader').classList.add('loader')
    const response = await fetch('/api/changepassword', {
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
        document.getElementById('loader').classList.remove('loader')
        document.getElementById('loader').innerHTML = '<p class="text-success fs-5">'+result.redirect+'</p>'
        setTimeout(function(){
            window.location.replace('/login')
        }, 3000);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
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
    var password = document.getElementById('password').value
    var re_password = document.getElementById('re_password').value
    var url = window.location.pathname;
    var pk = url.substring(url.indexOf('/',10) + 1, url.lastIndexOf('/'));
    // console.log(pk)
    if (ispasswordvalid(password, re_password)){
        postdata({"pk": pk, "password": password})
    }
}