// app.js - very similar to the extension popup logic
const webRun = document.getElementById('webRun');
const webOut = document.getElementById('webOut');
const webText = document.getElementById('webText');
const webImage = document.getElementById('webImage');


webRun.addEventListener('click', async () => {
    webOut.textContent = 'Preparing model...';
    // PSEUDOCODE: mirror the extension logic
    try {
        const session = await LanguageModel.create({ expectedInputs: [{ type: 'text' }] });
        const res = await session.prompt(`Summarize:\n${webText.value || '[no text]'}`);
        webOut.textContent = JSON.stringify(res, null, 2);
    } catch (e) {
        webOut.textContent = 'Model error: ' + e.message;
    }
});