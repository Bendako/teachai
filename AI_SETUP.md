# 🤖 AI Integration Setup Guide

## Environment Variables for AI Services

Add these environment variables to your `.env.local` file:

```env
# ===== OPENAI API =====
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# ===== ANTHROPIC (CLAUDE) API =====
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here

# ===== AI SERVICE CONFIGURATION =====
# Primary AI provider to use (openai or claude)
AI_PRIMARY_PROVIDER=claude

# Model configurations
OPENAI_MODEL=gpt-4o
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# AI generation settings
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
```

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add billing information if needed

### Anthropic (Claude) API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Add billing information if needed

## AI Provider Features

### Claude (Anthropic)
- **Strengths**: Better at understanding educational context, detailed lesson planning
- **Models Available**: claude-3-5-sonnet-20241022, claude-3-haiku-20240307
- **Best For**: Lesson plan generation, educational content analysis
- **Cost**: Generally cost-effective for educational use

### OpenAI GPT-4
- **Strengths**: Creative content generation, versatile responses
- **Models Available**: gpt-4o, gpt-4-turbo
- **Best For**: Creative activities, diverse lesson content
- **Cost**: Higher token costs but excellent quality

## Configuration Notes

1. **Primary Provider**: Set `AI_PRIMARY_PROVIDER` to your preferred service
2. **Fallback**: System will fallback to OpenAI if Claude fails
3. **Models**: Use the latest stable models for best results
4. **Tokens**: Adjust `AI_MAX_TOKENS` based on desired response length
5. **Temperature**: Lower values (0.3-0.5) for more consistent educational content

## Usage in Code

The AI services will be automatically configured based on these environment variables. The system will:

- Use the primary provider for lesson plan generation
- Fallback to the secondary provider if primary fails
- Log usage and costs for monitoring
- Cache responses to reduce API calls

## Testing Your Setup

After adding the environment variables:

1. Restart your development server
2. Generate a test lesson plan
3. Check the logs for successful AI API calls
4. Verify both providers work if configured

## Security Best Practices

- ✅ Never commit API keys to version control
- ✅ Use different API keys for development and production
- ✅ Monitor API usage and set billing alerts
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configurations

## Troubleshooting

### Common Issues:
- **Invalid API Key**: Double-check the key format and validity
- **Rate Limiting**: Implement proper retry logic with exponential backoff
- **Token Limits**: Adjust `AI_MAX_TOKENS` if responses are cut off
- **Model Availability**: Ensure you have access to the specified models

### Error Messages:
- `Invalid API key`: Check your API key format and validity
- `Rate limit exceeded`: Wait and retry, or upgrade your plan
- `Model not found`: Verify model name and availability
- `Insufficient credits`: Add billing information to your account 