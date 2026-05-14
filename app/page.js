'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

const BASE_URL = 'https://surmesur-tryon.vercel.app'

// ─── VILLES & DEVISES ─────────────────────────────────────────────────────
const CITIES = [
  { id: 'montreal', label: 'Montréal', currency: 'CAD', symbol: '$', email: 'montreal@surmesur.com' },
  { id: 'toronto', label: 'Toronto', currency: 'CAD', symbol: '$', email: 'toronto@surmesur.com' },
  { id: 'vancouver', label: 'Vancouver', currency: 'CAD', symbol: '$', email: 'vancouver@surmesur.com' },
  { id: 'ottawa', label: 'Ottawa', currency: 'CAD', symbol: '$', email: 'ottawa@surmesur.com' },
  { id: 'pittsburgh', label: 'Pittsburgh', currency: 'USD', symbol: '$', email: 'pittsburgh@surmesur.com' },
  { id: 'mexico', label: 'Mexico City', currency: 'MXN', symbol: '$', email: 'mexico@surmesur.com' },
]

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────
const T = {
  fr: {
    tagline: 'TECHNOLOGIE VIRTUELLE · VIRTUAL TRY-ON',
    heroTitle1: 'Essayez nos',
    heroTitle2: 'collections',
    heroTitle3: 'dans le confort de votre foyer',
    heroSub: 'Try our collections from the comfort of your home',
    stat1: 'LOOKS MAX',
    stat2: 'PIÈCES',
    stat3: 'SUR MESURE',
    step1Title: 'Votre photo',
    step1Sub: 'Pour un résultat fidèle à votre silhouette · For a result true to your silhouette',
    guideTitle: 'LA PHOTO PARFAITE',
    guideAvoid: 'À ÉVITER',
    guideGood: ['Corps entier visible, posture droite et naturelle', 'Lumière douce de face — fenêtre ou lumière naturelle', 'Fond blanc, gris clair ou mur uni', 'T-shirt ajusté blanc ou gris — révèle votre silhouette', 'Bras légèrement écartés du corps', 'Regard direct vers l\'appareil photo'],
    guideBad: ['Photo sombre, floue ou contre-jour', 'Pieds ou tête hors cadre', 'Vêtements amples ou superposés', 'Photo de profil, en biais ou en mouvement', 'Position assise ou décontractée', 'Fond chargé, coloré ou encombré'],
    noteTitle: 'NOTE DU STYLISTE',
    noteText: '"La qualité de votre photo détermine la précision du résultat. Une silhouette bien définie = un look remarquablement réaliste."',
    uploadTxt: 'Cliquez pour uploader votre photo',
    uploadSub: 'JPG, PNG · Max 10MB',
    btnCamera: '📷 PRENDRE UNE PHOTO',
    btnGallery: '🖼 MA GALERIE',
    camHint: '⏱ 3 secondes pour vous placer après le bouton',
    btnCancel: 'ANNULER',
    btnUse: '✓ UTILISER CETTE PHOTO',
    btnRetake: '↺ REPRENDRE',
    photoLoaded: 'Photo chargée ✓',
    changePhoto: 'Changer la photo',
    savePhoto: '⬇ Sauvegarder ma photo',
    step2Title0: 'Choisissez votre première pièce',
    step2TitleN: 'Ajouter une pièce',
    step2TitleR: 'Choisissez la pièce de remplacement',
    step2Sub: 'générations · Sélectionnez une pièce puis cliquez "Essayer"',
    catalogLabel: 'CATALOGUE',
    currentLook: 'VOTRE LOOK ACTUEL · YOUR CURRENT LOOK',
    download: '⬇ TÉLÉCHARGER CE LOOK · DOWNLOAD',
    replaceMode: 'Mode remplacement — Étape',
    cancelReplace: 'Annuler',
    btnTry: 'ESSAYER CETTE PIÈCE',
    btnTrySub: 'TRY THIS PIECE',
    btnReplace: 'REMPLACER CETTE PIÈCE',
    btnReplaceSub: 'REPLACE THIS PIECE',
    maxReached: 'Maximum 3 looks atteint',
    maxSub: 'Modifiez un look existant ou prenez rendez-vous',
    generating: 'GÉNÉRATION EN COURS...',
    aiWorking: 'L\'IA Surmesur travaille pour vous',
    selectionTitle: 'VOTRE SÉLECTION · YOUR OUTFIT',
    emptyState: 'Sélectionnez et essayez\nvos pièces dans le catalogue\nou laissez notre IA choisir',
    totalLabel: 'TOTAL ESTIMÉ',
    btnAppt: 'PRENDRE MON RENDEZ-VOUS',
    btnApptSub: 'BOOK MY FREE APPOINTMENT',
    btnVendor: '✉ ENVOYER AU VENDEUR',
    btnVendorSub: 'SEND TO STYLIST',
    btnRestart: '↺ RECOMMENCER · START OVER',
    selectCity: 'Choisir votre ville',
    cityLabel: 'VOTRE BOUTIQUE',
    surprise: '✦ SURPRENEZ-MOI',
    surpriseSub: 'SURPRISE ME · OUTFIT COMPLET',
    surpriseTitle: 'Quelle est l\'occasion ?',
    surpriseStylist: 'Notre styliste IA va créer un outfit complet et cohérent, spécialement pour vous.',
    surpriseLooks: 'Choisissez votre look',
    surpriseChange: '← Changer l\'occasion',
    surpriseTry: '✦ ESSAYER CE LOOK →',
    etape: 'Étape',
    step: 'Step',
    loadingMsgs: ['Analyse de votre silhouette...', 'Application du tissu sur mesure...', 'Ajustement des proportions...', 'Calibration des couleurs...', 'Finalisation de votre look...', 'Dernières retouches en cours...'],
    emailSubject: 'Sélection client Surmesur Try-On',
    emailBody: (items, total, city) => `Bonjour,\n\nUn client de la boutique ${city} a effectué une sélection via l'application Surmesur Try-On.\n\nSÉLECTION DU CLIENT :\n\n${items}\n\nTOTAL ESTIMÉ : ${total}\n\nMerci de préparer ce dossier pour le rendez-vous.\n\nCordialement,\nSurmesur Try-On`,
  },
  en: {
    tagline: 'VIRTUAL TECHNOLOGY · VIRTUAL TRY-ON',
    heroTitle1: 'Try our',
    heroTitle2: 'collections',
    heroTitle3: 'from the comfort of your home',
    heroSub: 'Essayez nos collections dans le confort de votre foyer',
    stat1: 'LOOKS MAX',
    stat2: 'PIECES',
    stat3: 'MADE TO MEASURE',
    step1Title: 'Your photo',
    step1Sub: 'For a result true to your silhouette · Pour un résultat fidèle à votre silhouette',
    guideTitle: 'THE PERFECT PHOTO',
    guideAvoid: 'TO AVOID',
    guideGood: ['Full body visible, straight natural posture', 'Soft front lighting — window or natural light', 'White, light grey or plain wall background', 'Fitted white or grey t-shirt — reveals your silhouette', 'Arms slightly away from your body', 'Looking directly at the camera'],
    guideBad: ['Dark, blurry or backlit photo', 'Feet or head out of frame', 'Loose or layered clothing', 'Profile photo, angled or in motion', 'Sitting or relaxed position', 'Busy, colorful or cluttered background'],
    noteTitle: 'STYLIST\'S NOTE',
    noteText: '"Photo quality determines result accuracy. A well-defined silhouette = a remarkably realistic generated look."',
    uploadTxt: 'Click to upload your photo',
    uploadSub: 'JPG, PNG · Max 10MB',
    btnCamera: '📷 TAKE A PHOTO',
    btnGallery: '🖼 MY GALLERY',
    camHint: '⏱ 3 seconds to get in position after the button',
    btnCancel: 'CANCEL',
    btnUse: '✓ USE THIS PHOTO',
    btnRetake: '↺ RETAKE',
    photoLoaded: 'Photo loaded ✓',
    changePhoto: 'Change photo',
    savePhoto: '⬇ Save my photo',
    step2Title0: 'Choose your first piece',
    step2TitleN: 'Add a piece',
    step2TitleR: 'Choose the replacement piece',
    step2Sub: 'generations · Select a piece then click "Try"',
    catalogLabel: 'CATALOGUE',
    currentLook: 'YOUR CURRENT LOOK · VOTRE LOOK ACTUEL',
    download: '⬇ DOWNLOAD THIS LOOK · TÉLÉCHARGER',
    replaceMode: 'Replace mode — Step',
    cancelReplace: 'Cancel',
    btnTry: 'TRY THIS PIECE',
    btnTrySub: 'ESSAYER CETTE PIÈCE',
    btnReplace: 'REPLACE THIS PIECE',
    btnReplaceSub: 'REMPLACER CETTE PIÈCE',
    maxReached: 'Maximum 3 looks reached',
    maxSub: 'Edit an existing look or book an appointment',
    generating: 'GENERATING...',
    aiWorking: 'Surmesur AI is working for you',
    selectionTitle: 'YOUR OUTFIT · VOTRE SÉLECTION',
    emptyState: 'Select and try\npieces from the catalogue\nor let our AI choose',
    totalLabel: 'ESTIMATED TOTAL',
    btnAppt: 'BOOK MY APPOINTMENT',
    btnApptSub: 'PRENDRE MON RENDEZ-VOUS',
    btnVendor: '✉ SEND TO STYLIST',
    btnVendorSub: 'ENVOYER AU VENDEUR',
    btnRestart: '↺ START OVER · RECOMMENCER',
    selectCity: 'Choose your city',
    cityLabel: 'YOUR BOUTIQUE',
    surprise: '✦ SURPRISE ME',
    surpriseSub: 'LET OUR AI STYLIST CHOOSE',
    surpriseTitle: 'What\'s the occasion?',
    surpriseStylist: 'Our AI stylist will create a complete, cohesive outfit especially for you.',
    surpriseLooks: 'Choose your look',
    surpriseChange: '← Change occasion',
    surpriseTry: '✦ TRY THIS LOOK →',
    etape: 'Step',
    step: 'Step',
    loadingMsgs: ['Analyzing your silhouette...', 'Applying the custom fabric...', 'Adjusting proportions...', 'Calibrating colors...', 'Finalizing your look...', 'Last finishing touches...'],
    emailSubject: 'Surmesur Try-On Client Selection',
    emailBody: (items, total, city) => `Hello,\n\nA client from the ${city} boutique made a selection via the Surmesur Try-On app.\n\nCLIENT SELECTION:\n\n${items}\n\nESTIMATED TOTAL: ${total}\n\nPlease prepare this file for the appointment.\n\nBest regards,\nSurmesur Try-On`,
  },
  es: {
    tagline: 'TECNOLOGÍA VIRTUAL · VIRTUAL TRY-ON',
    heroTitle1: 'Prueba nuestras',
    heroTitle2: 'colecciones',
    heroTitle3: 'desde la comodidad de tu hogar',
    heroSub: 'Try our collections from the comfort of your home',
    stat1: 'LOOKS MÁX',
    stat2: 'PIEZAS',
    stat3: 'A MEDIDA',
    step1Title: 'Tu foto',
    step1Sub: 'Para un resultado fiel a tu silueta · For a result true to your silhouette',
    guideTitle: 'LA FOTO PERFECTA',
    guideAvoid: 'A EVITAR',
    guideGood: ['Cuerpo entero visible, postura recta y natural', 'Luz suave de frente — ventana o luz natural', 'Fondo blanco, gris claro o pared lisa', 'Camiseta ajustada blanca o gris — revela tu silueta', 'Brazos ligeramente separados del cuerpo', 'Mirada directa a la cámara'],
    guideBad: ['Foto oscura, borrosa o a contraluz', 'Pies o cabeza fuera del encuadre', 'Ropa holgada o superpuesta', 'Foto de perfil, en ángulo o en movimiento', 'Posición sentada o relajada', 'Fondo cargado, colorido o desordenado'],
    noteTitle: 'NOTA DEL ESTILISTA',
    noteText: '"La calidad de tu foto determina la precisión del resultado. Una silueta bien definida = un look notablemente realista."',
    uploadTxt: 'Haz clic para subir tu foto',
    uploadSub: 'JPG, PNG · Máx 10MB',
    btnCamera: '📷 TOMAR UNA FOTO',
    btnGallery: '🖼 MI GALERÍA',
    camHint: '⏱ 3 segundos para posicionarte después del botón',
    btnCancel: 'CANCELAR',
    btnUse: '✓ USAR ESTA FOTO',
    btnRetake: '↺ REPETIR',
    photoLoaded: 'Foto cargada ✓',
    changePhoto: 'Cambiar foto',
    savePhoto: '⬇ Guardar mi foto',
    step2Title0: 'Elige tu primera prenda',
    step2TitleN: 'Agregar una prenda',
    step2TitleR: 'Elige la prenda de reemplazo',
    step2Sub: 'generaciones · Selecciona una prenda y haz clic en "Probar"',
    catalogLabel: 'CATÁLOGO',
    currentLook: 'TU LOOK ACTUAL · YOUR CURRENT LOOK',
    download: '⬇ DESCARGAR ESTE LOOK · DOWNLOAD',
    replaceMode: 'Modo reemplazo — Paso',
    cancelReplace: 'Cancelar',
    btnTry: 'PROBAR ESTA PRENDA',
    btnTrySub: 'TRY THIS PIECE',
    btnReplace: 'REEMPLAZAR ESTA PRENDA',
    btnReplaceSub: 'REPLACE THIS PIECE',
    maxReached: 'Máximo 3 looks alcanzado',
    maxSub: 'Edita un look existente o reserva una cita',
    generating: 'GENERANDO...',
    aiWorking: 'La IA de Surmesur trabaja para ti',
    selectionTitle: 'TU SELECCIÓN · YOUR OUTFIT',
    emptyState: 'Selecciona y prueba\nprendas del catálogo\no deja que nuestra IA elija',
    totalLabel: 'TOTAL ESTIMADO',
    btnAppt: 'RESERVAR MI CITA',
    btnApptSub: 'BOOK MY FREE APPOINTMENT',
    btnVendor: '✉ ENVIAR AL ESTILISTA',
    btnVendorSub: 'SEND TO STYLIST',
    btnRestart: '↺ COMENZAR DE NUEVO',
    selectCity: 'Elige tu ciudad',
    cityLabel: 'TU BOUTIQUE',
    surprise: '✦ SORPRÉNDEME',
    surpriseSub: 'DEJA QUE NUESTRA IA ELIJA',
    surpriseTitle: '¿Cuál es la ocasión?',
    surpriseStylist: 'Nuestro estilista IA creará un outfit completo y coherente, especialmente para ti.',
    surpriseLooks: 'Elige tu look',
    surpriseChange: '← Cambiar ocasión',
    surpriseTry: '✦ PROBAR ESTE LOOK →',
    etape: 'Paso',
    step: 'Step',
    loadingMsgs: ['Analizando tu silueta...', 'Aplicando la tela a medida...', 'Ajustando proporciones...', 'Calibrando colores...', 'Finalizando tu look...', 'Últimos retoques...'],
    emailSubject: 'Selección cliente Surmesur Try-On',
    emailBody: (items, total, city) => `Hola,\n\nUn cliente de la boutique ${city} ha realizado una selección en la app Surmesur Try-On.\n\nSELECCIÓN DEL CLIENTE:\n\n${items}\n\nTOTAL ESTIMADO: ${total}\n\nPor favor prepare este expediente para la cita.\n\nAtentamente,\nSurmesur Try-On`,
  }
}

const CATALOGUE = {
  suits: {
    label: 'Complets', label_en: 'Suits', icon: '🤵', categorie: 'one-pieces',
    items: [
      { id: 's1', nom_fr: 'Complet Bleu Pétrole', image: `${BASE_URL}/suit-1.jpeg`, prix: '$1,100', desc: '3-Piece · Wool' },
      { id: 's2', nom_fr: 'Complet Charbon', image: `${BASE_URL}/suit-2.jpeg`, prix: '$1,150', desc: '3-Piece · Premium Wool' },
      { id: 's3', nom_fr: 'Complet Prince de Galles', image: `${BASE_URL}/suit-3.jpeg`, prix: '$1,200', desc: '3-Piece · Flannel' },
      { id: 's4', nom_fr: 'Complet Gris Chevron', image: `${BASE_URL}/suit-4.jpeg`, prix: '$1,180', desc: '3-Piece · Herringbone' },
    ]
  },
  jackets: {
    label: 'Vestons', label_en: 'Jackets', icon: '🧥', categorie: 'tops',
    items: [
      { id: 'j1', nom_fr: 'Blazer Lin Cobalt', image: `${BASE_URL}/jacket-1.jpeg`, prix: '$645', desc: 'Premium Linen · Single Breasted' },
      { id: 'j2', nom_fr: 'Veston Tweed Brun', image: `${BASE_URL}/jacket-2.jpeg`, prix: '$720', desc: 'British Tweed · Notch Lapel' },
      { id: 'j3', nom_fr: 'Blazer Navy Structuré', image: `${BASE_URL}/jacket-3.jpeg`, prix: '$695', desc: 'Wool Blend · Double Breasted' },
      { id: 'j4', nom_fr: 'Veston Crème Été', image: `${BASE_URL}/jacket-4.jpeg`, prix: '$610', desc: 'Cotton Linen · Relaxed Fit' },
    ]
  },
  coats: {
    label: 'Manteaux', label_en: 'Coats', icon: '🧣', categorie: 'tops',
    items: [
      { id: 'c1', nom_fr: 'Manteau Camel Premium', image: `${BASE_URL}/coat-1.jpeg`, prix: '$1,200', desc: 'Cashmere Blend · Mid-Length' },
      { id: 'c2', nom_fr: 'Manteau Laine Tan', image: `${BASE_URL}/coat-2.jpeg`, prix: '$1,350', desc: 'Pure Wool · Full Length' },
      { id: 'c3', nom_fr: 'Pardessus Noir Élégant', image: `${BASE_URL}/coat-3.jpeg`, prix: '$1,280', desc: 'Wool Cashmere · Slim Fit' },
      { id: 'c4', nom_fr: 'Manteau Gris Anthracite', image: `${BASE_URL}/coat-4.jpeg`, prix: '$1,180', desc: 'Wool Blend · Classic Cut' },
    ]
  },
  shirts: {
    label: 'Chemises', label_en: 'Shirts', icon: '👔', categorie: 'tops',
    items: [
      { id: 'sh1', nom_fr: 'Chemise Florale Bleue', image: `${BASE_URL}/shirt-1.jpeg`, prix: '$350', desc: 'Linen · Sport Shirt' },
      { id: 'sh2', nom_fr: 'Chemise Blanche Classique', image: `${BASE_URL}/shirt-2.jpeg`, prix: '$295', desc: 'Egyptian Cotton · French Cuff' },
      { id: 'sh3', nom_fr: 'Chemise Lin Beige', image: `${BASE_URL}/shirt-3.jpeg`, prix: '$320', desc: 'Premium Linen · Relaxed' },
      { id: 'sh4', nom_fr: 'Chemise Carreaux Bleus', image: `${BASE_URL}/shirt-4.jpeg`, prix: '$310', desc: 'Cotton · Slim Fit' },
    ]
  },
  pants: {
    label: 'Pantalons', label_en: 'Pants', icon: '👖', categorie: 'bottoms',
    items: [
      { id: 'p1', nom_fr: 'Jean Blanc Terio', image: `${BASE_URL}/jean-1.jpeg`, prix: '$250', desc: 'Custom Fit · White' },
      { id: 'p2', nom_fr: 'Pantalon Gris Flanelle', image: `${BASE_URL}/jean-2.jpeg`, prix: '$280', desc: 'Wool Flannel · Tailored' },
      { id: 'p3', nom_fr: 'Pantalon Navy Classique', image: `${BASE_URL}/jean-3.jpeg`, prix: '$265', desc: 'Wool Blend · Slim' },
      { id: 'p4', nom_fr: 'Jean Indigo Premium', image: `${BASE_URL}/jean-4.jpeg`, prix: '$235', desc: 'Selvedge Denim · Straight' },
    ]
  }
}

// ─── OUTFITS CURATÉS PAR OCCASION ─────────────────────────────────────────
// Ordre de génération : BAS → HAUT (pantalon d'abord, chemise ensuite, veston/manteau en dernier)
// Chaque outfit = [pantalon, chemise, pièce principale (veston/manteau/complet)]
const OCCASIONS = [
  {
    id: 'mariage',
    label: 'Mariage',
    label_en: 'Wedding',
    icon: '💍',
    desc: 'Élégance intemporelle pour le grand jour',
    outfits: [
      {
        nom: 'Le Marié Impeccable',
        pieces: [
          { ...CATALOGUE.pants.items[1], _stepIdx: 0 },    // Pantalon Gris Flanelle
          { ...CATALOGUE.shirts.items[1], _stepIdx: 1 },   // Chemise Blanche Classique
          { ...CATALOGUE.suits.items[0], _stepIdx: 2 },    // Complet Bleu Pétrole
        ]
      },
      {
        nom: 'L\'Invité Distingué',
        pieces: [
          { ...CATALOGUE.pants.items[2], _stepIdx: 0 },    // Pantalon Navy
          { ...CATALOGUE.shirts.items[1], _stepIdx: 1 },   // Chemise Blanche
          { ...CATALOGUE.jackets.items[0], _stepIdx: 2 },  // Blazer Lin Cobalt
        ]
      },
    ]
  },
  {
    id: 'bureau',
    label: 'Bureau',
    label_en: 'Office',
    icon: '🏢',
    desc: 'Autorité et confiance au quotidien',
    outfits: [
      {
        nom: 'Le Dirigeant',
        pieces: [
          { ...CATALOGUE.pants.items[1], _stepIdx: 0 },    // Pantalon Gris Flanelle
          { ...CATALOGUE.shirts.items[3], _stepIdx: 1 },   // Chemise Carreaux Bleus
          { ...CATALOGUE.suits.items[1], _stepIdx: 2 },    // Complet Charbon
        ]
      },
      {
        nom: 'Le Professionnel Moderne',
        pieces: [
          { ...CATALOGUE.pants.items[2], _stepIdx: 0 },    // Pantalon Navy
          { ...CATALOGUE.shirts.items[2], _stepIdx: 1 },   // Chemise Lin Beige
          { ...CATALOGUE.jackets.items[2], _stepIdx: 2 },  // Blazer Navy Structuré
        ]
      },
    ]
  },
  {
    id: 'soiree',
    label: 'Soirée',
    label_en: 'Evening',
    icon: '🥂',
    desc: 'Sophistication pour les grandes occasions',
    outfits: [
      {
        nom: 'Le Gala',
        pieces: [
          { ...CATALOGUE.pants.items[1], _stepIdx: 0 },    // Pantalon Gris Flanelle
          { ...CATALOGUE.shirts.items[1], _stepIdx: 1 },   // Chemise Blanche
          { ...CATALOGUE.suits.items[2], _stepIdx: 2 },    // Complet Prince de Galles
        ]
      },
      {
        nom: 'La Nuit Élégante',
        pieces: [
          { ...CATALOGUE.pants.items[1], _stepIdx: 0 },    // Pantalon Gris
          { ...CATALOGUE.shirts.items[0], _stepIdx: 1 },   // Chemise Florale
          { ...CATALOGUE.jackets.items[1], _stepIdx: 2 },  // Veston Tweed Brun
        ]
      },
    ]
  },
  {
    id: 'casual',
    label: 'Casual Chic',
    label_en: 'Casual Chic',
    icon: '✨',
    desc: 'Style décontracté mais toujours impeccable',
    outfits: [
      {
        nom: 'Le Week-end Premium',
        pieces: [
          { ...CATALOGUE.pants.items[0], _stepIdx: 0 },    // Jean Blanc Terio
          { ...CATALOGUE.shirts.items[2], _stepIdx: 1 },   // Chemise Lin Beige
          { ...CATALOGUE.jackets.items[3], _stepIdx: 2 },  // Veston Crème Été
        ]
      },
      {
        nom: 'L\'Explorateur Chic',
        pieces: [
          { ...CATALOGUE.pants.items[3], _stepIdx: 0 },    // Jean Indigo
          { ...CATALOGUE.shirts.items[0], _stepIdx: 1 },   // Chemise Florale
          { ...CATALOGUE.coats.items[0], _stepIdx: 2 },    // Manteau Camel
        ]
      },
    ]
  },
  {
    id: 'automne',
    label: 'Automne / Hiver',
    label_en: 'Fall / Winter',
    icon: '🍂',
    desc: 'Chaleur et élégance pour la saison froide',
    outfits: [
      {
        nom: 'L\'Aristocrate Urbain',
        pieces: [
          { ...CATALOGUE.pants.items[1], _stepIdx: 0 },    // Pantalon Gris Flanelle
          { ...CATALOGUE.shirts.items[3], _stepIdx: 1 },   // Chemise Carreaux
          { ...CATALOGUE.coats.items[1], _stepIdx: 2 },    // Manteau Laine Tan
        ]
      },
      {
        nom: 'Le Gentleman d\'Hiver',
        pieces: [
          { ...CATALOGUE.pants.items[2], _stepIdx: 0 },    // Pantalon Navy
          { ...CATALOGUE.shirts.items[1], _stepIdx: 1 },   // Chemise Blanche
          { ...CATALOGUE.coats.items[2], _stepIdx: 2 },    // Pardessus Noir
        ]
      },
    ]
  },
]

const MAX_GENERATIONS = 3

const LOADING_MESSAGES = [
  { fr: 'Analyse de votre silhouette...', en: 'Analyzing your silhouette...' },
  { fr: 'Application du tissu sur mesure...', en: 'Applying the custom fabric...' },
  { fr: 'Ajustement des proportions...', en: 'Adjusting proportions...' },
  { fr: 'Calibration des couleurs...', en: 'Calibrating colors...' },
  { fr: 'Finalisation de votre look...', en: 'Finalizing your look...' },
  { fr: 'Dernières retouches en cours...', en: 'Last finishing touches...' },
]

export default function SurmesurTryOn() {
  const [phase, setPhase] = useState('photo')
  const [photoClient, setPhotoClient] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [activeTab, setActiveTab] = useState('suits')
  const [generations, setGenerations] = useState([])
  const [sidebarItems, setSidebarItems] = useState([])
  const [generating, setGenerating] = useState(false)
  const [autoGenerating, setAutoGenerating] = useState(false)
  const [autoStep, setAutoStep] = useState(0)
  const [autoTotal, setAutoTotal] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [error, setError] = useState(null)
  const [activeResultIdx, setActiveResultIdx] = useState(0)
  const [replaceMode, setReplaceMode] = useState(null)
  const [pendingItem, setPendingItem] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [photoConfirmation, setPhotoConfirmation] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [lang, setLang] = useState('fr')
  const [selectedCity, setSelectedCity] = useState(null)
  const [showCityModal, setShowCityModal] = useState(false)
  const t = T[lang]
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const resultRef = useRef(null)

  const totalPrice = sidebarItems.reduce((sum, it) => {
    return sum + parseFloat(it.prix.replace('$', '').replace(',', ''))
  }, 0)
  const formatPrice = (n) => {
    const city = selectedCity
    if (!city) return '$' + n.toLocaleString('en-CA') + ' CAD'
    if (city.currency === 'MXN') return '$' + Math.round(n * 13.5).toLocaleString('es-MX') + ' MXN'
    if (city.currency === 'USD') return '$' + Math.round(n * 0.73).toLocaleString('en-US') + ' USD'
    return '$' + n.toLocaleString('en-CA') + ' CAD'
  }

  // Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      setCameraActive(true)
      setPhotoConfirmation(null)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 150)
    } catch {
      setError('Caméra non disponible — utilisez le bouton Galerie')
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => { t.stop(); t.enabled = false })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load()
    }
    setCameraActive(false)
    setCountdown(null)
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    setCountdown(3)
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(iv)
          const v = videoRef.current, c = canvasRef.current
          if (!v || !c) return null
          c.width = v.videoWidth; c.height = v.videoHeight
          c.getContext('2d').drawImage(v, 0, 0)
          setPhotoConfirmation(c.toDataURL('image/jpeg', 0.9))
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const confirmPhoto = () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(blob => {
      setPhotoClient(blob)
      setPhotoPreview(photoConfirmation)
      stopCamera()
      setPhotoConfirmation(null)
      setPhase('build')
    }, 'image/jpeg', 0.9)
  }

  // Génération unique
  const generateOne = async (item, modelSource, photoClientFile) => {
    const fd = new FormData()
    if (modelSource) {
      fd.append('model_url', modelSource)
    } else {
      fd.append('model_image', photoClientFile)
    }
    fd.append('garment_url', item.image)
    fd.append('background_prompt', '')
    fd.append('seed', Math.floor(Math.random() * 1000000).toString())
    const res = await fetch('/api/tryon', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur API')
    return data.output
  }

  // ─── SURPRENEZ-MOI : génération séquentielle automatique bas → haut ───
  const handleSurpriseGenerate = async (occasion) => {
    if (!photoClient) return
    setShowSurpriseModal(false)
    setError(null)

    // Choisir un outfit aléatoire pour l'occasion
    const outfit = occasion.outfits[Math.floor(Math.random() * occasion.outfits.length)]
    const pieces = outfit.pieces // [pantalon, chemise, veston/manteau]

    setAutoGenerating(true)
    setAutoTotal(pieces.length)
    setAutoStep(0)
    setGenerations([])
    setSidebarItems([])
    setActiveResultIdx(0)

    let lastResultUrl = null
    const newGenerations = []
    const newSidebarItems = []

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i]
      setAutoStep(i + 1)
      setProgress(0)
      setLoadingMsg(0)

      const piv = setInterval(() => setProgress(p => p < 85 ? p + Math.random() * 2.5 : p), 800)
      const msgiv = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 4000)

      try {
        const resultUrl = await generateOne(piece, lastResultUrl, photoClient)
        clearInterval(piv); clearInterval(msgiv)
        setProgress(100)
        lastResultUrl = resultUrl
        const gen = { item: piece, resultUrl }
        newGenerations.push(gen)
        newSidebarItems.push({ ...piece, _stepIdx: i })
        setGenerations([...newGenerations])
        setSidebarItems([...newSidebarItems])
        setActiveResultIdx(i)
      } catch (err) {
        clearInterval(piv); clearInterval(msgiv)
        setError(err.message)
        break
      }
    }

    setAutoGenerating(false)
    setAutoStep(0)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
  }

  // Génération manuelle
  const handleGenerate = async () => {
    if (!pendingItem) { setError('Sélectionnez une pièce dans le catalogue'); return }
    if (!photoClient) return

    setGenerating(true); setError(null); setProgress(0); setLoadingMsg(0)
    const piv = setInterval(() => setProgress(p => p < 85 ? p + Math.random() * 2.5 : p), 800)
    const msgiv = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 4000)

    try {
      let modelSource
      if (replaceMode !== null) {
        const baseUrl = replaceMode === 0 ? null : generations[replaceMode - 1]?.resultUrl
        modelSource = baseUrl || null
      } else {
        const lastResult = generations[generations.length - 1]?.resultUrl
        modelSource = lastResult || null
      }

      const fd = new FormData()
      if (modelSource) {
        fd.append('model_url', modelSource)
      } else {
        fd.append('model_image', photoClient)
      }
      fd.append('garment_url', pendingItem.image)
      fd.append('background_prompt', '')
      fd.append('seed', Math.floor(Math.random() * 1000000).toString())

      const res = await fetch('/api/tryon', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')

      clearInterval(piv); setProgress(100)

      if (replaceMode !== null) {
        setGenerations(prev => { const next = [...prev]; next[replaceMode] = { item: pendingItem, resultUrl: data.output }; return next })
        setSidebarItems(prev => { const next = [...prev]; const idx = next.findIndex(it => it._stepIdx === replaceMode); if (idx >= 0) next[idx] = { ...pendingItem, _stepIdx: replaceMode }; return next })
        setActiveResultIdx(replaceMode)
        setReplaceMode(null)
      } else {
        const newIdx = generations.length
        setGenerations(prev => [...prev, { item: pendingItem, resultUrl: data.output }])
        setSidebarItems(prev => [...prev, { ...pendingItem, _stepIdx: newIdx }])
        setActiveResultIdx(newIdx)
      }
      setPendingItem(null)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    } catch (err) {
      setError(err.message)
    } finally {
      clearInterval(piv); clearInterval(msgiv); setGenerating(false)
    }
  }

  const removeFromSidebar = (stepIdx) => setSidebarItems(prev => prev.filter(it => it._stepIdx !== stepIdx))
  const startReplace = (stepIdx) => { setReplaceMode(stepIdx); setPendingItem(null); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelReplace = () => { setReplaceMode(null); setPendingItem(null) }

  const reset = () => {
    setPhase('photo'); setPhotoClient(null); setPhotoPreview(null)
    setGenerations([]); setSidebarItems([]); setPendingItem(null)
    setReplaceMode(null); setActiveResultIdx(0); setError(null); setProgress(0)
    setAutoGenerating(false); stopCamera()
  }

  const sendEmail = () => {
    const vendorEmail = selectedCity?.email || 'vendeur@surmesur.com'
    const cityName = selectedCity?.label || 'Surmesur'
    const itemsList = sidebarItems.map((it) => {
      const gen = generations[it._stepIdx]
      const resultLine = gen?.resultUrl ? `\n  Look : ${gen.resultUrl}` : ''
      return `• ${it.nom_fr} — ${it.prix}\n  Photo : ${it.image}${resultLine}`
    }).join('\n\n')
    const subject = encodeURIComponent(t.emailSubject)
    const body = encodeURIComponent(t.emailBody(itemsList, formatPrice(totalPrice), cityName))
    window.location.href = `mailto:${vendorEmail}?subject=${subject}&body=${body}`
  }

  const canAddMore = generations.length < MAX_GENERATIONS && !autoGenerating
  const currentResult = generations[activeResultIdx]?.resultUrl
  const isGenerating = generating || autoGenerating

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const s = {
    page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1a1a' },
    header: { background: '#000', padding: '1.1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
    logo: { color: '#fff', fontSize: '1rem', letterSpacing: '0.35em', fontWeight: 300 },
    goldLine: { width: '50px', height: '1px', background: 'linear-gradient(90deg,transparent,#C9A96E,transparent)' },
    photoWrap: { maxWidth: '860px', margin: '0 auto', padding: '3rem 2rem' },
    hero: { textAlign: 'center', padding: '4rem 2rem 3rem', background: '#fff', borderBottom: '1px solid #e8e4df' },
    eyebrow: { fontSize: '0.72rem', letterSpacing: '0.28em', color: '#C9A96E', marginBottom: '1.2rem', fontFamily: 'sans-serif' },
    title: { fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.15, marginBottom: '0.8rem' },
    gold: { color: '#C9A96E', fontStyle: 'italic' },
    sub: { fontSize: '0.8rem', color: '#999', fontFamily: 'sans-serif', marginBottom: '1.5rem' },
    stats: { display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', marginTop: '0.5rem' },
    statN: { fontSize: '1.8rem', fontWeight: 300, color: '#C9A96E' },
    statL: { fontSize: '0.65rem', letterSpacing: '0.15em', color: '#aaa', fontFamily: 'sans-serif' },
    stepNum: { fontSize: '2.5rem', fontWeight: 300, color: '#e8e4df', lineHeight: 1 },
    stepTitle: { fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.25rem' },
    stepSub: { fontSize: '0.72rem', color: '#888', fontFamily: 'sans-serif', marginBottom: '1.25rem' },
    uploadZone: { border: '1px dashed #ccc', borderRadius: '4px', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer', background: '#fafaf8', marginBottom: '1rem' },
    uploadIcon: { fontSize: '2.5rem', color: '#C9A96E', marginBottom: '0.75rem' },
    uploadTxt: { fontSize: '1.1rem', fontWeight: 300, color: '#333', marginBottom: '0.3rem' },
    uploadSub: { fontSize: '0.65rem', color: '#bbb', fontFamily: 'sans-serif' },
    btnRow: { display: 'flex', gap: '0.75rem', marginTop: '1rem' },
    btnBlack: { flex: 1, padding: '1.1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
    btnOutline: { flex: 1, padding: '1.1rem', background: 'transparent', color: '#000', border: '1px solid #000', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
    btnGhost: { flex: 1, padding: '1.1rem', background: 'transparent', color: '#888', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
    camWrap: { borderRadius: '4px', overflow: 'hidden', background: '#000', aspectRatio: '4/3' },
    camVideo: { width: '100%', height: '100%', objectFit: 'cover' },
    camHint: { fontSize: '0.68rem', color: '#C9A96E', fontFamily: 'sans-serif', fontStyle: 'italic', textAlign: 'center', padding: '0.4rem' },
    capBtn: { display: 'flex', margin: '0.8rem auto', width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #C9A96E', background: 'transparent', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' },
    capInner: { width: '40px', height: '40px', borderRadius: '50%', background: '#C9A96E' },
    confirmImg: { width: '100%', borderRadius: '4px' },
    confirmBtns: { display: 'flex', gap: '0.6rem', marginTop: '0.6rem' },
    buildWrap: { display: 'flex', minHeight: 'calc(100vh - 56px)', flexDirection: isMobile ? 'column' : 'row' },
    sideCol: isMobile
      ? { display: 'none' }
      : { width: '290px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #e8e4df', padding: '1.25rem', display: 'flex', flexDirection: 'column' },
    resultSection: { marginBottom: '2rem' },
    resultLabel: { fontSize: '0.62rem', letterSpacing: '0.18em', color: '#C9A96E', fontFamily: 'sans-serif', marginBottom: '0.75rem' },
    resultImg: { width: '100%', maxHeight: '520px', objectFit: 'contain', borderRadius: '4px', background: '#f5f5f3', display: 'block' },
    thumbRow: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' },
    thumb: (active) => ({ border: active ? '2px solid #C9A96E' : '1px solid #e0dbd4', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer', position: 'relative', width: '72px', flexShrink: 0 }),
    thumbImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' },
    thumbLabel: { fontSize: '0.55rem', fontFamily: 'sans-serif', color: '#888', padding: '0.2rem 0.3rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    thumbEdit: { position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    replaceBanner: { background: '#fff8ee', border: '1px solid #C9A96E', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.72rem', fontFamily: 'sans-serif', color: '#7a5c1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
    catalogLabel: { fontSize: '0.62rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.75rem' },
    tabs: { display: 'flex', borderBottom: '1px solid #e8e4df', marginBottom: '1.25rem', overflowX: 'auto' },
    tab: (a) => ({ padding: '0.6rem 0.9rem', background: 'none', border: 'none', borderBottom: a ? '2px solid #C9A96E' : '2px solid transparent', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.07em', fontFamily: 'sans-serif', color: a ? '#C9A96E' : '#888', whiteSpace: 'nowrap' }),
    grid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.85rem', marginBottom: '1.5rem' },
    card: (sel) => ({ border: sel ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: sel ? '#fffef8' : '#fff', position: 'relative', transition: 'border-color 0.15s' }),
    cardImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' },
    cardInfo: { padding: '0.5rem' },
    cardName: { fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.15rem', lineHeight: 1.2 },
    cardDesc: { fontSize: '0.58rem', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '0.25rem' },
    cardPrice: { fontSize: '0.8rem', color: '#C9A96E' },
    checkBadge: { position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff' },
    trySection: { marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e8e4df' },
    tryPreview: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.6rem', background: '#f9f7f4', borderRadius: '4px' },
    tryPreviewImg: { width: '40px', height: '50px', objectFit: 'cover', borderRadius: '2px' },
    btnTry: { width: '100%', padding: '1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.7 },
    btnTryDisabled: { width: '100%', padding: '1rem', background: '#e0dbd4', color: '#aaa', border: 'none', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center' },
    maxMsg: { textAlign: 'center', fontSize: '0.68rem', fontFamily: 'sans-serif', color: '#C9A96E', padding: '0.75rem', border: '1px solid #e8d8b8', borderRadius: '4px', background: '#fffbf2', marginTop: '1rem' },
    progWrap: { height: '2px', background: '#e8e4df', marginTop: '0.6rem' },
    progBar: (p) => ({ height: '100%', background: 'linear-gradient(90deg,#C9A96E,#e8c87a)', width: `${p}%`, transition: 'width 0.5s ease' }),
    sideTitle: { fontSize: '0.6rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', borderBottom: '1px solid #e8e4df', paddingBottom: '0.6rem', marginBottom: '0.85rem' },
    sideList: { flex: 1, overflowY: 'auto' },
    sideItem: { display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.6rem 0', borderBottom: '1px solid #f0ece6' },
    sideImg: { width: '38px', height: '48px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 },
    sideInfo: { flex: 1, minWidth: 0 },
    sideName: { fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    sideCat: { fontSize: '0.58rem', color: '#aaa', fontFamily: 'sans-serif' },
    sidePrice: { fontSize: '0.75rem', color: '#C9A96E' },
    sideActions: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    sideBtn: (color) => ({ background: 'none', border: `1px solid ${color}`, borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.58rem', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    emptyState: { textAlign: 'center', padding: '2rem 0.5rem', color: '#ccc' },
    totalWrap: { borderTop: '1px solid #e8e4df', paddingTop: '0.85rem', marginTop: 'auto' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' },
    totalLabel: { fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif' },
    totalAmt: { fontSize: '1.2rem', fontWeight: 300 },
    btnAppt: { display: 'block', width: '100%', padding: '0.9rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.15em', fontFamily: 'sans-serif', textAlign: 'center', textDecoration: 'none', lineHeight: 1.7, boxSizing: 'border-box' },
    btnRestart: { display: 'block', width: '100%', padding: '0.65rem', background: 'transparent', color: '#aaa', border: '1px solid #e8e4df', cursor: 'pointer', fontSize: '0.62rem', letterSpacing: '0.12em', fontFamily: 'sans-serif', marginTop: '0.4rem', textAlign: 'center' },
    photoThumbRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.6rem', background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px' },
    photoThumb: { width: '52px', height: '66px', objectFit: 'cover', borderRadius: '2px', border: '1.5px solid #C9A96E', flexShrink: 0 },
    changeBtn: { fontSize: '0.65rem', color: '#C9A96E', fontFamily: 'sans-serif', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
    error: { background: '#fff5f5', border: '1px solid #ffd0d0', padding: '0.6rem 0.85rem', borderRadius: '4px', fontSize: '0.68rem', color: '#c00', fontFamily: 'sans-serif', marginTop: '0.75rem' },
    // Surprise button
    btnSurprise: { width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #C9A96E, #e8c87a)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.78rem', letterSpacing: '0.15em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.7, marginBottom: '0.75rem', borderRadius: '2px' },
    // Modal
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    modal: { background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '16px 16px 0 0', padding: '2rem 1.5rem 3rem', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.4rem', textAlign: 'center' },
    modalSub: { fontSize: '0.72rem', color: '#888', fontFamily: 'sans-serif', textAlign: 'center', marginBottom: '1.5rem' },
    occasionGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '0.75rem' },
    occasionCard: (sel) => ({ border: sel ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '8px', padding: '1.25rem 0.75rem', textAlign: 'center', cursor: 'pointer', background: sel ? '#fffef8' : '#fff', transition: 'all 0.2s' }),
    occasionIcon: { fontSize: '1.8rem', display: 'block', marginBottom: '0.4rem' },
    occasionLabel: { fontSize: '0.82rem', fontWeight: 400, marginBottom: '0.2rem' },
    occasionDesc: { fontSize: '0.6rem', color: '#aaa', fontFamily: 'sans-serif', lineHeight: 1.4 },
    // Auto-generate progress
    autoProgress: { background: '#fff', border: '1px solid #e8d8b8', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', background: '#fffbf2' },
  }

  const SpinnerStyle = `@keyframes spin { to { transform: rotate(360deg) } }`

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
      <style>{SpinnerStyle}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>SURMESUR</div>
        <div style={s.goldLine} />
        {/* Sélecteurs langue + ville */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
          {/* Langue */}
          {['fr', 'en', 'es'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6rem', letterSpacing: '0.15em', fontFamily: 'sans-serif', color: lang === l ? '#C9A96E' : 'rgba(255,255,255,0.35)', fontWeight: lang === l ? 700 : 400, padding: '0.2rem 0.4rem', borderBottom: lang === l ? '1px solid #C9A96E' : '1px solid transparent' }}>
              {l.toUpperCase()}
            </button>
          ))}
          <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)' }} />
          {/* Ville */}
          <button onClick={() => setShowCityModal(true)}
            style={{ background: 'none', border: '1px solid rgba(201,169,110,0.4)', cursor: 'pointer', fontSize: '0.58rem', letterSpacing: '0.12em', fontFamily: 'sans-serif', color: selectedCity ? '#C9A96E' : 'rgba(255,255,255,0.4)', padding: '0.2rem 0.6rem', borderRadius: '2px' }}>
            {selectedCity ? selectedCity.label : t.selectCity} {selectedCity ? `· ${selectedCity.currency}` : ''}
          </button>
        </div>
      </header>

      {/* Modal sélection ville */}
      {showCityModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300 }} onClick={() => setShowCityModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', zIndex: 301, borderRadius: '4px', padding: '2rem', maxWidth: '400px', width: '90vw' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#C9A96E', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>{t.cityLabel}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 300, marginBottom: '1.5rem' }}>{t.selectCity}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CITIES.map(city => (
                <button key={city.id}
                  onClick={() => { setSelectedCity(city); setShowCityModal(false) }}
                  style={{ padding: '0.85rem 1rem', border: selectedCity?.id === city.id ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '3px', background: selectedCity?.id === city.id ? '#fffef8' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 300 }}>{city.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#C9A96E', letterSpacing: '0.1em' }}>{city.currency}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MODAL SURPRENEZ-MOI ── */}
      {showSurpriseModal && (
        <div style={s.modalOverlay} onClick={() => setShowSurpriseModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#e0dbd4', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
            <div style={s.modalTitle}>✦ Surprenez-moi</div>
            <div style={s.modalSub}>Choisissez votre occasion — notre styliste IA compose votre look parfait · Choose your occasion</div>
            <div style={s.occasionGrid}>
              {OCCASIONS.map(occ => (
                <div
                  key={occ.id}
                  style={s.occasionCard(selectedOccasion?.id === occ.id)}
                  onClick={() => setSelectedOccasion(occ)}
                >
                  <span style={s.occasionIcon}>{occ.icon}</span>
                  <div style={s.occasionLabel}>{occ.label}</div>
                  <div style={s.occasionDesc}>{occ.desc}</div>
                </div>
              ))}
            </div>
            {selectedOccasion && (
              <button
                style={{ ...s.btnSurprise, marginTop: '1.5rem', marginBottom: 0 }}
                onClick={() => handleSurpriseGenerate(selectedOccasion)}
              >
                ✦ CRÉER MON LOOK {selectedOccasion.label.toUpperCase()}<br />
                <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>Génération automatique en 3 étapes · ~90 secondes</span>
              </button>
            )}
            <button
              style={{ ...s.btnRestart, marginTop: '0.75rem' }}
              onClick={() => setShowSurpriseModal(false)}
            >
              ANNULER
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE PHOTO ── */}
      {phase === 'photo' && (
        <>
          <div style={s.hero}>
            <div style={s.eyebrow}>{t.tagline}</div>
            <h1 style={s.title}>{t.heroTitle1} <span style={s.gold}>{t.heroTitle2}</span><br />{t.heroTitle3}</h1>
            <p style={s.sub}>{t.heroSub}</p>
            <div style={s.stats}>
              <div><div style={s.statN}>3</div><div style={s.statL}>{t.stat1}</div></div>
              <div><div style={s.statN}>22+</div><div style={s.statL}>{t.stat2}</div></div>
              <div><div style={s.statN}>100%</div><div style={s.statL}>{t.stat3}</div></div>
            </div>
          </div>

          <div style={s.photoWrap}>
            <div style={s.stepNum}>01</div>
            <div style={s.stepTitle}>{t.step1Title}</div>
            <div style={s.stepSub}>{t.step1Sub}</div>

            {/* Guide photo — deux cartes */}
            <div style={{ marginBottom: '1.75rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e8e4df' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>

                {/* Carte gauche — LA PHOTO PARFAITE — fond or */}
                <div style={{ background: '#C9A96E', padding: '2rem 1.75rem' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#000', fontFamily: 'sans-serif', fontWeight: 800, marginBottom: '0.3rem' }}>✦ {t.guideTitle}</div>
                  <div style={{ width: '30px', height: '1px', background: 'rgba(0,0,0,0.2)', marginBottom: '1.25rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {t.guideGood.map((text, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ color: '#fff', fontSize: '0.55rem', flexShrink: 0, marginTop: '0.25rem', opacity: 0.8 }}>✦</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'sans-serif', color: '#fff', lineHeight: 1.5 }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carte droite — À ÉVITER — fond noir */}
                <div style={{ background: '#111', padding: '2rem 1.75rem' }}>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A96E', fontFamily: 'sans-serif', fontWeight: 700, marginBottom: '0.3rem' }}>— {t.guideAvoid}</div>
                  <div style={{ width: '30px', height: '1px', background: 'rgba(201,169,110,0.3)', marginBottom: '1.25rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {t.guideBad.map((text, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ color: '#C9A96E', fontSize: '0.65rem', flexShrink: 0, marginTop: '0.1rem' }}>—</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, textDecoration: 'line-through', textDecorationColor: 'rgba(201,169,110,0.25)' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Note du styliste */}
              <div style={{ background: '#fff', padding: '1.1rem 1.75rem', borderTop: '1px solid #e8e4df', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <span style={{ color: '#C9A96E', fontSize: '0.8rem', flexShrink: 0, marginTop: '0.05rem' }}>✦</span>
                <div>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C9A96E', fontFamily: 'sans-serif', fontWeight: 600, marginBottom: '0.35rem' }}>{t.noteTitle}</div>
                  <div style={{ fontSize: '0.72rem', color: '#1a1a1a', fontFamily: 'sans-serif', lineHeight: 1.6, fontStyle: 'italic' }}>{t.noteText}</div>
                </div>
              </div>
            </div>

            {!cameraActive && !photoConfirmation && (
              <>
                <div style={s.uploadZone} onClick={() => fileInputRef.current?.click()}>
                  <div style={s.uploadIcon}>✦</div>
                  <div style={s.uploadTxt}>{t.uploadTxt}</div>
                  <div style={s.uploadSub}>{t.uploadSub}</div>
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnBlack} onClick={startCamera}>{t.btnCamera}</button>
                  <button style={s.btnOutline} onClick={() => fileInputRef.current?.click()}>{t.btnGallery}</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return
                  setPhotoClient(f); setPhotoPreview(URL.createObjectURL(f)); setPhase('build')
                }} style={{ display: 'none' }} />
              </>
            )}

            {cameraActive && !photoConfirmation && (
              <>
                <div style={s.camWrap}><video ref={videoRef} style={s.camVideo} autoPlay playsInline muted /></div>
                <div style={s.camHint}>⏱ 3 secondes pour vous placer après le bouton</div>
                <button onClick={capturePhoto} disabled={countdown !== null} style={s.capBtn}>
                  {countdown ? <span style={{ color: '#C9A96E', fontSize: '1.6rem', fontWeight: 300 }}>{countdown}</span> : <div style={s.capInner} />}
                </button>
                <button style={{ ...s.btnGhost, width: '100%', marginTop: '0.5rem' }} onClick={stopCamera}>ANNULER</button>
              </>
            )}

            {photoConfirmation && (
              <>
                <img src={photoConfirmation} alt="Preview" style={s.confirmImg} />
                <div style={s.confirmBtns}>
                  <button style={s.btnBlack} onClick={confirmPhoto}>✓ UTILISER CETTE PHOTO</button>
                  <button style={s.btnGhost} onClick={() => { setPhotoConfirmation(null); startCamera() }}>↺ REPRENDRE</button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </>
      )}

      {/* ── PHASE BUILD ── */}
      {phase === 'build' && (
        <div style={s.buildWrap}>
          {/* Main column */}
          <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '1rem' : '1.5rem', paddingBottom: isMobile ? '80px' : undefined }}>

            {/* Photo thumb */}
            <div style={s.photoThumbRow}>
              {photoPreview && <img src={photoPreview} alt="Votre photo" style={s.photoThumb} />}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 300, marginBottom: '0.3rem' }}>Photo chargée ✓</div>
                <button style={s.changeBtn} onClick={() => { stopCamera(); setPhase('photo'); setPhotoClient(null); setPhotoPreview(null); setGenerations([]); setSidebarItems([]); setPendingItem(null) }}>
                  Changer la photo
                </button>
                {photoPreview && (
                  <a href={photoPreview} download="ma-photo-surmesur.jpg" style={{ ...s.changeBtn, marginLeft: '0.75rem' }}>
                    ⬇ Sauvegarder
                  </a>
                )}
              </div>
            </div>

            {/* AUTO-GENERATE PROGRESS */}
            {autoGenerating && (
              <div style={s.autoProgress}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C9A96E', fontFamily: 'sans-serif', marginBottom: '1rem' }}>
                  ✦ SURPRENEZ-MOI — GÉNÉRATION AUTOMATIQUE
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[1, 2, 3].map(step => (
                    <div key={step} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: autoStep > step ? '#C9A96E' : autoStep === step ? 'transparent' : '#e8e4df',
                        border: autoStep === step ? '2px solid #C9A96E' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: autoStep > step ? '#fff' : autoStep === step ? '#C9A96E' : '#aaa',
                        margin: '0 auto 0.3rem',
                        animation: autoStep === step ? 'spin 1s linear infinite' : 'none'
                      }}>
                        {autoStep > step ? '✓' : step === 1 ? '👖' : step === 2 ? '👔' : '🧥'}
                      </div>
                      <div style={{ fontSize: '0.55rem', fontFamily: 'sans-serif', color: autoStep >= step ? '#C9A96E' : '#aaa' }}>
                        {step === 1 ? 'Pantalon' : step === 2 ? 'Chemise' : 'Veston'}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 300, marginBottom: '0.2rem' }}>{t.loadingMsgs[loadingMsg]}</div>
                <div style={{ fontSize: '0.62rem', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '0.75rem' }}>{t.aiWorking}</div>
                <div style={s.progWrap}><div style={s.progBar(progress)} /></div>
                <div style={{ fontSize: '0.58rem', color: '#C9A96E', fontFamily: 'sans-serif', marginTop: '0.4rem' }}>
                  {t.etape} {autoStep}/{autoTotal} · {Math.round(progress)}%
                </div>
              </div>
            )}

            {/* Spinner mobile génération manuelle */}
            {isMobile && generating && (
              <div style={{ background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {pendingItem && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.6rem', background: '#fafaf8', borderRadius: '3px', textAlign: 'left' }}>
                    <img src={pendingItem.image} alt={pendingItem.nom_fr} style={{ width: '44px', height: '55px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 400, marginBottom: '0.1rem' }}>{pendingItem.nom_fr}</div>
                      <div style={{ fontSize: '0.62rem', color: '#C9A96E', fontFamily: 'sans-serif' }}>{pendingItem.prix}</div>
                    </div>
                  </div>
                )}
                <div style={{ width: '44px', height: '44px', margin: '0 auto 0.75rem', borderRadius: '50%', border: '2px solid #e8e4df', borderTop: '2px solid #C9A96E', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 300, marginBottom: '0.2rem' }}>{t.loadingMsgs[loadingMsg]}</div>
                <div style={{ fontSize: '0.62rem', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '0.75rem' }}>{t.aiWorking}</div>
                <div style={s.progWrap}><div style={s.progBar(progress)} /></div>
                <div style={{ fontSize: '0.58rem', color: '#C9A96E', fontFamily: 'sans-serif', marginTop: '0.3rem' }}>{Math.round(progress)}%</div>
              </div>
            )}

            {/* Results section */}
            {generations.length > 0 && (
              <div style={s.resultSection} ref={resultRef}>
                <div style={s.resultLabel}>{t.currentLook}</div>
                {currentResult && (
                  <>
                    <img src={currentResult} alt="Look généré" style={s.resultImg} />
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(currentResult)
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `look-surmesur-etape-${activeResultIdx + 1}.png`
                          a.click()
                          URL.revokeObjectURL(url)
                        } catch { window.open(currentResult, '_blank') }
                      }}
                      style={{ display: 'inline-block', marginTop: '0.6rem', fontSize: '0.68rem', color: '#C9A96E', fontFamily: 'sans-serif', letterSpacing: '0.1em', background: 'none', border: '1px solid #C9A96E', padding: '0.4rem 0.85rem', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      {t.download}
                    </button>
                  </>
                )}
                <div style={s.thumbRow}>
                  {generations.map((gen, i) => (
                    <div key={i} style={s.thumb(i === activeResultIdx)} onClick={() => setActiveResultIdx(i)}>
                      <img src={gen.resultUrl} alt={gen.item.nom_fr} style={s.thumbImg} />
                      <div style={s.thumbLabel}>{gen.item.nom_fr}</div>
                      {!isGenerating && (
                        <button style={s.thumbEdit} onClick={(e) => { e.stopPropagation(); startReplace(i) }}>✎</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replace mode banner */}
            {replaceMode !== null && (
              <div style={s.replaceBanner}>
                <span>✎ {t.replaceMode} {replaceMode + 1} : <strong>{generations[replaceMode]?.item.nom_fr}</strong></span>
                <button onClick={cancelReplace} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a5c1e', fontFamily: 'sans-serif', fontSize: '0.68rem', textDecoration: 'underline' }}>{t.cancelReplace}</button>
              </div>
            )}

            {/* Catalog */}
            {!autoGenerating && (
              <>
                <div style={s.stepNum}>0{generations.length === 0 ? '2' : generations.length + 1}</div>
                <div style={s.stepTitle}>{replaceMode !== null ? t.step2TitleR : generations.length === 0 ? t.step2Title0 : t.step2TitleN}</div>
                <div style={s.stepSub}>
                  {replaceMode !== null
                    ? `${t.replaceMode} : ${generations[replaceMode]?.item.nom_fr}`
                    : `${generations.length}/${MAX_GENERATIONS} ${t.step2Sub}`}
                </div>

                <div style={s.catalogLabel}>{t.catalogLabel} · {CATALOGUE[activeTab].label.toUpperCase()}</div>
                <div style={s.tabs}>
                  {Object.entries(CATALOGUE).map(([key, cat]) => (
                    <button key={key} style={s.tab(activeTab === key)} onClick={() => setActiveTab(key)}>
                      {cat.icon} {lang === 'en' ? cat.label_en || cat.label : cat.label}
                    </button>
                  ))}
                </div>

                <div style={s.grid}>
                  {CATALOGUE[activeTab].items.map(item => {
                    const isSel = pendingItem?.id === item.id
                    return (
                      <div key={item.id} style={s.card(isSel)} onClick={() => { setPendingItem(item); setError(null) }}>
                        <img src={item.image} alt={item.nom_fr} style={s.cardImg} />
                        {isSel && <div style={s.checkBadge}>✓</div>}
                        <div style={s.cardInfo}>
                          <div style={s.cardName}>{item.nom_fr}</div>
                          <div style={s.cardDesc}>{item.desc}</div>
                          <div style={s.cardPrice}>{item.prix}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Try button — desktop only */}
                {!isMobile && (
                  <div style={s.trySection}>
                    {pendingItem && (
                      <div style={s.tryPreview}>
                        <img src={pendingItem.image} alt={pendingItem.nom_fr} style={s.tryPreviewImg} />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 400 }}>{pendingItem.nom_fr}</div>
                          <div style={{ fontSize: '0.75rem', color: '#C9A96E' }}>{pendingItem.prix}</div>
                        </div>
                      </div>
                    )}
                    {(canAddMore || replaceMode !== null) ? (
                      generating ? (
                        <div style={{ background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px', padding: '1.5rem', textAlign: 'center' }}>
                          {pendingItem && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#fafaf8', borderRadius: '3px', textAlign: 'left' }}>
                              <img src={pendingItem.image} alt={pendingItem.nom_fr} style={{ width: '52px', height: '65px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.15rem' }}>{pendingItem.nom_fr}</div>
                                <div style={{ fontSize: '0.65rem', color: '#C9A96E', fontFamily: 'sans-serif' }}>{pendingItem.prix}</div>
                              </div>
                            </div>
                          )}
                          <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '50%', border: '2px solid #e8e4df', borderTop: '2px solid #C9A96E', animation: 'spin 1s linear infinite' }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 300, marginBottom: '0.25rem' }}>{LOADING_MESSAGES[loadingMsg].fr}</div>
                          <div style={{ fontSize: '0.65rem', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '1rem' }}>{LOADING_MESSAGES[loadingMsg].en}</div>
                          <div style={s.progWrap}><div style={s.progBar(progress)} /></div>
                          <div style={{ fontSize: '0.6rem', color: '#C9A96E', fontFamily: 'sans-serif', marginTop: '0.4rem' }}>{Math.round(progress)}% · {t.aiWorking}</div>
                        </div>
                      ) : (
                        <button style={pendingItem ? s.btnTry : s.btnTryDisabled} onClick={pendingItem ? handleGenerate : undefined} disabled={!pendingItem}>
                          {replaceMode !== null ? t.btnReplace : t.btnTry}<br />
                          <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{replaceMode !== null ? t.btnReplaceSub : t.btnTrySub}</span>
                        </button>
                      )
                    ) : (
                      <div style={s.maxMsg}>
                        ✦ {t.maxReached}<br />
                        <span style={{ fontSize: '0.6rem', color: '#aaa' }}>{t.maxSub}</span>
                      </div>
                    )}
                    {error && <div style={s.error}>⚠ {error}</div>}
                  </div>
                )}
              </>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* ── MOBILE DRAWER ── */}
          {isMobile && (
            <>
              {showSidebar && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 98 }} onClick={() => setShowSidebar(false)} />
              )}
              {showSidebar && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', zIndex: 99, borderRadius: '16px 16px 0 0', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
                  <div style={{ padding: '1rem 1.25rem 0.75rem', flexShrink: 0 }}>
                    <div style={{ width: '40px', height: '4px', background: '#e0dbd4', borderRadius: '2px', margin: '0 auto 0.85rem' }} />
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', borderBottom: '1px solid #e8e4df', paddingBottom: '0.75rem' }}>
                      {t.selectionTitle}
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem' }}>
                    {sidebarItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: '#ccc', fontSize: '0.75rem', fontFamily: 'sans-serif' }}>{t.emptyState.split('\n')[0]}</div>
                    ) : (
                      sidebarItems.map((item) => (
                        <div key={item._stepIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f0ece6' }}>
                          <img src={item.image} alt={item.nom_fr} style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 400, marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom_fr}</div>
                            <div style={{ fontSize: '0.62rem', color: '#aaa', fontFamily: 'sans-serif' }}>{t.etape} {item._stepIdx + 1}</div>
                            <div style={{ fontSize: '0.82rem', color: '#C9A96E' }}>{item.prix}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                            <button style={{ background: 'none', border: '1px solid #C9A96E', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.7rem', color: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => { startReplace(item._stepIdx); setShowSidebar(false) }}>✎</button>
                            <button style={{ background: 'none', border: '1px solid #ddd', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.7rem', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => removeFromSidebar(item._stepIdx)}>✕</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '1rem 1.25rem 5rem 1.25rem', borderTop: '1px solid #e8e4df', flexShrink: 0, background: '#fff' }}>
                    {sidebarItems.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'sans-serif' }}>{t.totalLabel}</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 300 }}>{formatPrice(totalPrice)}</span>
                      </div>
                    )}
                    <a href="https://www.surmesur.com" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', width: '100%', padding: '0.95rem', background: '#000', color: '#fff', fontSize: '0.72rem', letterSpacing: '0.15em', fontFamily: 'sans-serif', textAlign: 'center', textDecoration: 'none', marginBottom: '0.5rem', boxSizing: 'border-box' }}>
                      {t.btnAppt}<br />
                      <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{t.btnApptSub}</span>
                    </a>
                    {sidebarItems.length > 0 && (
                      <button style={{ width: '100%', padding: '0.85rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.12em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.7, boxSizing: 'border-box' }}
                        onClick={sendEmail}>
                        {t.btnVendor}<br />
                        <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{t.btnVendorSub}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Barre noire mobile */}
              <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', zIndex: 100 }}>
                <button
                  style={{ flex: 1, padding: '0.85rem', background: showSidebar ? '#C9A96E' : 'transparent', color: '#fff', border: '1px solid #C9A96E', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? '✕' : `✦ ${sidebarItems.length > 0 ? `(${sidebarItems.length})` : ''}`}
                </button>
                {!showSidebar && !isGenerating && generations.length === 0 && (
                  <button
                    style={{ flex: 2, padding: '0.85rem', background: 'linear-gradient(135deg,#C9A96E,#e8c87a)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.08em', fontFamily: 'sans-serif' }}
                    onClick={() => { setSelectedOccasion(null); setShowSurpriseModal(true) }}
                  >
                    {t.surprise}
                  </button>
                )}
                {!showSidebar && pendingItem && !isGenerating && (canAddMore || replaceMode !== null) && (
                  <button
                    style={{ flex: 2, padding: '0.85rem', background: '#C9A96E', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}
                    onClick={handleGenerate}
                  >
                    {t.btnTry.split(' ')[0]} →
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── SIDEBAR DESKTOP ── */}
          <div style={s.sideCol}>
            <div style={s.sideTitle}>{t.selectionTitle}</div>

            {generations.length === 0 && !autoGenerating && (
              <button style={{ ...s.btnSurprise, fontSize: '0.7rem', padding: '0.85rem', marginBottom: '1rem' }}
                onClick={() => { setSelectedOccasion(null); setShowSurpriseModal(true) }}>
                {t.surprise}<br />
                <span style={{ fontSize: '0.55rem', opacity: 0.85 }}>{t.surpriseSub}</span>
              </button>
            )}

            <div style={s.sideList}>
              {sidebarItems.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>✦</div>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>{t.emptyState.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</div>
                </div>
              ) : (
                sidebarItems.map((item) => (
                  <div key={item._stepIdx} style={s.sideItem}>
                    <img src={item.image} alt={item.nom_fr} style={s.sideImg} />
                    <div style={s.sideInfo}>
                      <div style={s.sideName}>{item.nom_fr}</div>
                      <div style={s.sideCat}>{t.etape} {item._stepIdx + 1}</div>
                      <div style={s.sidePrice}>{item.prix}</div>
                    </div>
                    <div style={s.sideActions}>
                      <button style={s.sideBtn('#C9A96E')} onClick={() => startReplace(item._stepIdx)}>✎</button>
                      <button style={s.sideBtn('#ddd')} onClick={() => removeFromSidebar(item._stepIdx)}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={s.totalWrap}>
              {sidebarItems.length > 0 && (
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>{t.totalLabel}</span>
                  <span style={s.totalAmt}>{formatPrice(totalPrice)}</span>
                </div>
              )}
              <a href="https://www.surmesur.com" target="_blank" rel="noopener noreferrer" style={s.btnAppt}>
                {t.btnAppt}<br />
                <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{t.btnApptSub}</span>
              </a>
              {sidebarItems.length > 0 && (
                <button style={{ width: '100%', padding: '0.9rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.15em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.7, marginTop: '0.5rem', boxSizing: 'border-box' }}
                  onClick={sendEmail}>
                  {t.btnVendor}<br />
                  <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{t.btnVendorSub}</span>
                </button>
              )}
              <button style={s.btnRestart} onClick={reset}>{t.btnRestart}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
