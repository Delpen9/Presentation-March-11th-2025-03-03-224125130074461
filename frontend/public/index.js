function renderPDF(url) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => {
            pdfjsLib.getDocument(new Uint8Array(data)).promise.then(async (pdf) => {
                const pdfContainer = document.getElementById('pdf-container');
                pdfContainer.innerHTML = '';

                const scale = 0.9;  
                const outputScale = 4;

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    await pdf.getPage(pageNum).then(page => {
                        const viewport = page.getViewport({ scale: scale });

                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');

                        canvas.width = Math.floor(viewport.width * outputScale);
                        canvas.height = Math.floor(viewport.height * outputScale);
                        canvas.style.width = `${viewport.width}px`;
                        canvas.style.height = `${viewport.height}px`;

                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                            transform: [outputScale, 0, 0, outputScale, 0, 0]
                        };

                        return page.render(renderContext).promise.then(() => {
                            const slideWrapper = document.createElement('div');
                            slideWrapper.classList.add('slide-wrapper');

                            // Add the notes button
                            const notesButton = document.createElement('button');
                            notesButton.innerText = "View Notes";
                            notesButton.classList.add('notes-btn');
                            notesButton.setAttribute("data-slide", pageNum);
                            notesButton.onclick = () => openModal(pageNum);

                            slideWrapper.appendChild(canvas);
                            slideWrapper.appendChild(notesButton);
                            pdfContainer.appendChild(slideWrapper);
                        });
                    });
                }
            });
        })
        .catch(error => console.error('Error loading PDF:', error));
}

// Function to open the PDF in a new tab
function openPDF() {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';  // Opens in a new tab
    link.rel = 'noopener noreferrer';  // Security best practices
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to open the modal with the correct notes
function openModal(slideNum) {
    const modal = document.getElementById("notes-modal");
    const modalText = document.getElementById("modal-text");

    // Fetch notes dynamically
    modalText.innerText = slideNotes[slideNum] || "No notes available for this slide.";

    // Display modal with fade-in effect
    modal.style.display = "flex";
    modal.style.opacity = "0";
    setTimeout(() => modal.style.opacity = "1", 50);
}