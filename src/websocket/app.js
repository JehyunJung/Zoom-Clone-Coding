//socket => represents a connection between front and back
const socket=new WebSocket(`ws://${window.location.host}`);
const messageList=document.querySelector("ul");
const messageForm=document.querySelector("#message");
const nickForm=document.querySelector("#nickname")
// Recieve message => (Events)

//make JSON Converter
const makeMessage=function(type,payload){
    const msg={type,payload}
    return JSON.stringify(msg);
}

//Connected to Server
socket.addEventListener("open",()=>{
    console.log("Connected to Server");
});
//Recieving message
socket.addEventListener("message",(message)=>{
    const li=document.createElement("li");
    li.innerText=message.data;
    messageList.appendChild(li);
});
//Disconnected to Server
socket.addEventListener("close",()=>{
    console.log("Connection Closed");
});

//Event Handler for Messsage submits
function handleSubmit(event){
    event.preventDefault();
    const input=messageForm.querySelector("input")
    socket.send(makeMessage("new_message",input.value));
    
    const li=document.createElement("li");
    li.innerText=`You: ${input.value}`;
    messageList.appendChild(li);

    input.value="";
}
//Event Handler for nickname submits
function handleNickSubmit(event){
    event.preventDefault();
    const input=nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    input.value="";
}
messageForm.addEventListener("submit",handleSubmit);
nickForm.addEventListener("submit",handleNickSubmit);