# RecapSensei ✨

**AI-Powered Anime Episode Recapper** using Chrome's Built-in Multimodal AI

Transform anime screenshots and subtitles into instant, shareable episode summaries using Chrome's cutting-edge on-device AI capabilities.

---

## 🎯 What It Does

RecapSensei analyzes anime episode content (screenshots + subtitles) and generates:

- **📝 Episode Summary** - Concise 2-3 sentence recap of the scene
- **👥 Key Characters** - Main characters and their roles in the scene
- **🏷️ Tags** - Themes, plot points, and genres (e.g., "Betrayal", "Action")
- **🎭 Mood** - Emotional tone descriptors (e.g., "Tense", "Hopeful")
- **🐦 Shareable Blurb** - Tweet-ready summary with emojis (< 280 characters)

---

## 🚀 Features

### Multimodal AI Processing
- **Image Analysis** - Upload episode screenshots for visual context
- **Text Processing** - Paste subtitles or dialogue for content analysis
- **Intelligent Summarization** - Automatically condenses long subtitle blocks

### Chrome Built-in AI APIs Used
1. **Prompt API** - Multimodal analysis (image + text → structured JSON)
2. **Summarizer API** - Condenses lengthy subtitle text
3. **Writer API** - Generates tweet-sized shareable blurbs

### User Experience
- 🎨 **Beautiful UI** - Gradient design with smooth animations
- 📱 **Drag & Drop** - Easy screenshot upload
- 📋 **One-Click Copy** - Copy blurb to clipboard instantly
- 🔗 **Share Button** - Direct Twitter/social sharing
- ⚡ **Fast Processing** - On-device AI, no external API calls

---

## 📦 Installation

### Prerequisites
- **Chrome 127+** with Built-in AI features enabled
- AI model must be downloaded (happens automatically on first use)

### Enable Chrome AI Features (if needed)
1. Navigate to `chrome://flags`
2. Enable these flags:
   - `#optimization-guide-on-device-model`
   - `#prompt-api-for-gemini-nano`
   - `#summarization-api-for-gemini-nano`
   - `#writer-api-for-gemini-nano`
3. Restart Chrome
4. Visit `chrome://components` and ensure "Optimization Guide On Device Model" is downloaded

### Install Extension
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `RecapSensei` folder
6. Pin the extension to your toolbar

---

## 🎮 Usage

### Basic Workflow
1. **Upload Screenshot** - Drag & drop or click to browse
2. **Paste Subtitles** (Optional) - Add episode dialogue for better context
3. **Click "Generate Recap"** - AI analyzes and generates results
4. **Copy/Share** - Use your recap across social media

### Example Input
**Screenshot:** Episode climax scene with characters facing off  
**Subtitles:**
```
"I won't give up! Not until I've protected everyone!"
"You still don't understand... true strength comes from within."
```

### Example Output
```json
{
  "summary": "In this intense confrontation, the protagonist faces their rival in a moonlit courtyard. The dialogue reveals deep backstory of betrayal and conflicting ideologies about protecting loved ones.",
  "characters": [
    {"name": "Protagonist", "role": "Determined to prove their resolve"},
    {"name": "Rival", "role": "Questions the protagonist's methods"}
  ],
  "tags": ["Confrontation", "Character Development", "Emotional Climax"],
  "mood": ["Tense", "Introspective", "Dramatic"],
  "blurb": "When ideals clash under moonlight, neither hero nor rival can turn back. A moment that changes everything. 🌙⚔️ #AnimeRecap"
}
```

---

## 🏗️ Project Structure

```
RecapSensei/
├── manifest.json       # Extension configuration
├── popup.html          # Main UI structure
├── popup.js            # Core logic & AI integration
├── styles.css          # Beautiful gradient styling
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🔧 Technical Details

### AI API Integration

#### 1. Prompt API (Multimodal Analysis)
```javascript
const session = await ai.languageModel.create();
const response = await session.prompt(promptText);
```
- Analyzes screenshots + subtitles together
- Returns structured JSON output
- Supports multimodal understanding

#### 2. Summarizer API (Text Condensing)
```javascript
const summarizer = await ai.summarizer.create({
  type: 'tl;dr',
  length: 'short',
  format: 'plain-text'
});
const summary = await summarizer.summarize(longText);
```
- Condenses subtitle blocks > 200 characters
- Fallback to Prompt API if unavailable

#### 3. Writer API (Blurb Generation)
```javascript
const writer = await ai.writer.create({
  tone: 'casual',
  length: 'short'
});
const blurb = await writer.write(promptText);
```
- Generates tweet-sized content
- Adds engaging emojis automatically

### Error Handling
- Graceful fallbacks for missing APIs
- Availability checks before processing
- User-friendly error messages
- Console logging for debugging

---

## 🎨 Design Philosophy

### Visual Identity
- **Gradient Background** - Purple/indigo theme (anime aesthetic)
- **Glassmorphism** - Frosted glass cards with backdrop blur
- **Golden Accents** - CTA button with gradient animation
- **Smooth Transitions** - Micro-animations for polish

### UX Principles
- **Progressive Disclosure** - Show only relevant UI states
- **Immediate Feedback** - Loading states, status updates
- **Accessibility** - High contrast, semantic HTML
- **Mobile-First** - Responsive design (450px width)

---

## 🏆 Competition Categories

Perfect for:
- ✅ **Best Multimodal** - Image + text analysis
- ✅ **Most Helpful** - Saves time for anime fans
- ✅ **Best Use of AI APIs** - Uses all 3 APIs effectively
- ✅ **Best Design** - Polished, modern UI

---

## 🐛 Known Limitations

- **Chrome 127+ Required** - Won't work on older versions
- **Model Download** - First use requires downloading AI model (~1GB)
- **On-Device Only** - No cloud processing (privacy-focused but requires capable hardware)
- **English Output** - Currently optimized for English language output

---

## 🚀 Future Enhancements

- [ ] Support for video clips (frame extraction)
- [ ] Multi-language support (Japanese, Chinese, etc.)
- [ ] Episode tracking / watchlist integration
- [ ] Export to Notion/Markdown
- [ ] Community sharing platform
- [ ] Batch processing for multiple episodes

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🙏 Acknowledgments

- Powered by Gemini Nano on-device model
- Inspired by the anime community's love for sharing moments

---

## 📞 Support

Found a bug or have a feature request? Open an issue on GitHub!

**Made with ❤️ for anime fans everywhere** ✨
