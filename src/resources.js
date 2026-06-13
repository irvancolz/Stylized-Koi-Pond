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
  }

]

const textures = []

export default [...models, ...textures]
