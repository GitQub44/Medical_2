// Camera Functionality
const cameraView = document.getElementById('camera-view');
const photoResult = document.getElementById('photo-result');
const startCamera = document.getElementById('start-camera');
const takePhoto = document.getElementById('take-photo');
let stream = null;

startCamera.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        cameraView.srcObject = stream;
        takePhoto.disabled = false;
        startCamera.textContent = 'Камера включена';
        startCamera.disabled = true;
    } catch (err) {
        alert("Ошибка доступа к камере: " + err.message);
    }
});

takePhoto.addEventListener('click', () => {
    const context = photoResult.getContext('2d');
    photoResult.width = cameraView.videoWidth;
    photoResult.height = cameraView.videoHeight;
    context.drawImage(cameraView, 0, 0, photoResult.width, photoResult.height);
    
    photoResult.style.display = 'block';
    cameraView.style.display = 'none';
    takePhoto.disabled = true;
    
    // Here you would typically send the photo to your backend
    // const imageData = photoResult.toDataURL('image/jpeg');
    // await saveMedicalPhoto(imageData);
});

// Registration Form
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value
    };
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Регистрация успешна!');
            // Redirect or show authenticated UI
        } else {
            alert(data.message || 'Ошибка регистрации');
        }
    } catch (error) {
        alert('Ошибка соединения с сервером');
    }
});

// Chatbot Functionality
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

document.getElementById('send-message').addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        addMessage(data.reply, 'bot');
    } catch (error) {
        addMessage("Извините, произошла ошибка соединения", 'bot');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', `${sender}-message`);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}