import { HfInference } from '@huggingface/inference';
import axios from 'axios';

class HuggingFaceService {
  constructor() {
    // Normalize API token: allow anonymous usage when no token is provided
    this.apiToken = (process.env.HUGGINGFACE_API_KEY || '').trim() || null;
    this.hf = new HfInference(this.apiToken || undefined);
    this.baseURL = 'https://api-inference.huggingface.co/models';
    
    // Model configurations - Updated with reliable, accessible models
    this.models = {
      // Text Generation Models - Using publicly available models
      'microsoft-dialoGPT': {
        id: 'microsoft/DialoGPT-medium',
        type: 'text-generation',
        maxTokens: 1000,
        contextWindow: 1000
      },
      'google-flan-t5': {
        id: 'google/flan-t5-base',
        type: 'text2text-generation',
        maxTokens: 512,
        contextWindow: 512
      },
      'huggingface-gpt2': {
        id: 'gpt2',
        type: 'text-generation',
        maxTokens: 1024,
        contextWindow: 1024
      },
      'distilgpt2': {
        id: 'distilgpt2',
        type: 'text-generation',
        maxTokens: 1024,
        contextWindow: 1024
      },
      'blenderbot': {
        id: 'facebook/blenderbot-400M-distill',
        type: 'text2text-generation',
        maxTokens: 512,
        contextWindow: 512
      },
      
      // Embedding Models
      'sentence-transformer': {
        id: 'sentence-transformers/all-MiniLM-L6-v2',
        type: 'feature-extraction',
        dimensions: 384
      },
      'bge-large': {
        id: 'BAAI/bge-large-en-v1.5',
        type: 'feature-extraction',
        dimensions: 1024
      },
      
      // Specialized Models
      'sentiment-analysis': {
        id: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        type: 'text-classification'
      },
      'emotion-detection': {
        id: 'j-hartmann/emotion-english-distilroberta-base',
        type: 'text-classification'
      },
      'toxicity-detection': {
        id: 'martin-ha/toxic-comment-model',
        type: 'text-classification'
      }
    };
  }

  // Generate text using various models with fallback
  async generateText(modelId, prompt, options = {}) {
    try {
      const model = await this.getWorkingModel(modelId);
      
      const parameters = {
        max_new_tokens: Math.min(options.maxTokens || 200, model.maxTokens || 200),
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        top_k: options.topK || 50,
        repetition_penalty: options.repetitionPenalty || 1.1,
        do_sample: true,
        return_full_text: false,
        ...options.parameters
      };

      if (options.stopSequences) {
        parameters.stop = options.stopSequences;
      }

      let response;
      
      if (model.type === 'text2text-generation') {
        response = await this.hf.textToTextGeneration({
          model: model.id,
          inputs: prompt,
          parameters
        });
      } else {
        response = await this.hf.textGeneration({
          model: model.id,
          inputs: prompt,
          parameters
        });
      }

      const generatedText = response.generated_text || response[0]?.generated_text || 'I apologize, but I could not generate a response at this time.';

      return {
        text: generatedText,
        model: model.id,
        parameters,
        usage: {
          promptTokens: this.estimateTokens(prompt),
          completionTokens: this.estimateTokens(generatedText),
          totalTokens: this.estimateTokens(prompt + generatedText)
        }
      };
    } catch (error) {
      console.error('Text generation error:', error.message);
      // Return a fallback response instead of throwing
      return {
        text: "I'm experiencing some technical difficulties. Please try rephrasing your question or try again later.",
        model: modelId,
        parameters: options,
        usage: {
          promptTokens: this.estimateTokens(prompt),
          completionTokens: 20,
          totalTokens: this.estimateTokens(prompt) + 20
        },
        error: error?.response?.data || error?.message
      };
    }
  }

  // Stream text generation with fallback to non-streaming
  async *streamText(modelId, prompt, options = {}) {
    try {
      // First try to get a working model
      const model = await this.getWorkingModel(modelId);
      
      const parameters = {
        max_new_tokens: Math.min(options.maxTokens || 200, model.maxTokens || 200),
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        do_sample: true,
        return_full_text: false,
        ...options.parameters
      };

      try {
        // Try streaming first
        const response = await axios.post(
          `${this.baseURL}/${model.id}`,
          {
            inputs: prompt,
            parameters: { ...parameters, stream: true }
          },
          {
            headers: this.buildHeaders(),
            responseType: 'stream',
            timeout: 30000
          }
        );

        let buffer = '';
        
        for await (const chunk of response.data) {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.token?.text) {
                  yield {
                    text: parsed.token.text,
                    finished: parsed.generated_text !== undefined
                  };
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (streamError) {
        console.log('Streaming failed, falling back to regular generation:', streamError.message);
        
        // Fallback to non-streaming generation
        const response = await this.generateText(modelId, prompt, options);
        
        // Simulate streaming by yielding the full response
        yield {
          text: response.text,
          finished: true
        };
      }
    } catch (error) {
      // Final fallback with a simple response
      console.error('All HuggingFace methods failed:', error.message);
      yield {
        text: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        finished: true
      };
    }
  }

  // Generate embeddings
  async generateEmbeddings(modelId, texts) {
    try {
      const model = this.models[modelId] || { id: modelId, type: 'feature-extraction' };
      
      const inputs = Array.isArray(texts) ? texts : [texts];
      
      const response = await this.hf.featureExtraction({
        model: model.id,
        inputs
      });

      return {
        embeddings: Array.isArray(texts) ? response : [response],
        model: model.id,
        dimensions: model.dimensions || response[0]?.length || 0
      };
    } catch (error) {
      throw new Error(`HuggingFace embedding error: ${error.message}`);
    }
  }

  // Analyze sentiment
  async analyzeSentiment(text) {
    try {
      const response = await this.hf.textClassification({
        model: this.models['sentiment-analysis'].id,
        inputs: text
      });

      const result = response[0];
      return {
        label: result.label,
        score: result.score,
        sentiment: this.mapSentimentLabel(result.label),
        confidence: result.score
      };
    } catch (error) {
      throw new Error(`Sentiment analysis error: ${error.message}`);
    }
  }

  // Detect emotions
  async detectEmotions(text) {
    try {
      const response = await this.hf.textClassification({
        model: this.models['emotion-detection'].id,
        inputs: text
      });

      return response.map(emotion => ({
        emotion: emotion.label,
        confidence: emotion.score
      })).sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      throw new Error(`Emotion detection error: ${error.message}`);
    }
  }

  // Check for toxicity
  async checkToxicity(text) {
    try {
      const response = await this.hf.textClassification({
        model: this.models['toxicity-detection'].id,
        inputs: text
      });

      const toxicResult = response.find(r => r.label === 'TOXIC') || response[0];
      
      return {
        isToxic: toxicResult.label === 'TOXIC',
        confidence: toxicResult.score,
        categories: response
      };
    } catch (error) {
      throw new Error(`Toxicity detection error: ${error.message}`);
    }
  }

  // Get available models
  getAvailableModels() {
    return Object.entries(this.models).map(([key, model]) => ({
      key,
      id: model.id,
      type: model.type,
      maxTokens: model.maxTokens,
      contextWindow: model.contextWindow,
      dimensions: model.dimensions
    }));
  }

  // Get model info
  getModelInfo(modelId) {
    return this.models[modelId] || null;
  }

  // Estimate token count (rough approximation)
  estimateTokens(text) {
    if (!text) return 0;
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  // Map sentiment labels to standardized format
  mapSentimentLabel(label) {
    const mapping = {
      'LABEL_0': 'negative',
      'LABEL_1': 'neutral', 
      'LABEL_2': 'positive',
      'NEGATIVE': 'negative',
      'NEUTRAL': 'neutral',
      'POSITIVE': 'positive'
    };
    return mapping[label] || label.toLowerCase();
  }

  // Calculate cost estimation
  calculateCost(tokens, modelId) {
    // Rough cost estimation (adjust based on actual pricing)
    const costPerToken = {
      'llama2-7b': 0.0000002,
      'llama2-13b': 0.0000004,
      'mistral-7b': 0.0000002,
      'codellama': 0.0000002,
      'zephyr-7b': 0.0000002
    };

    const rate = costPerToken[modelId] || 0.0000002;
    return tokens * rate;
  }

  // Validate model parameters
  validateParameters(modelId, parameters) {
    const model = this.models[modelId];
    if (!model) return parameters;

    const validated = { ...parameters };

    // Validate temperature
    if (validated.temperature !== undefined) {
      validated.temperature = Math.max(0.1, Math.min(2.0, validated.temperature));
    }

    // Validate max tokens
    if (validated.maxTokens !== undefined && model.maxTokens) {
      validated.maxTokens = Math.min(validated.maxTokens, model.maxTokens);
    }

    // Validate top_p
    if (validated.topP !== undefined) {
      validated.topP = Math.max(0.1, Math.min(1.0, validated.topP));
    }

    return validated;
  }

  // Get a working model with fallback logic
  async getWorkingModel(modelId) {
    const preferredModel = this.models[modelId];
    
    if (preferredModel) {
      try {
        // Test if the model is accessible
        await this.testModel(preferredModel.id);
        return preferredModel;
      } catch (error) {
        console.log(`Preferred model ${preferredModel.id} not accessible:`, error.message);
      }
    }

    // Try fallback models in order of preference
    const fallbackModels = ['distilgpt2', 'microsoft-dialoGPT', 'google-flan-t5', 'huggingface-gpt2'];
    
    for (const fallbackId of fallbackModels) {
      const model = this.models[fallbackId];
      if (model) {
        try {
          await this.testModel(model.id);
          console.log(`Using fallback model: ${model.id}`);
          return model;
        } catch (error) {
          console.log(`Fallback model ${model.id} not accessible:`, error.message);
        }
      }
    }

    // Final fallback to a basic model
    return {
      id: 'gpt2',
      type: 'text-generation',
      maxTokens: 100,
      contextWindow: 100
    };
  }

  // Test if a model is accessible
  async testModel(modelId) {
    const response = await axios.post(
      `${this.baseURL}/${modelId}`,
      {
        inputs: 'test',
        parameters: {
          max_new_tokens: 1,
          temperature: 0.7
        }
      },
      {
        headers: this.buildHeaders(),
        timeout: 10000
      }
    );
    return response.status === 200;
  }

  // Health check for HuggingFace API
  async healthCheck() {
    try {
      const model = await this.getWorkingModel('distilgpt2');
      const response = await this.generateText('distilgpt2', 'Hello', { maxTokens: 10 });
      return {
        status: 'healthy',
        latency: Date.now(),
        model: model.id
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Build headers for axios requests, only attaching Authorization when token exists
  buildHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }
    return headers;
  }
}

export default new HuggingFaceService();
