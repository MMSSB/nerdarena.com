// // greetings.js

// // Listen for the initial load and any profile updates
// document.addEventListener('userDataLoaded', renderGreeting);
// document.addEventListener('userProfileUpdated', renderGreeting);

// function renderGreeting() {
//     const greetingContainer = document.querySelector('.feed-header');
//     const greetingTextEl = document.getElementById('smart-greeting-text');
    
//     // Exit if elements don't exist (e.g., we aren't on index.html) or data isn't loaded
//     if (!greetingContainer || !greetingTextEl || !window.currentUserData) return;

//     // 1. Read Firebase Settings (Default to true if they don't exist yet)
//     const isGreetingEnabled = window.currentUserData.greetingEnabled !== false; 
//     const isNameEnabled = window.currentUserData.greetingShowName !== false;

//     // 2. Handle the "Disable Smart Greetings" setting
//     if (!isGreetingEnabled) {
//         greetingContainer.style.display = 'none';
//         return; // Stop running
//     } else {
//         greetingContainer.style.display = 'block';
//     }

//     // 3. Generate the Smart Greeting
//     const hour = new Date().getHours();
    
//     // Time-based options
//     let timeGreeting = 'Good evening';
//     if (hour < 5) timeGreeting = 'Up late working';
//     else if (hour < 12) timeGreeting = 'Good morning';
//     else if (hour < 18) timeGreeting = 'Good afternoon';
    
//     // Casual options
//     const casualGreetings = ['Hi there', 'Welcome back', 'Hey', 'Ready to code', 'Great to see you', 'Hello'];
//     const randomCasual = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
    
//     // 50/50 Chance to use Time vs Casual
//     const useTime = Math.random() > 0.5;
//     let finalGreeting = useTime ? timeGreeting : randomCasual;
    
//     // 4. Handle the "Show Name" setting
//     if (isNameEnabled && window.currentUserData.fullname) {
//         const firstName = window.currentUserData.fullname.split(' ')[0];
//         finalGreeting += `, ${firstName}! 👋`;
//     } else {
//         finalGreeting += `! 👋`;
//     }
    
//     // Apply to DOM
//     greetingTextEl.innerText = finalGreeting;

// }






// greetings.js

document.addEventListener('userDataLoaded', renderGreeting);
document.addEventListener('userProfileUpdated', renderGreeting);

function renderGreeting() {
    const greetingContainer = document.getElementById('greeting-wrapper');
    const greetingTextEl = document.getElementById('smart-greeting-text');
    
    if (!greetingContainer || !greetingTextEl || !window.currentUserData) return;

    // 1. Read Firebase Settings
    const isGreetingEnabled = window.currentUserData.greetingEnabled !== false; 
    const isNameEnabled = window.currentUserData.greetingShowName !== false;
    const greetingStyle = window.currentUserData.greetingStyle || 'smart'; // Defaults to hybrid

    // 2. Hide completely if disabled
    if (!isGreetingEnabled) {
        greetingContainer.style.display = 'none';
        return; 
    } else {
        greetingContainer.style.display = 'block';
    }

    // 3. Generate the Greetings
    const hour = new Date().getHours();
    
    // Time-based
    let timeGreeting = 'Good evening';
    if (hour < 5) timeGreeting = 'Up late working';
    else if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    
    // Casual
    const casualGreetings = ['Hi there', 'Welcome back', 'Hey', 'Ready to code', 'Great to see you', 'Hello'];
    const randomCasual = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
    
    // Determine which to use based on the user's setting
    let useTime = true;
    if (greetingStyle === 'time') {
        useTime = true;
    } else if (greetingStyle === 'casual') {
        useTime = false;
    } else if (greetingStyle === 'smart') {
        // Hybrid: 50/50 Chance
        useTime = Math.random() > 0.5;
    }
    
    let finalGreeting = useTime ? timeGreeting : randomCasual;
    
    // 4. Append Name if enabled
    if (isNameEnabled && window.currentUserData.fullname) {
        const firstName = window.currentUserData.fullname.split(' ')[0];
        finalGreeting += `, ${firstName}! 👋`;
    } else {
        finalGreeting += `! 👋`;
    }
    
    // Apply to DOM
    greetingTextEl.innerText = finalGreeting;
}