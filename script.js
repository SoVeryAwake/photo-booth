const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const postToDiscordButton = document.getElementById('postToDiscordButton');
const resetButton = document.getElementById('resetButton');
const videoContainer = document.querySelector('.video-container');
const canvasContainer = document.querySelector('.canvas-container');
const modal = document.getElementById('modal');
const messageInput = document.getElementById('messageInput');
const previewButton = document.getElementById('previewButton');
const postToDiscordModalButton = document.getElementById('postToDiscordModalButton');
const resetModalButton = document.getElementById('resetModalButton');
const welcomeModal = document.getElementById('welcomeModal');
const welcomeButton = document.getElementById('welcomeButton');
const swapCameraButton = document.getElementById('swapCameraButton');
const countdownOverlay = document.getElementById('countdown');

const DISCORD_WEBHOOK_URL_1 = 'https://discord.com/api/webhooks/1269139070047621195/y1-bY0MITS4aXgJFwNYUN3-HX1cQmtqsieusfinmaRTOM0alYZcsC2rN7Xi_bjauyNWl'; // Replace with your first Discord webhook URL
const DISCORD_WEBHOOK_URL_2 = 'https://discord.com/api/webhooks/1269135084187942935/2YuH68ubNd7WL2J1UjPR7R3Y0bNDeNtSoUoahEq6crJRv4oXAjjucZtdoZQXs-N-e_GX'; // Replace with your second Discord webhook URL

let currentStream;
let usingFrontCamera = true;

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

async function startCamera() {
    const constraints = {
        video: {
            width: { ideal: 3840 },
            height: { ideal: 2160 },
            aspectRatio: { ideal: 16 / 9 },
            facingMode: usingFrontCamera ? 'user' : 'environment'
        }
    };

    if (isMobileDevice()) {
        constraints.video.aspectRatio = { ideal: 9 / 16 };
    }

    try {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        currentStream = stream;
        video.setAttribute('crossorigin', 'anonymous');

        if (usingFrontCamera) {
            video.classList.add('flipped');
        } else {
            video.classList.remove('flipped');
        }

        video.addEventListener('loadedmetadata', () => {
            adjustCanvasSize();
        });
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

function adjustCanvasSize() {
    if (isMobileDevice()) {
        canvas.width = video.videoHeight;
        canvas.height = video.videoWidth;
    } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
}

startCamera();

if (isMobileDevice()) {
    welcomeModal.style.display = 'flex';
    swapCameraButton.classList.remove('hidden');
}

welcomeButton.addEventListener('click', () => {
    welcomeModal.style.display = 'none';
});

captureButton.addEventListener('click', () => {
    startCountdown();
});
video.addEventListener('click', () => {
    if (isMobileDevice()) {
        startCountdown();
    } else {
        startCountdown();
    }
});
postToDiscordButton.addEventListener('click', postImageToDiscord);
resetButton.addEventListener('click', confirmReset);
previewButton.addEventListener('click', () => {
    modal.style.display = 'none';
});
postToDiscordModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    postImageToDiscord();
});
resetModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    confirmReset();
});
canvas.addEventListener('click', () => {
    if (!canvasContainer.classList.contains('hidden')) {
        modal.style.display = 'flex';
    }
});

swapCameraButton.addEventListener('click', () => {
    usingFrontCamera = !usingFrontCamera;
    startCamera();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        startCountdown();
    }
});

function startCountdown() {
    let countdown = 3;
    countdownOverlay.style.display = 'flex';
    countdownOverlay.innerText = countdown;

    const countdownInterval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
            countdownOverlay.innerText = countdown;
        } else {
            clearInterval(countdownInterval);
            countdownOverlay.style.display = 'none';
            captureImage();
            modal.style.display = 'flex';
        }
    }, 1000);
}

function captureImage() {
    if (isMobileDevice() && video.videoWidth > video.videoHeight) {
        canvas.width = video.videoHeight;
        canvas.height = video.videoWidth;
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(Math.PI / 2);
        if (usingFrontCamera) {
            context.scale(-1, 1);
        }
        context.drawImage(video, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
        context.restore();
    } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.save();
        if (usingFrontCamera) {
            context.scale(-1, 1);
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        context.restore();
    }
    videoContainer.classList.add('hidden');
    canvasContainer.classList.remove('hidden');
    resetButton.classList.remove('hidden');
    captureButton.classList.add('hidden');
    postToDiscordButton.classList.remove('hidden');
}

function postImageToDiscord() {
    const dataURL = canvas.toDataURL('image/png');
    const file = dataURLtoFile(dataURL, 'image.png');
    const formData = new FormData();
    formData.append('file', file, 'image.png');

    const message = messageInput.value;
    if (message) {
        formData.append('content', message);
    }

    postToDiscordWebhook(DISCORD_WEBHOOK_URL_1, formData)
        .then(() => postToDiscordWebhook(DISCORD_WEBHOOK_URL_2, formData))
        .then(() => {
            alert('Posted to Discord successfully!');
            const confirmReset = confirm("Do you want to reset the photo booth?");
            if (confirmReset) resetProcess();
        })
        .catch(error => {
            console.error('Error posting to Discord:', error);
            alert('Failed to post to Discord. Please try again.');
        });
}

function postToDiscordWebhook(webhookURL, formData) {
    return axios.post(webhookURL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
}

function resetProcess() {
    videoContainer.classList.remove('hidden');
    canvasContainer.classList.add('hidden');
    resetButton.classList.add('hidden');
    captureButton.classList.remove('hidden');
    postToDiscordButton.classList.add('hidden');
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
}

function confirmReset() {
    const confirmReset = confirm("Are you sure you want to reset?");
    if (confirmReset) resetProcess();
}

function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
