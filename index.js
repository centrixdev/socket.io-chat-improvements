const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})



io.on('connection', (socket) => {
    socket.name = 'User'
    
    socket.on('nameChange', name => {
        io.emit('system', { type: 'nameChange', oldName: socket.name, newName: name})
        socket.name = name

        
    })
    io.emit('system', { type: 'connect'})

    socket.on('message', async message => {
        if(message[0] === '/') {
            switch(message.substring(1)) {
                case 'users': {
                    const sockets = await io.fetchSockets()
                    var users = []
                    for (const socket of sockets) {
                        users.push(socket.name)
                    }
                    io.emit('system', {type: 'command', message: `Users Online: ${users.join(', ')}`})
                }
                
            }
        } else {
            socket.broadcast.emit('message', {name: socket.name, message});
        }
    
    })
    socket.on('disconnect', reason => {
        io.emit('system', { type: 'disconnect', name: socket.name, reason})
    })
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.name)
    })
})

server.listen(3000, () => console.log('server listening on', 3000))