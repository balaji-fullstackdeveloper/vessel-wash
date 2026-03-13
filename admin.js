let allPersons = [
    {name: "person 1", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 2", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 3", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 4", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 5", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 6", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 7", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 8", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 9", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 10", available: ["morning", "afternoon", "night", "weekend"]},
    {name: "person 11", available: ["morning", "afternoon", "night", "weekend"]}
];

let dutySchedule = [];
let workload = {};

function checkAuth() {
    const userType = localStorage.getItem("userType");
    if (userType !== "admin") {
        window.location.href = "admin-login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function goToUser() {
    window.location.href = "login.html";
}

function initializeWorkload() {
    allPersons.forEach(person => {
        workload[person.name] = 0;
    });
}

function showDuty() {
    const today = new Date();
    const todayFormatted = `${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;
    const todaySchedule = dutySchedule.find(s => s.date === todayFormatted);
    
    if (todaySchedule) {
        document.getElementById("morning").innerText = todaySchedule.morning || "No one assigned";
        document.getElementById("afternoon").innerText = todaySchedule.afternoon || "No one assigned";
        document.getElementById("night").innerText = todaySchedule.night || "No one assigned";
        const weekendElem = document.getElementById("weekend");
        if (weekendElem) {
            weekendElem.innerText = todaySchedule.weekend || "No one assigned";
        }
    } else {
        generateDutySchedule();
        showDuty();
    }
}

function generateDutySchedule() {
    dutySchedule = [];
    initializeWorkload();
    
    const today = new Date();
    
    for (let day = 0; day < 30; day++) { // Generate 30 days
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        const dateFormatted = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        const daySchedule = {date: dateFormatted};
        
        // Only assign "weekend" shift on Saturdays and Sundays
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const shiftsForDay = (dayOfWeek === 0 || dayOfWeek === 6)
            ? ["morning", "afternoon", "night", "weekend"]
            : ["morning", "afternoon", "night"];

        shiftsForDay.forEach(shift => {
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

function addPerson() {
    let name = document.getElementById("newPerson").value;
    
    if (name.trim() === "") {
        alert("Please enter a name");
        return;
    }
    
    const available = [];
    if (document.getElementById("availMorning").checked) available.push("morning");
    if (document.getElementById("availAfternoon").checked) available.push("afternoon");
    if (document.getElementById("availNight").checked) available.push("night");
    if (document.getElementById("availWeekend").checked) available.push("weekend");
    
    if (available.length === 0) {
        alert("Please select at least one available time");
        return;
    }
    
    allPersons.push({name: name, available: available});
    alert("Person Added: " + name + " (Available: " + available.join(", ") + ")");
    
    // Reset form
    document.getElementById("newPerson").value = "";
    document.getElementById("availMorning").checked = false;
    document.getElementById("availAfternoon").checked = false;
    document.getElementById("availNight").checked = false;
    document.getElementById("availWeekend").checked = false;
    
    populatePersonDropdown();
    generateDutySchedule();
    showDuty();
    analytics();
}

function populatePersonDropdown() {
    const removeDropdown = document.getElementById("personToRemove");
    const editDropdown = document.getElementById("personToEdit");
    
    removeDropdown.innerHTML = '<option value="">Select person to remove</option>';
    editDropdown.innerHTML = '<option value="">Select person to edit</option>';
    
    allPersons.forEach(person => {
        // Remove dropdown
        const removeOption = document.createElement("option");
        removeOption.value = person.name;
        removeOption.textContent = person.name + " (" + person.available.join(", ") + ")";
        removeDropdown.appendChild(removeOption);
        
        // Edit dropdown
        const editOption = document.createElement("option");
        editOption.value = person.name;
        editOption.textContent = person.name + " (" + person.available.join(", ") + ")";
        editDropdown.appendChild(editOption);
    });
}

function editPerson() {
    const editDropdown = document.getElementById("personToEdit");
    const personName = editDropdown.value;
    
    if (!personName || personName.trim() === "") {
        alert("Please select a person to edit");
        return;
    }
    
    const available = [];
    if (document.getElementById("editMorning").checked) available.push("morning");
    if (document.getElementById("editAfternoon").checked) available.push("afternoon");
    if (document.getElementById("editNight").checked) available.push("night");
    if (document.getElementById("editWeekend").checked) available.push("weekend");
    
    if (available.length === 0) {
        alert("Please select at least one available time");
        return;
    }
    
    // Find and update the person
    const personIndex = allPersons.findIndex(p => p.name === personName);
    if (personIndex !== -1) {
        allPersons[personIndex].available = available;
        alert("Updated " + personName + " availability to: " + available.join(", "));
        
        // Reset form
        editDropdown.value = "";
        document.getElementById("editMorning").checked = false;
        document.getElementById("editAfternoon").checked = false;
        document.getElementById("editNight").checked = false;
        document.getElementById("editWeekend").checked = false;
        
        populatePersonDropdown();
        generateDutySchedule();
        showDuty();
        analytics();
    } else {
        alert("Person not found: " + personName);
    }
}

// Add event listener to auto-fill checkboxes when person is selected
document.addEventListener('DOMContentLoaded', function() {
    const editDropdown = document.getElementById("personToEdit");
    if (editDropdown) {
        editDropdown.addEventListener('change', function() {
            const personName = this.value;
            if (personName) {
                const person = allPersons.find(p => p.name === personName);
                if (person) {
                    document.getElementById("editMorning").checked = person.available.includes("morning");
                    document.getElementById("editAfternoon").checked = person.available.includes("afternoon");
                    document.getElementById("editNight").checked = person.available.includes("night");
                    const weekendCheckbox = document.getElementById("editWeekend");
                    if (weekendCheckbox) {
                        weekendCheckbox.checked = person.available.includes("weekend");
                    }
                }
            } else {
                document.getElementById("editMorning").checked = false;
                document.getElementById("editAfternoon").checked = false;
                document.getElementById("editNight").checked = false;
                const weekendCheckbox = document.getElementById("editWeekend");
                if (weekendCheckbox) {
                    weekendCheckbox.checked = false;
                }
            }
        });
    }
});

function removePerson() {
    const dropdown = document.getElementById("personToRemove");
    const name = dropdown.value;
    
    if (!name || name.trim() === "") {
        alert("Please select a person to remove");
        return;
    }
    
    const initialLength = allPersons.length;
    allPersons = allPersons.filter(p => p.name !== name);
    
    if (allPersons.length < initialLength) {
        alert("Removed: " + name);
        delete workload[name];
        populatePersonDropdown();
        generateDutySchedule();
        showDuty();
        analytics();
    } else {
        alert("Person not found: " + name);
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

// Initialize admin app
window.onload = function() {
    if (checkAuth()) {
        initializeWorkload();
        populatePersonDropdown();
        generateDutySchedule();
        showDuty();
        analytics();
    }
};
