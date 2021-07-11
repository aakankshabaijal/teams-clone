/**
 * File : app.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the code for socket.io and setting up the local host.
 *      Local host is set up using Node.js and Express.js.
 *      It contains an array to store ID of connected users and event handlers to
 *      emit events to connected peers.
 *
 */
const express = require("express");
const http = require("http");

//port 3000 is for local host
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
app.use(express.static("public")); // all files in public folder should be accessible outside the server

//defining routes, request and response
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// array for storing id of connected users in our server
let connectedPeers = [];

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketID) => peerSocketID === calleePersonalCode
    );

    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType,
      };

      io.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      const data = {
        preOfferAnswer: "CALLEE_NOT_FOUND",
      };
      io.to(socket.id).emit("pre-offer-answer", data);
    }
  });

  socket.on("pre-offer-answer", (data) => {
    const connectedPeer = connectedPeers.find(
      (peerSocketID) => peerSocketID === data.callerSocketId
    );
    if (connectedPeer) {
      io.to(data.callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketID) => peerSocketID === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("webRTC-signaling", data);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketID) => peerSocketID === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("user-hanged-up");
    }
  });

  socket.on("end-connection", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketID) => peerSocketID === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("end-connection");
    }
  });

  socket.on("disconnect", () => {
    const newConnectedPeers = connectedPeers.filter((peerSocketID) => {
      return peerSocketID !== socket.id;
    });

    connectedPeers = newConnectedPeers; //only active users will be in the array
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
