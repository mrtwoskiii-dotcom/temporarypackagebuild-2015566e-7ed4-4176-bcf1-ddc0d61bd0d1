const canvas = document.getElementById('tattooCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('cameraFeed');
const previewBtn = document.getElementById('previewBtn');
const brushSizeInput = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');

// Initialize Canvas
function resizeCanvas() {
    // Save current content if needed, but for now we just resize
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // If not in AR mode, ensure background is white
    if (!document.body.classList.contains('ar-mode')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing State
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let brushSize = 5;

brushSizeInput.addEventListener('input', (e) => {
    brushSize = e.target.value;
});

// Helper to get coordinates for both Mouse and Touch
function getCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x;
    lastY = y;
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    
    const { x, y } = getCoords(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// Clear Button
clearBtn.addEventListener('click', () => {
    // In AR mode, clearing means clearing to transparent (clearRect), else white
    if (document.body.classList.contains('ar-mode')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

// Preview Mode Logic
previewBtn.addEventListener('click', async () => {
    document.body.classList.toggle('ar-mode');
    
    if (document.body.classList.contains('ar-mode')) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            video.srcObject = stream;
        } catch (err) {
            console.error("Camera access denied or not available", err);
            alert("Camera access required for Preview Mode.");
            document.body.classList.remove('ar-mode');
        }
    } else {
        // Optional: Stop tracks to save battery when toggling off
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        // Restore white background
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }
});