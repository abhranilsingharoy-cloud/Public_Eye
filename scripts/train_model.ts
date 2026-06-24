import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 Starting Deep Learning Training Pipeline...');

// 1. Synthetic Data Generation
const dataSize = 1500;
const rawData: { text: string; severity: number }[] = []; // 0=low, 1=medium, 2=high

const highSeverityKeywords = ['sinkhole', 'massive', 'flood', 'pipe burst', 'crater', 'dangerous', 'crash', 'severe', 'deep'];
const mediumSeverityKeywords = ['crack', 'trash', 'dumping', 'graffiti', 'broken sidewalk', 'debris', 'pothole'];
const lowSeverityKeywords = ['street light', 'flickering', 'bulb out', 'dim', 'overgrown', 'weeds'];

for (let i = 0; i < dataSize; i++) {
  const rand = Math.random();
  let text = '';
  let severity = 1;

  if (rand < 0.33) {
    severity = 2; // High
    text = `There is a ${highSeverityKeywords[Math.floor(Math.random() * highSeverityKeywords.length)]} near the intersection. It looks ${highSeverityKeywords[Math.floor(Math.random() * highSeverityKeywords.length)]}.`;
  } else if (rand < 0.66) {
    severity = 1; // Medium
    text = `I noticed some ${mediumSeverityKeywords[Math.floor(Math.random() * mediumSeverityKeywords.length)]} on the street. Needs fixing.`;
  } else {
    severity = 0; // Low
    text = `The ${lowSeverityKeywords[Math.floor(Math.random() * lowSeverityKeywords.length)]} is an issue but not urgent.`;
  }
  rawData.push({ text, severity });
}

// 2. Tokenization and Vectorization (Bag of Words)
console.log('📚 Building Vocabulary...');
const vocab = new Map<string, number>();
let vocabIndex = 0;

const cleanText = (text: string) => text.toLowerCase().replace(/[^a-z ]/g, '');

rawData.forEach(item => {
  const words = cleanText(item.text).split(' ');
  words.forEach(word => {
    if (word && !vocab.has(word)) {
      vocab.set(word, vocabIndex++);
    }
  });
});

const VOCAB_SIZE = vocab.size;
console.log(`✅ Vocabulary size: ${VOCAB_SIZE}`);

// Save Vocabulary for Inference
const outDir = path.join(__dirname, '../server/models');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'vocab.json'), JSON.stringify(Object.fromEntries(vocab)));

const vectorize = (text: string) => {
  const vec = new Array(VOCAB_SIZE).fill(0);
  const words = cleanText(text).split(' ');
  words.forEach(word => {
    if (vocab.has(word)) {
      vec[vocab.get(word)!] = 1;
    }
  });
  return vec;
};

// 3. Prepare Tensors
console.log('🧠 Preparing Tensors...');
const xs = tf.tensor2d(rawData.map(item => vectorize(item.text)));
const ys = tf.oneHot(tf.tensor1d(rawData.map(item => item.severity), 'int32'), 3);

// 4. Build Deep Neural Network
console.log('🏗️ Building Neural Network Architecture...');
const model = tf.sequential();
model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [VOCAB_SIZE] }));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

model.compile({
  optimizer: tf.train.adam(0.01),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// 5. Train the Model
async function train() {
  console.log('🏋️ Training Model...');
  await model.fit(xs, ys, {
    epochs: 15,
    batchSize: 32,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
      }
    }
  });

  // 6. Save the Model
  console.log('💾 Saving Model to Disk...');
  await model.save(`file://${outDir}/tfjs-model`);
  console.log('✅ Deep Learning Pipeline Complete!');
}

train();
