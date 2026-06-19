import { math } from "./math"

export const data = (function() {
  return {
    seeder: (count = 0, seed = 0) => {
      const result = []

      for (let i = 0; i < count; i++) {
        const rand = math.random(i + seed)
        const angle = (rand() - .5) * 2 * Math.PI
        const radius = Math.max(.9, rand()) * 18
        const translation = [Math.sin(angle) * radius, 1, Math.cos(angle) * radius]
        const rotation = [0, ((rand() - .5)) * Math.PI, 0]
        const s = 1
        const scale = [s, s, s]

        result.push({ translation, rotation, scale })
      }
      return result
    }
  }
}())
