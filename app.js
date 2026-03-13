let allPersons = [
    {name: "person 1", available: ["morning", "afternoon", "night"]},
    {name: "person 2", available: ["morning", "afternoon", "night"]},
    {name: "person 3", available: ["morning", "afternoon", "night"]},
    {name: "person 4", available: ["morning", "afternoon", "night"]},
    {name: "person 5", available: ["morning", "afternoon", "night"]},
    {name: "person 6", available: ["morning", "afternoon", "night"]},
    {name: "person 7", available: ["morning", "afternoon", "night"]},
    {name: "person 8", available: ["morning", "afternoon", "night"]},
    {name: "person 9", available: ["morning", "afternoon", "night"]},
    {name: "person 10", available: ["morning", "afternoon", "night"]},
    {name: "person 11", available: ["morning", "afternoon", "night"]}
];

let dutySchedule = [];
let workload = {}; // Track workload per person

function checkAuth() {
    const userType = localStorage.getItem("userType");
    if (!userType) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function goToAdmin() {
    window.location.href = "admin-login.html";
}

function initializeWorkload() {
    allPersons.forEach(person => {
        workload[person.name] = 0;
    });
}

function showDuty() {
    const today = new Date().toDateString();
    const todaySchedule = dutySchedule.find(s => s.date === today);
    
    if (todaySchedule) {
        document.getElementById("morning").innerText = todaySchedule.morning || "No one assigned";
        document.getElementById("afternoon").innerText = todaySchedule.afternoon || "No one assigned";
        document.getElementById("night").innerText = todaySchedule.night || "No one assigned";
    } else {
        generateDutySchedule();
        showDuty();
    }
}

function generateDutySchedule() {
    dutySchedule = [];
    initializeWorkload();
    
    const today = new Date();
    const shifts = ["morning", "afternoon", "night"];
    
    for (let day = 0; day < 30; day++) { // Generate 30 days
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        const dateStr = date.toDateString();
        
        const daySchedule = {date: dateStr};
        
        shifts.forEach(shift => {
            const assignedPerson = findBestPerson(shift);
            if (assignedPerson) {
                daySchedule[shift] = assignedPerson.name;
                workload[assignedPerson.name]++;
            }
        });
        
        dutySchedule.push(daySchedule);
    }
}

function findBestPerson(shift) {
    const availablePersons = allPersons.filter(person => 
        person.available.includes(shift)
    );
    
    if (availablePersons.length === 0) return null;
    
    // Find person with minimum workload
    let bestPerson = availablePersons[0];
    let minWorkload = workload[bestPerson.name];
    
    availablePersons.forEach(person => {
        if (workload[person.name] < minWorkload) {
            bestPerson = person;
            minWorkload = workload[person.name];
        }
    });
    
    return bestPerson;
}

function generateWeeklySchedule() {
    const scheduleBody = document.getElementById("scheduleBody");
    scheduleBody.innerHTML = "";
    
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toDateString();
        
        const row = document.createElement("tr");
        
        // Format date
        const dateDisplay = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const daySchedule = dutySchedule.find(s => s.date === dateStr);
        
        row.innerHTML = `
            <td>${dateDisplay}</td>
            <td>${daySchedule?.morning || "No one assigned"}</td>
            <td>${daySchedule?.afternoon || "No one assigned"}</td>
            <td>${daySchedule?.night || "No one assigned"}</td>
        `;
        
        scheduleBody.appendChild(row);
    }
}

function setReminder() {
    let date = document.getElementById("reminderDate").value;
    alert("Reminder set for " + date);
}

function analytics() {
    let stats = "";
    
    stats += `Total persons: ${allPersons.length}<br>`;
    stats += "<strong>Workload Distribution:</strong><br>";
    
    // Sort by workload
    const sortedWorkload = Object.entries(workload).sort((a, b) => b[1] - a[1]);
    sortedWorkload.forEach(([name, count]) => {
        stats += `${name}: ${count} shifts<br>`;
    });
    
    document.getElementById("stats").innerHTML = stats;
}

// Initialize app
window.onload = function() {
    if (checkAuth()) {
        initializeWorkload();
        showDuty();
        generateWeeklySchedule();
        analytics();
    }
};