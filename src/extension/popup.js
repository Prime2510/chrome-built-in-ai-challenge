// ====================================
// RecapSensei - Anime Episode Recapper
// Chrome 144+ Built-in AI (Global Constructors)
// ====================================

class RecapSensei {
  constructor() {
    this.imageFile = null;
    this.imageDataURL = null;
    this.currentAnime = null;
    this.currentEpisode = null;
    this.initializeElements();
    this.attachEventListeners();
    this.loadSavedRecaps();
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
    this.animeNameInput = document.getElementById('animeNameInput');
    this.episodeNumberInput = document.getElementById('episodeNumberInput');
    this.generateBtn = document.getElementById('generateBtn');

    // Section elements
    this.inputSection = document.getElementById('inputSection');
    this.loadingSection = document.getElementById('loadingSection');
    this.resultsSection = document.getElementById('resultsSection');
    this.statusText = document.getElementById('statusText');

    // Result elements
    this.episodeTitle = document.getElementById('episodeTitle');
    this.summaryText = document.getElementById('summaryText');
    this.keyMoments = document.getElementById('keyMoments');
    this.charactersList = document.getElementById('charactersList');
    this.plotProgress = document.getElementById('plotProgress');
    this.cliffhanger = document.getElementById('cliffhanger');
    this.blurbText = document.getElementById('blurbText');
    this.copyBtn = document.getElementById('copyBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.saveBtn = document.getElementById('saveBtn');
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
    this.saveBtn.addEventListener('click', () => this.saveRecap());
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  // ====================================
  // Storage Management
  // ====================================

  loadSavedRecaps() {
    const saved = localStorage.getItem('recapsensei_recaps');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }

  saveRecapToStorage(recapData) {
    const recaps = this.loadSavedRecaps();
    recaps.unshift({
      ...recapData,
      timestamp: Date.now(),
      anime: this.currentAnime,
      episode: this.currentEpisode
    });
    // Keep only last 50 recaps
    if (recaps.length > 50) recaps.pop();
    localStorage.setItem('recapsensei_recaps', JSON.stringify(recaps));
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
    this.currentAnime = this.animeNameInput.value.trim();
    this.currentEpisode = this.episodeNumberInput.value.trim();

    if (!this.imageFile && !subtitles) {
      alert('Please provide at least a screenshot or subtitles!');
      return;
    }

    if (!this.currentAnime) {
      alert('Please enter the anime name!');
      return;
    }

    try {
      this.showLoading();
      await this.checkAIAvailability();

      // Process subtitles if needed
      let processedSubtitles = subtitles;
      if (subtitles && subtitles.length > 300) {
        this.updateStatus('Condensing dialogue...');
        processedSubtitles = await this.summarizeText(subtitles);
      }

      // Generate episode recap
      this.updateStatus('Analyzing episode content...');
      const recapData = await this.generateEpisodeRecap(processedSubtitles);

      // Generate shareable blurb
      this.updateStatus('Creating shareable summary...');
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

    if (typeof LanguageModel === 'undefined') {
      throw new Error('Chrome Built-in AI is not available. Please ensure you have Chrome 127+ with Prompt API enabled at chrome://flags');
    }

    try {
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
      if (typeof Summarizer !== 'undefined') {
        const summarizer = await Summarizer.create({
          type: 'key-points',
          length: 'medium',
          format: 'plain-text',
          outputLanguage: 'en'
        });
        const summary = await summarizer.summarize(text);
        await summarizer.destroy();
        return summary;
      }
    } catch (error) {
      console.warn('Summarizer failed, using LanguageModel:', error);
    }

    const session = await LanguageModel.create({ outputLanguage: 'en' });
    const summary = await session.prompt(`Extract the key dialogue and events from this episode transcript, keeping important plot points:\n\n${text}`);
    await session.destroy();
    return summary;
  }

  async generateEpisodeRecap(subtitles) {
    const session = await LanguageModel.create({ outputLanguage: 'en' });

    const prompt = `You are RecapSensei, an anime episode recap specialist. Generate a comprehensive episode recap for anime viewers.

ANIME: ${this.currentAnime}
EPISODE: ${this.currentEpisode || 'Unknown'}
${this.imageFile ? `SCREENSHOT: Provided (${this.imageFile.name})` : 'NO SCREENSHOT'}
${subtitles ? `DIALOGUE/EVENTS:\n${subtitles}` : 'NO DIALOGUE PROVIDED'}

Create a detailed episode recap in JSON format with this structure:
{
  "episodeTitle": "A catchy title for this episode based on events",
  "summary": "2-3 sentence overview of what happened this episode",
  "keyMoments": [
    "First major event or revelation",
    "Second major event or revelation",
    "Third major event or revelation"
  ],
  "characters": [
    {"name": "Character Name", "action": "What they did this episode"},
    {"name": "Character Name", "action": "What they did this episode"}
  ],
  "plotProgress": "How did the main story arc advance? What changed?",
  "cliffhanger": "What question/tension will carry to next episode? Or 'None' if episode wrapped up"
}

IMPORTANT GUIDELINES:
- This is an EPISODE RECAP, not a scene description
- Focus on STORY PROGRESSION and PLOT DEVELOPMENTS
- Include character actions that MATTER to the story
- Highlight TWISTS, REVELATIONS, or IMPORTANT DECISIONS
- Key moments should be story beats, not visual descriptions
- Think like you're explaining to someone who missed the episode
- Be specific about what happened, not just what was shown

Output ONLY valid JSON.`;

    const response = await session.prompt(prompt);
    await session.destroy();

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      return {
        episodeTitle: "Episode Recap",
        summary: response.substring(0, 200) + '...',
        keyMoments: ["Unable to extract key moments"],
        characters: [{ name: 'Unknown', action: 'Appeared in episode' }],
        plotProgress: "Unable to analyze plot progression",
        cliffhanger: "None"
      };
    }
  }

  async generateBlurb(recapData) {
    try {
      if (typeof Writer !== 'undefined') {
        const writer = await Writer.create({
          tone: 'casual',
          length: 'short',
          outputLanguage: 'en'
        });

        const blurb = await writer.write(
          `Create an exciting tweet (under 280 chars) about this anime episode. Anime: ${this.currentAnime} Ep${this.currentEpisode}. Summary: ${recapData.summary}. Make it spoiler-free but intriguing! Add 1-2 emojis.`
        );
        
        await writer.destroy();
        return blurb;
      }
    } catch (error) {
      console.warn('Writer failed, using LanguageModel:', error);
    }

    const session = await LanguageModel.create({ outputLanguage: 'en' });
    const blurb = await session.prompt(
      `Create a spoiler-free, exciting tweet (under 280 characters) about ${this.currentAnime} Episode ${this.currentEpisode}. Summary: ${recapData.summary}. Make it hype! Add 1-2 emojis. Output only the tweet text.`
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
    // Episode title
    this.episodeTitle.textContent = `${this.currentAnime} - Episode ${this.currentEpisode || '?'}: ${data.episodeTitle}`;

    // Summary
    this.summaryText.textContent = data.summary;

    // Key moments
    this.keyMoments.innerHTML = '';
    data.keyMoments.forEach((moment, idx) => {
      const momentDiv = document.createElement('div');
      momentDiv.className = 'key-moment-item';
      momentDiv.innerHTML = `
        <span class="moment-number">${idx + 1}</span>
        <span class="moment-text">${moment}</span>
      `;
      this.keyMoments.appendChild(momentDiv);
    });

    // Characters
    this.charactersList.innerHTML = '';
    data.characters.forEach(char => {
      const charDiv = document.createElement('div');
      charDiv.className = 'character-item';
      charDiv.innerHTML = `
        <div class="character-name">${char.name}</div>
        <div class="character-role">${char.action}</div>
      `;
      this.charactersList.appendChild(charDiv);
    });

    // Plot progress
    this.plotProgress.textContent = data.plotProgress;

    // Cliffhanger
    this.cliffhanger.textContent = data.cliffhanger;

    // Blurb
    this.blurbText.textContent = data.blurb;

    // Store for saving
    this.currentRecapData = data;

    this.showResults();
  }

  // ====================================
  // Action Handlers
  // ====================================

  async copyBlurb() {
    const blurbText = this.blurbText.textContent;
    
    try {
      await navigator.clipboard.writeText(blurbText);
      
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
        title: `${this.currentAnime} - Episode ${this.currentEpisode}`
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blurbText)}`;
      chrome.tabs.create({ url: tweetUrl });
    }
  }

  saveRecap() {
    if (this.currentRecapData) {
      this.saveRecapToStorage(this.currentRecapData);
      
      this.saveBtn.classList.add('saved');
      const originalHTML = this.saveBtn.innerHTML;
      this.saveBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Saved!
      `;

      setTimeout(() => {
        this.saveBtn.classList.remove('saved');
        this.saveBtn.innerHTML = originalHTML;
      }, 2000);
    }
  }

  reset() {
    this.removeImage();
    this.subtitleInput.value = '';
    this.currentRecapData = null;
    this.showInput();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RecapSensei();
});