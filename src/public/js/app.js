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

function handleNicknameSubmit(event){
    event.preventDefault();
    
}

function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3=room.querySelector("h3");
    h3.innerText=`Room ${roomName}`;
    const messageForm=room.querySelector("form");
    messageForm.addEventListener("submit",handleMessageSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();

    const nameInput=welcome.querySelector("input");
    const roomInput=welcome.querySelector("input:nth-child(2)");
    console.log(roomInput);

    //Emit anything + can send objects
    socket.emit("enter_room",nameInput.value,roomInput.value,showRoom);

    roomName=roomInput.value;
    roomInput.value="";
}
form.addEventListener("submit",handleRoomSubmit)

socket.on("welcome",(user)=>{
        addMessage(`${user} Joined`);
    }
)

socket.on("bye",(user)=>{
    addMessage(`${user} left`);
    }
)
socket.on("new_message",(msg)=>addMessage(msg));