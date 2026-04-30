const fs = require('fs');
const indexHtml3D = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
  </style>
</head>
<body>
  <script type="module" src="main.js"></script>
</body>
</html>`;

const mainJs3D = `// 3D Basic Scene with Three.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js';

const scene = new THREE.Scene();`;

let bundledHtml = indexHtml3D;
const isModule = mainJs3D.includes('import ') || mainJs3D.includes('export ') || indexHtml3D.includes('type="module"');
const scriptTag = isModule ? '<script type="module">' : '<script>';

const scriptRegex = /<script\b[^>]*src=["']\s*([^"'>]*)\s*["'][^>]*><\/script>/gi;
bundledHtml = bundledHtml.replace(scriptRegex, (match, src) => {
  if (src.includes('main.js')) {
    return `${scriptTag}\n${mainJs3D}\n</script>`;
  }
  return match;
});

bundledHtml = bundledHtml.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/[\d.]+\/three\.module\.js/g, 'https://unpkg.com/three@0.160.0/build/three.module.js');

console.log("3D output:", bundledHtml);

const indexHtml2D = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #111; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="main.js"></script>
</body>
</html>`;

const mainJs2D = `// 2D Canvas Basic Setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x = canvas.width / 2;
let y = canvas.height / 2;`;

bundledHtml = indexHtml2D;
bundledHtml = bundledHtml.replace(scriptRegex, (match, src) => {
  if (src.includes('main.js')) {
    return `<script>\n${mainJs2D}\n</script>`;
  }
  return match;
});
console.log("2D output:", bundledHtml);
