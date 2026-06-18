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
  }

]

const textures = [
  {
    name: 'koi_pattern_01',
    type: 'texture',
    path: './texture/KoiPattern01.jpg'
  },
  {
    name: 'koi_pattern_02',
    type: 'texture',
    path: './texture/KoiPattern02.jpg'
  },
  {
    name: 'koi_pattern_03',
    type: 'texture',
    path: './texture/KoiPattern03.jpg'
  },
  {
    name: 'koi_pattern_04',
    type: 'texture',
    path: './texture/KoiPattern04.jpg'
  },
  {
    name: 'koi_pattern_05',
    type: 'texture',
    path: './texture/KoiPattern05.jpg'
  },
  {
    name: 'koi_pattern_06',
    type: 'texture',
    path: './texture/KoiPattern06.jpg'
  },
]

export default [...models, ...textures]
