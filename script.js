<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Booth App</title>
    <style>
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f0f0; font-family: Arial, sans-serif; }
        .container { display: flex; justify-content: center; align-items: center; width: 100%; height: calc(100vh - 60px); }
        .video-container, .canvas-container { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; align-items: center; }
        video, canvas { width: auto; height: 100%; max-width: 100%; max-height: 100%; aspect-ratio: 16/9; }
        .buttons { display: flex; gap: 10px; margin: 10px; align-items: center; }
        button, select, input { padding: 10px 20px; font-size: 16px; cursor: pointer; }
        .hidden { display: none; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="video-container">
            <video id="video" autoplay></video>
        </div>
        <div class="canvas-container hidden">
            <canvas id="canvas" width="3840" height="2160"></canvas>
        </div>
    </div>
    <div class="buttons">
        <button id="capture">Capture</button>
        <button id="postToDiscordButton" class="hidden">Post to Discord</button>
        <button id="resetButton" class="hidden">Reset</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
