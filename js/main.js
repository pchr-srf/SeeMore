let vid = document.getElementById('videoel');
let vid_width = vid.width;
let vid_height = vid.height;
let overlay = document.getElementById('overlay');
let overlayCC = overlay.getContext('2d');
let front = document.getElementById("front");
let back  = document.getElementById("back");

/*********** Setup of video/webcam and checking for webGL support *********/
adjustVideoProportions = () => {
    // resize overlay and video if proportions of video are not 4:3
    // keep same height, just change width
    let proportion = vid.videoWidth/vid.videoHeight;
    vid_width = Math.round(vid_height * proportion);
    vid.width = vid_width;
    overlay.width = vid_width;
}
gumSuccess = (stream) => {
    // add camera stream if getUserMedia succeeded
    if ("srcObject" in vid) {
        vid.srcObject = stream;
    } else {
        vid.src = (window.URL && window.URL.createObjectURL(stream));
    }
    vid.onloadedmetadata = () => {
        adjustVideoProportions();
        vid.play();
    }
    vid.onresize = () => {
        adjustVideoProportions();
        if (trackingStarted) {
            ctrack.stop();
            ctrack.reset();
            ctrack.start(vid);
        }
    }
}
gumFail = () => {
    alert("There was some problem trying to fetch video from your webcam");
}

/*********** Code for face tracking *********/
let ctrack = new clm.tracker();
ctrack.init();
let trackingStarted = false;

startVideo = () => {
    vid.play();
    ctrack.start(vid);
    trackingStarted = true;
    
    drawLoop();
}

drawLoop = () => {
    window.requestAnimationFrame(drawLoop);
    overlayCC.clearRect(0, 0, vid_width, vid_height);
    if (ctrack.getCurrentPosition()) {
        ctrack.draw(overlay);

        updateImages( ctrack.getCurrentPosition()[33] );
    }
}

updateImages = (coordinates) => {
    let factorFront = 10;
    let factorBack = 5;

    let rX = (150-coordinates[1]);
    let rY = (200-coordinates[0]);

    let translateX = (150-coordinates[0])*1.5;

    front.style.transform = `perspective(525px) translateZ(0) rotateX(${rX/factorFront}deg) rotateY(${rY/factorFront}deg)`;
    back.style.transform = `perspective(525px) translateX(${translateX}px) translateZ(-100px) rotateX(${rX/factorBack}deg) rotateY(${rY/factorBack}deg)`;
}


navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// set up video
if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
    navigator.getUserMedia({video : true}, gumSuccess, gumFail);
} else {
    gumFail();
}

vid.addEventListener('canplay', startVideo, false);