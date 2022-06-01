import { errorMonitor } from "events";
import express from "express";
import http from "http";
import SocketIO from "socket.io"
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

//socket.io server
const io=SocketIO(server);
io.on("connection", (socket) => {
    //새로운 방에 들어가고자 하면 socket를 방에 등록시켜준다.
    socket.on("join_room",(roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    })
    //offer
    socket.on("offer",(offer,roomName) =>{
        socket.to(roomName).emit("offer",offer);
    });
    //answer
    socket.on("answer",(answer,roomName)=>{
        socket.to(roomName).emit("answer",answer);
    })
    //ice candidate
    socket.on("ice",(ice,roomName)=>{
        socket.to(roomName).emit("ice",ice);
    })
});


server.listen(3000,handleListen);

