import * as THREE from 'three'

const models = [
  {
    name: 'fish_model',
    type: 'gltfModel',
    path: './model/Fish.glb'
  },
  {
    name: 'statue_model',
    type: 'gltfModel',
    path: './model/Statue.glb'
  },
  {
    name: 'stoneround_model',
    type: 'gltfModel',
    path: './model/StoneRound.glb'
  },
  {
    name: 'stonetall_model',
    type: 'gltfModel',
    path: './model/StoneTall.glb'
  },
  {
    name: 'tallgrass_model',
    type: 'gltfModel',
    path: './model/TallGrass.glb'
  },
  {
    name: 'lotusleaves_model',
    type: 'gltfModel',
    path: './model/LotusLeaves.glb'
  },
  {
    name: 'lotusflower_model',
    type: 'gltfModel',
    path: './model/LotusFlower.glb'
  },
  {
    name: 'ground_model',
    type: 'gltfModel',
    path: './model/Ground.glb'
  },
  {
    name: 'pinetree_model',
    type: 'gltfModel',
    path: './model/PineTree.glb'
  },
  {
    name: 'birchtree_model',
    type: 'gltfModel',
    path: './model/BirchTree.glb'
  },
  {
    name: 'waterfall_model',
    type: 'gltfModel',
    path: './model/Waterfall.glb'
  }

]

const textures = [
  {
    name: 'grass_height',
    type: 'texture',
    path: './texture/GrassHeight.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false
    }
  },
  {
    name: 'leaves',
    type: 'texture',
    path: './texture/leaves.png',
  },
  {
    name: 'koi_pattern_01',
    type: 'texture',
    path: './texture/KoiPattern01.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false
    }
  },
  {
    name: 'koi_pattern_02',
    type: 'texture',
    path: './texture/KoiPattern02.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false
    }
  },
  {
    name: 'koi_pattern_03',
    type: 'texture',
    path: './texture/KoiPattern03.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false
    }
  },
  {
    name: 'koi_pattern_04',
    type: 'texture',
    path: './texture/KoiPattern04.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false
    }
  },
  {
    name: 'koi_pattern_05',
    type: 'texture',
    path: './texture/KoiPattern05.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false

    }
  },
  {
    name: 'koi_pattern_06',
    type: 'texture',
    path: './texture/KoiPattern06.jpg',
    onLoaded: (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY = false
    }
  },
]

export default [...models, ...textures]
