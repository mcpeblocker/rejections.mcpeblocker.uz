# AI Integration Guide 🤖

This document outlines where and how to integrate AI features into the Rejection Platform.

## 🎯 AI Integration Points

### 1. Rejection Reflection Generation

**Location**: `backend/routes/rejections.js`

**Current State**: Placeholder comment marked with `TODO`

**Integration Point** (Line ~77):
```javascript
// TODO: AI reflection generation hook
// This is where you would call an AI service to generate reflection
// Example: const aiReflection = await generateAIReflection(title, notes, reflection);
```

**Suggested Implementation**:

```javascript
// Create a new file: backend/services/aiService.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateAIReflection(title, notes, userReflection) {
  const prompt = `
You are a supportive coach helping someone process a rejection experience.

Rejection: ${title}
Context: ${notes || 'No additional context'}
User's thoughts: ${userReflection || 'No reflection yet'}

Provide a brief, encouraging reflection (2-3 sentences) that:
1. Validates their experience
2. Highlights a growth opportunity
3. Offers a positive perspective

Keep it warm, genuine, and empowering.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI reflection error:', error);
    return null;
  }
}

module.exports = { generateAIReflection };
```

**Usage in rejections.js**:
```javascript
const { generateAIReflection } = require('../services/aiService');

// After creating rejection
if (process.env.OPENAI_API_KEY) {
  const aiReflection = await generateAIReflection(title, notes, reflection);
  
  if (aiReflection) {
    await db.query(
      'UPDATE rejections SET ai_reflection = $1 WHERE id = $2',
      [aiReflection, rejection.id]
    );
  }
}
```

### 2. Analytics Insights

**Location**: `backend/routes/analytics.js`

**Current State**: Basic insights with TODO marker

**Integration Point** (Line ~66):
```javascript
// TODO: AI-generated insights
// This is where you would call an AI service to generate personalized insights
// Example: const insights = await generateInsights(result.rows);
```

**Suggested Implementation**:

```javascript
// In backend/services/aiService.js
async function generateInsights(rejectionsData) {
  const summary = rejectionsData.map(r => 
    `${r.rejection_type}: ${r.count} rejections`
  ).join(', ');

  const prompt = `
Analyze this user's rejection patterns and provide 2-3 actionable insights:

${summary}

Provide insights that:
1. Identify patterns
2. Suggest areas for growth
3. Celebrate persistence
4. Offer strategic advice

Format as JSON array of objects with 'type' and 'message' fields.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('AI insights error:', error);
    return [];
  }
}
```

### 3. Gmail Integration (Future)

**Suggested Approach**:

1. **OAuth Setup**:
   - Register app with Google Cloud Console
   - Enable Gmail API
   - Get OAuth credentials

2. **Backend Route**: `backend/routes/gmail.js`

```javascript
const { google } = require('googleapis');

// OAuth flow
router.get('/connect', authMiddleware, async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly']
  });

  res.json({ authUrl });
});

// Scan for rejections
async function scanForRejections(accessToken) {
  const gmail = google.gmail({ version: 'v1', auth: accessToken });
  
  const keywords = [
    'unfortunately',
    'not selected',
    'decided to move forward',
    'other candidates',
    'not a fit'
  ];

  // Search emails with rejection keywords
  const query = keywords.map(k => `"${k}"`).join(' OR ');
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50
  });

  // Parse and suggest rejections
  // User must approve before logging
}
```

3. **Frontend Flow**:
   - Settings page with "Connect Gmail" button
   - User authorizes app
   - App scans for potential rejections
   - Shows list for user approval
   - Only approved rejections are logged

## 📦 Required Packages

Add to `backend/package.json`:

```json
{
  "dependencies": {
    "openai": "^4.20.0",
    "googleapis": "^129.0.0"
  }
}
```

## 🔐 Environment Variables

Add to `.env`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Google OAuth (for Gmail)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback
```

## 🎨 Frontend Integration

### Reflection Display

**Location**: `frontend/src/components/Rejections/WallOfRejections.js`

Already has UI for `ai_reflection` field in modal:

```javascript
{selectedRejection.aiReflection && (
  <div className="detail-section">
    <strong>AI Reflection:</strong>
    <p className="ai-reflection-text">{selectedRejection.aiReflection}</p>
  </div>
)}
```

### Loading States

Add to `RejectionForm.js`:

```javascript
const [aiGenerating, setAiGenerating] = useState(false);

// After submission
if (data.aiReflection) {
  setAiGenerating(false);
  // Show AI reflection
}
```

## 🧪 Testing AI Integration

1. **Get API Key**: Sign up at OpenAI
2. **Set Environment**: Add key to `.env`
3. **Test Generation**: Log a rejection
4. **Check Database**: Verify `ai_reflection` column
5. **View in UI**: Check rejection details modal

## 💡 AI Enhancement Ideas

1. **Sentiment Analysis**: Track emotional trends
2. **Pattern Recognition**: Identify rejection patterns
3. **Success Prediction**: Suggest high-potential opportunities
4. **Personalized Advice**: Context-aware recommendations
5. **Goal Suggestions**: AI-powered goal setting
6. **Peer Matching**: Connect users with similar experiences

## 🚨 Privacy & Ethics

- **User Consent**: Always ask before AI processing
- **Data Privacy**: Don't share personal data with AI
- **Transparency**: Show when AI is used
- **User Control**: Allow disabling AI features
- **Data Retention**: Clear policy on AI data storage

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Claude API Docs](https://docs.anthropic.com/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

**Ready to integrate AI?** Start with reflection generation - it's the quickest win! 🚀
