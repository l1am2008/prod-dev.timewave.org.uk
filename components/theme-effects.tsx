"use client"

import { useEffect, useState } from "react"

interface ThemeEffectsProps {
  theme: string
}

export function ThemeEffects({ theme: initialTheme }: ThemeEffectsProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    setMounted(true)
    console.log("[v0] Theme effects mounted with theme:", theme)

    const handleThemeChange = (event: CustomEvent) => {
      console.log("[v0] Theme change event received:", event.detail.theme)
      setTheme(event.detail.theme)
    }

    window.addEventListener("themeChange", handleThemeChange as EventListener)

    const pollTheme = async () => {
      try {
        const response = await fetch("/api/admin/settings/theme")
        if (response.ok) {
          const data = await response.json()
          if (data.theme !== theme) {
            console.log("[v0] Theme change detected via polling:", data.theme)
            setTheme(data.theme)
          }
        }
      } catch (error) {
        console.error("[v0] Failed to poll theme:", error)
      }
    }

    const pollInterval = setInterval(pollTheme, 10000) // Poll every 10 seconds

    return () => {
      window.removeEventListener("themeChange", handleThemeChange as EventListener)
      clearInterval(pollInterval)
    }
  }, [theme])

  useEffect(() => {
    if (mounted) {
      console.log("[v0] Theme updated to:", theme)
    }
  }, [theme, mounted])

  if (!mounted) return null

  if (theme === "default" || !theme) {
    console.log("[v0] No theme effects active")
    return null
  }

  console.log("[v0] Rendering theme effect:", theme)

  return (
    <>
      {theme === "christmas" && <ChristmasEffect />}
      {theme === "newyear" && <NewYearEffect />}
      {theme === "spring" && <SpringEffect />}
      {theme === "halloween" && <HalloweenEffect />}
    </>
  )
}

function ChristmasEffect() {
  useEffect(() => {
    // Create snowflakes
    const createSnowflake = () => {
      const snowflake = document.createElement("div")
      snowflake.innerHTML = "❄"
      snowflake.style.position = "fixed"
      snowflake.style.top = "-10px"
      snowflake.style.left = Math.random() * window.innerWidth + "px"
      snowflake.style.fontSize = Math.random() * 10 + 10 + "px"
      snowflake.style.opacity = String(Math.random())
      snowflake.style.pointerEvents = "none"
      snowflake.style.zIndex = "9999"
      snowflake.style.color = "#fff"
      snowflake.style.textShadow = "0 0 5px rgba(255,255,255,0.8)"

      document.body.appendChild(snowflake)

      const duration = Math.random() * 3 + 2
      const drift = (Math.random() - 0.5) * 100

      snowflake.animate(
        [
          { transform: `translateY(0) translateX(0)`, opacity: snowflake.style.opacity },
          { transform: `translateY(${window.innerHeight}px) translateX(${drift}px)`, opacity: 0 },
        ],
        {
          duration: duration * 1000,
          easing: "linear",
        },
      ).onfinish = () => snowflake.remove()
    }

    const interval = setInterval(createSnowflake, 200)
    return () => clearInterval(interval)
  }, [])

  return null
}

function NewYearEffect() {
  useEffect(() => {
    const createFirework = () => {
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]
      const x = Math.random() * window.innerWidth
      const y = Math.random() * (window.innerHeight * 0.5)

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div")
        particle.style.position = "fixed"
        particle.style.left = x + "px"
        particle.style.top = y + "px"
        particle.style.width = "4px"
        particle.style.height = "4px"
        particle.style.borderRadius = "50%"
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        particle.style.pointerEvents = "none"
        particle.style.zIndex = "9999"

        document.body.appendChild(particle)

        const angle = (Math.PI * 2 * i) / 30
        const velocity = Math.random() * 100 + 50
        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity

        particle.animate(
          [
            { transform: `translate(0, 0)`, opacity: 1 },
            { transform: `translate(${vx}px, ${vy}px)`, opacity: 0 },
          ],
          {
            duration: 1000,
            easing: "ease-out",
          },
        ).onfinish = () => particle.remove()
      }
    }

    const interval = setInterval(createFirework, 1000)
    return () => clearInterval(interval)
  }, [])

  return null
}

function SpringEffect() {
  useEffect(() => {
    const createFlower = () => {
      const flowers = ["🌸", "🌺", "🌼", "🌻", "🌷"]
      const flower = document.createElement("div")
      flower.innerHTML = flowers[Math.floor(Math.random() * flowers.length)]
      flower.style.position = "fixed"
      flower.style.top = "-10px"
      flower.style.left = Math.random() * window.innerWidth + "px"
      flower.style.fontSize = Math.random() * 15 + 20 + "px"
      flower.style.pointerEvents = "none"
      flower.style.zIndex = "9999"

      document.body.appendChild(flower)

      const duration = Math.random() * 4 + 3
      const rotation = Math.random() * 360
      const drift = (Math.random() - 0.5) * 100

      flower.animate(
        [
          { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
          {
            transform: `translateY(${window.innerHeight}px) translateX(${drift}px) rotate(${rotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: duration * 1000,
          easing: "ease-in",
        },
      ).onfinish = () => flower.remove()
    }

    const interval = setInterval(createFlower, 500)
    return () => clearInterval(interval)
  }, [])

  return null
}

function HalloweenEffect() {
  useEffect(() => {
    const createGhost = () => {
      const ghosts = ["👻", "🎃", "🦇"]
      const ghost = document.createElement("div")
      ghost.innerHTML = ghosts[Math.floor(Math.random() * ghosts.length)]
      ghost.style.position = "fixed"
      ghost.style.top = Math.random() * window.innerHeight + "px"
      ghost.style.left = "-50px"
      ghost.style.fontSize = Math.random() * 20 + 30 + "px"
      ghost.style.pointerEvents = "none"
      ghost.style.zIndex = "9999"

      document.body.appendChild(ghost)

      const duration = Math.random() * 5 + 5
      const wave = Math.sin(Math.random() * Math.PI) * 50

      ghost.animate(
        [
          { transform: `translateX(0) translateY(0)`, opacity: 0.7 },
          { transform: `translateX(${window.innerWidth + 100}px) translateY(${wave}px)`, opacity: 0 },
        ],
        {
          duration: duration * 1000,
          easing: "linear",
        },
      ).onfinish = () => ghost.remove()
    }

    const interval = setInterval(createGhost, 2000)
    return () => clearInterval(interval)
  }, [])

  return null
}
