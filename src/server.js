import express from "express";
import http from "http";
import SocketIO from "socket.io";
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

//socket server, connection event handler
io.on("connection",socket => {
        socket.onAny((event)=> {
            console.log(`Socket Event: ${event}`);
        });

        socket.on("enter_room",(nickName,roomName,done)=>{
            socket["nickname"]=nickName;
            //join room
            socket.join(roomName);
            done();
            //emit "welcome" event to everyone in the room
            socket.to(roomName).emit("welcome",socket.nickname);

            // setTimeout(()=>{
            //     done("Hello from the Backend");
            // },10000);    

            }
        );

        socket.on("new_message",(msg,room,done)=>{
            socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
            done();
        })

        socket.on("nickname",nickname => socket["nickname"]=nickname);

        socket.on("disconnecting",()=>{
            socket.rooms.forEach(room => socket.to(room).emit("bye",socket.nickname));
            }
        );
        
    }    
)

server.listen(3000,handleListen);

