import { getCookie } from "./getCookie.js";
// import {Tooltip} from boots;
// tootip code
var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
$('[data-bs-toggle="tooltip"]').on("click", function () {
  $(this).blur();
});
// var myModal = new bootstrap.Modal(document.getElementById('exampleModal'))

const user = JSON.parse(document.getElementById("json-user").textContent);
const profile_pic = JSON.parse(
  document.getElementById("json-profile_pic").textContent
);
const name = JSON.parse(document.getElementById("json-name").textContent);
const about = JSON.parse(document.getElementById("json-about").textContent);
// window.localStorage.clear()
var selectedIcon =
  window.localStorage.getItem("selectedIcon") === null
    ? "Chats"
    : window.localStorage.getItem("selectedIcon");
var chatSocket;
var tmp = 0;

//get chats after refresh
// window.localStorage.clear()  
var room_id = window.localStorage.getItem("room_id");
if (room_id !== null) {
  document.getElementById(room_id).classList.add("active");
  get_chats(
    room_id,
    window.localStorage.getItem("image"),
    window.localStorage.getItem("name"),
    50
  );
}

// focus on notification click

function OnFocus() {
  caches.keys().then(function (keyList) {
    if (keyList.length > 0) {
      document.getElementById(String(keyList[0])).click();
      caches.delete(keyList[0]);
    }
  });
}

window.onfocus = OnFocus;

var objDiv = document.getElementsByClassName("messages")[0];
objDiv.addEventListener("scroll", function () {
  // console.log(objDiv.scrollTop);
  if (
    objDiv.scrollTop == 0 &&
    !document.getElementById("End of the chat History")
  ) {
    console.log("in");
    get_chats(
      localStorage.getItem("room_id"),
      localStorage.getItem("image"),
      localStorage.getItem("name"),
      parseInt(localStorage.getItem("upto")) + 50
    );
  }
});

//get room and its chats
async function get_chats(id, profile, name, upto=50) {
  window.localStorage.setItem("room_id", id);
  window.localStorage.setItem("image", profile);
  window.localStorage.setItem("name", name);
  window.localStorage.setItem("upto", upto);
  connect(localStorage.getItem("room_id"));
  // console.log(window.innerWidth)
  if (window.innerWidth < 770) {
    // console.log(window.innerWidth)
    document.getElementById("sidepanel").style.display = "none";
    var message = document.getElementsByClassName("content")[0];
    message.style.display = "flex";
    message.style.width = "100%";
  } else {
    document.getElementsByClassName("info_pick")[0].style.display = "none";
    document.getElementsByClassName("content")[0].style.display = "flex";
  }
  document.getElementById("chat_profile_pic").src = profile;
  document.getElementById("chat_profile_name").innerText = name;

  await fetch("/api/getmessages", {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ room_id: id, upto: upto }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);

      if (result.messages) {
        var div = document.getElementsByClassName("messages")[0];
        if (upto == 50) {
          var div = document.getElementsByClassName("messages")[0];
          div.innerHTML = `<ul id="messages_ul">
                    </ul>`;
        }
        for (const [key, chats] of Object.entries(result.messages)) {
          var B_co =
            key != "Unread messages" ? "#435f7a" : "rgba(255, 255, 255, 0.4)";
          B_co =
            key != "End of the chat History" ? B_co : "rgba(250, 12, 151, 0.9)";
          var co = key != "Unread messages" ? "white" : "#435f7a";
          // var today_id = key == 'Today' ? 'today' : ''
          try {
            document.getElementById(key).remove();
          } catch {}

          chats.map(function (i) {
            var type = i.user_id == user ? `sent` : `replies`;
            var float = i.user_id == user ? `right` : `left`;
            var color = i.user_id != user ? `black` : `azure`;
            var image = i.user_id != user ? profile : "/media/" + profile_pic;
            console.log(key == "Unread messages" && i.user_id != user);
            if (key == "Unread messages" && i.user_id != user) {
              chatSocket.send(
                JSON.stringify({
                  type: "markread",
                  room_id: localStorage.getItem("room_id"),
                  user: user,
                })
              );
            }

            $("#messages_ul").prepend(
              `<li class = ` +
                type +
                `>
                        <img src=` +
                image +
                ` alt="" class="chat_` +
                i.user_id +
                `"/>
                        <p>` +
                i.content +
                `
                            <br>
                            <small style="float: ` +
                float +
                `; color:` +
                color +
                `; font-size: .7em;">` +
                i.time +
                i.symbol +
                `</small>
                        </p>
                        
                    </li>`
            );
          });
          $("#messages_ul").prepend(
            `<div class="message-divider" id ="` +
              key +
              `"><small id = "date" style = "background-color:` +
              B_co +
              `; color:` +
              co +
              `;">` +
              key +
              `</small></div>`
          );
        }
        if (upto == 50) {
          var objDiv = document.getElementsByClassName("messages")[0];
          tmp = objDiv.scrollHeight;
          console.log(tmp);
          objDiv.scrollTop = objDiv.scrollHeight;
        } else {
          console.log(tmp);
          var objDiv = document.getElementsByClassName("messages")[0];
          objDiv.scrollTop = objDiv.scrollHeight - tmp;
        }
      } else {
        console.log(result.message);
        
        // document.getElementsByClassName('info_pick')[0].style.display = 'flex';
        // document.getElementsByClassName('content')[0].style.display = 'none';
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // remove bouble
  const bouble = document
    .getElementById(id)
    .getElementsByClassName("badge1")[0];
  bouble.style.visibility = "hidden";
  bouble.innerText = 0;

  document.getElementById("back_button").addEventListener("click", function () {
    document.getElementById("sidepanel").style.display = "block";
    window.localStorage.removeItem("room_id");
    if (window.innerWidth < 780) {
      document.getElementById("sidepanel").style.width = "100%";
      document.getElementsByClassName("content")[0].style.display = "none";
    } else {
      document.getElementsByClassName("info_pick")[0].style.display = "flex";
      document.getElementsByClassName("content")[0].style.display = "none";
    }
  });
}

if (window.localStorage.getItem("room_id") !== null) {
  window.addEventListener("hashchange", function (e) {
    console.log(window.localStorage.getItem("room_id"));
    this.window.localStorage.removeItem("room_id");
    document.getElementById("sidepanel").style.display = "block";
    if (window.innerWidth < 780) {
      document.getElementById("sidepanel").style.width = "100%";
      document.getElementsByClassName("content")[0].style.display = "none";
    }
    // var message = document.getElementsByClassName('content')[0]
    // message.style.display = 'none'
    history.forward();
  });
}

// post data

async function postdata(data, url) {
  // document.getElementById('loader').classList.add('loader')
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message) {
        alert(result.message);
      } else {
        console.error(result);
      }

      return result;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  return await response;
}

async function createroom(data, url) {
  // document.getElementById('loader').classList.add('loader')
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      if (result.room != undefined) {
        get_chats(result.room);
      } else {
        alert(result.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
//web sockets
var i = 0;
function connect(id) {
  chatSocket = new WebSocket(
    "ws://" + window.location.host + "/ws/" + id + "/"
  );

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data);

    if (data.type == "typing") {
      // document.get/
      if (data.user == user) {
        if (
          !document.getElementById("typing") &&
          data["room_id"] == window.localStorage.getItem("room_id")
        ) {
          $("#messages_ul").append(
            `<li class = replies id='typing'>
                            <img src=` +
              localStorage.getItem("image") +
              ` alt="" />
                            <div style="display: flex; flex-direction: row;"><p class="typing for_message_ul">` +
              localStorage.getItem("name") +
              ` is typing</p><div class="dot-pulse" style='display: block'></div></div>
                        </li>`
          );
        }
        const div = document.getElementById(data["room_id"]);
        div.getElementsByClassName("typing")[0].style.display = "inline-block";
        div.getElementsByClassName("dot-pulse")[0].style.display = "block";
        div.getElementsByClassName("preview")[0].style.display = "none";

        var objDiv = document.getElementsByClassName("messages")[0];
        objDiv.scrollTop = objDiv.scrollHeight;
      }
      setTimeout(function () {
        const div = document.getElementById(data["room_id"]);
        div.getElementsByClassName("typing")[0].style.display = "none";
        div.getElementsByClassName("dot-pulse")[0].style.display = "none";
        div.getElementsByClassName("preview")[0].style.display = "block";
        try {
          document.getElementById("typing").remove();
        } catch {}
      }, 2000);
    } else if (data.type == "remove_typing" || data.message != "undefined") {
      // document.get/
      const div = document.getElementById(data["room_id"]);
      div.getElementsByClassName("typing")[0].style.display = "none";
      div.getElementsByClassName("dot-pulse")[0].style.display = "none";
      div.getElementsByClassName("preview")[0].style.display = "block";
      // console.log(document.getElementById('typing'))
      try {
        document.getElementById("typing").remove();
      } catch {}
    }

    if (
      data.message &&
      data.room_id == window.localStorage.getItem("room_id")
    ) {
      // console.log(data)
      var type = data.user == user ? `sent` : `replies`;
      var float = data.user == user ? `right` : `left`;
      var color = data.user != user ? `black` : `azure`;
      var image =
        data.user != user
          ? window.localStorage.getItem("image")
          : "/media/" + profile_pic;
      // console.log(profile)
      var add1 =
        data.user == user
          ? `&nbsp;<span class="material-icons-outlined" id="check_circle">
                                                check_circle
                                            </span>`
          : "";
      try {
        document.getElementById("check_circle").remove();
      } catch {}
      // console.log(document.getElementById('today'));
      if (document.getElementById("today") == null) {
        $("#messages_ul").append(
          `<div class="message-divider" id="today"><small id = "date">Today</small></div>`
        );
      }
      $("#messages_ul").append(
        `<li class = ` +
          type +
          `>
                    <img src=` +
          image +
          ` alt="" class="chat_` +
          data.user +
          `"/>
                    <p>` +
          data.message +
          `
                        <br>
                        <small style="float: ` +
          float +
          `; color:` +
          color +
          `; font-size: .7em;">` +
          data.time +
          add1 +
          `</small>
                    </p>
                </li>`
      );
      var objDiv = document.getElementsByClassName("messages")[0];
      objDiv.scrollTop = objDiv.scrollHeight;
      if (data.user != user) {
        chatSocket.send(
          JSON.stringify({
            type: "markread",
            room_id: localStorage.getItem("room_id"),
            user: user,
          })
        );
      }
    }
    if (data.type == "markread" && data.user != user) {
      try {
        document.getElementById("visibility").remove();
      } catch {}
      document.getElementById("check_circle").innerText = "visibility";
    }
  };

  // document.querySelector('#chat-message-input').focus();
  const input = document.querySelector("#chat-message-input");
  input.onkeyup = function (e) {
    if (e.keyCode == 13 && !e.shiftKey) {
      // document.querySelector('#chat-message-input').ch
      document.querySelector(".send_btn").click();
    } else {
      chatSocket.send(
        JSON.stringify({
          type: "typing",
          room_id: localStorage.getItem("room_id"),
          user: document
            .getElementById(localStorage.getItem("room_id"))
            .getElementsByTagName("img")[0].id,
        })
      );
    }
  };

  input.addEventListener("change", function () {
    chatSocket.send(
      JSON.stringify({
        type: "remove_typing",
        room_id: localStorage.getItem("room_id"),
        user: document
          .getElementById(localStorage.getItem("room_id"))
          .getElementsByTagName("img")[0].id,
      })
    );
  });

  document.querySelector(".send_btn").onclick = function (e) {
    const messageInputDom = document.querySelector("#chat-message-input");
    const message = messageInputDom.value;
    // console.log('sent')
    chatSocket.send(
      JSON.stringify({
        message: message,
        room_id: localStorage.getItem("room_id"),
        user: user,
      })
    );

    messageInputDom.value = "";
  };
  chatSocket.onclose = function (e) {
    // console.error("closed")

    if (i < 2) {
      setTimeout(function () {
        connect(id);
        i++;
      }, 1000);
    }
  };
}

function changediv(id) {
  // console.log(selectedIcon)
  document
    .querySelectorAll("#contacts")
    .forEach((i) => (i.style.display = "none"));
  selectedIcon = id;
  window.localStorage.setItem("selectedIcon", id);
  document.getElementsByClassName(id)[0].style.display = "block";
  document.getElementById("title").innerText = id;
  if (window.innerWidth < 770) {
    if (selectedIcon != "Chats") {
      window.localStorage.removeItem("room_id");
      document.getElementById("sidepanel").style.display = "block";
      document.getElementById("sidepanel").style.width = "100%";
      var message = document.getElementsByClassName("content")[0];
      message.style.display = "none";
    }
  }
  // else{
  //     window.localStorage.removeItem('room_id')
  // }
}
// active element for navbar

const linkColor = document.querySelectorAll(".nav_link");

function colorLink() {
  if (linkColor) {
    linkColor.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
    changediv(this.id);
  }
}
linkColor.forEach((l) => l.addEventListener("click", colorLink));
document.getElementById(selectedIcon).click();

//scroll bottom

function scrollToBottom() {
  var objDiv = document.getElementsByClassName("messages")[0];
  objDiv.scrollTop = objDiv.scrollHeight;
}

// Add this below the function to trigger the scroll on load.
scrollToBottom();

function isemailvalid(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const bool = re.test(String(email).toLowerCase());
  document.getElementById("Search_message").innerHTML = "";
  if (bool) {
    document.querySelector("#search_input").classList.remove("is-invalid");
    document.querySelector("#search_input").classList.add("is-valid");
    return true;
  } else {
    document.querySelector("#search_input").classList.add("is-invalid");
    document.getElementById("Search_message").innerHTML =
      "Please Enter valid Email";
    return false;
  }
}

//search bar function
document.getElementById("start_chat_button").disabled = true;
document.getElementById("search_input").addEventListener("input", function () {
  document.getElementById("Search_message").classList.remove("valid-feedback");
  document.getElementById("Search_message").classList.add("invalid-feedback");

  if (selectedIcon === "Discover") {
    if (document.getElementById("search_input").value != "") {
      const response = fetch("/api/getpeople", {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          input: document.getElementById("search_input").value,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          var people = result;
          if (people[0].message == undefined) {
            document.getElementById("Search_message").innerHTML = "";
            document
              .querySelector("#search_input")
              .classList.remove("is-invalid");
            document.querySelector("#search_input").classList.add("is-valid");

            document.getElementsByClassName(
              "Discover"
            )[0].innerHTML = `<ul id="people_list">
                         </ul>`;
            people.map(function (i) {
              var about = i.about != null ? i.about : "";
              $("#people_list").append(
                `<li class="contact" id=` +
                  i.id +
                  `>
                                <div class="wrap">
                                    <span class="contact-status ` +
                  i.status +
                  `"></span>
                                    <img src="./media/` +
                  i.image +
                  `" alt="profile pic" />
                                    <div class="meta">
                                        <p class="name">` +
                  i.username +
                  `</p>
                                        <p class="preview">` +
                  about +
                  `</p>
                                    </div>
                                </div>
                            </li>`
              );
            });
            $(document).on("click", "li.contact", function () {
              var li = document
                .getElementById("people_list")
                .querySelectorAll(".contact");
              console.log(li);
              for (var i = 0; i < li.length; i++) {
                li[i].classList.remove("active");
              }
              $(this).addClass("active");
              var btn = document.getElementById("start_chat_button");
              btn.disabled = false;
            });
          } else {
            document.getElementsByClassName("Discover")[0].innerHTML = `<ul>
                        </ul>`;
          }

          if (people[0].message == "0") {
            document.getElementsByClassName("Discover")[0].innerHTML += `
                        <div class="d-grid d-md-block" id="invite_button_container">
                            <button class="btn btn-secondary btn-lg btn-block" id="invite_button" style="width: 100%;">
                                Invite
                                <span class="material-icons-outlined" style="float: right; font-size: larger;">
                                    chevron_right
                                </span>
                            </button>
                        </div>
                        `;

            var btn = document.getElementById("invite_button");
            btn.addEventListener("click", function () {
              if (isemailvalid(document.getElementById("search_input").value)) {
                postdata(
                  { email: document.getElementById("search_input").value },
                  "/api/sendInviteLink"
                );
                document
                  .getElementById("Search_message")
                  .classList.remove("invalid-feedback");
                document
                  .getElementById("Search_message")
                  .classList.add("valid-feedback");
                document.getElementById("Search_message").innerHTML =
                  "Invitation has been sent successfully";
              }
            });
          } else {
            document.getElementsByClassName("Discover")[0].innerHTML += `
                    <div class="d-grid d-md-block" id="invite_button_container">
                        <button class="btn btn-secondary btn-lg btn-block" id="start_chat_button" style="width: 100% !important;">
                            Start Chat
                            <span class="material-icons-outlined" style="float: right; font-size: larger;">
                                chevron_right
                            </span>
                        </button>
                    </div>
                    `;

            var btn = document.getElementById("start_chat_button");
            btn.disabled = false;
            // console.log(btn)

            btn.addEventListener("click", function () {
              var id = document
                .getElementById("people_list")
                .getElementsByClassName("active")[0].id;
              console.log(id);
              createroom({ user_id: id }, "/api/createroom");
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  if (selectedIcon === "Friends") {
    var input, filter, ul, li, a, i, txtValue, b, txtValue1;
    input = document.getElementById("search_input");
    filter = input.value.toUpperCase();
    ul = document.getElementById("Friends_ul");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByClassName("name")[0];
      b = li[i].getElementsByClassName("preview")[0];
      txtValue = a.textContent || a.innerText;
      txtValue1 = b.textContent || b.innerText;
      if (
        txtValue.toUpperCase().indexOf(filter) > -1 ||
        txtValue1.toUpperCase().indexOf(filter) > -1
      ) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
  if (selectedIcon === "Chats") {
    console.log("hi");
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("search_input");
    filter = input.value.toUpperCase();
    ul = document.getElementById("Chats_ul");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByClassName("name")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
});

var chats_ul = document.getElementById("Chats_ul").querySelectorAll(".contact");
chats_ul.forEach((i) =>
  i.addEventListener(
    "click",
    function () {
      // console.log('in');
      get_chats(
        i.id,
        i.getElementsByTagName("img")[0].src,
        i.getElementsByClassName("name")[0].innerText,
        50
      );
      for (var j = 0; j < chats_ul.length; j++) {
        chats_ul[j].classList.remove("active");
      }
      i.classList.add("active");
    },
    false
  )
);

var Friends_ul = document
  .getElementById("Friends_ul")
  .querySelectorAll(".contact");
// console.log(Friends_ul)
Friends_ul.forEach((i) =>
  i.addEventListener(
    "click",
    function () {
      get_chats(
        i.id,
        i.getElementsByTagName("img")[0].src,
        i.getElementsByClassName("name")[0].innerText,
        50
      );
      for (var j = 0; j < Friends_ul.length; j++) {
        Friends_ul[j].classList.remove("active");
      }
      i.classList.add("active");
    },
    false
  )
);

// settings

//change info

var name_in = document.getElementById("profile-name");
var about_in = document.getElementById("profile-bio");

function enablesave() {
  console.log("in");
  if (name_in.value != name || about_in.value != about) {
    document.getElementById("update_info").disabled = false;
  } else {
    document.getElementById("update_info").disabled = true;
  }
}

name_in.addEventListener("input", enablesave);
about_in.addEventListener("input", enablesave);

document.getElementById("update_info").addEventListener("click", function () {
  postdata({ name: name_in.value, about: about_in.value }, "/api/saveinfo");
});

// change password

function ispasswordvalid(cur_pass, password, re_password) {
  if (cur_pass.value.length < 6) {
    alert("please enter correct password for current password");
    return;
  }
  if (password.value === re_password.value) {
    cur_pass.classList.remove("is-invalid");
    cur_pass.classList.add("is-valid");
    password.classList.remove("is-invalid");
    re_password.classList.remove("is-invalid");
    if (
      password.value.match(/[a-z]/g) &&
      password.value.match(/[A-Z]/g) &&
      password.value.match(/[0-9]/g) &&
      password.value.match(/[^a-zA-Z\d]/g) &&
      password.value.length >= 8 &&
      password.value.length <= 15
    ) {
      password.classList.add("is-valid");
      re_password.classList.add("is-valid");
      if (cur_pass.value == password.value) {
        cur_pass.classList.add("is-invalid");
        password.classList.add("is-invalid");
        re_password.classList.add("is-invalid");
        document.getElementById("re_password_message").innerText =
          "current password shoud not be same as the old password";
        return false;
      }
      return true;
    } else {
      password.classList.add("is-invalid");
      re_password.classList.add("is-invalid");
      document.getElementById("re_password_message").innerHTML =
        "Your password must includes atleast 8-15 characters and combination of upper- and lower-case characters(*)<br>one or more digits(*) and a special character";
      return false;
    }
  } else {
    password.classList.add("is-invalid");
    re_password.classList.add("is-invalid");
    document.getElementById("re_password_message").innerHTML =
      "password does not match";
    return false;
  }
}

var cur_pass = document.getElementById("current-password");
var pass = document.getElementById("password");
var re_pass = document.getElementById("re_password");

function chkpass() {
  if (
    cur_pass.value.length > 6 &&
    pass.value.length > 6 &&
    re_pass.value.length > 6
  ) {
    if (ispasswordvalid(cur_pass, pass, re_pass)) {
      document.getElementById("save_pass").disabled = false;
    } else {
      document.getElementById("save_pass").disabled = true;
    }
  }
}

cur_pass.addEventListener("change", chkpass);
pass.addEventListener("change", chkpass);
re_pass.addEventListener("change", chkpass);

document.getElementById("save_pass").addEventListener("click", function () {
  postdata({ password: cur_pass.value, newpass: pass.value }, "/api/savepass");
});

// Notifications

let granted = false;

if (Notification.permission === "granted") {
  granted = true;
} else if (Notification.permission !== "denied") {
  let permission = await Notification.requestPermission();
  granted = permission === "granted" ? true : false;
}

const firebaseConfig = {
  apiKey: "AIzaSyAYoRSuZXO6FvcK_CuTKuC9qM9m0Y0y9Hc",
  authDomain: "buoyant-arena-322216.firebaseapp.com",
  projectId: "buoyant-arena-322216",
  storageBucket: "buoyant-arena-322216.appspot.com",
  messagingSenderId: "480437393258",
  appId: "1:480437393258:web:e10df2d2a36b3c6c5c3713",
  measurementId: "G-SHK9HJNP5J",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging
  .getToken({
    vapidKey:
      "BBbkontzkKjxBvlIS2IHhqndJqEwsJZ7AJ7OC7FxU5yOJ5ytMREOyk1OietaANrki6nI8z7tex6o-pdoT_gTfd4",
  })
  .then((currentToken) => {
    // console.log(currentToken)
    if (currentToken) {
      sendTokenToServer(currentToken);
    } else {
      // Show permission request UI
      console.log(
        "No registration token available. Request permission to generate one."
      );
      setTokenSentToServer(false);
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
    setTokenSentToServer(false);
  });

async function sendTokenToServer(token) {
  // console.log(isTokensendTokenToServer())
  if (!isTokensendTokenToServer()) {
    await fetch("/register-notif-token/", {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({
        registration_id: token,
        type: "web",
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        setTokenSentToServer(true);
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
        setTokenSentToServer(false);
      });
  }
}

function isTokensendTokenToServer() {
  return window.sessionStorage.getItem("sendTokenToServer") === "1";
}
function setTokenSentToServer(sent) {
  window.sessionStorage.setItem("sendTokenToServer", sent ? "1" : "0");
}

function sendnotification(payload) {
  // const notificationTitle = payload.data.title;

  // const notificationOptions = {
  //     body: payload.data.body,
  //     icon: payload.data.image,
  //     badge: 'https://www.google.com/search?q=stackoverflow+icon&tbm=isch&source=iu&ictx=1&fir=wJwj4cAbEmkwDM%252CsXB9L4LZX6wQKM%252C_&vet=1&usg=AI4_-kRTKQC9_SJv7meC0YJMAoppJDGGlA&sa=X&ved=2ahUKEwiKld-v0OryAhX0IbcAHVuLAFkQ9QF6BAgeEAE#imgrc=wJwj4cAbEmkwDM',
  //     data: { url:'http://localhost:8000/#', room_id: payload.data.room }, //the url which we gonna use later
  // };
  // return self.registration.showNotification(notificationTitle,notificationOptions);
  console.log("in");
  const notification = new Notification(payload.data.title, {
    body: payload.data.body,
    icon: payload.data.image,
  });

  // close the notification after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10 * 1000);

  notification.addEventListener("click", () => {
    get_chats(payload.data.room, payload.data.image, payload.data.title, 50);
  });
}

messaging.onMessage((payload) => {
  // console.log('Message received. ', payload);
  const data = payload.data;
  console.log(data);
  if (
    data.room != localStorage.getItem("room_id") ||
    localStorage.getItem("room_id") == null
  ) {
    const bouble = document
      .getElementById(data.room)
      .getElementsByClassName("badge1")[0];
    bouble.style.visibility = "visible";
    bouble.innerText = parseInt(bouble.innerText) + 1;
    connect(data.room);
    sendnotification(payload);
  }
});

//edit profile photo

var cropper, cropx, cropy, crop_height, crop_width, image_need_to_send;
const image_input = document.getElementById("upload-profile-photo");
document
  .getElementById("edit_profile_pic")
  .addEventListener("click", function () {
    image_input.click();
  });

image_input.addEventListener("change", function (input) {
  input = input.target;
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.addEventListener(
      "load",
      function () {
        const img = reader.result;
        const imgfeild = document.getElementById("new_profile_preview");
        document.getElementById("edit_profile_pic").classList.remove("d-block");
        document.getElementById("edit_profile_pic").classList.add("d-none");
        document.getElementById("new_profile_pic").classList.add("d-block");
        document.getElementById("new_profile_pic").classList.remove("d-none");
        imgfeild.src = img;

        //cropper js

        cropper = new Cropper(imgfeild, {
          aspectRatio: 1 / 1,
          minCropBoxHeight: 100,
          minCropBoxWidth: 100,
          crop(event) {
            console.log(event.detail.x);
            console.log(event.detail.y);
            console.log(event.detail.width);
            console.log(event.detail.height);
            console.log(event.detail.rotate);
            console.log(event.detail.scaleX);
            console.log(event.detail.scaleY);

            cropx = event.detail.x;
            cropy = event.detail.y;
            crop_height = event.detail.height;
            crop_width = event.detail.width;
            image_need_to_send = img;
          },
        });
      },
      false
    );

    reader.readAsDataURL(input.files[0]);
  }
  image_input.value = "";
});

document
  .getElementById("cancel_preview")
  .addEventListener("click", function () {
    $("#exampleModal").modal("hide");
    cropper.destroy();
    document.getElementById("edit_profile_pic").classList.add("d-block");
    document.getElementById("edit_profile_pic").classList.remove("d-none");
    document.getElementById("new_profile_pic").classList.remove("d-block");
    document.getElementById("new_profile_pic").classList.add("d-none");
  });

document.getElementById("undo").addEventListener("click", function () {
  cropper.reset();
});

function isvalid_pic(image) {
  const base64str = image.substr(image.indexOf("base64,") + 7);
  const decoded = atob(base64str);
  if (decoded.length <= 4 * 1024 * 1024) return base64str;
  return 0;
}

document
  .getElementById("save_pic")
  .addEventListener("click", async function () {
    const base64str = isvalid_pic(image_need_to_send);

    if (base64str) {
      console.log(base64str);
      const data = {
        image: base64str,
        cropx: cropx,
        cropy: cropy,
        height: crop_height,
        width: crop_width,
      };
      Spinner(1);
      await fetch("/api/savecropedimage", {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result.url);

          if (!result.message) {
            Spinner(0);
            document
              .getElementById("edit_profile_pic")
              .classList.add("d-block");
            document
              .getElementById("edit_profile_pic")
              .classList.remove("d-none");
            document
              .getElementById("new_profile_pic")
              .classList.remove("d-block");
            document.getElementById("new_profile_pic").classList.add("d-none");

            document.getElementById("Profile_edit_preview").src =
              String(result.url) + "?t=" + new Date().getTime();
            document.getElementById("Setting_profile").src =
              String(result.url) + "?t=" + new Date().getTime();
            document.getElementById("nav_profile").src =
              String(result.url) + "?t=" + new Date().getTime();

            // chatSocket.send(JSON.stringify({
            //     'type': 'ChangeImage',
            //     'room_id': localStorage.getItem('room_id'),
            //     'user': user,
            //     'image_url': result.url,
            // }));
          } else {
            console.log(result.message);
          }

          console.log(document.getElementById("Profile_edit_preview").src);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      alert("Image size must be less than 4 MB");
    }
  });

function Spinner(canDisplay) {
  var spinner = document.getElementById("loading");
  if (canDisplay) {
    cropper.destroy();
    spinner.classList.remove("d-none");
    spinner.classList.add("d-block");
    document.getElementById("new_profile_preview").style.opacity = 0.3;
  } else {
    spinner.classList.add("d-none");
    spinner.classList.remove("d-block");
    document.getElementById("new_profile_preview").style.opacity = 1;
  }
}

// send files / attach files
const file_inupt_feild = document.getElementById("attach_file");
document.getElementById("paperclip").addEventListener("click", function () {
  // console.log('in');
  file_inupt_feild.click();
});

const locale_ru_RU = {
  // override default English locale to your custom
  Crop: "Обзрезать",
  "Delete-all": "Удалить всё",
  // etc...
};
function send_image_for_preview_or_edit(img) {
  const instance = new tui.ImageEditor(
    document.querySelector("#tui-image-editor"),
    {
      includeUI: {
        loadImage: {
          path: img,
          name: "SampleImage",
        },
        //   locale: locale_ru_RU,
        //   theme: blackTheme, // or whiteTheme
        initMenu: "resize",
        menuBarPosition: "top",
      },
      cssMaxWidth: 400,
      cssMaxHeight: 300,
      selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70,
      },
    }
  );
}

function showEditwindow(canshow) {
  if (canshow) {
    document.getElementById("messages_container").classList.add("d-none");
    document.getElementById("tui-image-editor").classList.add("d-flex");
    document.getElementById("tui-image-editor").classList.remove("d-none");
  } else {
    document.getElementById("messages_container").classList.remove("d-none");
    document.getElementById("tui-image-editor").classList.remove("d-flex");
    document.getElementById("tui-image-editor").classList.add("d-none");
  }
}

file_inupt_feild.addEventListener("change", function (input) {
  input = input.target;
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    showEditwindow(1);
    reader.addEventListener(
      "load",
      function () {
        const img = reader.result;
        // console.log(img);
        send_image_for_preview_or_edit(img);
      },
      false
    );

    reader.readAsDataURL(input.files[0]);
  }
  image_input.value = "";
});
