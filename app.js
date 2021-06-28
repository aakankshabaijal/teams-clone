const express = require('express');
const http = require("http");

//port 3000 is for local host
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app); // express is used here to create our server
const io = require("socket.io")(server);//using the socket.io library
app.use(express.static("public")); // all files in public folder should be accessible outside the server
//defining routes, request and response


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let connectedPeers = [];

io.on('connection', (socket) => {
    connectedPeers.push(socket.id); // array for storing id of connected users in our server
    console.log(connectedPeers);

    socket.on('pre-offer', (data) => {
        console.log('pre-offer came');
        const { calleePersonalCode, callType } = data;

        const connectedPeer = connectedPeers.find((peerSocketID) =>
            peerSocketID === calleePersonalCode
        );

        console.log(connectedPeer);

        if (connectedPeer) {
            const data = {
                callerSocketId: socket.id,
                callType,
            };

            io.to(calleePersonalCode).emit('pre-offer', data);
        }
        else {
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND",
            };
            io.to(socket.id).emit('pre-offer-answer', data);
        }
    });

    socket.on('pre-offer-answer', (data) => {
        console.log("pre offer answer came");

        console.log(data);

        const connectedPeer = connectedPeers.find((peerSocketID) =>
            peerSocketID === data.callerSocketId
        );
        if (connectedPeer) {
            io.to(data.callerSocketId).emit("pre-offer-answer", data);
        }
    });

    socket.on('webRTC-signaling', (data) => {
        const { connectedUserSocketId } = data;


        const connectedPeer = connectedPeers.find((peerSocketID) =>
            peerSocketID === connectedUserSocketId
        );

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit('webRTC-signaling', data);
        }
    });

    socket.on('user-hanged-up', (data) => {
        const { connectedUserSocketId } = data;

        const connectedPeer = connectedPeers.find((peerSocketID) =>
            peerSocketID === connectedUserSocketId
        );

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit('user-hanged-up');
        }
    });

    socket.on('disconnect', () => {
        console.log("user disconnected");

        const newConnectedPeers = connectedPeers.filter((peerSocketID) => {
            return peerSocketID !== socket.id;
        });

        connectedPeers = newConnectedPeers; //only active users will be in the array
        console.log(connectedPeers);
    });
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});