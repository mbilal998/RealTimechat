const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, updateUserName } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Here we using some static folder
app.use(express.static(path.join(__dirname, 'public')));

const botname = 'Invozone Bot';

// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        // A room is an arbitrary channel that sockets can join and leave
        socket.join(user.room)

        socket.emit('message', formatMessage(botname, 'welcome to Invozone'));
        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botname, `${user.username} has joined the chat`));

        // Send user and room information
        io.to(user.room).emit('roomUser', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    // Runs when client discount
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botname, `${user.username} has left the chat`));

            // Second:  Send user and room information
            io.to(user.room).emit('roomUser', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
    // for typing

    socket.on('typing', (data) => {
        const user = getCurrentUser(socket.id);
        if (data.typing == true)
            socket.broadcast.to(user.room).emit('display', data);
        else
            socket.broadcast.to(user.room).emit('display', data);
    })

    // Update User name
    socket.on('updateUserName', (data) => {
        const user = updateUserName(socket.id, data.updatedName, data.room);
        // Third:  Send user and room information
        io.to(user.room).emit('roomUser', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        socket.broadcast.to(user.room).emit('message', formatMessage(botname, `${user.username} change his name from ${data.currentName} to ${user.username}`));
    })

})

const PORT = 5000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
