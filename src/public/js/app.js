const welcome=document.getElementById("welcome");
const form= welcome.querySelector("form");
const room = document.getElementById("room");
const nameForm=room.querySelector("form#name");

room.hidden=true;
let roomName;
//socket Server로 연결
const socket=io();

function addMessage(msg){
    const ul=room.querySelector("ul");
    const li=document.createElement("li");
    li.innerText=msg;
    ul.appendChild(li);
}

function backEndDone(msg){
    console.log("Backend Says: ",msg);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input=room.querySelector("input");
    const value=input.value;
    socket.emit("new_message",input.value,roomName,()=>{
        addMessage(`You: ${value}`)
    });
    input.value="";
}

function addRoomInfo(count){
    const h3=room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${count})`;
}
function showRoom(count){
    welcome.hidden=true;
    room.hidden=false;
    addRoomInfo(count)
    const messageForm=room.querySelector("form");
    messageForm.addEventListener("submit",handleMessageSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();

    const nameInput=welcome.querySelector("input");
    const roomInput=welcome.querySelector("input:nth-child(2)");

    //Emit anything + can send objects
    socket.emit("enter_room",nameInput.value,roomInput.value,showRoom);

    roomName=roomInput.value;
    roomInput.value="";
}
form.addEventListener("submit",handleRoomSubmit)

socket.on("welcome",(user,newCount)=>{
        addMessage(`${user} Joined`);
        addRoomInfo(newCount);
    }
)
socket.on("bye",(user,newCount)=>{
    addMessage(`${user} left`);
    addRoomInfo(newCount);
    }
)
socket.on("new_message",(msg)=>addMessage(msg));
socket.on("room_change",(rooms)=> { 
    const roomList=welcome.querySelector("ul");
    roomList.innerHTML="";

    if(Object.keys(rooms).length ===0){
        return;
    }
    for(let [roomName,count] of Object.entries(rooms)){
        const li=document.createElement("li");
        li.innerText=`Room ${roomName} (${count})`;
        roomList.appendChild(li);
        };
    }

);