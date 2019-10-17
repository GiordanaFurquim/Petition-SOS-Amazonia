const signCanvas = document.querySelector(".canvas");
const context = signCanvas.getContext("2d");
context.lineCap = "round";
const sign = document.getElementById('signature');

let x = 0,
    y = 0;
let isMouseDown = false;

const stopDrawing = () => {
    isMouseDown = false;
};
const startDrawing = event => {
    isMouseDown = true;
    [x, y] = [event.offsetX, event.offsetY];
};
const drawLine = event => {
    if (isMouseDown) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(newX, newY);
        context.stroke();
        [x, y] = [newX, newY];

        // CREATING A VAR TO STORE THE SIGNATURE
        let dataURL = signCanvas.toDataURL();
        sign.value = dataURL;
        console.log(dataURL);
    }
};

signCanvas.addEventListener("mousedown", startDrawing);
signCanvas.addEventListener("mousemove", drawLine);
signCanvas.addEventListener("mouseup", stopDrawing);
signCanvas.addEventListener("mouseout", stopDrawing);
