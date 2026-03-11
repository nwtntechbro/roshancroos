// Initialize Firebase
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

// Mobile Navigation
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Load Upcoming Events
async function loadUpcomingEvents() {
    try {
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef.where('eventDate', '>=', new Date().toISOString().split('T')[0])
                                      .orderBy('eventDate')
                                      .limit(3)
                                      .get();
        
        const eventsGrid = document.getElementById('upcomingEvents');
        eventsGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const event = doc.data();
            const eventCard = `
                <div class="event-card">
                    <div class="event-image" style="background-image: url('${event.image || 'https://via.placeholder.com/400x200'}')"></div>
                    <div class="event-content">
                        <div class="event-date"><i class="far fa-calendar"></i> ${event.eventDate}</div>
                        <h3 class="event-title">${event.title}</h3>
                        <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                        <div class="event-price">$${event.ticketPrice}</div>
                        <a href="#" class="btn btn-primary btn-block">Register Now</a>
                    </div>
                </div>
            `;
            eventsGrid.innerHTML += eventCard;
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Load Programs
async function loadPrograms() {
    try {
        const programsRef = db.collection('programs');
        const snapshot = await programsRef.limit(4).get();
        
        const programsGrid = document.getElementById('programsList');
        programsGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const program = doc.data();
            const programCard = `
                <div class="program-card">
                    <div class="program-icon">
                        <i class="fas ${getProgramIcon(program.title)}"></i>
                    </div>
                    <h3 class="program-title">${program.title}</h3>
                    <p class="program-description">${program.description}</p>
                    <div class="program-details">
                        <span><i class="far fa-clock"></i> ${program.duration}</span>
                        <span><i class="fas fa-tag"></i> $${program.price}</span>
                    </div>
                    <a href="#" class="btn btn-primary">Learn More</a>
                </div>
            `;
            programsGrid.innerHTML += programCard;
        });
    } catch (error) {
        console.error('Error loading programs:', error);
    }
}

function getProgramIcon(title) {
    const icons = {
        'Leadership': 'fa-users-cog',
        'Business': 'fa-chart-line',
        'SaaS': 'fa-cloud',
        'Speaker': 'fa-microphone'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (title.includes(key)) return icon;
    }
    return 'fa-graduation-cap';
}

// Load Coaching Packages
async function loadCoachingPackages() {
    try {
        const packagesRef = db.collection('coaching_packages');
        const snapshot = await packagesRef.get();
        
        const packagesGrid = document.querySelector('.packages-grid');
        packagesGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const pkg = doc.data();
            const packageCard = `
                <div class="package-card" data-id="${doc.id}">
                    <div class="package-name">${pkg.title}</div>
                    <div class="package-price">$${pkg.price}</div>
                    <div class="package-duration">${pkg.duration}</div>
                    <p>${pkg.description}</p>
                </div>
            `;
            packagesGrid.innerHTML += packageCard;
        });
        
        // Add click handlers
        document.querySelectorAll('.package-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    } catch (error) {
        console.error('Error loading packages:', error);
    }
}

// Load Testimonials
async function loadTestimonials() {
    try {
        const testimonialsRef = db.collection('testimonials');
        const snapshot = await testimonialsRef.limit(3).get();
        
        const testimonialsGrid = document.querySelector('.testimonials-slider');
        testimonialsGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const testimonial = doc.data();
            const testimonialCard = `
                <div class="testimonial-card">
                    <div class="testimonial-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                        ${'<i class="far fa-star"></i>'.repeat(5 - testimonial.rating)}
                    </div>
                    <p class="testimonial-text">"${testimonial.review}"</p>
                    <div class="testimonial-author">
                        <div class="author-image" style="background-image: url('${testimonial.photo || 'https://via.placeholder.com/50'}')"></div>
                        <div class="author-info">
                            <h4>${testimonial.name}</h4>
                            <p>${testimonial.company}</p>
                        </div>
                    </div>
                </div>
            `;
            testimonialsGrid.innerHTML += testimonialCard;
        });
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Load Blog Posts
async function loadBlogPosts() {
    try {
        const blogRef = db.collection('articles');
        const snapshot = await blogRef.orderBy('publishDate', 'desc').limit(3).get();
        
        const blogGrid = document.getElementById('blogPosts');
        blogGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const postCard = `
                <div class="blog-card">
                    <div class="blog-image" style="background-image: url('${post.image || 'https://via.placeholder.com/400x200'}')"></div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span><i class="far fa-calendar"></i> ${post.publishDate}</span>
                            <span><i class="far fa-user"></i> ${post.author}</span>
                        </div>
                        <h3 class="blog-title">${post.title}</h3>
                        <p class="blog-excerpt">${post.content.substring(0, 100)}...</p>
                        <a href="#" class="btn btn-outline">Read More</a>
                    </div>
                </div>
            `;
            blogGrid.innerHTML += postCard;
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Load Media Content
async function loadMediaContent() {
    try {
        const mediaRef = db.collection('media');
        const snapshot = await mediaRef.limit(4).get();
        
        const mediaGrid = document.querySelector('.media-grid');
        mediaGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const media = doc.data();
            const mediaItem = `
                <div class="media-item">
                    <i class="fas ${media.type === 'video' ? 'fa-video' : media.type === 'podcast' ? 'fa-podcast' : 'fa-newspaper'}"></i>
                    <h4>${media.title}</h4>
                </div>
            `;
            mediaGrid.innerHTML += mediaItem;
        });
    } catch (error) {
        console.error('Error loading media:', error);
    }
}

// Load Company Info
async function loadCompanyInfo() {
    try {
        const companyRef = db.collection('company').doc('main_settings');
        const doc = await companyRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('companyAddress').textContent = data.address;
            document.getElementById('companyPhone').textContent = data.phone;
            document.getElementById('companyEmail').textContent = data.email;
        }
    } catch (error) {
        console.error('Error loading company info:', error);
    }
}

// Booking System
let currentStep = 1;
let selectedPackage = null;
let selectedDate = null;
let selectedTime = null;

document.getElementById('nextStep').addEventListener('click', () => {
    if (currentStep < 4) {
        if (validateStep(currentStep)) {
            document.getElementById(`step${currentStep}`).classList.add('hidden');
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.remove('hidden');
            document.getElementById('prevStep').disabled = false;
            
            // Update step indicators
            document.querySelectorAll('.step').forEach((step, index) => {
                if (index + 1 === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
            
            if (currentStep === 4) {
                updateBookingSummary();
            }
        }
    }
});

document.getElementById('prevStep').addEventListener('click', () => {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        document.getElementById('prevStep').disabled = currentStep === 1;
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
});

function validateStep(step) {
    switch(step) {
        case 1:
            if (!document.querySelector('.package-card.selected')) {
                alert('Please select a coaching package');
                return false;
            }
            return true;
        case 2:
            if (!selectedDate || !selectedTime) {
                alert('Please select date and time');
                return false;
            }
            return true;
        case 3:
            const form = document.getElementById('bookingDetailsForm');
            if (!form.checkValidity()) {
                alert('Please fill all required fields');
                return false;
            }
            return true;
        default:
            return true;
    }
}

function updateBookingSummary() {
    const packageCard = document.querySelector('.package-card.selected');
    const packageName = packageCard ? packageCard.querySelector('.package-name').textContent : '';
    const packagePrice = packageCard ? packageCard.querySelector('.package-price').textContent : '';
    
    const summary = `
        <div class="summary-item">
            <strong>Package:</strong> ${packageName} - ${packagePrice}
        </div>
        <div class="summary-item">
            <strong>Date:</strong> ${selectedDate}
        </div>
        <div class="summary-item">
            <strong>Time:</strong> ${selectedTime}
        </div>
        <div class="summary-item">
            <strong>Name:</strong> ${document.getElementById('fullName').value}
        </div>
        <div class="summary-item">
            <strong>Email:</strong> ${document.getElementById('email').value}
        </div>
    `;
    
    document.getElementById('bookingSummary').innerHTML = summary;
}

// Calendar functionality
function generateCalendar(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay(); // 0 = Sunday
    const monthLength = lastDay.getDate();
    
    let calendarHTML = '';
    
    // Adjust for Monday first day
    let startOffset = startingDay === 0 ? 6 : startingDay - 1;
    
    for (let i = 0; i < startOffset; i++) {
        calendarHTML += '<div class="calendar-day disabled"></div>';
    }
    
    for (let d = 1; d <= monthLength; d++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isAvailable = checkAvailability(dateString);
        
        calendarHTML += `
            <div class="calendar-day ${isAvailable ? '' : 'disabled'}" data-date="${dateString}">
                ${d}
            </div>
        `;
    }
    
    document.getElementById('calendarDays').innerHTML = calendarHTML;
    
    // Add click handlers
    document.querySelectorAll('.calendar-day:not(.disabled)').forEach(day => {
        day.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            selectedDate = day.dataset.date;
            loadTimeSlots(selectedDate);
        });
    });
}

function checkAvailability(date) {
    // This would check against blocked dates in Firebase
    // For demo, return true for all dates
    return true;
}

async function loadTimeSlots(date) {
    try {
        const slotsRef = db.collection('time_slots').doc('default_week');
        const doc = await slotsRef.get();
        
        if (doc.exists) {
            const slots = doc.data();
            const dayOfWeek = new Date(date).getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const daySlots = slots[dayNames[dayOfWeek]] || [];
            
            const slotsGrid = document.getElementById('timeSlots');
            slotsGrid.innerHTML = '';
            
            daySlots.forEach(slot => {
                const slotElement = `
                    <div class="time-slot" data-time="${slot}">
                        ${slot}
                    </div>
                `;
                slotsGrid.innerHTML += slotElement;
            });
            
            // Add click handlers
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');
                    selectedTime = slot.dataset.time;
                });
            });
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
    }
}

// Contact Form
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: e.target[0].value,
        email: e.target[1].value,
        subject: e.target[2].value,
        message: e.target[3].value,
        date: new Date().toISOString()
    };
    
    try {
        await db.collection('contacts').add(formData);
        alert('Message sent successfully!');
        e.target.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again.');
    }
});

// Newsletter Form
document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = e.target[0].value;
    
    try {
        await db.collection('newsletter').add({
            email: email,
            subscribedAt: new Date().toISOString(),
            status: 'active'
        });
        alert('Successfully subscribed to newsletter!');
        e.target.reset();
    } catch (error) {
        console.error('Error subscribing:', error);
        alert('Error subscribing. Please try again.');
    }
});

// Initialize all data loading
document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingEvents();
    loadPrograms();
    loadCoachingPackages();
    loadTestimonials();
    loadBlogPosts();
    loadMediaContent();
    loadCompanyInfo();
    
    // Initialize calendar with current month
    const now = new Date();
    generateCalendar(now.getMonth(), now.getFullYear());
    
    // Update calendar month display
    document.getElementById('currentMonth').textContent = 
        now.toLocaleString('default', { month: 'long', year: 'numeric' });
});
