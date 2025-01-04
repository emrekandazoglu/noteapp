// Kullanıcı yönetimi
let currentUser = null;
const users = JSON.parse(localStorage.getItem('users')) || [];

// Sayfa yüklendiğinde kontrol
window.onload = () => {
    checkAuth();
};

// Kimlik kontrolü
function checkAuth() {
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('container');
    
    if (!currentUser) {
        authContainer.style.display = 'flex';
        mainContainer.style.display = 'none';
        document.getElementById('login-box').classList.add('active');
    } else {
        authContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        document.getElementById('user-email').textContent = currentUser.email;
        displayNotes();
    }
}

// Auth box geçişi
function toggleAuth() {
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    loginBox.classList.toggle('active');
    registerBox.classList.toggle('active');
}

// Giriş yapma
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        checkAuth();
        openVideo(); // Başarılı girişten sonra video modalı göster
    } else {
        alert('Hatalı email veya şifre!');
    }
}

// Kayıt olma
function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;

    if (password !== confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
    }

    if (users.some(user => user.email === email)) {
        alert('Bu email adresi zaten kayıtlı!');
        return;
    }

    const newUser = { email, password, notes: [] };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    toggleAuth();
}

// Çıkış yapma
function logout() {
    currentUser = null;
    checkAuth();
}

// Not oluşturma popup'ı
function popup() {
    if (!currentUser) {
        alert('Not eklemek için giriş yapmalısınız!');
        return;
    }
    
    const popupContainer = document.createElement("div");
    popupContainer.id = "popupContainer";
    popupContainer.innerHTML = `
    <div>
        <h1>Yeni Not</h1>
        <textarea id="note-text" placeholder="Notunuzu yazın..."></textarea>
        <div>
            <label for="note-priority">Öncelik: </label>
            <select id="note-priority">
                <option value="Low">Düşük</option>
                <option value="Medium">Orta</option>
                <option value="High">Yüksek</option>
            </select>
        </div>
        <div>
            <label>
                <input type="checkbox" id="add-date"> Tarih Ekle
            </label>
        </div>
        <div>
            <h3>Renk Seçimi:</h3>
            <label><input type="radio" name="note-color" value="red" checked> Kırmızı</label>
            <label><input type="radio" name="note-color" value="blue"> Mavi</label>
            <label><input type="radio" name="note-color" value="green"> Yeşil</label>
        </div>
        <div id="btn-container">
            <button id="submitBtn" onclick="createNote()">Not Ekle</button>
            <button id="closeBtn" onclick="closePopup()">Kapat</button>
        </div>
    </div>
    `;
    document.body.appendChild(popupContainer);
}


// Popup kapatma
function closePopup() {
    const popupContainer = document.getElementById("popupContainer");
    if (popupContainer) {
        popupContainer.remove();
    }
}

// Not oluşturma
function createNote() {
    const noteText = document.getElementById("note-text").value.trim();
    const priority = document.getElementById("note-priority").value;
    const addDate = document.getElementById("add-date").checked;
    const color = document.querySelector('input[name="note-color"]:checked').value;

    if (noteText && currentUser) {
        const note = {
            id: new Date().getTime(), // Benzersiz ID
            text: noteText,
            priority,
            date: addDate ? new Date().toLocaleString() : null,
            color,
        };

        // Notu mevcut kullanıcının notlar listesine ekle
        currentUser.notes = currentUser.notes || [];
        currentUser.notes.push(note);

        // Kullanıcıyı güncelle ve localStorage'a kaydet
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));

        // Popup'ı kapat ve notları güncelle
        closePopup();
        displayNotes();
    } else {
        alert("Lütfen not içeriğini doldurun!");
    }
}


// Notları görüntüleme
function displayNotes() {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = ""; // Eski notları temizle

    if (currentUser && currentUser.notes && currentUser.notes.length > 0) {
        currentUser.notes.forEach((note) => {
            const listItem = document.createElement("li");
            listItem.className = note.color; // Renk sınıfını ata
            listItem.innerHTML = `
            <div class="note-header">
                <span class="note-priority ${note.priority.toLowerCase()}">${note.priority}</span>
                ${note.date ? `<span class="note-date">${note.date}</span>` : ""}
            </div>
            <span class="note-text">${note.text}</span>
            <div id="noteBtns-container">
                <button id="editBtn" onclick="editNote(${note.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button id="deleteBtn" onclick="deleteNote(${note.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            `;
            notesList.appendChild(listItem);
        });
    } else {
        notesList.innerHTML = "<p>Henüz bir not eklenmedi.</p>";
    }
}


// Not düzenleme
function editNote(noteId) {
    if (!currentUser) return;
    
    const noteToEdit = currentUser.notes.find((note) => note.id === noteId);

    if (noteToEdit) {
        const popupContainer = document.createElement("div");
        popupContainer.id = "popupContainer";
        popupContainer.innerHTML = `
        <div>
            <h1>Notu Düzenle</h1>
            <textarea id="note-text">${noteToEdit.text}</textarea>
            <div>
                <label for="note-priority">Öncelik: </label>
                <select id="note-priority">
                    <option value="Low" ${noteToEdit.priority === "Low" ? "selected" : ""}>Düşük</option>
                    <option value="Medium" ${noteToEdit.priority === "Medium" ? "selected" : ""}>Orta</option>
                    <option value="High" ${noteToEdit.priority === "High" ? "selected" : ""}>Yüksek</option>
                </select>
            </div>
            <div>
                <label>
                    <input type="checkbox" id="add-date" ${noteToEdit.date ? "checked" : ""}> Tarih Ekle
                </label>
            </div>
            <div id="btn-container">
                <button id="submitBtn" onclick="updateNote(${noteId})">Güncelle</button>
                <button id="closeBtn" onclick="closePopup()">Kapat</button>
            </div>
        </div>
        `;
        document.body.appendChild(popupContainer);
    }
}

// Not güncelleme
function updateNote(noteId) {
    if (!currentUser) return;

    const noteText = document.getElementById("note-text").value.trim();
    const priority = document.getElementById("note-priority").value;
    const addDate = document.getElementById("add-date").checked;
    const date = addDate ? new Date().toLocaleString() : null;

    if (noteText) {
        const noteIndex = currentUser.notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            currentUser.notes[noteIndex] = {
                ...currentUser.notes[noteIndex],
                text: noteText,
                priority,
                date,
            };

            const userIndex = users.findIndex(u => u.email === currentUser.email);
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            
            closePopup();
            displayNotes();
        }
    }
}

// Not silme
function deleteNote(noteId) {
    if (!currentUser) return;

    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
        currentUser.notes = currentUser.notes.filter((note) => note.id !== noteId);
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        
        displayNotes();
    }
}

// Video modal fonksiyonları
function openVideo() {
    const videoModal = document.getElementById("videoModal");
    videoModal.style.display = "flex";
}

function closeVideo() {
    const videoModal = document.getElementById("videoModal");
    videoModal.style.display = "none";
}

// Başlangıç işlemleri
displayNotes();
