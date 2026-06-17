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
    name: 'michelle_model',
    type: 'gltfModel',
    path: './Michelle.glb'
  }

]

const textures = []

export default [...models, ...textures]
