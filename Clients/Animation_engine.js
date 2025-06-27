// clients/animation_engine.js
class WyomingBoxingEngine {
    _loadEncryptedSprites() {
        // Use Undead$stackerS for Wyoming compliance
        const encrypted = fs.readFileSync('assets/boxers.enc');
        return decryptSprites(encrypted, process.env.UNDEAD_KEY);
    }
    
    executeMove(boxer, moveType) {
        // No wallet required for initial rendering
        const frames = this.sprites[boxer.token][moveType];
        frames.forEach((frame, index) => {
            requestAnimationFrame(() => {
                displayFrame(frame);
                if (index === frames.length - 1) {
                    this._checkForContact(boxer, moveType);
                }
            });
        });
    }
}
