// ====================================
// RecapSensei - Main Popup Logic
// Chrome 144+ Built-in AI (Global Constructors)
// ====================================

class RecapSensei {
  constructor() {
    this.imageFile = null;
    this.imageDataURL = null;
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Input elements
    this.imageInput = document.getElementById('imageInput');
    this.uploadArea = document.getElementById('uploadArea');
    this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
    this.imagePreview = document.getElementById('imagePreview');
    this.previewImg = document.getElementById('previewImg');
    this.removeImageBtn = document.getElementById('removeImage');
    this.subtitleInput = document.getElementById('subtitleInput');
    this.generateBtn = document.getElementById('generateBtn');

    // Section elements
    this.inputSection = document.getElementById('inputSection');
    this.loadingSection = document.getElementById('loadingSection');
    this.resultsSection = document.getElementById('resultsSection');
    this.statusText = document.getElementById('statusText');

    // Result elements
    this.summaryText = document.getElementById('summaryText');
    this.charactersList = document.getElementById('charactersList');
    this.tagsList = document.getElementById('tagsList');
    this.moodList = document.getElementById('moodList');
    this.blurbText = document.getElementById('blurbText');
    this.copyBtn = document.getElementById('copyBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.resetBtn = document.getElementById('resetBtn');
  }

  attachEventListeners() {
    // Image upload
    this.uploadPlaceholder.addEventListener('click', () => this.imageInput.click());
    this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
    this.removeImageBtn.addEventListener('click', () => this.removeImage());

    // Drag and drop
    this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

    // Generate button
    this.generateBtn.addEventListener('click', () => this.generateRecap());

    // Action buttons
    this.copyBtn.addEventListener('click', () => this.copyBlurb());
    this.shareBtn.addEventListener('click', () => this.shareBlurb());
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  // ====================================
  // Image Handling
  // ====================================

  handleImageSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.imageFile = file;
      this.displayImagePreview(file);
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      this.imageFile = file;
      this.displayImagePreview(file);
    }
  }

  displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageDataURL = e.target.result;
      this.previewImg.src = this.imageDataURL;
      this.uploadPlaceholder.classList.add('hidden');
      this.imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageFile = null;
    this.imageDataURL = null;
    this.imageInput.value = '';
    this.uploadPlaceholder.classList.remove('hidden');
    this.imagePreview.classList.add('hidden');
  }

  // ====================================
  // AI Processing
  // ====================================

  async generateRecap() {
    const subtitles = this.subtitleInput.value.trim();

    if (!this.imageFile && !subtitles) {
      alert('Please provide at least a screenshot or subtitles!');
      return;
    }

    try {
      // Show loading
      this.showLoading();

      // Check AI availability
      await this.checkAIAvailability();

      // Process subtitles if needed
      let processedSubtitles = subtitles;
      if (subtitles && subtitles.length > 200) {
        this.updateStatus('Summarizing subtitles...');
        processedSubtitles = await this.summarizeText(subtitles);
      }

      // Generate recap
      this.updateStatus('Analyzing content...');
      const recapData = await this.generateRecapWithAI(processedSubtitles);

      // Generate blurb
      this.updateStatus('Creating shareable blurb...');
      const blurb = await this.generateBlurb(recapData);

      // Show results
      this.displayResults({ ...recapData, blurb });

    } catch (error) {
      console.error('Error generating recap:', error);
      alert(`Error: ${error.message}\n\nPlease ensure Chrome Built-in AI is enabled at chrome://flags`);
      this.showInput();
    }
  }

  async checkAIAvailability() {
    this.updateStatus('Checking AI availability...');

    // Check if LanguageModel constructor exists (Chrome 144+)
    if (typeof LanguageModel === 'undefined') {
      throw new Error('Chrome Built-in AI is not available. Please ensure you have Chrome 127+ with Prompt API enabled at chrome://flags (#optimization-guide-on-device-model and #prompt-api-for-gemini-nano)');
    }

    try {
      // Test if we can create a session
      const testSession = await LanguageModel.create({ outputLanguage: 'en' });
      await testSession.destroy();
      this.updateStatus('AI ready!');
    } catch (error) {
      if (error.message.includes('not available')) {
        throw new Error('Gemini Nano model not downloaded. Please visit chrome://components and update "Optimization Guide On Device Model"');
      }
      throw error;
    }
  }

  async summarizeText(text) {
    try {
      // Check if Summarizer API exists
      if (typeof Summarizer === 'undefined') {
        console.log('Summarizer API not available, using LanguageModel fallback');
        return await this.summarizeWithLanguageModel(text);
      }

      const summarizer = await Summarizer.create({
        type: 'tl;dr',
        length: 'short',
        format: 'plain-text',
        outputLanguage: 'en'
      });

      const summary = await summarizer.summarize(text);
      await summarizer.destroy();
      return summary;

    } catch (error) {
      console.warn('Summarizer failed, using LanguageModel:', error);
      return await this.summarizeWithLanguageModel(text);
    }
  }

  async summarizeWithLanguageModel(text) {
    const session = await LanguageModel.create({ outputLanguage: 'en' });
    const summary = await session.prompt(`Summarize this dialogue in 2-3 sentences:\n\n${text}`);
    await session.destroy();
    return summary;
  }

  async generateRecapWithAI(subtitles) {
    const session = await LanguageModel.create({ outputLanguage: 'en' });

    const prompt = `You are RecapSensei, an anime episode analyzer. Based on the provided content, generate a detailed recap in JSON format.

${this.imageFile ? `Screenshot: ${this.imageFile.name}` : 'No screenshot provided'}
${subtitles ? `Dialogue/Subtitles:\n${subtitles}` : 'No subtitles provided'}

Generate a JSON response with this EXACT structure:
{
  "summary": "A detailed 2-3 sentence summary of the scene/episode",
  "characters": [
    {"name": "Character Name", "role": "What they're doing in this scene"}
  ],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "mood": ["Mood1", "Mood2", "Mood3"]
}

Guidelines:
- Summary should capture the key events and emotions
- List 2-4 main characters with their roles
- Tags should include themes, plot points, or genres (e.g., "Betrayal", "Action", "Romance")
- Mood should be 2-3 adjectives (e.g., "Tense", "Hopeful", "Dramatic")
- Output ONLY valid JSON, no additional text`;

    const response = await session.prompt(prompt);
    await session.destroy();

    // Parse JSON from response
    try {
      // Try to extract JSON if there's extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      // Return a fallback structure
      return {
        summary: response.substring(0, 200) + '...',
        characters: [{ name: 'Unknown', role: 'Main character' }],
        tags: ['Episode Recap'],
        mood: ['Dramatic']
      };
    }
  }

  async generateBlurb(recapData) {
    try {
      // Check if Writer API exists
      if (typeof Writer === 'undefined') {
        console.log('Writer API not available, using LanguageModel fallback');
        return this.generateBlurbWithLanguageModel(recapData);
      }

      const writer = await Writer.create({
        tone: 'casual',
        length: 'short',
        outputLanguage: 'en'
      });

      const blurb = await writer.write(
        `Create a tweet-length blurb (under 280 characters) for this anime scene: ${recapData.summary}. Make it engaging and include relevant emojis.`
      );
      
      await writer.destroy();
      return blurb;

    } catch (error) {
      console.warn('Writer failed, using LanguageModel:', error);
      return this.generateBlurbWithLanguageModel(recapData);
    }
  }

  async generateBlurbWithLanguageModel(recapData) {
    const session = await LanguageModel.create({ outputLanguage: 'en' });
    const blurb = await session.prompt(
      `Create a tweet-length blurb (under 280 characters) for this anime scene: ${recapData.summary}. Make it engaging and include 1-2 relevant emojis. Output only the blurb text.`
    );
    await session.destroy();
    return blurb.trim();
  }

  // ====================================
  // UI State Management
  // ====================================

  showLoading() {
    this.inputSection.classList.add('hidden');
    this.resultsSection.classList.add('hidden');
    this.loadingSection.classList.remove('hidden');
  }

  showResults() {
    this.inputSection.classList.add('hidden');
    this.loadingSection.classList.add('hidden');
    this.resultsSection.classList.remove('hidden');
  }

  showInput() {
    this.loadingSection.classList.add('hidden');
    this.resultsSection.classList.add('hidden');
    this.inputSection.classList.remove('hidden');
  }

  updateStatus(message) {
    this.statusText.textContent = message;
  }

  displayResults(data) {
    // Summary
    this.summaryText.textContent = data.summary;

    // Characters
    this.charactersList.innerHTML = '';
    data.characters.forEach(char => {
      const charDiv = document.createElement('div');
      charDiv.className = 'character-item';
      charDiv.innerHTML = `
        <div class="character-name">${char.name}</div>
        <div class="character-role">${char.role}</div>
      `;
      this.charactersList.appendChild(charDiv);
    });

    // Tags
    this.tagsList.innerHTML = '';
    data.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.textContent = tag;
      this.tagsList.appendChild(tagSpan);
    });

    // Mood
    this.moodList.innerHTML = '';
    data.mood.forEach(mood => {
      const moodSpan = document.createElement('span');
      moodSpan.className = 'tag';
      moodSpan.textContent = mood;
      this.moodList.appendChild(moodSpan);
    });

    // Blurb
    this.blurbText.textContent = data.blurb;

    this.showResults();
  }

  // ====================================
  // Action Handlers
  // ====================================

  async copyBlurb() {
    const blurbText = this.blurbText.textContent;
    
    try {
      await navigator.clipboard.writeText(blurbText);
      
      // Visual feedback
      this.copyBtn.classList.add('copied');
      const originalHTML = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;

      setTimeout(() => {
        this.copyBtn.classList.remove('copied');
        this.copyBtn.innerHTML = originalHTML;
      }, 2000);

    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  }

  shareBlurb() {
    const blurbText = this.blurbText.textContent;
    
    if (navigator.share) {
      navigator.share({
        text: blurbText,
        title: 'RecapSensei - Episode Recap'
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      // Fallback: open Twitter intent
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blurbText)}`;
      chrome.tabs.create({ url: tweetUrl });
    }
  }

  reset() {
    this.removeImage();
    this.subtitleInput.value = '';
    this.showInput();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RecapSensei();
});