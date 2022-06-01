const socket=io();

const myFace=document.getElementById("myFace");
const muteButton=document.getElementById("mute");
const cameraButton=document.getElementById("camera");
const camerasSelect=document.getElementById("cameras");


const call=document.getElementById("call");

call.hidden=true;

let myStream;


let muted=false
let cameraOff=false;
let roomName;

let myPeerConnection;
let myDataChannel;

async function getCameras(){
    try{
        const devices=await navigator.mediaDevices.enumerateDevices();
        const cameras=devices.filter(device => device.kind==="videoinput");
        const currentCamera=mySteam.getVideoTracks()[0];
        cameras.forEach((camera)=>{
            const option=document.createElement("option");
            option.value=camera.deviceId;
            option.innerText=camera.label;
            if(currentCamera.label === camera.label){
                option.selected=true;
            }
            camerasSelect.appendChild(option);
        });
        console.log(cameras);

    }catch(e){
        console.log(e);
    }
}
async function getMedia(deviceId){
    const initialConstraints={
        audio:true,
        video:{ facingMode:"user"}
    };
    const cameraConstraints={
        audio:true,
        video:{deviceId:{exact: deviceId}}
    };
    try{
        myStream= await navigator.mediaDevices.getUserMedia(
            deviceId?cameraConstraints:initialConstraints
        )
        myFace.srcObject=mySteam;
        if(!deviceId){
            await getCameras();    
        }
    }catch(e){
        console.log(e)
    }

}

function handleMuteClick(){
    myStream.getAudioTracks().forEach(track=>track.enabled= !track.enabled)
    if(!muted){
        muteButton.innerText="Unmute"
        muted=true;
    }
    else{
        muteButton.innerText="Mute"
        muted=false;
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach(track=>track.enabled= !track.enabled)
    if(!cameraOff){
        cameraButton.innerText="Turn Camera Off";
        cameraOff=true;
    }
    else{
        cameraButton.innerText="Turn Camera On";
        cameraOff=false;
    }
}
async function handleCameraSelectChange(){
    await getMedia(camerasSelect.value);
    //need to change new stream to peerConnection
    if(myPeerConnection){
        const videoSender=myPeerConnection
        .getSenders()
        .find(sender=> sender.track.kind="vide");
        videoSender.replaceTrack(myStream.getVideoTracks()[0])
    }
}
muteButton.addEventListener("click",handleMuteClick);
cameraButton.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input",handleCameraSelectChange);


// Welcome Foprm
const welcome=document.getElementById("welcome");
const welcomeForm=welcome.querySelector("form");
async function startMedia(){
    welcome.hidden=true;
    call.hidden=false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input=welcomeForm.querySelector("input");
    console.log(input.value);
    await startMedia();
    socket.emit("join_room",input.value);
    roomName=input.value;
    input.value="";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit)

//Socket Code Signaling Process
//PeerA
socket.on("welcome",async ()=> {
    console.log("some body joined");
    myDataChannel=myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message",console.log);
    const offer=await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer)    
    socket.emit("offer",offer,roomName);
})

socket.on("answer",answer=>{
    myPeerConnection.setRemoteDescription(answer);
})

//Peer B
socket.on("offer",async (offer)=>{
    myPeerConnection.addEventListener("datachannel",(event)=>{
        myDataChannel=event.channel;
        myDataChannel.addEventListener("message",console.log);
    });
    myPeerConnection.setRemoteDescription(offer);
    const answer=await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer,roomName);
})

//Ice Candidate Handling
socket.on("ice",(ice)=>{
    myPeerConnection.addIceCandidate(ice);
})

//RTC Code
/*
WebRTC Connection을 만드는 과정이 socket.io/websockets보다 오래 걸리므로
먼저 실행 시켜준다.
*/
function makeConnection(){
    myPeerConnection=new RTCPeerConnection({
        iceServers:[
            {
                urls:[
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
        }
    );
    myPeerConnection.addEventListener("icecandidate",handleIce)
    myPeerConnection.addEventListener("addstreamevent",handleAddStream);
    //add Tracks 대신에 사용하는 함수
    myStream.getTracks().forEach(
        track=> myPeerConnection.addTrack(track,myStream)
        );

}
//Ice Candidates을 계속 전송하게 된다.
function handleIce(data){
    socket.emit("ice",data.candidate,roomName);
}

//받아온 Stream을 등록하면 상대방의 stream이 등록된다.
function handleAddStream(data){
    const peerFace=document.getElementById("peerFace");
    peerFace.srcObject=data.stream;
}

