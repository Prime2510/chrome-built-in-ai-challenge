// DOM elements
const imageInput = document.getElementById('imageInput');
const textInput = document.getElementById('textInput');
const runBtn = document.getElementById('runBtn');
const status = document.getElementById('status');
const output = document.getElementById('output');

// State variables
let selectedImage = null;
let imageBase64 = null;

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateRunButton();
});

function setupEventListeners() {
    // Image input change handler
    imageInput.addEventListener('change', handleImageSelection);
    
    // Text input change handler
    textInput.addEventListener('input', updateRunButton);
    
    // Run button click handler
    runBtn.addEventListener('click', handleGenerateRecap);
    
    // Drag and drop handlers for image input
    imageInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    imageInput.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files.length > 0) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
}

async function handleImageSelection(event) {
    const file = event.target.files[0];
    if (file) {
        await handleImageFile(file);
    }
}

async function handleImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showStatus('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showStatus('Image file too large. Please select an image under 10MB.', 'error');
        return;
    }
    
    try {
        selectedImage = file;
        imageBase64 = await convertFileToBase64(file);
        showStatus(`Image selected: ${file.name} (${formatFileSize(file.size)})`, 'success');
        updateRunButton();
    } catch (error) {
        console.error('Error processing image:', error);
        showStatus('Error processing image file.', 'error');
        selectedImage = null;
        imageBase64 = null;
    }
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix to get just the base64 string
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateInputs() {
    const hasImage = selectedImage !== null;
    const hasText = textInput.value.trim().length > 0;
    
    return {
        isValid: hasImage || hasText,
        hasImage,
        hasText
    };
}

function updateRunButton() {
    const validation = validateInputs();
    runBtn.disabled = !validation.isValid;
    
    if (!validation.isValid) {
        showStatus('Please provide either an image or text input.', 'warning');
    } else if (validation.hasImage && validation.hasText) {
        showStatus('Ready to generate recap from image and text.', 'ready');
    } else if (validation.hasImage) {
        showStatus('Ready to generate recap from image.', 'ready');
    } else if (validation.hasText) {
        showStatus('Ready to generate recap from text.', 'ready');
    }
}

async function handleGenerateRecap() {
    const validation = validateInputs();
    
    if (!validation.isValid) {
        showStatus('Please provide either an image or text input.', 'error');
        return;
    }
    
    try {
        runBtn.disabled = true;
        output.textContent = '';
        
        // Step 1: Check model availability
        showStatus('Checking model availability...', 'loading');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate check delay
        
        const modelStatus = await checkModelAvailability();
        
        if (modelStatus.needsDownload) {
            // Step 2: Download model if needed
            showStatus('Downloading model... This may take a few minutes.', 'loading');
            await downloadModel();
        }
        
        // Step 3: Generate recap
        showStatus('Running AI model...', 'loading');
        
        const inputData = prepareInputData(validation);
        const result = await generateRecap(inputData);
        
        // Display result
        output.textContent = result;
        showStatus('Recap generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating recap:', error);
        showStatus(`Error: ${error.message}`, 'error');
        output.textContent = `Error generating recap: ${error.message}`;
    } finally {
        runBtn.disabled = false;
        updateRunButton();
    }
}

async function checkModelAvailability() {
    try {
        // Check if Chrome's built-in AI is available
        if (!window.ai || !window.ai.languageModel) {
            throw new Error('Chrome built-in AI not available. Please use Chrome Canary with AI features enabled.');
        }
        
        const capabilities = await window.ai.languageModel.capabilities();
        
        return {
            available: capabilities.available === 'readily',
            needsDownload: capabilities.available === 'after-download'
        };
    } catch (error) {
        throw new Error('Failed to check model availability: ' + error.message);
    }
}

async function downloadModel() {
    try {
        // Create a session which will trigger model download if needed
        const session = await window.ai.languageModel.create();
        await session.destroy();
    } catch (error) {
        throw new Error('Failed to download model: ' + error.message);
    }
}

function prepareInputData(validation) {
    const inputData = {
        hasImage: validation.hasImage,
        hasText: validation.hasText,
        text: validation.hasText ? textInput.value.trim() : null
    };
    
    if (validation.hasImage) {
        inputData.image = {
            file: selectedImage,
            base64: imageBase64,
            name: selectedImage.name,
            type: selectedImage.type,
            size: selectedImage.size
        };
    }
    
    return inputData;
}

async function generateRecap(inputData) {
    try {
        const session = await window.ai.languageModel.create();
        
        let prompt = "Generate a short, engaging recap based on the following content:\n\n";
        
        if (inputData.hasText) {
            prompt += `Text/Subtitles:\n${inputData.text}\n\n`;
        }
        
        if (inputData.hasImage) {
            // For now, we'll add a placeholder for image processing
            // In a real implementation, you'd need to handle multimodal input
            // or extract text from image using OCR
            prompt += `Image provided: ${inputData.image.name} (${formatFileSize(inputData.image.size)})\n`;
            prompt += "Note: Image analysis would be performed here with multimodal AI or OCR.\n\n";
        }
        
        prompt += "Create a concise, entertaining recap that captures the key moments and emotions. Keep it under 150 words.";
        
        const result = await session.prompt(prompt);
        await session.destroy();
        
        return result;
    } catch (error) {
        throw new Error('Failed to generate recap: ' + error.message);
    }
}

function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status-${type}`;
    
    // Clear success/ready messages after a delay
    if (type === 'success' || type === 'ready') {
        setTimeout(() => {
            if (status.textContent === message) {
                status.textContent = '';
                status.className = '';
            }
        }, 3000);
    }
}

// Utility function to extract text from image using OCR (placeholder)
async function extractTextFromImage(imageBase64) {
    // This would be implemented using an OCR service or library
    // For now, return placeholder text
    return "[OCR text extraction would be implemented here]";
}

// Utility function to generate alt text for image (placeholder)
async function generateImageAltText(imageBase64) {
    // This would be implemented using an image analysis service
    // For now, return placeholder text
    return "[Image alt text generation would be implemented here]";
}
