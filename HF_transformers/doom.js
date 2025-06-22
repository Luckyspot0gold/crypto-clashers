// crypto_clashers_doom.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformersJS } from '@xenova/transformers';
import { CoinGeckoAPI } from 'crypto-market-api';

// Initialize Transformers.js for AI-powered enemies
const classifier = await TransformersJS.AutoModel.from_pretrained('Xenova/distilbert-base-uncased');
const tokenizer = await TransformersJS.AutoTokenizer.from_pretrained('Xenova/distilbert-base-uncased');

// Game constants
const COINS = ['bitcoin', 'ethereum', 'solana', 'avalanche', 'dogecoin'];
const MARKET_SENTIMENTS = {
  fear: 0.3,
  greed: 0.7,
  panic: 0.1,
  euphoria: 0.9
};

// Doom-style 3D setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load cryptocurrency enemy models
const loader = new GLTFLoader();
const cryptoEnemies = {};

await Promise.all(COINS.map(async coin => {
  cryptoEnemies[coin] = await loader.loadAsync(`https://huggingface.co/datasets/StoneVerse/crypto-3d/resolve/main/${coin}_enemy.glb`);
  cryptoEnemies[coin].scene.scale.set(0.5, 0.5, 0.5);
}));

// Market-powered weapon system
class CryptoWeapon {
  constructor(type) {
    this.type = type;
    this.power = 1.0;
    this.cooldown = 0;
  }

  async updatePower() {
    const marketData = await CoinGeckoAPI.getCoinMarketData(this.type);
    const rsi = marketData.rsi_14;
    this.power = Math.min(2.0, Math.max(0.2, rsi / 50));
  }

  fire() {
    if (this.cooldown > 0) return;
    
    // Create projectile with market-based power
    const projectile = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    projectile.position.copy(camera.position);
    projectile.userData = { damage: this.power * 10, type: this.type };
    
    scene.add(projectile);
    this.cooldown = 30 / this.power; // Higher RSI = faster firing
  }
}

// AI-powered enemy behavior
class CryptoEnemy {
  constructor(coinType, position) {
    this.model = cryptoEnemies[coinType].scene.clone();
    this.model.position.copy(position);
    this.coinType = coinType;
    this.health = 100;
    this.sentiment = 'neutral';
    scene.add(this.model);
  }

  async updateBehavior() {
    // Use Transformers.js to analyze market sentiment
    const news = await CoinGeckoAPI.getCoinNews(this.coinType);
    const inputs = tokenizer(news.slice(0, 3).join(' '));
    const output = await classifier(inputs);
    this.sentiment = output[0].label.toLowerCase();
    
    // Adjust behavior based on sentiment
    const speed = MARKET_SENTIMENTS[this.sentiment] || 0.5;
    this.model.position.z -= speed * 0.05;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      scene.remove(this.model);
      return true;
    }
    return false;
  }
}

// Game initialization
const playerWeapon = new CryptoWeapon('bitcoin');
const enemies = [
  new CryptoEnemy('ethereum', new THREE.Vector3(0, 0, -10)),
  new CryptoEnemy('solana', new THREE.Vector3(2, 0, -8)),
  new CryptoEnemy('dogecoin', new THREE.Vector3(-2, 0, -12))
];

camera.position.z = 5;

// Game loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update weapon power based on market
  if (frameCount % 300 === 0) playerWeapon.updatePower();
  
  // Update enemy behavior
  enemies.forEach(enemy => enemy.updateBehavior());
  
  // Handle weapon cooldown
  if (playerWeapon.cooldown > 0) playerWeapon.cooldown--;
  
  renderer.render(scene, camera);
  frameCount++;
}

// Controls
document.addEventListener('click', () => playerWeapon.fire());
window.addEventListener('keydown', (e) => {
  if (e.key === '1') playerWeapon.type = 'bitcoin';
  if (e.key === '2') playerWeapon.type = 'ethereum';
  // Add other coin weapons
});

let frameCount = 0;
animate();
