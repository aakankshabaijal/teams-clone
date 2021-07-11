# Microsoft Teams Clone

This project is a part of the Microsoft Engage Mentorship Program, 2021.
The challenge was that a minimum of two participants should be able to connect via this product and have a video conversation.

I have used WebRTC and socket.io for establishing the connection between two users.

[Teams Clone](https://teams-clone-engage.herokuapp.com/)

## Feature Set

1. Video call between two participants
2. Chat that is active before, during and after the video call
3. Screen sharing
4. Recording the video and screen share of other user and saving it locally
5. Recording can be paused and resumed during the video call
6. Option to accept or reject incoming video call or connection request

## Installation

After installing, run the script to host the application on a local host

```bash
npm run start
```

## Limitations

Since an external TURN server has not been integrated, the connection between two people on different networks might not be possible if they have firewall enabled or their IP address is masked by the browser.
