import * as THREE from "three";

export function GridTextureMaterial() {
  const image = new Image();
  const texture = new THREE.Texture(image);
  image.addEventListener("load", () => {
    texture.needsUpdate = true;
  });
  image.src = "./floor-grid-texture.png";
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 1024;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.repeat.x = 3;
  texture.repeat.y = 3;

  const material = new THREE.MeshBasicMaterial({ map: texture });
  return material;
}
