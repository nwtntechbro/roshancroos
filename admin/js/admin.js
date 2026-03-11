// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJMhojec6G1AkQJh0ifiendwrEIvYGYxQ",
    authDomain: "roshancroos-97cdd.firebaseapp.com",
    projectId: "roshancroos-97cdd",
    storageBucket: "roshancroos-97cdd.firebasestorage.app",
    messagingSenderId: "906840504110",
    appId: "1:906840504110:web:8a603e41bfd725be616cbf",
    measurementId: "G-3JFH2485YV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Check authentication
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('adminEmail').textContent = user.email;
        loadDashboardData();
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Navigation
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        link.parentElement.classList.add('active');
        
        // Show corresponding page
        const pageId = link.getAttribute('href').substring(1);
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        // Update page title
        document.getElementById('pageTitle').textContent = link.querySelector('span').textContent;
        
        // Load page-specific data
        loadPageData(pageId);
    });
});

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Total Bookings
        const bookingsSnapshot = await db.collection('bookings').get();
        document.getElementById('totalBookings').textContent = bookingsSnapshot.size;
        
        // Upcoming Events
        const eventsSnapshot = await db.collection('events')
            .where('eventDate', '>=', new Date().toISOString().split('T')[0])
            .get();
        document.getElementById('upcomingEvents').textContent = eventsSnapshot.size;
        
        // Total Users
        const usersSnapshot = await db.collection('users').get();
        document.getElementById('totalUsers').textContent = usersSnapshot.size;
        
        // Total Revenue
        const paymentsSnapshot = await db.collection('payments').get();
        let totalRevenue = 0;
        paymentsSnapshot.forEach(doc => {
            totalRevenue += doc.data().amount || 0;
        });
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        
        // Recent Bookings
        const recentBookings = await db.collection('bookings')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        const tbody = document.querySelector('#recentBookings tbody');
        tbody.innerHTML = '';
        
        recentBookings.forEach(doc => {
            const booking = doc.data();
            const row = `
                <tr>
                    <td>${booking.customerName}</td>
                    <td>${booking.packageId || 'N/A'}</td>
                    <td>${booking.date}</td>
                    <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                    <td>$${booking.amount || 0}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
        
        // Initialize Charts
        initCharts();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Initialize Charts
function initCharts() {
    // Bookings Chart
    const bookingsCtx = document.getElementById('bookingsChart').getContext('2d');
    new Chart(bookingsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Bookings',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#f7c35c',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#f7c35c'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Load Page Data
async function loadPageData(pageId) {
    switch(pageId) {
        case 'events':
            loadEvents();
            break;
        case 'programs':
            loadPrograms();
            break;
        case 'coaching':
            loadCoachingPackages();
            break;
        case 'bookings':
            loadAllBookings();
            break;
        case 'calendar':
            loadCalendarSettings();
            break;
        case 'blog':
            loadArticles();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

// Load Events
async function loadEvents() {
    try {
        const snapshot = await db.collection('events').orderBy('eventDate', 'desc').get();
        const tbody = document.getElementById('eventsTableBody');
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const event = doc.data();
            const row = `
                <tr>
                    <td>${event.title}</td>
                    <td>${event.eventDate}</td>
                    <td>${event.location}</td>
                    <td>$${event.ticketPrice}</td>
                    <td>${event.seats || 0}</td>
                    <td><span class="status-badge ${new Date(event.eventDate) > new Date() ? 'confirmed' : 'pending'}">
                        ${new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Past'}
                    </span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editEvent('${doc.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" onclick="deleteEvent('${doc.id}')"><i class="fas fa-trash"></i></button>
                            <button class="btn-view" onclick="viewEvent('${doc.id}')"><i class="fas fa-eye"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Load Programs
async function loadPrograms() {
    try {
        const snapshot = await db.collection('programs').get();
        const tbody = document.getElementById('programsTableBody');
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const program = doc.data();
            const row = `
                <tr>
                    <td>${program.title}</td>
                    <td>${program.duration}</td>
                    <td>$${program.price}</td>
                    <td>${program.trainer}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editProgram('${doc.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" onclick="deleteProgram('${doc.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading programs:', error);
    }
}

// Load Coaching Packages
async function loadCoachingPackages() {
    try {
        const snapshot = await db.collection('coaching_packages').get();
        const grid = document.getElementById('coachingPackagesGrid');
        grid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const pkg = doc.data();
            const card = `
                <div class="package-card">
                    <h4>${pkg.title}</h4>
                    <div class="package-price">$${pkg.price}</div>
                    <div class="package-duration">${pkg.duration}</div>
                    <p>${pkg.description}</p>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editPackage('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="deletePackage('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });
    } catch (error) {
        console.error('Error loading packages:', error);
    }
}

// Load All Bookings
async function loadAllBookings() {
    try {
        const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const booking = doc.data();
            const row = `
                <tr>
                    <td>${booking.customerName}</td>
                    <td>${booking.packageId || 'N/A'}</td>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                    <td><span class="status-badge ${booking.paymentStatus}">${booking.paymentStatus || 'pending'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-view" onclick="viewBooking('${doc.id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn-edit" onclick="updateBookingStatus('${doc.id}')"><i class="fas fa-check"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Load Calendar Settings
async function loadCalendarSettings() {
    try {
        const doc = await db.collection('time_slots').doc('default_week').get();
        const slots = doc.exists ? doc.data() : {
            monday: ['09:00', '11:00', '14:00', '16:00'],
            tuesday: ['09:00', '14:00'],
            wednesday: ['09:00', '11:00', '15:00'],
            thursday: ['10:00', '14:00', '16:30'],
            friday: ['09:00', '11:00'],
            saturday: [],
            sunday: []
        };
        
        const editor = document.getElementById('timeSlotsEditor');
        editor.innerHTML = '';
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const dayCard = `
                <div class="day-card">
                    <h4>${day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                    <div id="${day}Slots">
                        ${slots[day].map((slot, index) => `
                            <div class="slot-input">
                                <input type="time" value="${slot}" data-day="${day}" data-index="${index}">
                                <button class="btn-delete" onclick="removeSlot('${day}', ${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add-slot" onclick="addSlot('${day}')">
                        <i class="fas fa-plus"></i> Add Slot
                    </button>
                </div>
            `;
            editor.innerHTML += dayCard;
        });
        
        // Load Blocked Dates
        const blockedSnapshot = await db.collection('blocked_dates').get();
        const blockedTbody = document.getElementById('blockedDatesBody');
        blockedTbody.innerHTML = '';
        
        blockedSnapshot.forEach(doc => {
            const blocked = doc.data();
            const row = `
                <tr>
                    <td>${blocked.date}</td>
                    <td>${blocked.reason}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteBlockedDate('${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            blockedTbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading calendar settings:', error);
    }
}

// Load Articles
async function loadArticles() {
    try {
        const snapshot = await db.collection('articles').orderBy('publishDate', 'desc').get();
        const tbody = document.getElementById('articlesTableBody');
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const article = doc.data();
            const row = `
                <tr>
                    <td>${article.title}</td>
                    <td>${article.author}</td>
                    <td>${article.publishDate}</td>
                    <td><span class="status-badge confirmed">Published</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editArticle('${doc.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" onclick="deleteArticle('${doc.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

// Load Users
async function loadUsers() {
    try {
        const snapshot = await db.collection('users').get();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const user = doc.data();
            const row = `
                <tr>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td>${user.bookings ? user.bookings.length : 0}</td>
                    <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="status-badge confirmed">Active</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-view" onclick="viewUser('${doc.id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn-edit" onclick="editUser('${doc.id}')"><i class="fas fa-edit"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Save Website Settings
async function saveWebsiteSettings() {
    const settings = {
        websiteName: document.getElementById('websiteName').value,
        tagline: document.getElementById('tagline').value,
        primaryColor: document.getElementById('primaryColor').value,
        address: document.getElementById('address').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        social: {
            facebook: document.getElementById('facebook').value,
            twitter: document.getElementById('twitter').value,
            instagram: document.getElementById('instagram').value,
            linkedin: document.getElementById('linkedin').value
        },
        updatedAt: new Date().toISOString()
    };
    
    try {
        await db.collection('company').doc('main_settings').set(settings, { merge: true });
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
    }
}

// Save Time Slots
async function saveTimeSlots() {
    const slots = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        const daySlots = [];
        document.querySelectorAll(`#${day}Slots input`).forEach(input => {
            if (input.value) daySlots.push(input.value);
        });
        slots[day] = daySlots;
    });
    
    try {
        await db.collection('time_slots').doc('default_week').set(slots);
        alert('Time slots saved successfully!');
    } catch (error) {
        console.error('Error saving time slots:', error);
        alert('Error saving time slots');
    }
}

// Add Time Slot
function addSlot(day) {
    const container = document.getElementById(`${day}Slots`);
    const index = container.children.length;
    
    const slotDiv = document.createElement('div');
    slotDiv.className = 'slot-input';
    slotDiv.innerHTML = `
        <input type="time" data-day="${day}" data-index="${index}">
        <button class="btn-delete" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(slotDiv);
}

// Remove Time Slot
function removeSlot(day, index) {
    const slot = document.querySelector(`#${day}Slots input[data-index="${index}"]`).parentElement;
    slot.remove();
}

// Show Add Event Modal
function showAddEventModal() {
    document.getElementById('modalTitle').textContent = 'Add New Event';
    document.getElementById('eventForm').reset();
    document.getElementById('eventModal').style.display = 'block';
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event Form Submit
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        location: document.getElementById('eventLocation').value,
        eventDate: document.getElementById('eventDate').value,
        eventTime: document.getElementById('eventTime').value,
        ticketPrice: parseFloat(document.getElementById('eventPrice').value),
        seats: parseInt(document.getElementById('eventSeats').value),
        agenda: document.getElementById('eventAgenda').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        await db.collection('events').add(eventData);
        alert('Event added successfully!');
        closeModal('eventModal');
        loadEvents();
    } catch (error) {
        console.error('Error adding event:', error);
        alert('Error adding event');
    }
});

// Show Add Blocked Date Modal
function showAddBlockedDateModal() {
    const date = prompt('Enter date to block (YYYY-MM-DD):');
    const reason = prompt('Enter reason:');
    
    if (date && reason) {
        addBlockedDate(date, reason);
    }
}

async function addBlockedDate(date, reason) {
    try {
        await db.collection('blocked_dates').add({
            date: date,
            reason: reason,
            createdAt: new Date().toISOString()
        });
        alert('Date blocked successfully!');
        loadCalendarSettings();
    } catch (error) {
        console.error('Error blocking date:', error);
        alert('Error blocking date');
    }
}

// Delete functions
async function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            await db.collection('events').doc(id).delete();
            alert('Event deleted!');
            loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }
}

async function deleteProgram(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        try {
            await db.collection('programs').doc(id).delete();
            alert('Program deleted!');
            loadPrograms();
        } catch (error) {
            console.error('Error deleting program:', error);
        }
    }
}

async function deleteBlockedDate(id) {
    if (confirm('Are you sure you want to remove this blocked date?')) {
        try {
            await db.collection('blocked_dates').doc(id).delete();
            alert('Blocked date removed!');
            loadCalendarSettings();
        } catch (error) {
            console.error('Error removing blocked date:', error);
        }
    }
}

// Update current date
function updateDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

updateDate();
setInterval(updateDate, 60000);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
