import * as THREE from 'three';
import { ANATOMY_LEGEND, colorForStructure } from '../data/anatomyPalette.js';

export function styleAnatomyMesh(mesh, structureKey, system) {
  if (!mesh?.isMesh || !mesh.material) return;

  const color = colorForStructure(structureKey, system);
  const material = mesh.material.clone();
  material.color = new THREE.Color(color);

  if ('roughness' in material) {
    material.roughness = system === 'skeleton' ? 0.72 : system === 'muscles' ? 0.62 : 0.5;
  }
  if ('metalness' in material) material.metalness = 0;
  if ('emissive' in material) {
    material.emissive = new THREE.Color(0x000000);
    material.emissiveIntensity = 0;
  }

  material.needsUpdate = true;
  mesh.material = material;
  mesh.userData.baseColor = color;
  mesh.userData.baseEmissive = material.emissive?.getHex?.() ?? 0x000000;
  mesh.userData.baseEmissiveIntensity = material.emissiveIntensity ?? 0;
}

export function ensureAnatomyLegend() {
  if (document.querySelector('#anatomy-legend')) return;
  const viewer = document.querySelector('.viewer-wrap');
  if (!viewer) return;

  const legend = document.createElement('div');
  legend.id = 'anatomy-legend';
  legend.setAttribute('aria-label', 'Anatomical color legend');
  legend.innerHTML = `
    <div class="anatomy-legend-title">COLOR KEY</div>
    <div class="anatomy-legend-items">
      ${ANATOMY_LEGEND.map(({ label, color }) => `
        <span class="anatomy-legend-item">
          <i style="background:${color}"></i>${label}
        </span>`).join('')}
    </div>
  `;
  viewer.appendChild(legend);

  if (!document.querySelector('#anatomy-legend-styles')) {
    const style = document.createElement('style');
    style.id = 'anatomy-legend-styles';
    style.textContent = `
      #anatomy-legend {
        position: absolute;
        left: 18px;
        bottom: 18px;
        z-index: 4;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 12px;
        background: rgba(10,13,18,.74);
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 30px rgba(0,0,0,.24);
        color: #d9dee8;
        pointer-events: none;
      }
      .anatomy-legend-title {
        margin-bottom: 7px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .16em;
        color: #838c9a;
      }
      .anatomy-legend-items {
        display: flex;
        flex-wrap: wrap;
        gap: 7px 12px;
        max-width: 290px;
      }
      .anatomy-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 650;
        white-space: nowrap;
      }
      .anatomy-legend-item i {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 0 10px rgba(255,255,255,.06);
      }
      @media (max-width: 760px) {
        #anatomy-legend { left: 10px; bottom: 10px; padding: 8px 10px; }
        .anatomy-legend-items { max-width: 230px; gap: 5px 9px; }
        .anatomy-legend-item { font-size: 10px; }
      }
    `;
    document.head.appendChild(style);
  }
}
