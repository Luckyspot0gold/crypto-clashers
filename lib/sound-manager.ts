// Sound Management System
class SoundManager {
  sounds: Record<string, HTMLAudioElement>
  muted: boolean

  constructor() {
    this.sounds = {}
    this.muted = false
  }

  // Load all sound assets
  async loadSounds() {
    const soundAssets = {
      fight: "/sounds/fight.mp3",
      coin: "/sounds/coin.mp3",
      victory: "/sounds/victory.mp3",
      defeat: "/sounds/defeat.mp3",
      button: "/sounds/button.mp3",
      trade: "/sounds/trade.mp3",
      theme: "/sounds/cryptotheme.mp3",
      bell: "/sounds/bell.wav",
    }

    // Create a dummy audio element for fallback
    const dummyAudio = new Audio()
    dummyAudio.volume = 0

    for (const [name, path] of Object.entries(soundAssets)) {
      try {
        const audio = new Audio(path)

        // Set a timeout to avoid hanging on load
        const loadPromise = new Promise((resolve, reject) => {
          audio.addEventListener("canplaythrough", resolve, { once: true })
          audio.addEventListener(
            "error",
            (e) => {
              console.warn(`Sound ${name} failed to load: ${path}`)
              resolve(null) // Resolve with null instead of rejecting
            },
            { once: true },
          )

          // Set timeout to avoid infinite loading
          setTimeout(() => {
            resolve(null)
            console.warn(`Sound ${name} load timed out`)
          }, 3000)
        })

        await loadPromise

        // If audio loaded successfully, add it to sounds
        if (audio.error === null) {
          this.sounds[name] = audio
          console.log(`Sound ${name} loaded successfully`)
        } else {
          // Use dummy audio as fallback
          this.sounds[name] = dummyAudio.cloneNode() as HTMLAudioElement
          console.warn(`Using silent fallback for ${name}`)
        }
      } catch (error) {
        console.error(`Failed to load sound ${name}:`, error)
        // Use dummy audio as fallback
        this.sounds[name] = dummyAudio.cloneNode() as HTMLAudioElement
      }
    }
  }

  // Play a sound
  play(soundName: string, loop = false) {
    if (this.muted) return null

    // Check if sound exists
    if (!this.sounds[soundName]) {
      console.warn(`Sound ${soundName} not found`)
      return null
    }

    try {
      // Clone the audio to allow overlapping sounds
      const soundToPlay = this.sounds[soundName].cloneNode() as HTMLAudioElement
      soundToPlay.volume = 0.7 // Default volume
      soundToPlay.loop = loop

      // Use a try-catch for play() since it can fail for various reasons
      soundToPlay.play().catch((err) => {
        console.warn(`Audio playback failed for ${soundName}:`, err)
      })

      return soundToPlay
    } catch (err) {
      console.warn(`Error playing sound ${soundName}:`, err)
      return null
    }
  }

  // Stop a specific sound
  stop(sound: HTMLAudioElement | null) {
    if (sound) {
      sound.pause()
      sound.currentTime = 0
    }
  }

  // Set volume for all sounds
  setVolume(volume: number) {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = volume
    })
  }

  // Toggle mute status
  toggleMute() {
    this.muted = !this.muted
    return this.muted
  }
}

// Export as singleton
const soundManager = new SoundManager()
export default soundManager
