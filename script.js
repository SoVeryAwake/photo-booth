const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const sendEmailButton = document.getElementById('sendEmail');
const resetButton = document.getElementById('reset');
const emailInput = document.getElementById('email');
const postToDiscordCheckbox = document.getElementById('postToDiscord');
const checkboxContainer = document.getElementById('checkbox-container');
const videoContainer = document.querySelector('.video-container');
const canvasContainer = document.querySelector('.canvas-container');

const EMAILJS_USER_ID = 'VIoYfu_KKNmMppsT8'; // Replace with your EmailJS user ID
const SERVICE_ID = 'service_us2nq48';
const TEMPLATE_ID = 'template_a7eb60m';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1269139070047621195/y1-bY0MITS4aXgJFwNYUN3-HX1cQmtqsieusfinmaRTOM0alYZcsC2rN7Xi_bjauyNWl'; // Replace with your Discord webhook URL

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                aspectRatio: { ideal: 16 / 9 }
            }
        });
        video.srcObject = stream;
        video.setAttribute('crossorigin', 'anonymous');
    } catch (error) {
        console.warn("Preferred constraints failed, falling back to default constraints:", error);
        try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            video.srcObject = fallbackStream;
            video.setAttribute('crossorigin', 'anonymous');
        } catch (fallbackError) {
            console.error("Error accessing the camera with default constraints:", fallbackError);
        }
    }
}

startCamera();

captureButton.addEventListener('click', captureImage);

sendEmailButton.addEventListener('click', () => {
    const email = emailInput.value;
    if (email) {
        uploadAndSend(canvas, email);
    } else {
        alert('Please enter a valid email address.');
    }
});

resetButton.addEventListener('click', resetProcess);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        captureImage();
    }
});

function captureImage() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    videoContainer.classList.add('hidden');
    canvasContainer.classList.remove('hidden');
    emailInput.classList.remove('hidden');
    checkboxContainer.classList.remove('hidden'); // Show checkbox after capture
    resetButton.classList.remove('hidden');
    captureButton.classList.add('hidden');
    sendEmailButton.classList.remove('hidden');
}

function resetProcess() {
    videoContainer.classList.remove('hidden');
    canvasContainer.classList.add('hidden');
    resetButton.classList.add('hidden');
    emailInput.classList.add('hidden');
    checkboxContainer.classList.add('hidden'); // Hide checkbox on reset
    captureButton.classList.remove('hidden');
    sendEmailButton.classList.add('hidden');
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    emailInput.value = '';
    postToDiscordCheckbox.checked = true; // Ensure the checkbox is checked by default
}

function uploadAndSend(canvas, email) {
    const dataURL = canvas.toDataURL('image/png');
    const file = dataURLtoFile(dataURL, 'image.png');

    const postToDiscord = postToDiscordCheckbox.checked;
    if (postToDiscord) {
        postToDiscordAndSendEmail(file, email);
    } else {
        sendEmailWithAttachment(file, email);
    }
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

function postToDiscordAndSendEmail(file, email) {
    const formData = new FormData();
    formData.append('file', file, 'image.png');

    axios.post(DISCORD_WEBHOOK_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    })
    .then(response => {
        console.log('Posted to Discord:', response.data);
        sendEmailWithAttachment(file, email, response.data.attachments[0].url);
    })
    .catch(error => {
        console.error('Error posting to Discord:', error);
    });
}

function sendEmailWithAttachment(file, email, discordUrl = '') {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        const base64data = reader.result.split(',')[1]; // Get base64 data without the prefix
        const emailParams = {
            to_email: email,
            attachment: base64data,
            discord_url: discordUrl
        };

        emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, EMAILJS_USER_ID)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
        }, (error) => {
            console.error('FAILED...', error);
        });
    };
}
