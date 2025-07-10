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
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        alert('Регистрация успешна!');
        console.log('User registered:', data);
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(`Ошибка: ${error.message}`);
    }
});

// BMI Calculator
document.getElementById('calculate-bmi').addEventListener('click', () => {
    try {
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('bmi-height').value) / 100;
        
        if (isNaN(weight)) throw new Error("Введите корректный вес");
        if (isNaN(height) || height <= 0) throw new Error("Введите корректный рост");

        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmi-value').textContent = `ИМТ: ${bmi}`;
        
        // Add BMI category logic here
        console.log("BMI calculated:", bmi);
    } catch (error) {
        alert(error.message);
    }
});

// Blood Pressure Tracker
document.getElementById('save-pressure').addEventListener('click', async () => {
    try {
        const pressureData = {
            systolic: document.getElementById('systolic').value,
            diastolic: document.getElementById('diastolic').value,
            pulse: document.getElementById('pulse').value
        };

        const response = await fetch('/api/health/pressure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(pressureData)
        });

        if (!response.ok) throw new Error("Failed to save data");
        
        alert("Данные сохранены!");
        console.log('Pressure saved:', await response.json());
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

// Chatbot Functionality
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error("Chat service unavailable");
        }

        const data = await response.json();
        addMessage(data.reply, 'bot');
    } catch (error) {
        addMessage("Извините, произошла ошибка соединения", 'bot');
        console.error('Chat error:', error);
    }
}