
document.getElementById("resume-checker-file-input").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        document.querySelector(".custom-file-upload").textContent = file.name;
    }
});




function toggleArticle() {
    const content = document.getElementById("article-content");
    content.style.display = content.style.display === "block" ? "none" : "block";
}

function showLoader() {
    document.getElementById("resume-checker-loading").style.display = "block";
}

function hideLoader() {
    document.getElementById("resume-checker-loading").style.display = "none";
}

function handleFileUpload() {
    const fileInput = document.getElementById("resume-checker-file-input");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a resume file.");
        return;
    }

    showLoader();

    const fileType = file.type;

    if (fileType === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function () {
            const typedarray = new Uint8Array(reader.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
                let allText = "";
                let loadPagePromises = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    loadPagePromises.push(
                        pdf.getPage(i).then(function (page) {
                            return page.getTextContent().then(function (textContent) {
                                const pageText = textContent.items.map(item => item.str).join(" ");
                                allText += pageText + " ";
                            });
                        })
                    );
                }

                Promise.all(loadPagePromises).then(() => {
                    setTimeout(() => {
                        checkResumeScore(allText.toLowerCase());
                        hideLoader();
                    }, 10000);
                });
            });
        };
        reader.readAsArrayBuffer(file);

    } else if (fileType === "text/plain") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result.toLowerCase();
            setTimeout(() => {
                checkResumeScore(text);
                hideLoader();
            }, 10000);
        };
        reader.readAsText(file);
    } else {
        alert("Unsupported file type. Please upload a .txt or .pdf file.");
        hideLoader();
    }
}

function checkResumeScore(text) {
    let score = 0;
    let feedback = [];
    let missing = [];

    const criteria = [
        { keyword: "email", points: 10, message: "Includes contact info" },
        { keyword: "experience", points: 15, message: "Includes work experience" },
        { keyword: "skills", points: 15, message: "Includes skills section" },
        { keyword: "summary", points: 10, message: "Includes summary/about section" },
        { keyword: "project", points: 10, message: "Includes projects" },
        { keyword: "education", points: 10, message: "Includes education section" },
        { keyword: "-", points: 10, message: "Uses bullet points" },
        { keyword: "certification", points: 5, message: "Mentions certifications" },
        { keyword: "internship", points: 5, message: "Includes internship experience" },
        { keyword: "linkedin", points: 5, message: "Mentions LinkedIn profile" },
        { keyword: "github", points: 5, message: "Includes GitHub or portfolio link" },
        { keyword: "achievement", points: 5, message: "Mentions achievements or awards" },
        { keyword: "responsible", points: 5, message: "Describes responsibilities" },
        { keyword: "leadership", points: 5, message: "Mentions leadership or team experience" },
        { keyword: "python", points: 3, message: "Mentions Python" },
        { keyword: "java", points: 3, message: "Mentions Java" },
        { keyword: "sql", points: 3, message: "Mentions SQL or database" }
    ];

    criteria.forEach(c => {
        if (text.includes(c.keyword)) {
            score += c.points;
            feedback.push(`<li class='positive-feedback'>${c.message}</li>`);
        } else {
            missing.push(`<li class='negative-feedback'>Missing: ${c.message}</li>`);
        }
    });

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 600) {
        score += 10;
        feedback.push("<li class='positive-feedback'>Proper resume length</li>");
    } else {
        missing.push("<li class='negative-feedback'>Resume might be too short or too long</li>");
    }

    const fullFeedback = feedback.concat(missing);

    document.getElementById("resume-checker-result").innerHTML = `
      <p>Your Resume Score: <strong>${score}/100</strong></p>
      <ul>${fullFeedback.join('')}</ul>
    `;
}

