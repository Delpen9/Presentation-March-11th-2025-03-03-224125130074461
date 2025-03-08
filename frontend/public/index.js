async function loadCSV(csvFile) {
    const response = await fetch(csvFile);
    const data = await response.text();
    const rows = data.split("\n").map(row => row.split(","));
    return rows;
}

async function renderPDF(url) {
    try {
        const [additionalResources, codeExamples] = await Promise.all([
            loadCSV("additional_resources.csv"),
            loadCSV("code_examples.csv")
        ]);

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

                                // Title and lines
                                const titleContainer = document.createElement('div');
                                titleContainer.classList.add('title-container');

                                const hrTop = document.createElement('hr');
                                const slideTitle = document.createElement('div');
                                slideTitle.classList.add('slide-title');
                                slideTitle.innerText = `_slide[${pageNum - 1}]`;
                                const hrBottom = document.createElement('hr');

                                titleContainer.appendChild(hrTop);
                                titleContainer.appendChild(slideTitle);
                                titleContainer.appendChild(hrBottom);

                                // Notes button
                                const notesButton = document.createElement('button');
                                notesButton.innerText = "View Notes";
                                notesButton.classList.add('notes-btn');
                                // notesButton.setAttribute("data-slide", pageNum);
                                notesButton.onclick = () => openModal(pageNum);

                                // Additional Resources button
                                const additionalResourcesBtn = document.createElement('button');
                                additionalResourcesBtn.innerText = "Additional Resources";
                                additionalResourcesBtn.classList.add('additional-resources-btn');
                                additionalResourcesBtn.style.backgroundColor = "purple";
                                additionalResourcesBtn.style.color = "white";
                                additionalResourcesBtn.onclick = () => {
                                    alert(`Resources: ${additionalResources[pageNum - 1] || "No additional resources available"}`);
                                };

                                // Code Example button
                                const codeExampleBtn = document.createElement('button');
                                codeExampleBtn.innerText = "Code Example";
                                codeExampleBtn.classList.add('code-example-btn');
                                codeExampleBtn.style.backgroundColor = "green";
                                codeExampleBtn.style.color = "white";
                                codeExampleBtn.onclick = () => {
                                    const url = codeExamples[pageNum - 1] ? codeExamples[pageNum - 1][0].trim() : "";
                                    if (url) {
                                        window.open(url, "_blank");
                                    } else {
                                        alert("No code example available for this slide.");
                                    }
                                };

                                // Buttons container
                                const buttonsContainer = document.createElement('div');
                                buttonsContainer.classList.add('buttons-container');
                                buttonsContainer.appendChild(notesButton);
                                buttonsContainer.appendChild(additionalResourcesBtn);
                                buttonsContainer.appendChild(codeExampleBtn);

                                // Append elements
                                slideWrapper.appendChild(titleContainer);
                                slideWrapper.appendChild(canvas);
                                slideWrapper.appendChild(notesButton);
                                slideWrapper.appendChild(buttonsContainer);
                                pdfContainer.appendChild(slideWrapper);
                            });
                        });
                    }
                });
            })
            .catch(error => console.error('Error loading PDF:', error));
    } catch (error) {
        console.error("Error loading CSV files:", error);
    }
}

// Function to open the PDF in a new tab
function downloadPDF() {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';  // Opens in a new tab
    link.rel = 'noopener noreferrer';  // Security best practices
    link.download = 'presentation_march_11th.pdf';
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