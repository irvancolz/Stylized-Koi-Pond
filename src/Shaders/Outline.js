
export const vertex = `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const fragment = `
#include <common>

uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec3 uLineColor;

varying vec2 vUv;

float getLuminance(sampler2D tex, vec2 coord) {
  vec4 pixelColor = texture2D(tex, coord);
  vec3 color = pixelColor.rgb;

  float lum = luminance(pixelColor.rgb);
  return lum;
}

const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel

const mat3 GaussianBlurKernel = mat3(
    0.0625, 0.1250, 0.0625,
    0.1250, 0.2500, 0.1250,
    0.0625, 0.1250, 0.0625
);

void main() {
  vec2 uv = vUv;
  vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );

  vec4 pixelColor = texture2D( tDiffuse, vUv );

  vec4 outlineColor = vec4(uLineColor, 1.0);

  float lum = getLuminance(tDiffuse, vUv);

  // 1st col
  float tx0y0 = getLuminance( tDiffuse, vUv + texel * vec2(-1, -1) );
  float tx0y1 = getLuminance( tDiffuse, vUv + texel * vec2(-1, 0) );
  float tx0y2 = getLuminance( tDiffuse, vUv + texel * vec2(-1, 1) );

  // 2nd col
  float tx1y0 = getLuminance( tDiffuse, vUv + texel * vec2(0, -1) );
  float tx1y1 = getLuminance( tDiffuse, vUv + texel * vec2(0, 0) );
  float tx1y2 = getLuminance( tDiffuse, vUv + texel * vec2(0, 1) );

  // 3rd col
  float tx2y0 = getLuminance( tDiffuse, vUv + texel * vec2(1, -1) );
  float tx2y1 = getLuminance( tDiffuse, vUv + texel * vec2(1, 0) );
  float tx2y2 = getLuminance( tDiffuse, vUv + texel * vec2(1, 1) );

  // blur before calc sobel
  float blur =  GaussianBlurKernel[0][0] * tx0y0 + GaussianBlurKernel[1][0] * tx1y0 + GaussianBlurKernel[2][0] * tx2y0 +
    GaussianBlurKernel[0][1] * tx0y1 + GaussianBlurKernel[1][1] * tx1y1 + GaussianBlurKernel[2][1] * tx2y1 +
    GaussianBlurKernel[0][2] * tx0y2 + GaussianBlurKernel[1][2] * tx1y2 + GaussianBlurKernel[2][2] * tx2y2;

  // gradient value in x direction

  float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
    Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
    Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

  // gradient value in y direction

  float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
    Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
    Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

  // magnitude of the total gradient

  float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );
  G *= blur;

  // outlineColor.rgb = pixelColor.rgb * .5;
  vec3 color = mix(pixelColor.rgb, outlineColor.rgb, G);

  gl_FragColor = vec4(color.rgb, 1.);

}

`;
