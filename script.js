document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === "pdf") {
        renderPDF(URL.createObjectURL(file));
    } else if (fileType === "docx") {
        renderDOCX(file);
    } else {
        alert("Chỉ hỗ trợ file PDF và DOCX!");
    }
});

// 📌 Hiển thị file PDF
const renderPDF = async (url) => {
    const container = document.getElementById("thumbnails");
    container.innerHTML = ""; // Xóa thumbnails cũ
    document.getElementById("pdf-render").style.display = "block";
    document.getElementById("doc-content").style.display = "none";

    const pdf = await pdfjsLib.getDocument(url).promise;
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        // Thumbnail
        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = 100;
        thumbCanvas.height = 100 * (viewport.height / viewport.width);
        const thumbContext = thumbCanvas.getContext("2d");

        await page.render({ canvasContext: thumbContext, viewport }).promise;
        container.appendChild(thumbCanvas);

        thumbCanvas.addEventListener("click", () => {
            renderPage(pdf, pageNum);
        });

        if (pageNum === 1) {
            renderPage(pdf, 1); // Hiển thị trang đầu tiên
        }
    }
};

// 📌 Render từng trang PDF
const renderPage = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.getElementById("pdf-render");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
};

// 📌 Hiển thị file DOCX
const renderDOCX = (file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        mammoth.convertToHtml({ arrayBuffer })
            .then(function (result) {
                document.getElementById("pdf-render").style.display = "none";
                document.getElementById("doc-content").style.display = "block";
                document.getElementById("doc-content").innerHTML = result.value;
            })
            .catch(console.error);
    };
    reader.readAsArrayBuffer(file);
};
