const models = [
  {
    name: 'fish_model',
    type: 'gltfModel',
    path: './Fish.glb'
  },
  {
    name: 'statue_model',
    type: 'gltfModel',
    path: './Statue.glb'
  },
  {
    name: 'world_model',
    type: 'gltfModel',
    path: './Environment.glb'
  },
  {
    name: 'lotusleaves_model',
    type: 'gltfModel',
    path: './LotusLeaves.glb'
  },
  {
    name: 'lotusflower_model',
    type: 'gltfModel',
    path: './LotusFlower.glb'
  },
  {
    name: 'ground_model',
    type: 'gltfModel',
    path: './Ground.glb'
  },
  {
    name: 'pinetree_model',
    type: 'gltfModel',
    path: './PineTree.glb'
  }

]

const textures = [
  {
    name: 'koi_pattern_01',
    type: 'texture',
    path: './KoiPattern01.jpg'
  },
  {
    name: 'koi_pattern_02',
    type: 'texture',
    path: './KoiPattern02.jpg'
  },
  {
    name: 'koi_pattern_03',
    type: 'texture',
    path: './KoiPattern03.jpg'
  },
  {
    name: 'koi_pattern_04',
    type: 'texture',
    path: './KoiPattern04.jpg'
  },
  {
    name: 'koi_pattern_05',
    type: 'texture',
    path: './KoiPattern05.jpg'
  },
  {
    name: 'koi_pattern_06',
    type: 'texture',
    path: './KoiPattern06.jpg'
  },
]

export default [...models, ...textures]
