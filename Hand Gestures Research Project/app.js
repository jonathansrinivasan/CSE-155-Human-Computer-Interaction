const video = document.querySelector('#video');
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let model;
var coords = [0, 0, 0, 0];
var activate = false;

//Support for most browsers
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

//handTrack.js parameters
const modelParams = {
    flipHorizontal: false,   // flip e.g for video 
    imageScaleFactor: 0.7,  // reduce input image size for gains in speed.
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.79,    // confidence threshold for predictions.
}

handTrack.startVideo(video).then(status => {
    if (status) {
        navigator.getUserMedia({ video: {} }, stream => {
            video.srcObject = stream;
            setInterval(runDetection, 350)
            setInterval(runOverlayDetection, 1000)
        },
            err => console.log(err)
        );
    }
});

function runOverlayDetection() {
    model.detect(video).then(predictions => {
        if (predictions.length !== 0) {
            let hand = predictions[0].bbox;
            let x = hand[0];
            let y = hand[1];

            //Window width and heights
            var ww = document.getElementById("video").width;
            var wh = document.getElementById("video").height;
            // console.log("Activated Status: ", activate);

            if (x <= (ww / 2 + 65) && x >= (ww / 2 - 65) && y <= (wh / 2 + 65) && y >= (wh / 2 - 65)) {
                // console.log("Center!");
                document.getElementById("handOverlay").src = "go.png";
                activate = true;
                setTimeout(function resetActivate() { document.getElementById("handOverlay").src = "hand.png"; activate = false; }, 2000);
            }
        }
    });
}

function runDetection() {
    model.detect(video).then(predictions => {
        model.renderPredictions(predictions, canvas, context, video);
        // console.log(predictions);
        if (predictions.length !== 0) {
            let hand = predictions[0].bbox;
            let x = hand[0];
            let y = hand[1];
            coords.unshift(x, y);
            coords.pop();
            coords.pop();
            //Velocity
            xVel = coords[0] - coords[2];
            yVel = coords[1] - coords[3];

            // console.log("Current x position: ", x);
            // console.log("Current y position: ", y);
            // console.log("\nX Velocity: ", xVel);
            // console.log("\nY Velocity: ", yVel);

            if (activate) {
                if (xVel >= 85) {
                    if (yVel >= 70) {
                        console.log("Moving diagonally down, in positive x");
                        // window.open("https://www.apple.com/");
                    } else if (yVel <= -70) {
                        console.log("Moving diagonally up, in positvie x");
                        // window.open("https://www.google.com/");
                    } else if (yVel < 35 && yVel > -35) {
                        console.log("--->");
                        // window.open("https://www.youtube.com/");
                    }
                } else if (xVel < -85) {
                    if (yVel >= 70) {
                        console.log("Moving diagonally down, in negative x");
                        // window.open("");
                    } else if (yVel <= -70) {
                        console.log("Moving diagonally up, in negative x");
                        // window.open("");
                    } else if (yVel < 35 && yVel > -35) {
                        console.log("<---");
                        // window.open("");
                    }
                } else if (xVel < 35 && xVel > -35) {
                    if (yVel < -65) {
                        console.log("Up");
                        // window.open("");
                    } else if (yVel >= 65) {
                        console.log("Down");
                        // window.open("");
                    }
                }
            }
        }
    });
}

handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
})
