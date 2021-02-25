const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();

// Message from server 
socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTo = chatMessages.scrollHeight;
});

// Username and Room from URl through Qs

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

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
