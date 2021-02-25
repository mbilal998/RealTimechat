const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const currentUser = document.getElementById('currentUser');

const socket = io();

// For typing

var typing = false;
var timeout = undefined;

// Message from server 
socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTo = chatMessages.scrollHeight;
});

// Username and Room from URl through Qs

let { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

let user = username;
currentUser.innerHTML = user;

//Join the room
socket.emit('joinRoom', { username, room })

// Get Room And Users
socket.on('roomUser', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

// Submit the Form
chatForm.addEventListener('submit', (e) => {

    e.preventDefault();

    // Get the submitt message from form
    const msg = e.target.elements.msg.value;

    // Send message to server
    socket.emit('chatMessage', msg);

    // clear the input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

// Output Message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
        ${message.text}
        </p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add Room name to DOM
function outputRoomName(room) {
    roomName.innerHTML = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

// For typing
$(document).ready(function () {
    $('#msg').keypress((e) => {
        if (e.which != 13) {
            typing = true
            socket.emit('typing', { user: user, typing: true })
            clearTimeout(timeout)
            timeout = setTimeout(typingTimeout, 1000)
        } else {
            clearTimeout(timeout)
            typingTimeout()
        }
    })

    //code explained later
    socket.on('display', (data) => {
        if (data.typing == true)
            $('.typing').text(`${data.user} is typing...`)
        else
            $('.typing').text("")
    })
})

function typingTimeout() {
    $('.typing').text("")
    socket.emit('typing', { user: user, typing: false })

}
$(document).ready(function () {
    $("#editCurrentUser").click(function () {
        $("#changeCurrentUserName").show();
        $("#editCurrentUser").hide();
        $("#currentUservalue").val(user);

    });
    $("#UpdateCurrentUser").click(function () {
        $("#editCurrentUser").show();
        $("#changeCurrentUserName").hide();
        const updatename = $("#currentUservalue").val();
        currentUser.innerHTML = updatename;
        username = updatename; room = room;
        socket.emit('updateUserName', { updatedName: updatename, currentName: user, room })
        user = updatename;
    });

});
