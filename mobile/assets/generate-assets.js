/**
 * AgriConnect Market — Asset Generator
 * Generates icon.png, adaptive-icon.png, splash-icon.png, favicon.png
 * Run: npm install && node generate-assets.js
 */

const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// SHARED DEFS snippet reused inside each SVG
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 1. MAIN APP ICON  (icon.png + source for adaptive)
//    1024×1024  — deep forest-green bg, circuit-leaf logo,
//    golden signal arcs, verified shield badge
// ─────────────────────────────────────────────────────────────
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
<defs>
  <!-- Backgrounds -->
  <linearGradient id="bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#071C0D"/>
    <stop offset="50%"  stop-color="#14522A"/>
    <stop offset="100%" stop-color="#081606"/>
  </linearGradient>
  <radialGradient id="glow" cx="512" cy="490" r="360" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#27AE60" stop-opacity="0.26"/>
    <stop offset="100%" stop-color="#071C0D" stop-opacity="0"/>
  </radialGradient>
  <!-- Leaf gradients -->
  <linearGradient id="leafL" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0%"   stop-color="#1B5E20"/>
    <stop offset="100%" stop-color="#76FF03"/>
  </linearGradient>
  <linearGradient id="leafR" x1="1" y1="1" x2="0" y2="0">
    <stop offset="0%"   stop-color="#1B5E20"/>
    <stop offset="100%" stop-color="#76FF03"/>
  </linearGradient>
  <linearGradient id="bud" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%"   stop-color="#2E7D32"/>
    <stop offset="100%" stop-color="#CCFF90"/>
  </linearGradient>
  <!-- Gold for signal arcs & badge -->
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#FFE57F"/>
    <stop offset="100%" stop-color="#E65100"/>
  </linearGradient>
  <!-- Gloss overlay -->
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.07"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.14"/>
  </linearGradient>
  <!-- Badge drop-shadow -->
  <filter id="bshadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="2" dy="5" stdDeviation="9" flood-color="#000000" flood-opacity="0.5"/>
  </filter>
  <!-- Subtle plant glow -->
  <filter id="pglow" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>

<!-- ── BACKGROUND ── -->
<rect width="1024" height="1024" rx="196" fill="url(#bg)"/>
<ellipse cx="512" cy="490" rx="400" ry="400" fill="url(#glow)"/>

<!-- ── NETWORK RINGS (faint connectivity lines) ── -->
<circle cx="512" cy="490" r="380" fill="none" stroke="#27AE60" stroke-width="1.5" stroke-opacity="0.13"/>
<circle cx="512" cy="490" r="298" fill="none" stroke="#27AE60" stroke-width="1.5" stroke-opacity="0.17"/>
<circle cx="512" cy="490" r="216" fill="none" stroke="#27AE60" stroke-width="1.5" stroke-opacity="0.22"/>
<!-- Node dots -->
<circle cx="132" cy="490" r="9" fill="#4CAF50" fill-opacity="0.28"/>
<circle cx="892" cy="490" r="9" fill="#4CAF50" fill-opacity="0.28"/>
<circle cx="512" cy="110" r="9" fill="#4CAF50" fill-opacity="0.28"/>
<circle cx="512" cy="870" r="9" fill="#4CAF50" fill-opacity="0.28"/>
<circle cx="246" cy="226" r="6" fill="#4CAF50" fill-opacity="0.18"/>
<circle cx="778" cy="226" r="6" fill="#4CAF50" fill-opacity="0.18"/>
<circle cx="246" cy="754" r="6" fill="#4CAF50" fill-opacity="0.18"/>
<circle cx="778" cy="754" r="6" fill="#4CAF50" fill-opacity="0.18"/>
<!-- Connector lines (very faint) -->
<line x1="132" y1="490" x2="246" y2="226"  stroke="#4CAF50" stroke-width="1" stroke-opacity="0.07"/>
<line x1="892" y1="490" x2="778" y2="226"  stroke="#4CAF50" stroke-width="1" stroke-opacity="0.07"/>
<line x1="512" y1="110" x2="246" y2="226"  stroke="#4CAF50" stroke-width="1" stroke-opacity="0.07"/>
<line x1="512" y1="110" x2="778" y2="226"  stroke="#4CAF50" stroke-width="1" stroke-opacity="0.07"/>

<!-- ── SIGNAL ARCS (CAMARA API theme — WiFi-style upward) ── -->
<path d="M 210 558 Q 512 208 814 558"
      fill="none" stroke="#FFB300" stroke-width="7" stroke-linecap="round" stroke-opacity="0.40"/>
<path d="M 308 534 Q 512 246 716 534"
      fill="none" stroke="#FFB300" stroke-width="12" stroke-linecap="round" stroke-opacity="0.68"/>
<path d="M 406 510 Q 512 284 618 510"
      fill="none" stroke="#FFD54F" stroke-width="18" stroke-linecap="round"/>

<!-- Signal source dot -->
<circle cx="512" cy="268" r="36" fill="#FF8F00" fill-opacity="0.85"/>
<circle cx="512" cy="268" r="22" fill="#FFE082"/>
<circle cx="512" cy="268" r="9"  fill="#FFFFFF"/>
<circle cx="512" cy="268" r="46" fill="none" stroke="#FFB300" stroke-width="4" stroke-opacity="0.38"/>

<!-- ── PLANT (centered) ── -->
<!-- Soft stem glow -->
<line x1="512" y1="828" x2="512" y2="494"
      stroke="#69F0AE" stroke-width="54" stroke-linecap="round" stroke-opacity="0.10"/>
<!-- Main stem -->
<line x1="512" y1="830" x2="512" y2="496"
      stroke="#66BB6A" stroke-width="24" stroke-linecap="round"/>

<!-- Left leaf -->
<ellipse cx="390" cy="602" rx="150" ry="65" transform="rotate(-37 390 602)"
         fill="url(#leafL)" filter="url(#pglow)"/>
<!-- Left vein main -->
<path d="M 512 658 Q 452 628 388 598"
      fill="none" stroke="#E8F5E9" stroke-width="4.5" stroke-linecap="round" stroke-opacity="0.6"/>
<!-- Left secondary veins -->
<path d="M 464 638 Q 428 616 394 600"
      fill="none" stroke="#E8F5E9" stroke-width="2" stroke-linecap="round" stroke-opacity="0.32"/>
<path d="M 432 622 Q 392 598 372 582"
      fill="none" stroke="#E8F5E9" stroke-width="2" stroke-linecap="round" stroke-opacity="0.32"/>

<!-- Right leaf -->
<ellipse cx="634" cy="566" rx="150" ry="65" transform="rotate(37 634 566)"
         fill="url(#leafR)" filter="url(#pglow)"/>
<!-- Right vein main -->
<path d="M 512 616 Q 572 588 636 560"
      fill="none" stroke="#E8F5E9" stroke-width="4.5" stroke-linecap="round" stroke-opacity="0.6"/>
<!-- Right secondary veins -->
<path d="M 562 601 Q 600 578 632 562"
      fill="none" stroke="#E8F5E9" stroke-width="2" stroke-linecap="round" stroke-opacity="0.32"/>
<path d="M 592 587 Q 632 563 654 546"
      fill="none" stroke="#E8F5E9" stroke-width="2" stroke-linecap="round" stroke-opacity="0.32"/>

<!-- Young bud at top -->
<ellipse cx="512" cy="496" rx="40" ry="62" fill="url(#bud)"/>
<ellipse cx="504" cy="477" rx="20" ry="32" fill="#CCFF90" fill-opacity="0.38"/>

<!-- ── SOIL MOUND ── -->
<ellipse cx="512" cy="836" rx="204" ry="46" fill="#145820"/>
<ellipse cx="512" cy="830" rx="200" ry="38" fill="#2E7D32"/>
<ellipse cx="512" cy="823" rx="194" ry="30" fill="#388E3C"/>
<!-- Soil speckles -->
<circle cx="444" cy="818" r="7" fill="#2E7D32"/>
<circle cx="478" cy="827" r="5" fill="#1B5E20"/>
<circle cx="520" cy="817" r="6" fill="#2E7D32"/>
<circle cx="558" cy="824" r="5" fill="#1B5E20"/>
<circle cx="594" cy="816" r="6" fill="#2E7D32"/>

<!-- ── VERIFIED SHIELD BADGE (bottom-right) ── -->
<!-- Badge golden aura -->
<ellipse cx="800" cy="804" rx="98" ry="98" fill="#FFB300" fill-opacity="0.17"/>
<g filter="url(#bshadow)">
  <!-- Shield path -->
  <path d="M 742 742 L 858 742 L 886 770 L 886 852 L 800 900 L 714 852 L 714 770 Z"
        fill="url(#gold)"/>
  <!-- Inner border highlight -->
  <path d="M 750 752 L 850 752 L 875 776 L 875 848 L 800 888 L 725 848 L 725 776 Z"
        fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.32"/>
  <!-- Checkmark -->
  <path d="M 744 814 L 782 852 L 860 764"
        fill="none" stroke="#FFFFFF" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<!-- Sparkle on shield corner -->
<path d="M 858 744 L 865 753 L 874 744 L 865 735 Z" fill="#FFFFFF" fill-opacity="0.82"/>

<!-- ── GLOSS OVERLAY ── -->
<rect width="1024" height="1024" rx="196" fill="url(#gloss)"/>
</svg>`;

// ─────────────────────────────────────────────────────────────
// 2. ADAPTIVE ICON  (adaptive-icon.png)
//    Same art but NO rounded corners — Android handles clipping.
//    Main content kept in the central ~66% safe zone.
// ─────────────────────────────────────────────────────────────
const ADAPTIVE_SVG = ICON_SVG.replace(
  /(<rect width="1024" height="1024") rx="196"/g,
  '$1 rx="0"'
);

// ─────────────────────────────────────────────────────────────
// 3. SPLASH ICON  (splash-icon.png)
//    Deep forest background + scaled logo in upper half +
//    anime-style African farmer character in lower half +
//    app name text at bottom.
// ─────────────────────────────────────────────────────────────
const SPLASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
<defs>
  <!-- Background -->
  <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#050F07"/>
    <stop offset="50%"  stop-color="#0F3B18"/>
    <stop offset="82%"  stop-color="#1A6030"/>
    <stop offset="100%" stop-color="#0F3018"/>
  </linearGradient>
  <radialGradient id="sunrise" cx="512" cy="660" r="340" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#FFA000" stop-opacity="0.24"/>
    <stop offset="55%"  stop-color="#FF6F00" stop-opacity="0.09"/>
    <stop offset="100%" stop-color="#FF6F00" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="topglow" cx="512" cy="230" r="240" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#27AE60" stop-opacity="0.26"/>
    <stop offset="100%" stop-color="#27AE60" stop-opacity="0"/>
  </radialGradient>
  <!-- Logo leaf gradients -->
  <linearGradient id="sLL" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0%"   stop-color="#1B5E20"/>
    <stop offset="100%" stop-color="#76FF03"/>
  </linearGradient>
  <linearGradient id="sLR" x1="1" y1="1" x2="0" y2="0">
    <stop offset="0%"   stop-color="#1B5E20"/>
    <stop offset="100%" stop-color="#76FF03"/>
  </linearGradient>
  <linearGradient id="sBud" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%"   stop-color="#2E7D32"/>
    <stop offset="100%" stop-color="#CCFF90"/>
  </linearGradient>
  <!-- Farmer gradients -->
  <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#A0622A"/>
    <stop offset="100%" stop-color="#7A4726"/>
  </linearGradient>
  <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#43A047"/>
    <stop offset="100%" stop-color="#1B5E20"/>
  </linearGradient>
  <linearGradient id="jeans" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#1976D2"/>
    <stop offset="100%" stop-color="#0D47A1"/>
  </linearGradient>
  <linearGradient id="hat" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#ECD050"/>
    <stop offset="100%" stop-color="#9A760E"/>
  </linearGradient>
  <linearGradient id="hatbrim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#D8B840"/>
    <stop offset="100%" stop-color="#B89020"/>
  </linearGradient>
  <!-- Ground -->
  <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#2E7D32"/>
    <stop offset="100%" stop-color="#165820"/>
  </linearGradient>
</defs>

<!-- ── BACKGROUND ── -->
<rect width="1024" height="1024" fill="url(#sbg)"/>
<ellipse cx="512" cy="680" rx="360" ry="290" fill="url(#sunrise)"/>
<ellipse cx="512" cy="230" rx="256" ry="224" fill="url(#topglow)"/>

<!-- Stars -->
<circle cx="110" cy="70"  r="2"   fill="#FFFFFF" fill-opacity="0.56"/>
<circle cx="200" cy="130" r="1.5" fill="#FFFFFF" fill-opacity="0.42"/>
<circle cx="348" cy="52"  r="2.2" fill="#FFFFFF" fill-opacity="0.60"/>
<circle cx="680" cy="80"  r="1.8" fill="#FFFFFF" fill-opacity="0.50"/>
<circle cx="800" cy="42"  r="2"   fill="#FFFFFF" fill-opacity="0.44"/>
<circle cx="920" cy="110" r="1.5" fill="#FFFFFF" fill-opacity="0.36"/>
<circle cx="960" cy="200" r="2"   fill="#FFFFFF" fill-opacity="0.50"/>
<circle cx="80"  cy="290" r="1.8" fill="#FFFFFF" fill-opacity="0.32"/>
<circle cx="948" cy="302" r="2"   fill="#FFFFFF" fill-opacity="0.36"/>
<circle cx="148" cy="196" r="1.5" fill="#FFFFFF" fill-opacity="0.28"/>

<!-- Background hills -->
<ellipse cx="190"  cy="972" rx="360" ry="148" fill="#0D3B1A" fill-opacity="0.82"/>
<ellipse cx="834"  cy="980" rx="360" ry="148" fill="#0D3B1A" fill-opacity="0.82"/>
<ellipse cx="512"  cy="998" rx="620" ry="122" fill="#1A5C2A"/>

<!-- ── LOGO (scaled 0.30×, centred in upper 320px) ── -->
<!-- transform maps original (0,0)–(1024,1024) → (358,45)–(665,352) -->
<g transform="translate(358,45) scale(0.30)">
  <!-- Network rings -->
  <circle cx="512" cy="490" r="298" fill="none" stroke="#27AE60" stroke-width="4" stroke-opacity="0.22"/>
  <circle cx="512" cy="490" r="216" fill="none" stroke="#27AE60" stroke-width="4" stroke-opacity="0.26"/>
  <!-- Signal arcs -->
  <path d="M 210 558 Q 512 208 814 558"
        fill="none" stroke="#FFB300" stroke-width="22" stroke-linecap="round" stroke-opacity="0.40"/>
  <path d="M 308 534 Q 512 246 716 534"
        fill="none" stroke="#FFB300" stroke-width="36" stroke-linecap="round" stroke-opacity="0.68"/>
  <path d="M 406 510 Q 512 284 618 510"
        fill="none" stroke="#FFD54F" stroke-width="52" stroke-linecap="round"/>
  <!-- Signal dot -->
  <circle cx="512" cy="268" r="70"  fill="#FF8F00" fill-opacity="0.85"/>
  <circle cx="512" cy="268" r="44"  fill="#FFE082"/>
  <circle cx="512" cy="268" r="18"  fill="#FFFFFF"/>
  <!-- Stem glow -->
  <line x1="512" y1="828" x2="512" y2="496"
        stroke="#69F0AE" stroke-width="110" stroke-linecap="round" stroke-opacity="0.10"/>
  <!-- Stem -->
  <line x1="512" y1="830" x2="512" y2="496"
        stroke="#66BB6A" stroke-width="58" stroke-linecap="round"/>
  <!-- Left leaf -->
  <ellipse cx="390" cy="602" rx="300" ry="130" transform="rotate(-37 390 602)" fill="url(#sLL)"/>
  <path d="M 512 658 Q 452 628 388 598"
        fill="none" stroke="#E8F5E9" stroke-width="11" stroke-linecap="round" stroke-opacity="0.55"/>
  <!-- Right leaf -->
  <ellipse cx="634" cy="566" rx="300" ry="130" transform="rotate(37 634 566)" fill="url(#sLR)"/>
  <path d="M 512 616 Q 572 588 636 560"
        fill="none" stroke="#E8F5E9" stroke-width="11" stroke-linecap="round" stroke-opacity="0.55"/>
  <!-- Bud -->
  <ellipse cx="512" cy="496" rx="80" ry="122" fill="url(#sBud)"/>
  <ellipse cx="504" cy="466" rx="40" ry="64"  fill="#CCFF90" fill-opacity="0.38"/>
  <!-- Soil -->
  <ellipse cx="512" cy="836" rx="400" ry="90"  fill="#145820"/>
  <ellipse cx="512" cy="824" rx="390" ry="72"  fill="#388E3C"/>
</g>

<!-- ── FARMER CHARACTER ── -->

<!-- Ground platform -->
<ellipse cx="512" cy="940" rx="318" ry="38" fill="url(#gnd)"/>
<!-- Grass blades -->
<path d="M 224 934 Q 228 900 231 934" fill="none" stroke="#4CAF50" stroke-width="5" stroke-linecap="round"/>
<path d="M 244 932 Q 240 895 246 932" fill="none" stroke="#66BB6A" stroke-width="4" stroke-linecap="round"/>
<path d="M 264 934 Q 268 898 270 934" fill="none" stroke="#4CAF50" stroke-width="5" stroke-linecap="round"/>
<path d="M 754 934 Q 758 900 761 934" fill="none" stroke="#4CAF50" stroke-width="5" stroke-linecap="round"/>
<path d="M 774 932 Q 770 895 776 932" fill="none" stroke="#66BB6A" stroke-width="4" stroke-linecap="round"/>
<path d="M 794 934 Q 798 898 800 934" fill="none" stroke="#4CAF50" stroke-width="5" stroke-linecap="round"/>

<!-- Shoes -->
<ellipse cx="474" cy="924" rx="44" ry="17" fill="#3E2723"/>
<ellipse cx="466" cy="919" rx="24" ry=" 8" fill="#5D4037" fill-opacity="0.5"/>
<ellipse cx="550" cy="924" rx="44" ry="17" fill="#3E2723"/>
<ellipse cx="542" cy="919" rx="24" ry=" 8" fill="#5D4037" fill-opacity="0.5"/>

<!-- Jeans / legs -->
<rect x="452" y="832" width="48" height="93" rx="15" fill="url(#jeans)"/>
<rect x="524" y="832" width="48" height="93" rx="15" fill="url(#jeans)"/>
<rect x="458" y="840" width="11" height="78" rx="5"  fill="#1976D2" fill-opacity="0.38"/>
<rect x="530" y="840" width="11" height="78" rx="5"  fill="#1976D2" fill-opacity="0.38"/>

<!-- Body / shirt -->
<path d="M 436 702 L 430 834 L 594 834 L 588 702 L 566 692 L 512 700 L 458 692 Z"
      fill="url(#shirt)"/>
<!-- Shirt front stripe -->
<rect x="506" y="700" width="12" height="134" rx="4" fill="#4CAF50" fill-opacity="0.38"/>
<!-- Pocket -->
<rect x="470" y="726" width="32" height="28" rx="5" fill="#2E7D32" fill-opacity="0.58"/>
<!-- Collar -->
<path d="M 458 692 Q 490 716 512 714 Q 534 716 566 692 L 548 672 Q 512 686 476 672 Z"
      fill="#1B5E20"/>

<!-- Left arm (wheat) — upper sleeve -->
<path d="M 436 710 Q 388 748 358 812"
      stroke="#43A047" stroke-width="40" stroke-linecap="round" fill="none"/>
<!-- Left forearm skin -->
<path d="M 390 756 Q 360 800 348 838"
      stroke="url(#skin)" stroke-width="30" stroke-linecap="round" fill="none"/>
<!-- Left hand -->
<ellipse cx="344" cy="845" rx="24" ry="20" fill="url(#skin)"/>

<!-- Wheat stalk in left hand -->
<path d="M 336 850 Q 302 786 288 712"
      stroke="#C4A040" stroke-width="7" stroke-linecap="round" fill="none"/>
<!-- Wheat grains cluster -->
<ellipse cx="286" cy="702" rx="12" ry="17" transform="rotate(-14 286 702)" fill="#F0D060"/>
<ellipse cx="300" cy="697" rx="11" ry="16" transform="rotate(4 300 697)"  fill="#E8C840"/>
<ellipse cx="274" cy="716" rx="10" ry="15" transform="rotate(-26 274 716)" fill="#F5DE70"/>
<ellipse cx="296" cy="720" rx="10" ry="14" transform="rotate(-7 296 720)"  fill="#E8C840"/>
<ellipse cx="308" cy="710" rx="9"  ry="14" transform="rotate(10 308 710)"  fill="#F0D060"/>
<!-- Wheat whiskers -->
<path d="M 286 702 Q 272 680 266 662" stroke="#C4A040" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M 300 697 Q 296 674 296 656" stroke="#C4A040" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M 274 716 Q 260 694 256 676" stroke="#C4A040" stroke-width="3" stroke-linecap="round" fill="none"/>

<!-- Right arm (phone) — upper sleeve -->
<path d="M 588 710 Q 636 748 666 812"
      stroke="#43A047" stroke-width="40" stroke-linecap="round" fill="none"/>
<!-- Right forearm skin -->
<path d="M 634 756 Q 664 800 676 838"
      stroke="url(#skin)" stroke-width="30" stroke-linecap="round" fill="none"/>
<!-- Right hand -->
<ellipse cx="680" cy="845" rx="24" ry="20" fill="url(#skin)"/>

<!-- Smartphone -->
<rect x="662" y="804" width="56" height="90" rx="10" fill="#1A1A2E"/>
<rect x="668" y="814" width="44" height="72" rx="6"  fill="#0D47A1"/>
<!-- Phone screen — mini AgriConnect UI -->
<rect x="672" y="820" width="36" height="12" rx="3" fill="#4CAF50" fill-opacity="0.82"/>
<rect x="672" y="836" width="28" height="6"  rx="2" fill="#81C784" fill-opacity="0.64"/>
<rect x="672" y="846" width="22" height="6"  rx="2" fill="#A5D6A7" fill-opacity="0.50"/>
<rect x="672" y="856" width="36" height="16" rx="3" fill="#1565C0" fill-opacity="0.72"/>
<!-- Home button -->
<circle cx="690" cy="892" r="5" fill="#37474F"/>
<!-- Small camera -->
<circle cx="690" cy="808" r="4" fill="#212121"/>

<!-- Neck -->
<rect x="494" y="664" width="36" height="36" rx="11" fill="url(#skin)"/>

<!-- Head -->
<ellipse cx="512" cy="614" rx="70" ry="76" fill="url(#skin)"/>
<!-- Face highlight -->
<ellipse cx="490" cy="592" rx="42" ry="50" fill="#B87040" fill-opacity="0.28"/>

<!-- Hair -->
<path d="M 444 600 Q 446 534 512 526 Q 578 534 580 600 Q 566 568 512 564 Q 458 568 444 600 Z"
      fill="#170C06"/>

<!-- ── ANIME EYES ── -->
<!-- Left eye white -->
<ellipse cx="482" cy="608" rx="22" ry="26" fill="#FFFFFF"/>
<!-- Left iris (warm brown) -->
<ellipse cx="482" cy="610" rx="16" ry="20" fill="#5D3A1A"/>
<!-- Left pupil -->
<ellipse cx="482" cy="612" rx="9"  ry="13" fill="#180800"/>
<!-- Left highlights (anime sparkles) -->
<ellipse cx="475" cy="603" rx="6"  ry="8"  fill="#FFFFFF" fill-opacity="0.96"/>
<circle  cx="487" cy="601" r="3.5"         fill="#FFFFFF" fill-opacity="0.72"/>
<!-- Left upper lash line -->
<path d="M 462 596 Q 480 585 504 596"
      fill="none" stroke="#1C0F08" stroke-width="4.5" stroke-linecap="round"/>

<!-- Right eye white -->
<ellipse cx="542" cy="608" rx="22" ry="26" fill="#FFFFFF"/>
<!-- Right iris -->
<ellipse cx="542" cy="610" rx="16" ry="20" fill="#5D3A1A"/>
<!-- Right pupil -->
<ellipse cx="542" cy="612" rx="9"  ry="13" fill="#180800"/>
<!-- Right highlights -->
<ellipse cx="535" cy="603" rx="6"  ry="8"  fill="#FFFFFF" fill-opacity="0.96"/>
<circle  cx="547" cy="601" r="3.5"         fill="#FFFFFF" fill-opacity="0.72"/>
<!-- Right upper lash line -->
<path d="M 522 596 Q 540 585 564 596"
      fill="none" stroke="#1C0F08" stroke-width="4.5" stroke-linecap="round"/>

<!-- Eyebrows -->
<path d="M 462 582 Q 480 570 500 578"
      fill="none" stroke="#3E2008" stroke-width="7" stroke-linecap="round"/>
<path d="M 524 578 Q 544 570 562 582"
      fill="none" stroke="#3E2008" stroke-width="7" stroke-linecap="round"/>

<!-- Nose -->
<path d="M 506 636 Q 512 648 518 636"
      fill="none" stroke="#7A4726" stroke-width="4.5" stroke-linecap="round"/>

<!-- Mouth — warm smile -->
<path d="M 492 660 Q 512 678 532 660"
      fill="none" stroke="#7A4726" stroke-width="5.5" stroke-linecap="round"/>
<!-- Anime rosy cheeks -->
<ellipse cx="450" cy="640" rx="28" ry="14" fill="#FF7043" fill-opacity="0.19"/>
<ellipse cx="574" cy="640" rx="28" ry="14" fill="#FF7043" fill-opacity="0.19"/>

<!-- Ears -->
<ellipse cx="442" cy="618" rx="14" ry="20" fill="#8D5524"/>
<ellipse cx="444" cy="618" rx=" 8" ry="14" fill="#9E6030"/>
<ellipse cx="582" cy="618" rx="14" ry="20" fill="#8D5524"/>
<ellipse cx="580" cy="618" rx=" 8" ry="14" fill="#9E6030"/>

<!-- ── STRAW HAT ── -->
<!-- Brim shadow on head -->
<ellipse cx="512" cy="548" rx="142" ry="22" fill="#0A2014" fill-opacity="0.48"/>
<!-- Brim (wide oval) -->
<ellipse cx="512" cy="544" rx="154" ry="25" fill="url(#hatbrim)"/>
<ellipse cx="512" cy="539" rx="150" ry="20" fill="#D8C040"/>
<!-- Hat body (dome/cone) -->
<path d="M 362 542 Q 398 468 512 442 Q 626 468 662 542 Z" fill="url(#hat)"/>
<!-- Hat left shadow -->
<path d="M 362 542 Q 398 468 512 442 Q 458 458 412 498 Z" fill="#8A6810" fill-opacity="0.38"/>
<!-- Hat top highlight -->
<ellipse cx="512" cy="448" rx="50" ry="24" fill="#F0D858" fill-opacity="0.50"/>
<!-- Hat band -->
<path d="M 365 536 Q 512 524 659 536"
      fill="none" stroke="#7A5010" stroke-width="9" stroke-linecap="round"/>
<!-- Hat ribbon bow -->
<path d="M 428 529 Q 418 518 428 508 Q 444 518 428 529 Z" fill="#C0392B" fill-opacity="0.86"/>
<path d="M 452 529 Q 462 518 452 508 Q 436 518 452 529 Z" fill="#C0392B" fill-opacity="0.86"/>
<circle cx="440" cy="518" r="7" fill="#922B21"/>

<!-- ── APP NAME TEXT ── -->
<text x="512" y="970"
      text-anchor="middle"
      font-family="Arial Black, Arial, Helvetica, sans-serif"
      font-size="44" font-weight="900"
      fill="#4CAF50" letter-spacing="2">AgriConnect</text>
<text x="512" y="1008"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="30" font-weight="400"
      fill="#FFB300" letter-spacing="6">MARKET</text>
</svg>`;

// ─────────────────────────────────────────────────────────────
// 4. FAVICON  (favicon.png)
//    64×64 — simple rounded-square icon: mini plant + arc
// ─────────────────────────────────────────────────────────────
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs>
  <linearGradient id="fbg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#0B3018"/>
    <stop offset="100%" stop-color="#165A2A"/>
  </linearGradient>
  <linearGradient id="fLeafL" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0%"   stop-color="#2E7D32"/>
    <stop offset="100%" stop-color="#76FF03"/>
  </linearGradient>
  <linearGradient id="fLeafR" x1="1" y1="1" x2="0" y2="0">
    <stop offset="0%"   stop-color="#2E7D32"/>
    <stop offset="100%" stop-color="#76FF03"/>
  </linearGradient>
</defs>
<!-- Background -->
<rect width="64" height="64" rx="13" fill="url(#fbg)"/>

<!-- Signal arc -->
<path d="M 14 36 Q 32 18 50 36"
      fill="none" stroke="#FFD54F" stroke-width="2.8" stroke-linecap="round" stroke-opacity="0.92"/>
<!-- Signal dot -->
<circle cx="32" cy="17" r="4"   fill="#FFB300"/>
<circle cx="32" cy="17" r="2"   fill="#FFFFFF"/>

<!-- Stem -->
<line x1="32" y1="53" x2="32" y2="32"
      stroke="#66BB6A" stroke-width="3.5" stroke-linecap="round"/>
<!-- Left leaf -->
<ellipse cx="21" cy="40" rx="12" ry="5.5" transform="rotate(-38 21 40)" fill="url(#fLeafL)"/>
<!-- Right leaf -->
<ellipse cx="43" cy="36" rx="12" ry="5.5" transform="rotate(38 43 36)"  fill="url(#fLeafR)"/>
<!-- Bud -->
<ellipse cx="32" cy="32" rx="4"  ry="5.5" fill="#CCFF90"/>

<!-- Soil -->
<ellipse cx="32" cy="53" rx="14" ry="4"   fill="#2E7D32"/>
<ellipse cx="32" cy="51" rx="13" ry="3"   fill="#388E3C"/>
</svg>`;

// ─────────────────────────────────────────────────────────────
// GENERATE ALL ASSETS
// ─────────────────────────────────────────────────────────────
const assets = [
  { file: "icon.png", svg: ICON_SVG, width: 1024 },
  { file: "adaptive-icon.png", svg: ADAPTIVE_SVG, width: 1024 },
  { file: "splash-icon.png", svg: SPLASH_SVG, width: 1024 },
  { file: "favicon.png", svg: FAVICON_SVG, width: 64 },
];

console.log("AgriConnect Market — Generating assets...\n");

let ok = 0;
let fail = 0;

for (const { file, svg, width } of assets) {
  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
      font: { loadSystemFonts: true },
    });
    const rendered = resvg.render();
    const pngBuffer = rendered.asPng();
    const outPath = path.join(__dirname, file);
    fs.writeFileSync(outPath, pngBuffer);
    const kb = (pngBuffer.length / 1024).toFixed(1);
    console.log(`  ✓  ${file.padEnd(22)} ${width}×${width}px  (${kb} KB)`);
    ok++;
  } catch (err) {
    console.error(`  ✗  ${file}  —  ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} generated, ${fail} failed.`);
