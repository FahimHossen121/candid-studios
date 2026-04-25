const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'models', 'TV.glb');
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const buf = fs.readFileSync(filePath);
const readUInt32LE = (off) => buf.readUInt32LE(off);
const magic = readUInt32LE(0);
if (magic !== 0x46546c67) {
  console.error('Not a GLB file');
  process.exit(1);
}
const version = readUInt32LE(4);
const length = readUInt32LE(8);
let offset = 12;
let json = null;

while (offset < length) {
  const chunkLength = readUInt32LE(offset); offset += 4;
  const chunkType = readUInt32LE(offset); offset += 4;
  const chunkData = buf.slice(offset, offset + chunkLength);
  offset += chunkLength;
  if (chunkType === 0x4E4F534A) { // JSON
    json = JSON.parse(chunkData.toString('utf8'));
  }
}

if (!json) {
  console.error('No JSON chunk found');
  process.exit(1);
}

const gltf = json;
console.log('sceneVersion:', version);

function matInfo(mat) {
  const pbr = mat.pbrMetallicRoughness || {};
  const metallic = (typeof pbr.metallicFactor === 'number') ? pbr.metallicFactor : 1;
  const roughness = (typeof pbr.roughnessFactor === 'number') ? pbr.roughnessFactor : 1;
  return {
    name: mat.name || '<unnamed>',
    unlit: !!(mat.extensions && mat.extensions.KHR_materials_unlit),
    doubleSided: !!mat.doubleSided,
    alphaMode: mat.alphaMode || 'OPAQUE',
    metallic,
    roughness,
    hasEmissive: !!(mat.emissiveFactor || mat.emissiveTexture),
    extras: mat.extras || null,
  };
}

if (Array.isArray(gltf.materials)) {
  console.log('Materials:', gltf.materials.length);
  gltf.materials.forEach((m, i) => {
    console.log(`  [${i}]`, matInfo(m));
  });
} else {
  console.log('No materials in file');
}

if (Array.isArray(gltf.meshes)) {
  console.log('Meshes:', gltf.meshes.length);
  const usage = {};
  gltf.meshes.forEach((mesh, mi) => {
    mesh.primitives.forEach((prim, pi) => {
      const midx = (typeof prim.material === 'number') ? prim.material : null;
      usage[midx] = (usage[midx] || 0) + 1;
    });
  });
  console.log('Material usage by index:', usage);
}

if (gltf.scenes) console.log('Scenes:', gltf.scenes.length);
if (gltf.nodes) console.log('Nodes:', gltf.nodes.length);

console.log('Done');
