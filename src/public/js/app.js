const socket=io();

const myFace=document.getElementById("myFace");
const muteButton=document.getElementById("mute");
const cameraButton=document.getElementById("camera");
const camerasSelect=document.getElementById("cameras");
let myStream;

let muted=false
let cameraOff=false;

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

getMedia();

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
function handleCameraSelectChange(){
    await getMedia(camerasSelect.value);
}
muteButton.addEventListener("click",handleMuteClick);
cameraButton.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input",handleCameraSelectChange);