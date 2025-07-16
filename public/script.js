// Global Variables
let currentUser = null;
let socket = null;
let calendar = null;

// DOM Elements
const authSection = document.getElementById('authSection');
const appointmentSection = document.getElementById('appointmentSection');
const chatSection = document.getElementById('chatSection');
const doctorCabinet = document.getElementById('doctorCabinet');
const navLinks = document.querySelectorAll('#navLinks a');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupEventListeners();
    hideAllSections();
    showSection('home');
});

function hideAllSections() {
    authSection.style.display = 'none';
    appointmentSection.style.display = 'none';
    chatSection.style.display = 'none';
    doctorCabinet.style.display = 'none';
}

// Check if user is logged in
function checkAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
        verifyToken(token);
    }
}

function verifyToken(token) {
    fetch('/api/auth/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            currentUser = data.user;
            setupAuthenticatedUI();
            initializeSocket();
        }
    })
    .catch(() => {
        localStorage.removeItem('token');
    });
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });

    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Appointment form
    document.querySelectorAll('input[name="appointmentType"]').forEach(radio => {
        radio.addEventListener('change', updateAppointmentTypeUI);
    });

    document.getElementById('doctorSpecialty').addEventListener('change', loadDoctors);
    document.getElementById('bookAppointmentForm').addEventListener('submit', bookAppointment);

    // Chat
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    document.getElementById('sendFileBtn').addEventListener('click', uploadFile);
    document.getElementById('refreshAppointmentsBtn').addEventListener('click', loadDoctorAppointments);
}

function updateAppointmentTypeUI() {
    document.getElementById('durationField').style.display = 
        document.querySelector('input[name="appointmentType"]:checked').value === 'video' ? 'block' : 'none';
}

// Show specific section
function showSection(section) {
    hideAllSections();

    switch(section) {
        case 'home':
            if (currentUser) {
                showSection(currentUser.role === 'doctor' ? 'doctor' : 'appointments');
            } else {
                showAuthSection('login');
            }
            break;
        case 'login':
            showAuthSection('login');
            break;
        case 'register':
            showAuthSection('register');
            break;
        case 'appointments':
            appointmentSection.style.display = 'block';
            loadAppointments();
            initCalendar();
            break;
        case 'chat':
            chatSection.style.display = 'block';
            break;
        case 'doctor':
            doctorCabinet.style.display = 'block';
            loadDoctorAppointments();
            break;
    }

    updateActiveNavLink(section);
}

function showAuthSection(formType) {
    authSection.style.display = 'block';
    document.getElementById('loginForm').style.display = formType === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = formType === 'register' ? 'block' : 'none';
}

function updateActiveNavLink(section) {
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });
}

// Authentication handlers
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            setupAuthenticatedUI();
            initializeSocket();
            showSection(currentUser.role === 'doctor' ? 'doctor' : 'appointments');
        } else {
            showError(data.error || 'Ошибка входа');
        }
    })
    .catch(() => {
        showError('Ошибка соединения');
    });
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            alert('Регистрация успешна! Теперь войдите в систему.');
            showSection('login');
        } else {
            showError(data.error || 'Ошибка регистрации');
        }
    })
    .catch(() => {
        showError('Ошибка соединения');
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    if (socket) socket.disconnect();
    setupUnauthenticatedUI();
    showSection('home');
}

function showError(message) {
    alert(message); // Replace with your preferred error display method
}

// UI State Management
function setupAuthenticatedUI() {
    document.getElementById('authLinks').style.display = 'none';
    document.getElementById('userMenu').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.role === 'doctor') {
        document.querySelector('[data-section="doctor"]').style.display = 'inline-block';
    }
}

function setupUnauthenticatedUI() {
    document.getElementById('authLinks').style.display = 'block';
    document.getElementById('userMenu').style.display = 'none';
}

// Appointment functions
function loadDoctors() {
    const specialty = document.getElementById('doctorSpecialty').value;
    if (!specialty) return;

    fetch(`/api/doctors?specialty=${specialty}`)
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('doctorSelect');
        select.innerHTML = data.doctors.map(doctor => 
            `<option value="${doctor.id}">${doctor.name}</option>`
        ).join('');
        select.disabled = false;
    })
    .catch(() => {
        showError('Ошибка загрузки врачей');
    });
}

function bookAppointment(e) {
    e.preventDefault();
    
    const appointmentData = {
        doctorId: document.getElementById('doctorSelect').value,
        type: document.querySelector('input[name="appointmentType"]:checked').value,
        date: document.getElementById('appointmentDate').value,
        duration: document.getElementById('appointmentDuration').value,
        notes: document.getElementById('appointmentNotes').value,
        patientId: currentUser.id
    };

    fetch('/api/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(appointmentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Запись успешно создана!');
            loadAppointments();
        } else {
            showError(data.error || 'Ошибка при создании записи');
        }
    })
    .catch(() => {
        showError('Ошибка соединения');
    });
}

function loadAppointments() {
    fetch('/api/appointments', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        renderAppointments(data.appointments, 'appointmentsList');
    })
    .catch(() => {
        showError('Ошибка загрузки записей');
    });
}

function renderAppointments(appointments, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = appointments.map(appointment => `
        <div class="appointment-card">
            <h4>${formatDate(appointment.date)}</h4>
            <p>Тип: ${getAppointmentType(appointment.type)}</p>
            <p>Доктор: ${appointment.doctorName}</p>
            <p>Статус: ${appointment.status}</p>
            <div class="appointment-actions">
                ${appointment.status === 'pending' ? `
                <button onclick="cancelAppointment('${appointment.id}')">Отменить</button>
                <button onclick="rescheduleAppointment('${appointment.id}')">Перенести</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function initCalendar() {
    const calendarEl = document.getElementById('appointmentCalendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        dateClick: function(info) {
            document.getElementById('appointmentDate').value = info.dateStr + 'T10:00';
        },
        events: '/api/appointments/calendar'
    });
    calendar.render();
}

// Chat functions
function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        if (currentUser) {
            socket.emit('authenticate', { token: localStorage.getItem('token') });
        }
    });

    socket.on('newMessage', addMessage);
    socket.on('newFile', addFileMessage);
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    socket.emit('sendMessage', {
        content: message,
        appointmentId: getCurrentAppointmentId()
    });

    addMessage({
        sender: currentUser.id,
        content: message,
        timestamp: new Date()
    });

    input.value = '';
}

function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    if (fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('appointmentId', getCurrentAppointmentId());

    fetch('/api/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fileInput.value = '';
        }
    })
    .catch(() => {
        showError('Ошибка загрузки файла');
    });
}

function addMessage(message) {
    const isCurrentUser = message.sender === currentUser.id;
    const messagesContainer = document.getElementById('chatMessages');
    
    messagesContainer.innerHTML += `
        <div class="message ${isCurrentUser ? 'sent' : 'received'}">
            <div class="message-content">${message.content}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addFileMessage(file) {
    const messagesContainer = document.getElementById('chatMessages');
    
    messagesContainer.innerHTML += `
        <div class="message ${file.sender === currentUser.id ? 'sent' : 'received'}">
            <div class="file-message">
                <i class="fas fa-file"></i>
                <a href="${file.url}" target="_blank">${file.name}</a>
            </div>
            <div class="message-time">${formatTime(file.timestamp)}</div>
        </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getCurrentAppointmentId() {
    // Implement logic to get current appointment ID from UI
    return 'current-appointment-id'; // Replace with actual implementation
}

// Doctor specific functions
function loadDoctorAppointments() {
    fetch('/api/appointments/doctor', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        renderAppointments(data.appointments, 'upcomingAppointments');
    })
    .catch(() => {
        showError('Ошибка загрузки записей');
    });
}

// Appointment actions
function cancelAppointment(appointmentId) {
    if (!confirm('Вы уверены, что хотите отменить запись?')) return;

    fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Запись отменена');
            currentUser.role === 'doctor' ? loadDoctorAppointments() : loadAppointments();
        }
    })
    .catch(() => {
        showError('Ошибка отмены записи');
    });
}

function rescheduleAppointment(appointmentId) {
    const newDate = prompt('Введите новую дату и время (YYYY-MM-DDTHH:MM):');
    if (!newDate) return;

    fetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newDate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Запись перенесена');
            loadAppointments();
        }
    })
    .catch(() => {
        showError('Ошибка переноса записи');
    });
}

function approveAppointment(appointmentId) {
    fetch(`/api/appointments/${appointmentId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Запись подтверждена');
            loadDoctorAppointments();
        }
    })
    .catch(() => {
        showError('Ошибка подтверждения записи');
    });
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getAppointmentType(type) {
    const types = {
        'in-person': 'Личный прием',
        'video': 'Видеоконсультация',
        'chat': 'Чат-консультация'
    };
    return types[type] || type;
}