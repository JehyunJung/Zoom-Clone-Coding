import express from "express";
import http from "http";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui"
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
const io=new Server(server,{
    cors:{
        origin:["https://admin.socket.io"],
        credentials:true,
    }
})
instrument(io,{
    auth:false
});

//function that finds public rooms
function publicRooms(){
    /* 
    const sids=io.sockets.adapter.sids;
    const rooms=io.sockets.adapter.rooms; 
    */

    const {
        sockets:{
            adapter:{
                sids,rooms
            }
        }
    }=io;
    const public_rooms={};
    rooms.forEach((_,key)=>{
        if(sids.get(key) === undefined){
            public_rooms[key]=rooms.get(key)?.size;
        }
    })
    return public_rooms;
}
function countRoom(roomName){
    return io.sockets.adapter.rooms.get(roomName)?.size;
}
//socket server, connection event handler
io.on("connection",socket => {
        socket.emit("room_change",publicRooms())
        socket.onAny((event)=> {
            console.log(`Socket Event: ${event}`);
            
        });

        socket.on("enter_room",(nickName,roomName,done)=>{
            socket["nickname"]=nickName;
            //join room
            socket.join(roomName);
            done(countRoom(roomName));
            //emit "welcome" event to everyone in the room
            socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));

            io.sockets.emit("room_change",publicRooms());
            // setTimeout(()=>{
            //     done("Hello from the Backend");
            // },10000);    

            }
        );

        socket.on("new_message",(msg,room,done)=>{
            socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
            done();
        })
        socket.on("disconnecting",()=>{
            socket.rooms.forEach(room => socket.to(room).emit("bye",socket.nickname,countRoom(room)-1));
            }       
        );
        socket.on("disconnect",()=>io.sockets.emit("room_change",publicRooms()));
        
    }    
)

server.listen(3000,handleListen);

