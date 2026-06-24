import os

server_path = r"c:\Users\Abhranil\OneDrive\ドキュメント\GitHub\Public_Eye\server.ts"

with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add TF Import and training logic after push setup
tf_setup = """
// --- Deep Learning Local AI Engine ---
import * as tf from '@tensorflow/tfjs';

let localAIModel: tf.Sequential | null = null;
let localAIVocab: Map<string, number> = new Map();

async function buildAndTrainLocalAI() {
  console.log('🚀 Initializing Local Deep Learning AI Engine...');
  try {
    const dataSize = 500;
    const rawData: { text: string; severity: number }[] = [];
    
    const highSeverityKeywords = ['sinkhole', 'massive', 'flood', 'pipe burst', 'crater', 'dangerous', 'crash', 'severe', 'deep'];
    const mediumSeverityKeywords = ['crack', 'trash', 'dumping', 'graffiti', 'broken sidewalk', 'debris', 'pothole'];
    const lowSeverityKeywords = ['street light', 'flickering', 'bulb out', 'dim', 'overgrown', 'weeds'];

    for (let i = 0; i < dataSize; i++) {
      const rand = Math.random();
      let text = '';
      let severity = 1;
      if (rand < 0.33) {
        severity = 2;
        text = `There is a ${highSeverityKeywords[Math.floor(Math.random() * highSeverityKeywords.length)]} near the intersection. It looks ${highSeverityKeywords[Math.floor(Math.random() * highSeverityKeywords.length)]}.`;
      } else if (rand < 0.66) {
        severity = 1;
        text = `I noticed some ${mediumSeverityKeywords[Math.floor(Math.random() * mediumSeverityKeywords.length)]} on the street. Needs fixing.`;
      } else {
        severity = 0;
        text = `The ${lowSeverityKeywords[Math.floor(Math.random() * lowSeverityKeywords.length)]} is an issue but not urgent.`;
      }
      rawData.push({ text, severity });
    }

    let vocabIndex = 0;
    const cleanText = (text: string) => text.toLowerCase().replace(/[^a-z ]/g, '');
    
    rawData.forEach(item => {
      const words = cleanText(item.text).split(' ');
      words.forEach(word => {
        if (word && !localAIVocab.has(word)) localAIVocab.set(word, vocabIndex++);
      });
    });

    const VOCAB_SIZE = localAIVocab.size;
    const vectorize = (text: string) => {
      const vec = new Array(VOCAB_SIZE).fill(0);
      cleanText(text).split(' ').forEach(word => {
        if (localAIVocab.has(word)) vec[localAIVocab.get(word)!] = 1;
      });
      return vec;
    };

    const xs = tf.tensor2d(rawData.map(item => vectorize(item.text)));
    const ys = tf.oneHot(tf.tensor1d(rawData.map(item => item.severity), 'int32'), 3);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [VOCAB_SIZE] }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

    model.compile({ optimizer: tf.train.adam(0.02), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    
    console.log('🏋️ Training Local Neural Network in memory...');
    await model.fit(xs, ys, { epochs: 10, batchSize: 32, verbose: 0 });
    
    localAIModel = model;
    console.log('✅ Deep Learning Pipeline Complete! Model Ready.');
  } catch (err) {
    console.error('Failed to train local AI model:', err);
  }
}
buildAndTrainLocalAI();

function predictSeverityLocal(text: string): 'low' | 'medium' | 'high' {
  if (!localAIModel || localAIVocab.size === 0) return 'medium';
  
  const cleanText = text.toLowerCase().replace(/[^a-z ]/g, '');
  const vec = new Array(localAIVocab.size).fill(0);
  cleanText.split(' ').forEach(word => {
    if (localAIVocab.has(word)) vec[localAIVocab.get(word)!] = 1;
  });

  const inputTensor = tf.tensor2d([vec]);
  const prediction = localAIModel.predict(inputTensor) as tf.Tensor;
  const classIdx = prediction.argMax(-1).dataSync()[0];
  
  const labels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  return labels[classIdx] || 'medium';
}
// -------------------------------------
"""

content = content.replace("dotenv.config();\n", "dotenv.config();\n" + tf_setup)

# 2. Modify the fallback logic
fallback_old = """
  } else {
    aiWarning = 'AI Sandbox Mode: Configure GEMINI_API_KEY in Secrets for live intelligence.';
    // Heuristic categorization engine for fallback
"""

fallback_new = """
  } else {
    // Heuristic categorization engine for fallback
    aiWarning = 'AI Sandbox Mode: Configure GEMINI_API_KEY in Secrets for live intelligence.';
    if (localAIModel) {
      aiWarning = '[⚡ TensorFlow.js Local AI Engine] Operating offline with neural network predictions.';
      aiSeverity = predictSeverityLocal(title + ' ' + description);
      aiSafetyTips = `[Local AI System] Auto-classified ${aiSeverity.toUpperCase()} risk based on neural pattern matching.`;
      aiTags = ['Neural Net', aiSeverity.toUpperCase() + ' RISK'];
    } else {
"""

content = content.replace(fallback_old, fallback_new)

heuristic_end_old = """
      aiTags = [category.toUpperCase().replace('_', ' ')];
    }
  }

  const now = new Date().toISOString();
"""

heuristic_end_new = """
      aiTags = [category.toUpperCase().replace('_', ' ')];
    }
    } // End of localAIModel else
  }

  const now = new Date().toISOString();
"""
content = content.replace(heuristic_end_old, heuristic_end_new)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected TensorFlow training into server.ts")
