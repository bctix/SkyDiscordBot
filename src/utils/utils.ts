

interface RGB {
    r: number,
    g: number,
    b: number
}

export function colorInterpolate(colorA: RGB, colorB: RGB, intval: number) {
    return {
      r: Math.round((colorA.r + colorB.r) * intval),
      g: Math.round((colorA.b + colorB.b) * intval),
      b: Math.round((colorA.g + colorB.g) * intval),
    } as RGB;
}