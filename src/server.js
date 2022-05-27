import express from "express";
import http from "http";
import WebSocket from "ws";
const app=express();

app.set("view engine","pug");
app.set("views",__dirname +"/views");
app.use("/public",express.static(__dirname+ "/public"));
app.get("/",(req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000,handleListen);

//http server => to get access to server
const server=http.createServer(app);
//websocket server
const wss=new WebSocket.Server({server});

//socket represents a connected web browser
/*
function handleConnection(socket){
    console.log(socket)
}
*/
wss.on("connection",(socket)=>{
    console.log("Connected to Browser");
    socket.on("close",()=>console.log("Disconnected from the Client"));
    socket.on("message",(message)=>{
        console.log(message.toString('utf-8'));
    });
    socket.send("hello!!!");
});

//using http server and websocket together
server.listen(3000,handleListen);

