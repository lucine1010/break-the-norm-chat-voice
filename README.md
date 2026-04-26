# 🥚 EggyTalk

EggyTalk is a social chat application that integrates AI-powered guidance to help users communicate more effectively in real-time conversations.

---

## 🧠 Overview

EggyTalk focuses on solving a common problem in social communication:  
users often don’t know how to respond in conversations, especially with new people.

Instead of generating full replies, EggyTalk introduces an AI-assisted system that suggests different communication strategies while preserving user control and tone.

---

## ⚙️ Tech Stack

### Frontend
- React (UI & component-based architecture)
- Vite (fast build tool & dev server)
- JavaScript (ES6+)
- HTML5 / CSS3

### APIs
- OpenAI API  
  - Used for conversation analysis and generating style-based suggestions  
  - Processes chat context + user profile to produce guided responses

- ElevenLabs API  
  - Text-to-speech for message playback  
  - Adds emotional and immersive layer to chat experience

### Deployment
- GitHub Pages (static hosting)
- GitHub Actions (CI/CD for build & deploy)

### Tools
- Figma (UI/UX design)
- Cursor (AI-assisted development)

---

## 🏗️ Architecture

The application follows a **client-driven architecture**:

1. User interacts with chat UI
2. On-demand AI calls (triggered by user actions only)
3. OpenAI processes:
   - chat history
   - selected communication mode
   - user tone (optional)
4. Response returned as structured suggestion
5. UI renders suggestion options
6. Optional ElevenLabs call for audio playback

### Key Design Decisions

- ❌ No automatic API calls during rendering (prevents over-calling)
- ✅ AI triggered only by explicit user interaction
- ✅ Separation between chat logic and AI suggestion layer
- ✅ Lightweight frontend with no heavy backend dependency (hackathon scope)

---

## 💬 Core Features

### 1. AI-Guided Conversation Modes
Users can select different communication styles:
- Safe
- Relatable
- Curious
- Unexpected

Each mode influences how AI generates suggestions.

---

### 2. Context-Aware Suggestions
AI considers:
- Current conversation
- User profile
- Matched user profile

This allows more relevant and situational responses.

---

### 3. User-Controlled Responses
Users can:
- Copy AI suggestions
- Edit responses before sending

This ensures AI does not replace user voice.

---

### 4. Voice Integration
- ElevenLabs TTS converts text → audio
- Per-message playback (no global triggers)
- Enhances emotional realism of chat

---

## 🧪 Challenges

- Managing API rate limits and avoiding duplicate calls
- Designing AI interaction without breaking chat flow
- Handling per-message audio state (instead of global state)
- Maintaining UI consistency under dynamic states
- Debugging environment variables for deployment (GitHub Pages)

---

## 🚀 Getting Started

```bash
# install dependencies
npm install

# run locally
npm run dev

# build project
npm run build
