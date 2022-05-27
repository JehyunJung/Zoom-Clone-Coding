//socket => represents a connection between front and back
const socket=new WebSocket(`ws://${window.location.host}`);

// Recieve message => (Events)

//Connected to Server
socket.addEventListener("open",()=>{
    console.log("Connected to Server");
});
//Recieving message
socket.addEventListener("message",(message)=>{
    console.log("Just Got This: ",message.data,"from the server");
});
//Disconnected to Server
socket.addEventListener("close",()=>{
    console.log("Connection Closed");
});

setTimeout(()=>{
    socket.send("hello from the browser")
},10000);