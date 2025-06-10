"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ArenaEffectsProps {
  isMatchActive: boolean
  matchRound: number
  winner: string | null
  leftFighter: string
  rightFighter: string
}

export default function ArenaEffects({
  isMatchActive,
  matchRound,
  winner,
  leftFighter,
  rightFighter,
}: ArenaEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Particle system for visual effects
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number
      gravity: number

      constructor(x: number, y: number, color: string, size = 5, gravity = 0.1) {
        this.x = x
        this.y = y
        this.size = Math.random() * size + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * -3
        this.color = color
        this.opacity = 1
        this.gravity = gravity
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.speedY += this.gravity
        this.opacity -= 0.01

        if (this.size > 0.2) this.size -= 0.1
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color.replace(")", `, ${this.opacity})`)
        ctx.fill()
      }
    }

    // Particles array
    const particles: Particle[] = []

    // Create particles
    const createParticles = (x: number, y: number, color: string, count = 20) => {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color))
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw(ctx)

        // Remove particles when they're too small or transparent
        if (particles[i].size <= 0.2 || particles[i].opacity <= 0) {
          particles.splice(i, 1)
          i--
        }
      }

      // Add new particles for active match
      if (isMatchActive && !winner) {
        // Left fighter particles (orange/red)
        if (Math.random() < 0.1) {
          const x = canvas.width * 0.25 + (Math.random() * 50 - 25)
          const y = canvas.height * 0.5 + (Math.random() * 30 - 15)
          createParticles(x, y, "rgba(249, 115, 22, ", 2)
        }

        // Right fighter particles (purple/blue)
        if (Math.random() < 0.1) {
          const x = canvas.width * 0.75 + (Math.random() * 50 - 25)
          const y = canvas.height * 0.5 + (Math.random() * 30 - 15)
          createParticles(x, y, "rgba(139, 92, 246, ", 2)
        }
      }

      // Winner celebration particles
      if (winner) {
        const centerX = winner === leftFighter ? canvas.width * 0.25 : canvas.width * 0.75
        const centerY = canvas.height * 0.4

        if (Math.random() < 0.3) {
          const x = centerX + (Math.random() * 100 - 50)
          const y = centerY + (Math.random() * 100 - 50)
          const color = winner === leftFighter ? "rgba(249, 115, 22, " : "rgba(139, 92, 246, "
          createParticles(x, y, color, 5)
        }

        // Gold celebration particles
        if (Math.random() < 0.2) {
          const x = centerX + (Math.random() * 150 - 75)
          const y = centerY + (Math.random() * 150 - 75)
          createParticles(x, y, "rgba(234, 179, 8, ", 3)
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isMatchActive, matchRound, winner, leftFighter, rightFighter])

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />

      {/* Round announcement */}
      {isMatchActive && !winner && (
        <motion.div
          key={`round-${matchRound}`}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="text-6xl font-bold text-white text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
            ROUND {matchRound}
          </div>
        </motion.div>
      )}

      {/* Winner announcement */}
      {winner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="text-center">
            <div className="text-7xl font-bold text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.7)]">
              {winner === "DRAW" ? "DRAW!" : `${winner} WINS!`}
            </div>
            <div className="text-2xl text-white">
              {winner === "DRAW" ? "Both fighters showed equal strength!" : "The market has spoken!"}
            </div>
          </div>
        </motion.div>
      )}

      {/* Light beams for active match */}
      {isMatchActive && (
        <>
          <div className="absolute top-0 left-1/4 w-1 h-1/2 bg-gradient-to-b from-orange-500/70 to-transparent blur-xl"></div>
          <div className="absolute top-0 right-1/4 w-1 h-1/2 bg-gradient-to-b from-purple-500/70 to-transparent blur-xl"></div>
        </>
      )}

      {/* Winner spotlight */}
      {winner && winner !== "DRAW" && (
        <div
          className={`absolute top-0 ${winner === leftFighter ? "left-1/4" : "right-1/4"} w-2 h-2/3 bg-gradient-to-b from-yellow-400/90 to-transparent blur-2xl`}
        ></div>
      )}
    </div>
  )
}
