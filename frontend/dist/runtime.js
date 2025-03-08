// Load the PDF
const pdfUrl = '/presentation_march_11th.pdf';
renderPDF(pdfUrl);

let slideNotes = {}; // Object to store parsed notes

// Function to fetch and parse CSV file
function loadNotesFromCSV() {
    fetch("notes.csv")
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\n").slice(1); // Skip header row
            rows.forEach(row => {
                const [slide, notes] = row.split(",");
                if (slide && notes) {
                    slideNotes[parseInt(slide.trim())] = notes.trim();
                }
            });
        })
        .catch(error => console.error("Error loading CSV:", error));
}

// Load notes on page load
document.addEventListener("DOMContentLoaded", loadNotesFromCSV);

// Ensure modal doesn't open on page load
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("notes-modal");
    modal.style.display = "none";
});

// Function to close the modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("notes-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Close modal when clicking the "X"
document.querySelector(".close-modal").onclick = function() {
    document.getElementById("notes-modal").style.display = "none";
};

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById("notes-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};