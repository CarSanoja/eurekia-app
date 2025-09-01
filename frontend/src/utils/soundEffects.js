// Sound effects system for user interactions
class SoundManager {
  constructor() {
    this.enabled = true
    this.volume = 0.3
    this.sounds = {}
    this.loadSounds()
  }

  loadSounds() {
    // Create audio objects for each sound effect
    // Using data URLs for small sound effects to avoid external dependencies
    this.sounds = {
      // Success/completion sounds
      success: this.createBeepSound(800, 100, 'sine'),
      levelUp: this.createChord([523, 659, 784], 300), // C major chord
      badge: this.createMelody([523, 659, 784, 1047], 150), // C-E-G-C
      
      // Action sounds  
      click: this.createBeepSound(600, 50, 'square'),
      hover: this.createBeepSound(400, 30, 'sine'),
      swipe: this.createSweepSound(200, 600, 100),
      
      // Streak/fire sounds
      streak: this.createBeepSound(1000, 200, 'sawtooth'),
      fire: this.createCrackle(150),
      
      // Mood/emotional sounds
      happy: this.createMelody([523, 587, 659], 200),
      celebration: this.createMelody([523, 659, 784, 659, 784, 1047], 100),
      
      // Error/warning sounds
      error: this.createBeepSound(300, 200, 'square'),
      warning: this.createBeepSound(400, 100, 'triangle')
    }
  }

  createBeepSound(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = type
        
        gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
        
        oscillator.start()
        oscillator.stop(audioContext.currentTime + duration / 1000)
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }
  }

  createChord(frequencies, duration) {
    return () => {
      if (!this.enabled) return
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const gainNode = audioContext.createGain()
        gainNode.connect(audioContext.destination)
        gainNode.gain.setValueAtTime(this.volume * 0.7, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
        
        frequencies.forEach(freq => {
          const oscillator = audioContext.createOscillator()
          oscillator.connect(gainNode)
          oscillator.frequency.value = freq
          oscillator.type = 'sine'
          oscillator.start()
          oscillator.stop(audioContext.currentTime + duration / 1000)
        })
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }
  }

  createMelody(frequencies, noteDuration) {
    return () => {
      if (!this.enabled) return
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = freq
          oscillator.type = 'sine'
          
          const startTime = audioContext.currentTime + (index * noteDuration / 1000)
          const endTime = startTime + (noteDuration / 1000)
          
          gainNode.gain.setValueAtTime(this.volume * 0.5, startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)
          
          oscillator.start(startTime)
          oscillator.stop(endTime)
        })
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }
  }

  createSweepSound(startFreq, endFreq, duration) {
    return () => {
      if (!this.enabled) return
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration / 1000)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
        
        oscillator.start()
        oscillator.stop(audioContext.currentTime + duration / 1000)
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }
  }

  createCrackle(duration) {
    return () => {
      if (!this.enabled) return
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const bufferSize = audioContext.sampleRate * (duration / 1000)
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
        const data = buffer.getChannelData(0)
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
        }
        
        const source = audioContext.createBufferSource()
        const gainNode = audioContext.createGain()
        
        source.buffer = buffer
        source.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        gainNode.gain.value = this.volume * 0.2
        source.start()
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }
  }

  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      this.sounds[soundName]()
    }
  }

  enable() {
    this.enabled = true
    localStorage.setItem('soundEffectsEnabled', 'true')
  }

  disable() {
    this.enabled = false
    localStorage.setItem('soundEffectsEnabled', 'false')
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('soundEffectsVolume', this.volume.toString())
  }

  toggle() {
    if (this.enabled) {
      this.disable()
    } else {
      this.enable()
    }
    return this.enabled
  }

  // Load settings from localStorage
  loadSettings() {
    const enabled = localStorage.getItem('soundEffectsEnabled')
    const volume = localStorage.getItem('soundEffectsVolume')
    
    if (enabled !== null) {
      this.enabled = enabled === 'true'
    }
    
    if (volume !== null) {
      this.volume = parseFloat(volume)
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager()
soundManager.loadSettings()

// Convenience functions for common actions
export const playSound = {
  // Habit actions
  habitComplete: () => soundManager.play('success'),
  habitSkip: () => soundManager.play('click'),
  streakMilestone: () => soundManager.play('levelUp'),
  insuranceUsed: () => soundManager.play('warning'),
  
  // Badge/Achievement sounds
  badgeUnlocked: () => soundManager.play('badge'),
  levelUp: () => soundManager.play('levelUp'),
  milestone: () => soundManager.play('celebration'),
  comeback: () => soundManager.play('happy'),
  
  // UI interactions
  buttonClick: () => soundManager.play('click'),
  buttonHover: () => soundManager.play('hover'),
  pageSwipe: () => soundManager.play('swipe'),
  
  // Mood tracking
  moodPositive: () => soundManager.play('happy'),
  moodNegative: () => soundManager.play('warning'),
  
  // Errors
  error: () => soundManager.play('error'),
  warning: () => soundManager.play('warning')
}

// React hook for sound effects
export function useSounds() {
  const isEnabled = () => soundManager.enabled
  const toggle = () => soundManager.toggle()
  const setVolume = (volume) => soundManager.setVolume(volume)
  const getVolume = () => soundManager.volume

  return {
    playSound,
    isEnabled,
    toggle,
    setVolume,
    getVolume
  }
}

export default soundManager