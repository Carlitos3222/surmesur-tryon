'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BASE_URL = 'https://surmesur-tryon.vercel.app'
const SESSION_KEY = 'surmesur_tryon_session'

// ─── Compresse une photo (galerie) en JPEG redimensionné + renvoie blob + dataURL ──
const compressPhotoForStorage = (file, maxDim = 1280, quality = 0.85) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim }
        else { width = Math.round(width * (maxDim / height)); height = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      canvas.toBlob((blob) => resolve({ blob, dataUrl }), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = e.target.result
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// ─── Reconstruit un Blob à partir d'une dataURL (utilisé pour restaurer la photo après un refresh) ──
const dataUrlToBlob = (dataUrl) => {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

// ─── VILLES & DEVISES ─────────────────────────────────────────────────────
const CITIES = [
  { id: 'laval', label: 'Laval', currency: 'CAD', symbol: '$', email: 'laval@surmesur.com' },
  { id: 'mississauga', label: 'Mississauga', currency: 'CAD', symbol: '$', email: 'mississauga@surmesur.com' },
  { id: 'montreal', label: 'Montréal', currency: 'CAD', symbol: '$', email: 'montreal@surmesur.com' },
  { id: 'ottawa', label: 'Ottawa', currency: 'CAD', symbol: '$', email: 'ottawa@surmesur.com' },
  { id: 'pittsburgh', label: 'Pittsburgh', currency: 'USD', symbol: '$', email: 'pittsburgh@surmesur.com' },
  { id: 'quebec', label: 'Québec', currency: 'CAD', symbol: '$', email: 'quebec@surmesur.com' },
  { id: 'toronto', label: 'Toronto', currency: 'CAD', symbol: '$', email: 'toronto@surmesur.com' },
  { id: 'vancouver', label: 'Vancouver', currency: 'CAD', symbol: '$', email: 'vancouver@surmesur.com' },
  { id: 'waterloo', label: 'Waterloo', currency: 'CAD', symbol: '$', email: 'waterloo@surmesur.com' },
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
    stat3: 'SURMESUR',
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
    step2Title0Outfit: 'Essayez votre premier outfit',
    step2TitleN: 'Ajouter une pièce',
    step2TitleR: 'Choisissez la pièce de remplacement',
    step2Sub: 'générations · Sélectionnez une pièce puis cliquez sur "Essayer"',
    step2SubOutfit: 'générations · Sélectionnez votre coup de cœur puis cliquez sur "Essayer"',
    catalogLabel: 'CATALOGUE',
    currentLook: 'VOTRE LOOK ACTUEL · YOUR CURRENT LOOK',
    download: '⬇ TÉLÉCHARGER CE LOOK · DOWNLOAD',
    regenerate: '↻ Régénérer cette image',
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
    btnChangeMode: '⇄ Changer d\'option',
    btnChangeModeSub: 'Outfits · Pièce par pièce',
    selectCity: 'Choisir votre ville',
    cityLabel: 'VOTRE BOUTIQUE',
    cityRequiredHint: 'Veuillez sélectionner votre boutique pour continuer',
    surprise: '✦ SURPRENEZ-MOI',
    surpriseSub: 'SURPRISE ME · OUTFIT COMPLET',
    surpriseTitle: 'Quelle est l\'occasion ?',
    surpriseStylist: 'Notre styliste IA va créer un outfit complet et cohérent, spécialement pour vous.',
    surpriseLooks: 'Choisissez votre look',
    surpriseChange: '← Changer l\'occasion',
    surpriseTry: '✦ ESSAYER CE LOOK →',
    etape: 'Étape',
    step: 'Step',
    loadingMsgs: ['Analyse de votre silhouette...', 'Application du tissu Surmesur...', 'Ajustement des proportions...', 'Calibration des couleurs...', 'Finalisation de votre look...', 'Dernières retouches en cours...'],
    emailSubject: 'Sélection client Surmesur Try-On',
    emailBody: (items, total, city, mens) => `Bonjour,\n\nUn client de la boutique ${city} a effectué une sélection via l'application Surmesur Try-On.\n\nSÉLECTION DU CLIENT :\n\n${items}\n\nTOTAL ESTIMÉ : ${total}${mens}\n\nMerci de préparer ce dossier pour le rendez-vous.\n\nCordialement,\nSurmesur Try-On`,
    introTitle: 'Que souhaitez-vous essayer aujourd\'hui ?',
    introSub: 'Choisissez votre expérience pour des instructions de photo personnalisées',
    introOutfitsLabel: 'Essayer nos Outfits',
    introOutfitsDesc: 'Looks complets prêts à porter, générés en une seule photo — peu importe votre tenue actuelle.',
    introPiecesLabel: 'Essayer pièce par pièce',
    introPiecesDesc: 'Composez votre look à la carte, pièce par pièce — vestons, chemises, pantalons.',
    introTransitionOutfits: 'Préparation de votre essayage Outfits…',
    introTransitionPieces: 'Préparation de votre essayage pièce par pièce…',
    wearGuideOutfitsTitle: 'ASTUCE OUTFITS',
    wearGuideOutfitsText: 'Peu importe ce que vous portez sur la photo — l\'outfit complet remplacera entièrement votre tenue en une seule génération.',
    wearGuidePiecesTitle: 'ASTUCE PIÈCE PAR PIÈCE',
    wearGuidePiecesText: 'Portez une tenue propre et déjà bien assortie, qui pourrait accompagner un veston ou toute autre pièce sélectionnée dans l\'application — elle restera visible sous la pièce ajoutée.',
    changePieceBtn: '✎ CHANGER UNE PIÈCE',
  },
  en: {
    tagline: 'VIRTUAL TECHNOLOGY · VIRTUAL TRY-ON',
    heroTitle1: 'Try our',
    heroTitle2: 'collections',
    heroTitle3: 'from the comfort of your home',
    heroSub: 'Essayez nos collections dans le confort de votre foyer',
    stat1: 'LOOKS MAX',
    stat2: 'PIECES',
    stat3: 'SURMESUR',
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
    step2Title0Outfit: 'Try your first outfit',
    step2TitleN: 'Add a piece',
    step2TitleR: 'Choose the replacement piece',
    step2Sub: 'generations · Select a piece then click on "Try"',
    step2SubOutfit: 'generations · Select your favorite then click on "Try"',
    catalogLabel: 'CATALOGUE',
    currentLook: 'YOUR CURRENT LOOK · VOTRE LOOK ACTUEL',
    download: '⬇ DOWNLOAD THIS LOOK · TÉLÉCHARGER',
    regenerate: '↻ Regenerate this image',
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
    btnChangeMode: '⇄ Change option',
    btnChangeModeSub: 'Outfits · Piece by piece',
    selectCity: 'Choose your city',
    cityLabel: 'YOUR BOUTIQUE',
    cityRequiredHint: 'Please select your boutique to continue',
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
    emailBody: (items, total, city, mens) => `Hello,\n\nA client from the ${city} boutique made a selection via the Surmesur Try-On app.\n\nCLIENT SELECTION:\n\n${items}\n\nESTIMATED TOTAL: ${total}${mens}\n\nPlease prepare this file for the appointment.\n\nBest regards,\nSurmesur Try-On`,
    introTitle: 'What would you like to try today?',
    introSub: 'Choose your experience for personalized photo instructions',
    introOutfitsLabel: 'Try our Outfits',
    introOutfitsDesc: 'Complete ready-to-wear looks, generated in a single photo — no matter what you\'re currently wearing.',
    introPiecesLabel: 'Try piece by piece',
    introPiecesDesc: 'Build your look à la carte, piece by piece — jackets, shirts, pants.',
    introTransitionOutfits: 'Preparing your Outfits fitting…',
    introTransitionPieces: 'Preparing your piece-by-piece fitting…',
    wearGuideOutfitsTitle: 'OUTFITS TIP',
    wearGuideOutfitsText: 'No matter what you\'re wearing in the photo — the complete outfit will fully replace your outfit in a single generation.',
    wearGuidePiecesTitle: 'PIECE BY PIECE TIP',
    wearGuidePiecesText: 'Wear clean, put-together clothing that could already pair with a jacket or any piece selected in the app — it will remain visible beneath the added piece.',
    changePieceBtn: '✎ CHANGE A PIECE',
  },
  es: {
    tagline: 'TECNOLOGÍA VIRTUAL · VIRTUAL TRY-ON',
    heroTitle1: 'Prueba nuestras',
    heroTitle2: 'colecciones',
    heroTitle3: 'desde la comodidad de tu hogar',
    heroSub: 'Try our collections from the comfort of your home',
    stat1: 'LOOKS MÁX',
    stat2: 'PIEZAS',
    stat3: 'SURMESUR',
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
    step2Title0Outfit: 'Prueba tu primer outfit',
    step2TitleN: 'Agregar una prenda',
    step2TitleR: 'Elige la prenda de reemplazo',
    step2Sub: 'generaciones · Selecciona una prenda y haz clic en "Probar"',
    step2SubOutfit: 'generaciones · Selecciona tu favorito y haz clic en "Probar"',
    catalogLabel: 'CATÁLOGO',
    currentLook: 'TU LOOK ACTUAL · YOUR CURRENT LOOK',
    download: '⬇ DESCARGAR ESTE LOOK · DOWNLOAD',
    regenerate: '↻ Regenerar esta imagen',
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
    btnChangeMode: '⇄ Cambiar de opción',
    btnChangeModeSub: 'Outfits · Prenda por prenda',
    selectCity: 'Elige tu ciudad',
    cityLabel: 'TU BOUTIQUE',
    cityRequiredHint: 'Selecciona tu boutique para continuar',
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
    emailBody: (items, total, city, mens) => `Hola,\n\nUn cliente de la boutique ${city} ha realizado una selección en la app Surmesur Try-On.\n\nSELECCIÓN DEL CLIENTE:\n\n${items}\n\nTOTAL ESTIMADO: ${total}${mens}\n\nPor favor prepare este expediente para la cita.\n\nAtentamente,\nSurmesur Try-On`,
    introTitle: '¿Qué deseas probar hoy?',
    introSub: 'Elige tu experiencia para instrucciones de foto personalizadas',
    introOutfitsLabel: 'Probar nuestros Outfits',
    introOutfitsDesc: 'Looks completos listos para usar, generados en una sola foto — sin importar lo que lleves puesto.',
    introPiecesLabel: 'Probar prenda por prenda',
    introPiecesDesc: 'Compón tu look a la carta, prenda por prenda — chaquetas, camisas, pantalones.',
    introTransitionOutfits: 'Preparando tu prueba de Outfits…',
    introTransitionPieces: 'Preparando tu prueba pieza por pieza…',
    wearGuideOutfitsTitle: 'CONSEJO OUTFITS',
    wearGuideOutfitsText: 'No importa lo que lleves puesto en la foto — el outfit completo reemplazará totalmente tu ropa en una sola generación.',
    wearGuidePiecesTitle: 'CONSEJO PRENDA POR PRENDA',
    wearGuidePiecesText: 'Usa una tenida limpia y ya bien combinada, que pueda acompañar una chaqueta o cualquier otra prenda seleccionada en la aplicación — permanecerá visible debajo de la prenda añadida.',
    changePieceBtn: '✎ CAMBIAR UNA PRENDA',
  }
}

const CATALOGUE = {
  suits: {
    label: 'Complets', label_en: 'Suits', iconImage: `${BASE_URL}/suit-1.jpeg`, categorie: 'one-pieces',
    items: [
      { id: 's1', nom_fr: 'Complet Bleu Pétrole', image: `${BASE_URL}/suit-1.jpeg`, prix: '$1,100', desc: '3-Piece · Wool' },
      { id: 's2', nom_fr: 'Complet Charbon', image: `${BASE_URL}/suit-2.jpeg`, prix: '$1,150', desc: '3-Piece · Premium Wool' },
      { id: 's3', nom_fr: 'Complet Prince de Galles', image: `${BASE_URL}/suit-3.jpeg`, prix: '$1,200', desc: '3-Piece · Flannel' },
      { id: 's4', nom_fr: 'Complet Gris Chevron', image: `${BASE_URL}/suit-4.jpeg`, prix: '$1,180', desc: '3-Piece · Herringbone' },
    ]
  },
  outfits: {
    label: 'Essayez nos Outfits', label_en: 'Try our Outfits', iconImage: `${BASE_URL}/outfit-1.jpeg`, categorie: 'one-pieces',
    items: [
      { id: 'o1', nom_fr: 'Outfit Blazer Cobalt', image: `${BASE_URL}/outfit-1.jpeg`, prix: '$980', desc: 'Look Complet · Blazer + Chemise + Jean' },
    ]
  },
  jackets: {
    label: 'Vestons', label_en: 'Jackets', iconImage: `${BASE_URL}/jacket-1.jpeg`, categorie: 'tops',
    items: [
      { id: 'j1', nom_fr: 'Blazer Lin Cobalt', image: `${BASE_URL}/jacket-1.jpeg`, prix: '$645', desc: 'Premium Linen · Single Breasted' },
      { id: 'j2', nom_fr: 'Veston Tweed Brun', image: `${BASE_URL}/jacket-2.jpeg`, prix: '$720', desc: 'British Tweed · Notch Lapel' },
      { id: 'j3', nom_fr: 'Blazer Navy Structuré', image: `${BASE_URL}/jacket-3.jpeg`, prix: '$695', desc: 'Wool Blend · Double Breasted' },
      { id: 'j4', nom_fr: 'Veston Crème Été', image: `${BASE_URL}/jacket-4.jpeg`, prix: '$610', desc: 'Cotton Linen · Relaxed Fit' },
      { id: 'j5', nom_fr: 'Blazer Sarcelle Loro Piana', image: `${BASE_URL}/jacket-5.jpeg`, tissu: `${BASE_URL}/tissu-5.jpeg`, prix: '$890', desc: 'Wool-Silk-Linen · Loro Piana' },
      { id: 'j6', nom_fr: 'Veston Ivoire Glen Plaid', image: `${BASE_URL}/jacket-6.jpeg`, tissu: `${BASE_URL}/tissu-6.jpeg`, prix: '$780', desc: 'Pure Wool · Glen Plaid' },
      { id: 'j7', nom_fr: 'Blazer Prune Windowpane', image: `${BASE_URL}/jacket-7.jpeg`, tissu: `${BASE_URL}/tissu-7.jpeg`, prix: '$820', desc: 'Pure Wool · REDA Milano' },
      { id: 'j8', nom_fr: 'Blazer Navy Glen Plaid', image: `${BASE_URL}/jacket-8.jpeg`, tissu: `${BASE_URL}/tissu-8.jpeg`, prix: '$840', desc: 'Super 100s · Drago Biella' },
      { id: 'j9', nom_fr: 'Veston Gris Micro-Carreaux', image: `${BASE_URL}/jacket-9.jpeg`, tissu: `${BASE_URL}/tissu-9.jpeg`, prix: '$760', desc: 'Pure Wool · Holland & Sherry' },
    ]
  },
  shirts: {
    label: 'Chemises', label_en: 'Shirts', iconImage: `${BASE_URL}/shirt-1.jpeg`, categorie: 'tops',
    items: [
      { id: 'sh1', nom_fr: 'Chemise Florale Bleue', image: `${BASE_URL}/shirt-1.jpeg`, prix: '$350', desc: 'Linen · Sport Shirt' },
      { id: 'sh2', nom_fr: 'Chemise Blanche Classique', image: `${BASE_URL}/shirt-2.jpeg`, prix: '$295', desc: 'Egyptian Cotton · French Cuff' },
      { id: 'sh3', nom_fr: 'Chemise Lin Beige', image: `${BASE_URL}/shirt-3.jpeg`, prix: '$320', desc: 'Premium Linen · Relaxed' },
      { id: 'sh4', nom_fr: 'Chemise Carreaux Bleus', image: `${BASE_URL}/shirt-4.jpeg`, prix: '$310', desc: 'Cotton · Slim Fit' },
    ]
  },
  pants: {
    label: 'Pantalons', label_en: 'Pants', iconImage: `${BASE_URL}/jean-1.jpeg`, categorie: 'bottoms',
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
    suitOnly: true, // ← flag spécial : génère uniquement un complet en 1 seule image
    outfits: [
      { nom: 'Le Marié Impeccable', pieces: [{ ...CATALOGUE.suits.items[0], _stepIdx: 0 }] },
      { nom: 'L\'Aristocrate', pieces: [{ ...CATALOGUE.suits.items[1], _stepIdx: 0 }] },
      { nom: 'Le Prince de Galles', pieces: [{ ...CATALOGUE.suits.items[2], _stepIdx: 0 }] },
      { nom: 'Le Gentleman Chevron', pieces: [{ ...CATALOGUE.suits.items[3], _stepIdx: 0 }] },
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
          { ...CATALOGUE.jackets.items[1], _stepIdx: 2 },  // Veston Tweed Brun
        ]
      },
    ]
  },
]

const MAX_GENERATIONS = 3

const LOADING_MESSAGES = [
  { fr: 'Analyse de votre silhouette...', en: 'Analyzing your silhouette...' },
  { fr: 'Application du tissu Surmesur...', en: 'Applying the custom fabric...' },
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
  const [clientInfo, setClientInfo] = useState(null) // { name, phone, customerId } — pré-rempli via l'URL si intégré depuis surmesur.com
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState(null)
  const [tryMode, setTryMode] = useState(null)
  const [showIntroModal, setShowIntroModal] = useState(true)
  const [showAllTabs, setShowAllTabs] = useState(false)
  const [introTransition, setIntroTransition] = useState(null) // null | 'outfits' | 'pieces'
  // Mensurations optionnelles
  const [mensurations, setMensurations] = useState({
    genre: '',
    taille: '',
    tailleUnit: 'cm',
    poids: '',
    poidsUnit: 'kg',
    morphologie: '',
  })
  const [showMensurationsForm, setShowMensurationsForm] = useState(true)
  const t = T[lang]
  // État (et non ref) : une ref se mute de façon synchrone, avant que les setState
  // du useEffect de restauration n'aient été appliqués dans un nouveau rendu — ce qui
  // provoquait une écriture prématurée des valeurs par défaut (phase/showIntroModal/
  // activeTab) dans sessionStorage. Un state garantit que l'effet de sauvegarde ne se
  // redéclenche qu'après que TOUTES les valeurs restaurées soient appliquées ensemble.
  const [restored, setRestored] = useState(false)

  // ─── Restauration de la session après un rafraîchissement de page (F5) ───
  // Le client reste sur l'étape où il était (photo, choix de vêtements, etc.)
  // plutôt que de revenir complètement au début. La page remonte en haut.
  useEffect(() => {
    try {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.selectedCityId) {
          const city = CITIES.find(c => c.id === saved.selectedCityId)
          if (city) setSelectedCity(city)
        }
        if (saved.clientInfo) setClientInfo(saved.clientInfo)
        if (saved.lang) setLang(saved.lang)
        if (saved.tryMode) setTryMode(saved.tryMode)
        if (typeof saved.showIntroModal === 'boolean') setShowIntroModal(saved.showIntroModal)
        if (saved.activeTab) setActiveTab(saved.activeTab)
        if (saved.mensurations) setMensurations(saved.mensurations)
        if (typeof saved.showMensurationsForm === 'boolean') setShowMensurationsForm(saved.showMensurationsForm)
        if (Array.isArray(saved.generations)) setGenerations(saved.generations)
        if (Array.isArray(saved.sidebarItems)) setSidebarItems(saved.sidebarItems)
        if (saved.replaceMode === null || typeof saved.replaceMode === 'number') setReplaceMode(saved.replaceMode)
        if (typeof saved.activeResultIdx === 'number') setActiveResultIdx(saved.activeResultIdx)
        if (saved.photoPreview) {
          setPhotoPreview(saved.photoPreview)
          try { setPhotoClient(dataUrlToBlob(saved.photoPreview)) } catch (e) { /* no-op */ }
        }
        if (saved.phase) setPhase(saved.phase)
      }
    } catch (e) { /* no-op */ }
    setRestored(true)
    // Remonte en haut immédiatement, puis re-confirme après que les images/animations
    // aient fini de charger (elles peuvent décaler la hauteur de la page et donc le scroll).
    window.scrollTo({ top: 0, behavior: 'instant' })
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const t1 = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 150)
    const t2 = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // ─── Pré-remplissage via l'URL (bouton "Try On" intégré sur surmesur.com) ───
  // Prioritaire sur la session restaurée : un lien entrant explicite doit gagner.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const cityParam = (params.get('city') || params.get('ville') || '').toLowerCase()
      const matchedCity = CITIES.find(c => c.id === cityParam)
      if (matchedCity) setSelectedCity(matchedCity)

      const name = params.get('name') || params.get('nom') || ''
      const phone = params.get('phone') || params.get('telephone') || ''
      const customerId = params.get('customerId') || params.get('client_id') || params.get('id') || ''
      if (name || phone || customerId) setClientInfo({ name, phone, customerId })
    } catch (e) { /* no-op */ }
  }, [])

  // ─── Sauvegarde continue de la session (survit à un F5, effacée si l'onglet est fermé) ───
  useEffect(() => {
    if (!restored) return
    try {
      const toSave = {
        selectedCityId: selectedCity?.id || null,
        clientInfo,
        lang,
        tryMode,
        showIntroModal,
        activeTab,
        mensurations,
        showMensurationsForm,
        generations,
        sidebarItems,
        replaceMode,
        activeResultIdx,
        photoPreview,
        phase,
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave))
    } catch (e) { /* quota dépassé ou navigation privée — on ignore silencieusement */ }
  }, [restored, selectedCity, clientInfo, lang, tryMode, showIntroModal, activeTab, mensurations, showMensurationsForm, generations, sidebarItems, replaceMode, activeResultIdx, photoPreview, phase])

  useEffect(() => {
    if (!introTransition) return
    const timer = setTimeout(() => {
      setTryMode(introTransition)
      setActiveTab(introTransition === 'outfits' ? 'outfits' : 'jackets')
      setShowIntroModal(false)
      setIntroTransition(null)
    }, 1400)
    return () => clearTimeout(timer)
  }, [introTransition])

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
  const loadingRef = useRef(null)

  const totalPrice = sidebarItems.reduce((sum, it) => {
    return sum + parseFloat(it.prix.replace('$', '').replace(',', ''))
  }, 0)
  const formatPrice = (n) => {
    const city = selectedCity
    const num = typeof n === 'string' ? parseFloat(n.replace(/[$,]/g, '')) : n
    if (!city || city.currency === 'CAD') return '$' + num.toLocaleString('en-CA') + ' CAD'
    if (city.currency === 'USD') return '$' + Math.round(num * 0.73).toLocaleString('en-US') + ' USD'
    if (city.currency === 'MXN') return '$' + Math.round(num * 13.5).toLocaleString('es-MX') + ' MXN'
    return '$' + num.toLocaleString('en-CA') + ' CAD'
  }

  const displayItemPrice = (prix) => formatPrice(prix)

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
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 'image/jpeg', 0.9)
  }

  // Génération unique
  const generateOne = async (item, modelSource, photoClientFile, mensurationsData = null) => {
    const fd = new FormData()
    if (modelSource) {
      fd.append('model_url', modelSource)
    } else {
      fd.append('model_image', photoClientFile)
    }
    fd.append('garment_url', item.image)
    fd.append('background_prompt', '')
    fd.append('seed', Math.floor(Math.random() * 1000000).toString())
    if (mensurationsData) {
      fd.append('mensurations', JSON.stringify(mensurationsData))
    }
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

    // ── CAS SPÉCIAL MARIAGE : complet uniquement, 1 seule génération ──
    if (occasion.suitOnly) {
      // Choisir un complet au hasard parmi les 4
      const suits = CATALOGUE.suits.items
      const suit = suits[Math.floor(Math.random() * suits.length)]

      setAutoGenerating(true)
      setAutoTotal(1)
      setAutoStep(1)
      setGenerations([])
      setSidebarItems([])
      setActiveResultIdx(0)
      setProgress(0)
      setLoadingMsg(0)

      const piv = setInterval(() => setProgress(p => p < 85 ? p + Math.random() * 2.5 : p), 800)
      const msgiv = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 4000)

      try {
        const resultUrl = await generateOne(suit, null, photoClient)
        clearInterval(piv); clearInterval(msgiv)
        setProgress(100)
        setGenerations([{ item: suit, resultUrl }])
        setSidebarItems([{ ...suit, _stepIdx: 0 }])
        setActiveResultIdx(0)
      } catch (err) {
        clearInterval(piv); clearInterval(msgiv)
        setError(err.message)
      }

      setAutoGenerating(false)
      setAutoStep(0)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
      return
    }

    // ── CAS NORMAL : pantalon → chemise → veston (3 générations séquentielles) ──
    const pieces = outfit.pieces

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
    setTimeout(() => loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
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

  // Régénérer la dernière image (même pièce, nouveau rendu)
  // Repart TOUJOURS de la dernière bonne image (l'étape précédente), jamais de l'image rejetée.
  const handleRegenerate = async () => {
    const idx = generations.length - 1
    const gen = generations[idx]
    if (!gen || isGenerating) return

    setGenerating(true); setError(null); setProgress(0); setLoadingMsg(0)
    setTimeout(() => loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    const piv = setInterval(() => setProgress(p => p < 85 ? p + Math.random() * 2.5 : p), 800)
    const msgiv = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 4000)

    try {
      // Base = résultat de l'étape précédente (dernière bonne image), ou photo d'origine si 1re pièce
      const baseUrl = idx === 0 ? null : generations[idx - 1]?.resultUrl

      const fd = new FormData()
      if (baseUrl) {
        fd.append('model_url', baseUrl)
      } else {
        fd.append('model_image', photoClient)
      }
      fd.append('garment_url', gen.item.image)
      fd.append('background_prompt', '')
      fd.append('seed', Math.floor(Math.random() * 1000000).toString())

      const res = await fetch('/api/tryon', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')

      setProgress(100)
      setGenerations(prev => { const next = [...prev]; next[idx] = { item: gen.item, resultUrl: data.output }; return next })
      setActiveResultIdx(idx)
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

  // ─── Retour à l'étape 1 (choix Outfits / Pièce par pièce) sans rafraîchir la page ───
  // Permet au client de changer d'option en cours de route (ex: depuis l'étape 2 ou 3).
  const backToStep1 = () => {
    stopCamera()
    setPhase('photo'); setPhotoClient(null); setPhotoPreview(null)
    setGenerations([]); setSidebarItems([]); setPendingItem(null)
    setReplaceMode(null); setActiveResultIdx(0); setError(null); setProgress(0)
    setAutoGenerating(false)
    setTryMode(null)
    setIntroTransition(null)
    setShowIntroModal(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // ─── Bascule directement entre Outfits ⇄ Pièce par pièce depuis l'étape 3 ───
  // Contrairement à backToStep1, on reste sur l'étape 3 et on garde la photo déjà
  // téléversée/prise — le client n'a pas à refaire l'étape 2.
  const toggleTryMode = () => {
    const newMode = tryMode === 'outfits' ? 'pieces' : 'outfits'
    setTryMode(newMode)
    setActiveTab(newMode === 'outfits' ? 'outfits' : 'jackets')
    setGenerations([]); setSidebarItems([]); setPendingItem(null)
    setReplaceMode(null); setActiveResultIdx(0); setError(null); setProgress(0)
    setAutoGenerating(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const sendEmail = () => {
    const vendorEmail = selectedCity?.email || 'vendeur@surmesur.com'
    const cityName = selectedCity?.label || 'Surmesur'
    const itemsList = sidebarItems.map((it) => {
      const gen = generations[it._stepIdx]
      const resultLine = gen?.resultUrl ? `\n  Look : ${gen.resultUrl}` : ''
      return `• ${it.nom_fr} — ${it.prix}\n  Photo : ${it.image}${resultLine}`
    }).join('\n\n')

    // Bloc mensurations si disponibles
    let mensBlock = ''
    if (mensurations.genre || mensurations.taille || mensurations.poids || mensurations.morphologie) {
      const morphoLabels = { mince: 'Mince', moyen: 'Moyen', athletic: 'Athlétique', poire: 'Poire', costaud: 'Costaud', enveloppe: 'Enveloppé' }
      mensBlock = '\n\nMENSURATIONS DU CLIENT :'
      if (mensurations.genre) mensBlock += `\n  Genre : ${mensurations.genre}`
      if (mensurations.taille) mensBlock += `\n  Taille : ${mensurations.taille} ${mensurations.tailleUnit}`
      if (mensurations.poids) mensBlock += `\n  Poids : ${mensurations.poids} ${mensurations.poidsUnit}`
      if (mensurations.morphologie) mensBlock += `\n  Morphologie : ${morphoLabels[mensurations.morphologie] || mensurations.morphologie}`
    }

    // Bloc identité client (si transmis via l'URL depuis le site surmesur.com)
    let clientBlock = ''
    if (clientInfo && (clientInfo.name || clientInfo.phone || clientInfo.customerId)) {
      clientBlock = '\n\nIDENTITÉ DU CLIENT :'
      if (clientInfo.name) clientBlock += `\n  Nom : ${clientInfo.name}`
      if (clientInfo.phone) clientBlock += `\n  Téléphone : ${clientInfo.phone}`
      if (clientInfo.customerId) clientBlock += `\n  # Client : ${clientInfo.customerId}`
    }

    const subject = encodeURIComponent(t.emailSubject)
    const body = encodeURIComponent(t.emailBody(itemsList, formatPrice(totalPrice), cityName, mensBlock) + clientBlock)
    window.location.href = `mailto:${vendorEmail}?subject=${subject}&body=${body}`
  }

  const canAddMore = generations.length < MAX_GENERATIONS && !autoGenerating
  const currentResult = generations[activeResultIdx]?.resultUrl
  const isGenerating = generating || autoGenerating

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const s = {
    page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1a1a' },
    pagePhoto: { minHeight: '100vh', backgroundColor: 'transparent', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1a1a' },
    bgLayer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundColor: '#fafaf8', backgroundImage: `linear-gradient(rgba(250,250,248,0.42), rgba(250,250,248,0.52)), url(${BASE_URL}/accueil.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' },
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
    stepNum: { fontSize: '2.5rem', fontWeight: 300, color: '#C9A96E', lineHeight: 1 },
    stepTitle: { fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.25rem' },
    stepSub: { fontSize: '0.72rem', color: '#888', fontFamily: 'sans-serif', marginBottom: '1.25rem' },
    uploadZone: { border: '1px dashed #ccc', borderRadius: '4px', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(250,250,248,0.68)', marginBottom: '1rem' },
    uploadIcon: { fontSize: '2.5rem', color: '#C9A96E', marginBottom: '0.75rem' },
    uploadTxt: { fontSize: '1.1rem', fontWeight: 300, color: '#333', marginBottom: '0.3rem' },
    uploadSub: { fontSize: '0.65rem', color: '#bbb', fontFamily: 'sans-serif' },
    btnRow: { display: 'flex', gap: '0.75rem', marginTop: '1rem' },
    btnBlack: { flex: 1, padding: '1.1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
    btnOutline: { flex: 1, padding: '1.1rem', background: 'transparent', color: '#000', border: '1px solid #000', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
    btnGhost: { flex: 1, padding: '1.1rem', background: 'transparent', color: '#888', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
    btnRegen: { display: 'block', width: '100%', marginTop: '0.85rem', padding: '0.75rem', background: 'transparent', color: '#C9A96E', border: '1px solid #C9A96E', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.12em', fontFamily: 'sans-serif' },
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
    tab: (a) => ({ padding: '0.6rem 0.9rem', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.07em', fontFamily: 'sans-serif', color: a ? '#C9A96E' : '#888', whiteSpace: 'nowrap', position: 'relative' }),
    grid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.85rem', marginBottom: '1.5rem' },
    card: (sel) => ({ border: sel ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: sel ? '#fffef8' : '#fff', position: 'relative', transition: 'border-color 0.15s' }),
    cardImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' },
    cardImgWrap: { position: 'relative', lineHeight: 0 },
    cardSwatch: { position: 'absolute', bottom: '8px', left: '8px', width: '46px', height: '46px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
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
    photoThumbRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.6rem', background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px' },
    photoThumb: { width: '52px', height: '66px', objectFit: 'cover', borderRadius: '2px', border: '1.5px solid #C9A96E', flexShrink: 0 },
    changeBtn: { fontSize: '0.65rem', color: '#C9A96E', fontFamily: 'sans-serif', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
    modeSwitchBtn: { background: '#000', color: '#C9A96E', border: 'none', borderRadius: '4px', padding: '0.65rem 1rem', fontSize: '0.62rem', letterSpacing: '0.04em', fontFamily: 'sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
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

  const heroContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }
  const heroItem = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }
  const revealOnScroll = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }
  const gridContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.045 } } }
  const gridItem = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }

  // Onglets visibles selon le mode choisi dans la modale d'intro
  const visibleTabKeys = tryMode === 'pieces'
    ? ['jackets', 'shirts', 'pants']
    : (showAllTabs ? Object.keys(CATALOGUE) : ['suits', 'outfits'])

  return (
    <div style={phase === 'photo' ? s.pagePhoto : s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
      <style>{SpinnerStyle}</style>

      {phase === 'photo' && <div style={s.bgLayer} />}
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <header style={s.header}>
        <img src={`${BASE_URL}/logo-surmesur.png`} alt="Surmesur Select" style={{ height: '28px', width: 'auto', display: 'block' }} />
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

      {/* ── MODAL INTRO : Outfits vs Pièce par pièce ── */}
      <AnimatePresence>
      {showIntroModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ ...s.modalOverlay, alignItems: 'center', zIndex: 400 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ ...s.modal, maxWidth: '640px', borderRadius: '8px' }}>
            <div style={{ ...s.stepNum, fontSize: isMobile ? '1.6rem' : '1.9rem', textAlign: 'center', marginBottom: '0.3rem' }}>01</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.1rem' }}>
              <img src={`${BASE_URL}/logo-surmesur-black.png`} alt="Surmesur Select" style={{ height: isMobile ? '20px' : '24px', width: 'auto', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.7rem' }}>
              <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg,transparent,#C9A96E,transparent)' }} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1.5rem' : '1.85rem', fontWeight: 500, letterSpacing: '0.01em', marginBottom: '0.5rem', textAlign: 'center', color: '#1a1a1a' }}>{t.introTitle}</div>
            <div style={s.modalSub}>{t.introSub}</div>

            {/* ── Sélection de la ville / boutique (obligatoire avant de continuer) ── */}
            <div style={{ marginBottom: isMobile ? '1rem' : '1.3rem' }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#C9A96E', fontFamily: 'sans-serif', marginBottom: '0.6rem', textAlign: 'center' }}>{t.cityLabel}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                {CITIES.map(city => (
                  <motion.button
                    key={city.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      padding: isMobile ? '0.4rem 0.7rem' : '0.5rem 0.9rem',
                      border: selectedCity?.id === city.id ? '1.5px solid #C9A96E' : '1px solid #e8e4df',
                      borderRadius: '20px',
                      background: selectedCity?.id === city.id ? '#C9A96E' : '#fff',
                      color: selectedCity?.id === city.id ? '#fff' : '#444',
                      cursor: 'pointer',
                      fontFamily: 'sans-serif',
                      fontSize: isMobile ? '0.68rem' : '0.75rem',
                      fontWeight: selectedCity?.id === city.id ? 500 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {city.label}
                  </motion.button>
                ))}
              </div>
              {!selectedCity && (
                <div style={{ fontSize: isMobile ? '0.6rem' : '0.65rem', color: '#b8925a', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '0.6rem', fontStyle: 'italic' }}>{t.cityRequiredHint}</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '0.6rem' : '1rem', opacity: selectedCity ? 1 : 0.45, pointerEvents: selectedCity ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
              <motion.div
                whileHover={{ y: -3, boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.98 }}
                animate={introTransition ? (introTransition === 'outfits' ? { scale: 1.045, boxShadow: '0 16px 34px rgba(201,169,110,0.4)' } : { opacity: 0.3, scale: 0.96 }) : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  if (introTransition || !selectedCity) return
                  setIntroTransition('outfits')
                }}
                style={{ border: '1px solid #e8e4df', borderRadius: '6px', overflow: 'hidden', cursor: (introTransition || !selectedCity) ? 'default' : 'pointer', textAlign: 'center', background: '#fffef8' }}
              >
                <div style={{ width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', background: '#fffef8' }}>
                  <img src={`${BASE_URL}/outfit-1.jpeg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
                </div>
                <div style={{ padding: isMobile ? '0.6rem 0.5rem 0.8rem' : '1.1rem 1.25rem 1.4rem' }}>
                  <div style={{ fontSize: isMobile ? '0.78rem' : '0.95rem', fontWeight: 400, marginBottom: isMobile ? '0.3rem' : '0.5rem', color: '#C9A96E' }}>{t.introOutfitsLabel}</div>
                  <div style={{ fontSize: isMobile ? '0.62rem' : '0.7rem', color: '#888', fontFamily: 'sans-serif', lineHeight: 1.5 }}>{t.introOutfitsDesc}</div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3, boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.98 }}
                animate={introTransition ? (introTransition === 'pieces' ? { scale: 1.045, boxShadow: '0 16px 34px rgba(201,169,110,0.4)' } : { opacity: 0.3, scale: 0.96 }) : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  if (introTransition || !selectedCity) return
                  setIntroTransition('pieces')
                }}
                style={{ border: '1px solid #e8e4df', borderRadius: '6px', overflow: 'hidden', cursor: (introTransition || !selectedCity) ? 'default' : 'pointer', textAlign: 'center', background: '#fff' }}
              >
                <div style={{ width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', background: '#fff' }}>
                  <img src={`${BASE_URL}/jacket-3.jpeg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
                </div>
                <div style={{ padding: isMobile ? '0.6rem 0.5rem 0.8rem' : '1.1rem 1.25rem 1.4rem' }}>
                  <div style={{ fontSize: isMobile ? '0.78rem' : '0.95rem', fontWeight: 400, marginBottom: isMobile ? '0.3rem' : '0.5rem' }}>{t.introPiecesLabel}</div>
                  <div style={{ fontSize: isMobile ? '0.62rem' : '0.7rem', color: '#888', fontFamily: 'sans-serif', lineHeight: 1.5 }}>{t.introPiecesDesc}</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Transition élégante entre l'étape 1 (choix) et l'étape 2 (photo) ── */}
      <AnimatePresence>
      {introTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ textAlign: 'center', padding: '0 1.5rem' }}
          >
            <img src={`${BASE_URL}/logo-surmesur.png`} alt="Surmesur Select" style={{ height: '22px', width: 'auto', display: 'block', margin: '0 auto 1.6rem' }} />
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '54px', opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#C9A96E,transparent)', margin: '0 auto 1.3rem' }}
            />
            <motion.div
              key={introTransition}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 500, color: '#fff', letterSpacing: '0.01em', marginBottom: '1.7rem' }}
            >
              {introTransition === 'outfits' ? t.introTransitionOutfits : t.introTransitionPieces}
            </motion.div>
            <div style={{ width: '170px', height: '2px', background: 'rgba(201,169,110,0.2)', margin: '0 auto', overflow: 'hidden', borderRadius: '2px' }}>
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', height: '100%', background: '#C9A96E' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Modal sélection ville */}
      <AnimatePresence>
      {showCityModal && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300 }} onClick={() => setShowCityModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }} animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }} exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} style={{ position: 'fixed', top: '50%', left: '50%', background: '#fff', zIndex: 301, borderRadius: '4px', padding: '2rem', maxWidth: '400px', width: '90vw' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#C9A96E', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>{t.cityLabel}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 300, marginBottom: '1.5rem' }}>{t.selectCity}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CITIES.map(city => (
                <motion.button key={city.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedCity(city); setShowCityModal(false) }}
                  style={{ padding: '0.85rem 1rem', border: selectedCity?.id === city.id ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '3px', background: selectedCity?.id === city.id ? '#fffef8' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 300 }}>{city.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#C9A96E', letterSpacing: '0.1em' }}>{city.currency}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* ── MODAL SURPRENEZ-MOI ── */}
      <AnimatePresence>
      {showSurpriseModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={s.modalOverlay} onClick={() => setShowSurpriseModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ width: '40px', height: '4px', background: '#e0dbd4', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
            <div style={s.modalTitle}>✦ Surprenez-moi</div>
            <div style={s.modalSub}>Choisissez votre occasion — notre styliste IA compose votre look parfait · Choose your occasion</div>
            <div style={s.occasionGrid}>
              {OCCASIONS.map(occ => (
                <motion.div
                  key={occ.id}
                  style={s.occasionCard(selectedOccasion?.id === occ.id)}
                  onClick={() => setSelectedOccasion(occ)}
                  whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span style={s.occasionIcon}>{occ.icon}</span>
                  <div style={s.occasionLabel}>{occ.label}</div>
                  <div style={s.occasionDesc}>{occ.desc}</div>
                  {occ.suitOnly && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.55rem', fontFamily: 'sans-serif', color: '#C9A96E', letterSpacing: '0.1em', background: 'rgba(201,169,110,0.1)', padding: '0.2rem 0.4rem', borderRadius: '2px', display: 'inline-block' }}>
                      COMPLET UNIQUEMENT
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <AnimatePresence>
            {selectedOccasion && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                {selectedOccasion.suitOnly && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fffbf0', border: '1px solid #e8d8b8', borderRadius: '3px', fontSize: '0.7rem', fontFamily: 'sans-serif', color: '#7a5c1e', lineHeight: 1.6 }}>
                    ✦ Pour le mariage, notre styliste IA sélectionnera le complet idéal et le placera directement sur vous — en une seule génération. Élégance garantie.
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ ...s.btnSurprise, marginTop: '1rem', marginBottom: 0 }}
                  onClick={() => handleSurpriseGenerate(selectedOccasion)}
                >
                  ✦ CRÉER MON LOOK {selectedOccasion.label.toUpperCase()}<br />
                  <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                    {selectedOccasion.suitOnly
                      ? 'Complet Surmesur · ~30 secondes'
                      : 'Génération automatique en 3 étapes · ~90 secondes'}
                  </span>
                </motion.button>
              </motion.div>
            )}
            </AnimatePresence>
            <button
              style={{ ...s.btnRestart, marginTop: '0.75rem' }}
              onClick={() => setShowSurpriseModal(false)}
            >
              ANNULER
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── PHASE PHOTO ── */}
      <AnimatePresence mode="wait">
      {phase === 'photo' && (
        <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
          <motion.div style={s.hero} initial="hidden" animate="visible" variants={heroContainer}>
            <motion.div style={s.eyebrow} variants={heroItem}>{t.tagline}</motion.div>
            <motion.h1 style={s.title} variants={heroItem}>{t.heroTitle1} <span style={s.gold}>{t.heroTitle2}</span><br />{t.heroTitle3}</motion.h1>
            <motion.p style={s.sub} variants={heroItem}>{t.heroSub}</motion.p>
            <motion.div style={s.stats} variants={heroItem}>
              <div><div style={s.statN}>3</div><div style={s.statL}>{t.stat1}</div></div>
              <div><div style={s.statN}>22+</div><div style={s.statL}>{t.stat2}</div></div>
              <div><div style={s.statN}>100%</div><div style={s.statL}>{t.stat3}</div></div>
            </motion.div>
          </motion.div>

          <div style={s.photoWrap}>
            <div style={s.stepNum}>02</div>
            <div style={s.stepTitle}>{t.step1Title}</div>
            <div style={s.stepSub}>{t.step1Sub}</div>

            {tryMode && (
              <motion.button
                whileHover={{ scale: 1.02, borderColor: '#C9A96E', color: '#C9A96E' }}
                whileTap={{ scale: 0.97 }}
                onClick={backToStep1}
                style={{ display: 'inline-block', background: 'none', border: '1px solid #e8e4df', borderRadius: '20px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.05em', fontFamily: 'sans-serif', color: '#888', marginTop: '0.7rem', marginBottom: '0.3rem' }}
              >
                {t.btnChangeMode}
              </motion.button>
            )}

            {/* Guide photo — deux cartes */}
            <motion.div
              style={{ marginBottom: '1.75rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e8e4df' }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={revealOnScroll}
            >
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>

                {/* Carte gauche — LA PHOTO PARFAITE — fond or */}
                <div style={{ background: 'rgba(201,169,110,0.86)', padding: '2rem 1.75rem' }}>
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
                <div style={{ background: 'rgba(17,17,17,0.82)', padding: '2rem 1.75rem' }}>
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

              {/* Astuce spécifique au mode choisi (Outfits vs Pièce par pièce) */}
              {tryMode && (
                <div style={{ background: tryMode === 'outfits' ? 'rgba(201,169,110,0.12)' : '#111', padding: '1.1rem 1.75rem', borderTop: '1px solid #e8e4df', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <span style={{ color: '#C9A96E', fontSize: '0.8rem', flexShrink: 0, marginTop: '0.05rem' }}>✦</span>
                  <div>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C9A96E', fontFamily: 'sans-serif', fontWeight: 600, marginBottom: '0.35rem' }}>{tryMode === 'outfits' ? t.wearGuideOutfitsTitle : t.wearGuidePiecesTitle}</div>
                    <div style={{ fontSize: '0.72rem', color: tryMode === 'outfits' ? '#1a1a1a' : '#fff', fontFamily: 'sans-serif', lineHeight: 1.6 }}>{tryMode === 'outfits' ? t.wearGuideOutfitsText : t.wearGuidePiecesText}</div>
                  </div>
                </div>
              )}
            </motion.div>

            {!cameraActive && !photoConfirmation && (
              <>
                <motion.div style={s.uploadZone} onClick={() => fileInputRef.current?.click()} whileHover={{ scale: 1.01, borderColor: '#C9A96E' }} whileTap={{ scale: 0.99 }}>
                  <div style={s.uploadIcon}>✦</div>
                  <div style={s.uploadTxt}>{t.uploadTxt}</div>
                  <div style={s.uploadSub}>{t.uploadSub}</div>
                  <div style={{ fontSize: '0.62rem', color: '#aaa', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '0.5rem' }}>
                    {{ fr: 'Votre photo est utilisée uniquement pour générer votre look et n\'est pas stockée sur nos serveurs.', en: 'Your photo is used solely to generate your look and is not stored on our servers.', es: 'Tu foto se usa únicamente para generar tu look y no se almacena en nuestros servidores.' }[lang]}
                  </div>
                </motion.div>
                <div style={s.btnRow}>
                  <motion.button style={s.btnBlack} onClick={startCamera} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>{t.btnCamera}</motion.button>
                  <motion.button style={s.btnOutline} onClick={() => fileInputRef.current?.click()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>{t.btnGallery}</motion.button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return
                  try {
                    const { blob, dataUrl } = await compressPhotoForStorage(f)
                    setPhotoClient(blob); setPhotoPreview(dataUrl)
                  } catch (err) {
                    setPhotoClient(f); setPhotoPreview(URL.createObjectURL(f))
                  }
                  setPhase('build'); window.scrollTo({ top: 0, behavior: 'instant' })
                }} style={{ display: 'none' }} />
              </>
            )}

            {cameraActive && !photoConfirmation && (
              <>
                <div style={s.camWrap}><video ref={videoRef} style={s.camVideo} autoPlay playsInline muted /></div>
                <div style={s.camHint}>⏱ 3 secondes pour vous placer après le bouton</div>
                <motion.button onClick={capturePhoto} disabled={countdown !== null} style={s.capBtn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AnimatePresence mode="wait">
                    {countdown ? (
                      <motion.span key={countdown} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.35 }} style={{ color: '#C9A96E', fontSize: '1.6rem', fontWeight: 300 }}>{countdown}</motion.span>
                    ) : (
                      <motion.div key="dot" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={s.capInner} />
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button style={{ ...s.btnGhost, width: '100%', marginTop: '0.5rem' }} onClick={stopCamera} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>ANNULER</motion.button>
              </>
            )}

            {photoConfirmation && (
              <>
                <motion.img initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} src={photoConfirmation} alt="Preview" style={s.confirmImg} />
                <div style={s.confirmBtns}>
                  <motion.button style={s.btnBlack} onClick={confirmPhoto} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>✓ UTILISER CETTE PHOTO</motion.button>
                  <motion.button style={s.btnGhost} onClick={() => { setPhotoConfirmation(null); startCamera() }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>↺ REPRENDRE</motion.button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

      {/* ── PHASE BUILD ── */}
      {phase === 'build' && (
        <motion.div key="build" style={s.buildWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
          {/* Main column */}
          <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '1rem' : '1.5rem', paddingBottom: isMobile ? '80px' : undefined }}>

            {/* Photo thumb */}
            <div style={s.photoThumbRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {photoPreview && <img src={photoPreview} alt="Votre photo" style={s.photoThumb} />}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 300, marginBottom: '0.3rem' }}>Photo chargée ✓</div>
                  <button style={s.changeBtn} onClick={() => { stopCamera(); setPhase('photo'); setPhotoClient(null); setPhotoPreview(null); setGenerations([]); setSidebarItems([]); setPendingItem(null) }}>
                    Changer la photo
                  </button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                style={s.modeSwitchBtn}
                onClick={toggleTryMode}
              >
                {tryMode === 'outfits' ? t.introPiecesLabel : t.introOutfitsLabel}
              </motion.button>
            </div>

            {/* Avertissement IA — mobile uniquement, sous la photo chargée */}
            {isMobile && (
              <div style={{ fontSize: '0.6rem', color: '#aaa', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.6, padding: '0.5rem 0.75rem', marginBottom: '0.75rem', background: '#fafaf8', border: '1px solid #e8e4df', borderRadius: '3px' }}>
                ℹ Aperçu IA — approximation visuelle. Couleurs et ajustements réels peuvent différer. · <em>AI preview — actual fit may vary.</em>
              </div>
            )}

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
              <div ref={loadingRef} style={{ background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {pendingItem && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.6rem', background: '#fafaf8', borderRadius: '3px', textAlign: 'left' }}>
                    <img src={pendingItem.image} alt={pendingItem.nom_fr} style={{ width: '44px', height: '55px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 400, marginBottom: '0.1rem' }}>{pendingItem.nom_fr}</div>
                      <div style={{ fontSize: '0.62rem', color: '#C9A96E', fontFamily: 'sans-serif' }}>{displayItemPrice(pendingItem.prix)}</div>
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
                    <AnimatePresence mode="wait">
                      <motion.img key={currentResult} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} src={currentResult} alt="Look généré" style={s.resultImg} />
                    </AnimatePresence>

                    {activeResultIdx === generations.length - 1 && !isGenerating && replaceMode === null && (
                      <button style={s.btnRegen} onClick={handleRegenerate}>{t.regenerate}</button>
                    )}

                    {/* Boutons partage social */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.6rem' }}>
                        ✦ PARTAGER MON LOOK · SHARE MY LOOK
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Télécharger', icon: '⬇', color: '#C9A96E', action: async () => {
                            try {
                              const res = await fetch(currentResult)
                              const blob = await res.blob()
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `look-surmesur.png`
                              a.click()
                              URL.revokeObjectURL(url)
                            } catch { window.open(currentResult, '_blank') }
                          }},
                          { label: 'WhatsApp', icon: '💬', color: '#25D366', action: () => {
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Regarde mon look Surmesur ✦ ' + currentResult)}`, '_blank')
                          }},
                          { label: 'Message', icon: '✉️', color: '#555', action: () => {
                            window.location.href = `sms:?body=${encodeURIComponent('Regarde mon look Surmesur ✦ ' + currentResult)}`
                          }},
                        ].map(({ label, icon, color, action }) => (
                          <button
                            key={label}
                            onClick={action}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', background: '#fff', border: `1px solid ${color}`, borderRadius: '3px', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'sans-serif', color, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: '#bbb', fontFamily: 'sans-serif', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        ✦ Powered by Surmesur Virtual Try-On · surmesur-tryon.vercel.app
                      </div>
                    </div>

                    {/* Avertissement sous l'image générée — supprimé, déplacé sous le bouton Essayer */}
                  </>
                )}
                <div style={s.thumbRow}>
                  {generations.map((gen, i) => (
                    <motion.div key={i} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={s.thumb(i === activeResultIdx)} onClick={() => setActiveResultIdx(i)}>
                      <img src={gen.resultUrl} alt={gen.item.nom_fr} style={s.thumbImg} />
                      <div style={s.thumbLabel}>{gen.item.nom_fr}</div>
                      {!isGenerating && (
                        <button style={s.thumbEdit} onClick={(e) => { e.stopPropagation(); startReplace(i) }}>✎</button>
                      )}
                    </motion.div>
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
                <div style={s.stepNum}>0{generations.length === 0 ? '3' : generations.length + 2}</div>
                <div style={s.stepTitle}>{replaceMode !== null ? t.step2TitleR : generations.length === 0 ? (tryMode === 'outfits' ? t.step2Title0Outfit : t.step2Title0) : t.step2TitleN}</div>
                <div style={s.stepSub}>
                  {replaceMode !== null
                    ? `${t.replaceMode} : ${generations[replaceMode]?.item.nom_fr}`
                    : `${generations.length}/${MAX_GENERATIONS} ${tryMode === 'outfits' ? t.step2SubOutfit : t.step2Sub}`}
                </div>

                {/* Formulaire mensurations — au-dessus du catalogue (mobile + desktop) */}
                {(
                  <div style={{ marginBottom: '1rem', border: '1px solid #e8e4df', borderRadius: '4px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setShowMensurationsForm(!showMensurationsForm)}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: showMensurationsForm ? '#fffbf0' : '#fafaf8', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: showMensurationsForm ? '1px solid #e8d8b8' : 'none' }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'sans-serif', color: '#C9A96E', fontWeight: 600, letterSpacing: '0.1em' }}>✦ MENSURATIONS · OPTIONNEL</div>
                        <div style={{ fontSize: '0.58rem', fontFamily: 'sans-serif', color: '#aaa', marginTop: '0.15rem' }}>Pour un résultat encore plus fidèle</div>
                      </div>
                      <motion.span animate={{ rotate: showMensurationsForm ? 0 : 0 }} style={{ color: '#C9A96E', fontSize: '0.8rem', display: 'inline-block' }}>{showMensurationsForm ? '▲' : '▼'}</motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                    {showMensurationsForm && (
                      <motion.div
                        key="mensurations-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                      <div style={{ padding: '1rem', background: '#fffbf0' }}>
                        <div style={{ fontSize: '0.62rem', color: '#fff', fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: '1rem', padding: '0.6rem 0.75rem', background: '#000', border: '1px solid #C9A96E', borderRadius: '3px' }}>
                          <span style={{ color: '#C9A96E' }}>✦</span> Ces informations sont <strong>optionnelles mais recommandées</strong>. Elles permettent à notre IA de créer un résultat plus réaliste et fidèle à votre morphologie.
                        </div>

                        {/* Genre */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.35rem' }}>GENRE</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['Homme', 'Femme', 'Autre'].map(g => (
                              <button key={g} onClick={() => setMensurations(m => ({ ...m, genre: g }))}
                                style={{ flex: 1, padding: '0.5rem', border: mensurations.genre === g ? '2px solid #C9A96E' : '1px solid #e8e4df', background: mensurations.genre === g ? '#fffbf0' : '#fff', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'sans-serif', color: mensurations.genre === g ? '#C9A96E' : '#666', borderRadius: '3px' }}>
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Taille + Poids */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.35rem' }}>TAILLE</div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <input type="number" placeholder={mensurations.tailleUnit === 'cm' ? '180' : '71'} value={mensurations.taille}
                                onChange={e => setMensurations(m => ({ ...m, taille: e.target.value }))}
                                style={{ flex: 1, padding: '0.45rem 0.4rem', border: '1px solid #e8e4df', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'sans-serif', outline: 'none', minWidth: 0 }} />
                              <div style={{ display: 'flex', borderRadius: '3px', overflow: 'hidden', border: '1px solid #e8e4df' }}>
                                {['cm', 'po'].map(u => (
                                  <button key={u} onClick={() => setMensurations(m => ({ ...m, tailleUnit: u }))}
                                    style={{ padding: '0.45rem 0.4rem', border: 'none', background: mensurations.tailleUnit === u ? '#C9A96E' : '#fff', color: mensurations.tailleUnit === u ? '#fff' : '#888', cursor: 'pointer', fontSize: '0.6rem', fontFamily: 'sans-serif' }}>
                                    {u}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.35rem' }}>POIDS</div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <input type="number" placeholder={mensurations.poidsUnit === 'kg' ? '80' : '176'} value={mensurations.poids}
                                onChange={e => setMensurations(m => ({ ...m, poids: e.target.value }))}
                                style={{ flex: 1, padding: '0.45rem 0.4rem', border: '1px solid #e8e4df', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'sans-serif', outline: 'none', minWidth: 0 }} />
                              <div style={{ display: 'flex', borderRadius: '3px', overflow: 'hidden', border: '1px solid #e8e4df' }}>
                                {['kg', 'lb'].map(u => (
                                  <button key={u} onClick={() => setMensurations(m => ({ ...m, poidsUnit: u }))}
                                    style={{ padding: '0.45rem 0.4rem', border: 'none', background: mensurations.poidsUnit === u ? '#C9A96E' : '#fff', color: mensurations.poidsUnit === u ? '#fff' : '#888', cursor: 'pointer', fontSize: '0.6rem', fontFamily: 'sans-serif' }}>
                                    {u}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Morphologie mobile avec SVG */}
                        <div>
                          <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>MORPHOLOGIE</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                            {[
                              { id: 'mince', label: 'Mince',
                                svgH: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><rect x="15" y="18" width="10" height="28" rx="4" fill="currentColor"/><rect x="13" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-8 13 18)"/><rect x="23" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(8 27 18)"/><rect x="15" y="44" width="4" height="26" rx="2" fill="currentColor" transform="rotate(-3 15 44)"/><rect x="21" y="44" width="4" height="26" rx="2" fill="currentColor" transform="rotate(3 25 44)"/></svg>,
                                svgF: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M14 18 Q20 22 26 18 L28 42 Q20 46 12 42 Z" fill="currentColor"/><rect x="11" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-10 11 18)"/><rect x="25" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(10 29 18)"/><rect x="14" y="42" width="5" height="28" rx="2" fill="currentColor" transform="rotate(-2 14 42)"/><rect x="21" y="42" width="5" height="28" rx="2" fill="currentColor" transform="rotate(2 25 42)"/></svg> },
                              { id: 'moyen', label: 'Moyen',
                                svgH: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M13 18 Q20 17 27 18 L26 44 Q20 46 14 44 Z" fill="currentColor"/><rect x="11" y="18" width="4" height="21" rx="2" fill="currentColor" transform="rotate(-10 11 18)"/><rect x="25" y="18" width="4" height="21" rx="2" fill="currentColor" transform="rotate(10 29 18)"/><rect x="14" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(-3 14 43)"/><rect x="21" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(3 26 43)"/></svg>,
                                svgF: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M13 18 Q20 16 27 18 L29 36 Q22 44 18 44 L11 36 Z" fill="currentColor"/><rect x="11" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-10 11 18)"/><rect x="25" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(10 29 18)"/><rect x="14" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(-3 14 43)"/><rect x="21" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(3 26 43)"/></svg> },
                              { id: 'athletic', label: 'Athlétique',
                                svgH: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M11 18 Q20 16 29 18 L27 44 Q20 46 13 44 Z" fill="currentColor"/><rect x="9" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-12 9 18)"/><rect x="26" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(12 31 18)"/><rect x="13" y="43" width="6" height="27" rx="2" fill="currentColor" transform="rotate(-3 13 43)"/><rect x="21" y="43" width="6" height="27" rx="2" fill="currentColor" transform="rotate(3 27 43)"/></svg>,
                                svgF: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M12 18 Q20 15 28 18 L30 36 Q24 44 16 44 L10 36 Z" fill="currentColor"/><rect x="9" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-12 9 18)"/><rect x="27" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(12 31 18)"/><rect x="14" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(-3 14 43)"/><rect x="21" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(3 26 43)"/></svg> },
                              { id: 'poire', label: 'Poire',
                                svgH: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M14 18 Q20 18 26 18 L28 32 Q26 46 12 46 L12 32 Z" fill="currentColor"/><rect x="12" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-8 12 18)"/><rect x="24" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(8 28 18)"/><rect x="12" y="44" width="6" height="26" rx="2" fill="currentColor" transform="rotate(-4 12 44)"/><rect x="22" y="44" width="6" height="26" rx="2" fill="currentColor" transform="rotate(4 28 44)"/></svg>,
                                svgF: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M15 18 Q20 17 25 18 L27 30 Q32 44 20 50 Q8 44 13 30 Z" fill="currentColor"/><rect x="13" y="18" width="4" height="18" rx="2" fill="currentColor" transform="rotate(-8 13 18)"/><rect x="23" y="18" width="4" height="18" rx="2" fill="currentColor" transform="rotate(8 27 18)"/><rect x="13" y="48" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-4 13 48)"/><rect x="22" y="48" width="5" height="22" rx="2" fill="currentColor" transform="rotate(4 27 48)"/></svg> },
                              { id: 'costaud', label: 'Costaud',
                                svgH: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M9 18 Q20 15 31 18 L29 44 Q20 47 11 44 Z" fill="currentColor"/><rect x="7" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-14 7 18)"/><rect x="28" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(14 33 18)"/><rect x="12" y="43" width="7" height="27" rx="2" fill="currentColor" transform="rotate(-3 12 43)"/><rect x="21" y="43" width="7" height="27" rx="2" fill="currentColor" transform="rotate(3 28 43)"/></svg>,
                                svgF: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M10 18 Q20 15 30 18 L33 36 Q24 48 16 48 L7 36 Z" fill="currentColor"/><rect x="8" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-14 8 18)"/><rect x="28" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(14 32 18)"/><rect x="13" y="46" width="6" height="24" rx="2" fill="currentColor" transform="rotate(-3 13 46)"/><rect x="21" y="46" width="6" height="24" rx="2" fill="currentColor" transform="rotate(3 27 46)"/></svg> },
                              { id: 'enveloppe', label: 'Enveloppé',
                                svgH: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M8 18 Q20 14 32 18 L34 46 Q20 50 6 46 Z" fill="currentColor"/><rect x="6" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-16 6 18)"/><rect x="29" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(16 34 18)"/><rect x="11" y="45" width="7" height="25" rx="2" fill="currentColor" transform="rotate(-4 11 45)"/><rect x="22" y="45" width="7" height="25" rx="2" fill="currentColor" transform="rotate(4 29 45)"/></svg>,
                                svgF: <svg viewBox="0 0 40 80" width="28" height="56"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M9 18 Q20 14 31 18 L35 38 Q24 52 16 52 L5 38 Z" fill="currentColor"/><rect x="7" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-16 7 18)"/><rect x="29" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(16 33 18)"/><rect x="13" y="50" width="6" height="20" rx="2" fill="currentColor" transform="rotate(-4 13 50)"/><rect x="21" y="50" width="6" height="20" rx="2" fill="currentColor" transform="rotate(4 27 50)"/></svg> },
                            ].map(morph => {
                              const isSel = mensurations.morphologie === morph.id
                              const isFemme = mensurations.genre === 'Femme'
                              return (
                                <button key={morph.id} onClick={() => setMensurations(m => ({ ...m, morphologie: morph.id }))}
                                  style={{ padding: '0.65rem 0.25rem', border: isSel ? '2px solid #C9A96E' : '1px solid #e8e4df', background: isSel ? '#fffbf0' : '#fff', cursor: 'pointer', borderRadius: '4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                                  <div style={{ color: isSel ? '#C9A96E' : '#ccc', lineHeight: 0 }}>
                                    {isFemme ? morph.svgF : morph.svgH}
                                  </div>
                                  <div style={{ fontSize: '0.62rem', fontFamily: 'sans-serif', color: isSel ? '#C9A96E' : '#555', fontWeight: isSel ? 600 : 400, lineHeight: 1.2 }}>{morph.label}</div>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {(mensurations.genre || mensurations.taille || mensurations.poids || mensurations.morphologie) && (
                          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#fff', border: '1px solid #C9A96E', borderRadius: '3px', fontSize: '0.62rem', color: '#7a5c1e', fontFamily: 'sans-serif' }}>
                            ✦ {mensurations.genre}{mensurations.taille && ` · ${mensurations.taille} ${mensurations.tailleUnit}`}{mensurations.poids && ` · ${mensurations.poids} ${mensurations.poidsUnit}`}{mensurations.morphologie && ` · ${mensurations.morphologie}`}
                          </div>
                        )}
                      </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                )}

                <div style={s.catalogLabel}>{t.catalogLabel} · {CATALOGUE[activeTab].label.toUpperCase()}</div>
                <div style={s.tabs}>
                  {Object.entries(CATALOGUE).filter(([key]) => visibleTabKeys.includes(key)).map(([key, cat]) => (
                    <button key={key} style={s.tab(activeTab === key)} onClick={() => setActiveTab(key)}>
                      <img src={cat.iconImage} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', marginRight: '0.4rem', verticalAlign: 'middle', border: activeTab === key ? '1px solid #C9A96E' : '1px solid #e8e4df', opacity: activeTab === key ? 1 : 0.6 }} />
                      {lang === 'en' ? cat.label_en || cat.label : cat.label}
                      {activeTab === key && (
                        <motion.div layoutId="tabIndicator" style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '2px', background: '#C9A96E' }} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Bouton "Changer une pièce" — visible seulement en mode Outfits, après la 1ère génération */}
                {tryMode === 'outfits' && generations.length > 0 && !showAllTabs && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAllTabs(true)}
                    style={{ ...s.btnBlack, width: '100%', marginBottom: '1rem', fontSize: '0.68rem' }}
                  >
                    {t.changePieceBtn}
                  </motion.button>
                )}

                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} style={s.grid} initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={gridContainer}>
                    {CATALOGUE[activeTab].items.map(item => {
                      const isSel = pendingItem?.id === item.id
                      return (
                        <motion.div key={item.id} variants={gridItem} style={s.card(isSel)} onClick={() => { setPendingItem(item); setError(null) }} whileHover={{ y: -4, boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }}>
                          <div style={s.cardImgWrap}>
                            <img src={item.image} alt={item.nom_fr} style={s.cardImg} />
                            {item.tissu && <img src={item.tissu} alt="Tissu" title="Aperçu du tissu" style={s.cardSwatch} />}
                          </div>
                          {isSel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} style={s.checkBadge}>✓</motion.div>}
                          <div style={s.cardInfo}>
                            <div style={s.cardName}>{item.nom_fr}</div>
                            <div style={s.cardDesc}>{item.desc}</div>
                            <div style={s.cardPrice}>{displayItemPrice(item.prix)}</div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Try button — desktop only */}
                {!isMobile && (
                  <div style={s.trySection}>
                    {pendingItem && (
                      <div style={s.tryPreview}>
                        <img src={pendingItem.image} alt={pendingItem.nom_fr} style={s.tryPreviewImg} />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 400 }}>{pendingItem.nom_fr}</div>
                          <div style={{ fontSize: '0.75rem', color: '#C9A96E' }}>{displayItemPrice(pendingItem.prix)}</div>
                        </div>
                      </div>
                    )}
                    {/* Formulaire mensurations optionnel — masqué : déplacé au-dessus du catalogue */}
                    <div style={{ display: 'none', marginTop: '1.25rem', marginBottom: '0.75rem', border: '1px solid #e8e4df', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setShowMensurationsForm(!showMensurationsForm)}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: showMensurationsForm ? '#fffbf0' : '#fafaf8', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: showMensurationsForm ? '1px solid #e8d8b8' : 'none' }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.68rem', fontFamily: 'sans-serif', color: '#C9A96E', fontWeight: 600, letterSpacing: '0.1em' }}>✦ MENSURATIONS · OPTIONNEL</div>
                          <div style={{ fontSize: '0.58rem', fontFamily: 'sans-serif', color: '#aaa', marginTop: '0.15rem' }}>Pour un résultat encore plus fidèle · For a more accurate result</div>
                        </div>
                        <span style={{ color: '#C9A96E', fontSize: '0.8rem' }}>{showMensurationsForm ? '▲' : '▼'}</span>
                      </button>

                      {showMensurationsForm && (
                        <div style={{ padding: '1rem', background: '#fffbf0' }}>
                          <div style={{ fontSize: '0.62rem', color: '#fff', fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: '1rem', padding: '0.6rem 0.75rem', background: '#000', border: '1px solid #C9A96E', borderRadius: '3px' }}>
                            <span style={{ color: '#C9A96E' }}>✦</span> Ces informations sont <strong style={{ color: '#fff' }}>optionnelles mais recommandées</strong>. Elles permettent à notre IA de créer un résultat encore plus réaliste et fidèle à votre morphologie réelle. Elles seront également transmises à votre styliste pour préparer votre rendez-vous. · <em>Optional but recommended for best results.</em>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

                            {/* Genre */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.35rem' }}>GENRE · GENDER</div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['Homme', 'Femme', 'Autre'].map(g => (
                                  <button key={g} onClick={() => setMensurations(m => ({ ...m, genre: g }))}
                                    style={{ flex: 1, padding: '0.5rem', border: mensurations.genre === g ? '2px solid #C9A96E' : '1px solid #e8e4df', background: mensurations.genre === g ? '#fffbf0' : '#fff', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'sans-serif', color: mensurations.genre === g ? '#C9A96E' : '#666', borderRadius: '3px' }}>
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Taille */}
                            <div>
                              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.35rem' }}>TAILLE · HEIGHT</div>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <input
                                  type="number"
                                  placeholder={mensurations.tailleUnit === 'cm' ? 'ex: 180' : mensurations.tailleUnit === 'po' ? 'ex: 71' : 'ex: 5.11'}
                                  value={mensurations.taille}
                                  onChange={e => setMensurations(m => ({ ...m, taille: e.target.value }))}
                                  style={{ flex: 1, padding: '0.45rem 0.6rem', border: '1px solid #e8e4df', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'sans-serif', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', borderRadius: '3px', overflow: 'hidden', border: '1px solid #e8e4df' }}>
                                  {['cm', 'po', 'pi'].map(u => (
                                    <button key={u} onClick={() => setMensurations(m => ({ ...m, tailleUnit: u }))}
                                      style={{ padding: '0.45rem 0.5rem', border: 'none', background: mensurations.tailleUnit === u ? '#C9A96E' : '#fff', color: mensurations.tailleUnit === u ? '#fff' : '#888', cursor: 'pointer', fontSize: '0.6rem', fontFamily: 'sans-serif' }}>
                                      {u}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Poids */}
                            <div>
                              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.35rem' }}>POIDS · WEIGHT</div>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <input
                                  type="number"
                                  placeholder={mensurations.poidsUnit === 'kg' ? 'ex: 80' : 'ex: 176'}
                                  value={mensurations.poids}
                                  onChange={e => setMensurations(m => ({ ...m, poids: e.target.value }))}
                                  style={{ flex: 1, padding: '0.45rem 0.6rem', border: '1px solid #e8e4df', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'sans-serif', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', borderRadius: '3px', overflow: 'hidden', border: '1px solid #e8e4df' }}>
                                  {['kg', 'lb'].map(u => (
                                    <button key={u} onClick={() => setMensurations(m => ({ ...m, poidsUnit: u }))}
                                      style={{ padding: '0.45rem 0.5rem', border: 'none', background: mensurations.poidsUnit === u ? '#C9A96E' : '#fff', color: mensurations.poidsUnit === u ? '#fff' : '#888', cursor: 'pointer', fontSize: '0.6rem', fontFamily: 'sans-serif' }}>
                                      {u}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Morphologie */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>MORPHOLOGIE · BODY TYPE</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {[
                                  // LIGNE 1 — Mince, Moyen, Athlétique
                                  {
                                    id: 'mince', label: 'Mince', sub: 'Slim',
                                    svgH: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><rect x="15" y="18" width="10" height="28" rx="4" fill="currentColor"/><rect x="13" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-8 13 18)"/><rect x="23" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(8 27 18)"/><rect x="15" y="44" width="4" height="26" rx="2" fill="currentColor" transform="rotate(-3 15 44)"/><rect x="21" y="44" width="4" height="26" rx="2" fill="currentColor" transform="rotate(3 25 44)"/></svg>,
                                    svgF: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M14 18 Q20 22 26 18 L28 42 Q20 46 12 42 Z" fill="currentColor"/><rect x="11" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-10 11 18)"/><rect x="25" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(10 29 18)"/><rect x="14" y="42" width="5" height="28" rx="2" fill="currentColor" transform="rotate(-2 14 42)"/><rect x="21" y="42" width="5" height="28" rx="2" fill="currentColor" transform="rotate(2 25 42)"/></svg>
                                  },
                                  {
                                    id: 'moyen', label: 'Moyen', sub: 'Average',
                                    svgH: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M13 18 Q20 17 27 18 L26 44 Q20 46 14 44 Z" fill="currentColor"/><rect x="11" y="18" width="4" height="21" rx="2" fill="currentColor" transform="rotate(-10 11 18)"/><rect x="25" y="18" width="4" height="21" rx="2" fill="currentColor" transform="rotate(10 29 18)"/><rect x="14" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(-3 14 43)"/><rect x="21" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(3 26 43)"/></svg>,
                                    svgF: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M13 18 Q20 16 27 18 L29 36 Q22 44 18 44 L11 36 Z" fill="currentColor"/><rect x="11" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-10 11 18)"/><rect x="25" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(10 29 18)"/><rect x="14" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(-3 14 43)"/><rect x="21" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(3 26 43)"/></svg>
                                  },
                                  {
                                    id: 'athletic', label: 'Athlétique', sub: 'Athletic',
                                    svgH: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M11 18 Q20 16 29 18 L27 44 Q20 46 13 44 Z" fill="currentColor"/><rect x="9" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-12 9 18)"/><rect x="26" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(12 31 18)"/><rect x="13" y="43" width="6" height="27" rx="2" fill="currentColor" transform="rotate(-3 13 43)"/><rect x="21" y="43" width="6" height="27" rx="2" fill="currentColor" transform="rotate(3 27 43)"/></svg>,
                                    svgF: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M12 18 Q20 15 28 18 L30 36 Q24 44 16 44 L10 36 Z" fill="currentColor"/><rect x="9" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-12 9 18)"/><rect x="27" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(12 31 18)"/><rect x="14" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(-3 14 43)"/><rect x="21" y="43" width="5" height="27" rx="2" fill="currentColor" transform="rotate(3 26 43)"/></svg>
                                  },
                                  // LIGNE 2 — Poire, Costaud, Enveloppé
                                  {
                                    id: 'poire', label: 'Poire', sub: 'Pear',
                                    svgH: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M14 18 Q20 18 26 18 L28 32 Q26 46 12 46 L12 32 Z" fill="currentColor"/><rect x="12" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-8 12 18)"/><rect x="24" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(8 28 18)"/><rect x="12" y="44" width="6" height="26" rx="2" fill="currentColor" transform="rotate(-4 12 44)"/><rect x="22" y="44" width="6" height="26" rx="2" fill="currentColor" transform="rotate(4 28 44)"/></svg>,
                                    svgF: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="7" ry="7" fill="currentColor"/><path d="M15 18 Q20 17 25 18 L27 30 Q32 44 20 50 Q8 44 13 30 Z" fill="currentColor"/><rect x="13" y="18" width="4" height="18" rx="2" fill="currentColor" transform="rotate(-8 13 18)"/><rect x="23" y="18" width="4" height="18" rx="2" fill="currentColor" transform="rotate(8 27 18)"/><rect x="13" y="48" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-4 13 48)"/><rect x="22" y="48" width="5" height="22" rx="2" fill="currentColor" transform="rotate(4 27 48)"/></svg>
                                  },
                                  {
                                    id: 'costaud', label: 'Costaud', sub: 'Stocky',
                                    svgH: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M9 18 Q20 15 31 18 L29 44 Q20 47 11 44 Z" fill="currentColor"/><rect x="7" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-14 7 18)"/><rect x="28" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(14 33 18)"/><rect x="12" y="43" width="7" height="27" rx="2" fill="currentColor" transform="rotate(-3 12 43)"/><rect x="21" y="43" width="7" height="27" rx="2" fill="currentColor" transform="rotate(3 28 43)"/></svg>,
                                    svgF: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M10 18 Q20 15 30 18 L33 36 Q24 48 16 48 L7 36 Z" fill="currentColor"/><rect x="8" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-14 8 18)"/><rect x="28" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(14 32 18)"/><rect x="13" y="46" width="6" height="24" rx="2" fill="currentColor" transform="rotate(-3 13 46)"/><rect x="21" y="46" width="6" height="24" rx="2" fill="currentColor" transform="rotate(3 27 46)"/></svg>
                                  },
                                  {
                                    id: 'enveloppe', label: 'Enveloppé', sub: 'Full',
                                    svgH: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M8 18 Q20 14 32 18 L34 46 Q20 50 6 46 Z" fill="currentColor"/><rect x="6" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(-16 6 18)"/><rect x="29" y="18" width="5" height="22" rx="2" fill="currentColor" transform="rotate(16 34 18)"/><rect x="11" y="45" width="7" height="25" rx="2" fill="currentColor" transform="rotate(-4 11 45)"/><rect x="22" y="45" width="7" height="25" rx="2" fill="currentColor" transform="rotate(4 29 45)"/></svg>,
                                    svgF: <svg viewBox="0 0 40 80" width="32" height="64"><ellipse cx="20" cy="10" rx="8" ry="7" fill="currentColor"/><path d="M9 18 Q20 14 31 18 L35 38 Q24 52 16 52 L5 38 Z" fill="currentColor"/><rect x="7" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(-16 7 18)"/><rect x="29" y="18" width="4" height="20" rx="2" fill="currentColor" transform="rotate(16 33 18)"/><rect x="13" y="50" width="6" height="20" rx="2" fill="currentColor" transform="rotate(-4 13 50)"/><rect x="21" y="50" width="6" height="20" rx="2" fill="currentColor" transform="rotate(4 27 50)"/></svg>
                                  },
                                ].map(morph => {
                                  const isSel = mensurations.morphologie === morph.id
                                  const isFemme = mensurations.genre === 'Femme'
                                  return (
                                    <button key={morph.id} onClick={() => setMensurations(m => ({ ...m, morphologie: morph.id }))}
                                      style={{ padding: '0.75rem 0.35rem', border: isSel ? '2px solid #C9A96E' : '1px solid #e8e4df', background: isSel ? '#fffbf0' : '#fff', cursor: 'pointer', borderRadius: '4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                                      <div style={{ color: isSel ? '#C9A96E' : '#ccc', lineHeight: 0 }}>
                                        {isFemme ? morph.svgF : morph.svgH}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', fontFamily: 'sans-serif', color: isSel ? '#C9A96E' : '#555', fontWeight: isSel ? 600 : 400, lineHeight: 1.2 }}>{morph.label}</div>
                                      <div style={{ fontSize: '0.52rem', color: '#bbb', fontFamily: 'sans-serif' }}>{morph.sub}</div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                          </div>

                          {/* Résumé si rempli */}
                          {(mensurations.genre || mensurations.taille || mensurations.poids || mensurations.morphologie) && (
                            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#fff', border: '1px solid #C9A96E', borderRadius: '3px', fontSize: '0.62rem', color: '#7a5c1e', fontFamily: 'sans-serif' }}>
                              ✦ Transmis au styliste :
                              {mensurations.genre && ` ${mensurations.genre}`}
                              {mensurations.taille && ` · ${mensurations.taille} ${mensurations.tailleUnit}`}
                              {mensurations.poids && ` · ${mensurations.poids} ${mensurations.poidsUnit}`}
                              {mensurations.morphologie && ` · Morphologie ${mensurations.morphologie}`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {(canAddMore || replaceMode !== null) ? (
                      generating ? (
                        <div style={{ background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px', padding: '1.5rem', textAlign: 'center' }}>
                          {pendingItem && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#fafaf8', borderRadius: '3px', textAlign: 'left' }}>
                              <img src={pendingItem.image} alt={pendingItem.nom_fr} style={{ width: '52px', height: '65px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.15rem' }}>{pendingItem.nom_fr}</div>
                                <div style={{ fontSize: '0.65rem', color: '#C9A96E', fontFamily: 'sans-serif' }}>{displayItemPrice(pendingItem.prix)}</div>
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
                        <>
                          <button style={pendingItem ? s.btnTry : s.btnTryDisabled} onClick={pendingItem ? handleGenerate : undefined} disabled={!pendingItem}>
                            {replaceMode !== null ? t.btnReplace : t.btnTry}<br />
                            <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{replaceMode !== null ? t.btnReplaceSub : t.btnTrySub}</span>
                          </button>
                          <div style={{ fontSize: '0.58rem', color: '#bbb', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.5 }}>
                            ℹ Aperçu IA — approximation visuelle. Couleurs et ajustements réels peuvent différer. · <em>AI preview — actual fit may vary.</em>
                          </div>
                        </>
                      )
                    ) : (
                      <div style={s.maxMsg}>
                        ✦ {t.maxReached}<br />
                        <span style={{ fontSize: '0.6rem', color: '#aaa' }}>{t.maxSub}</span>
                      </div>
                    )}
                    <AnimatePresence>
                      {error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} style={s.error}>⚠ {error}</motion.div>}
                    </AnimatePresence>
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
                      <AnimatePresence initial={false}>
                      {sidebarItems.map((item) => (
                        <motion.div key={item._stepIdx} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f0ece6' }}>
                          <img src={item.image} alt={item.nom_fr} style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 400, marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom_fr}</div>
                            <div style={{ fontSize: '0.62rem', color: '#aaa', fontFamily: 'sans-serif' }}>{t.etape} {item._stepIdx + 1}</div>
                            <div style={{ fontSize: '0.82rem', color: '#C9A96E' }}>{displayItemPrice(item.prix)}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                            <button style={{ background: 'none', border: '1px solid #C9A96E', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.7rem', color: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => { startReplace(item._stepIdx); setShowSidebar(false) }}>✎</button>
                            <button style={{ background: 'none', border: '1px solid #ddd', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.7rem', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => removeFromSidebar(item._stepIdx)}>✕</button>
                          </div>
                        </div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    )}
                  </div>
                  <div style={{ padding: '1rem 1.25rem 5rem 1.25rem', borderTop: '1px solid #e8e4df', flexShrink: 0, background: '#fff' }}>
                    {sidebarItems.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'sans-serif' }}>{t.totalLabel}</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 300 }}>{formatPrice(totalPrice)}</span>
                      </div>
                    )}
                    <a href="https://surmesur.com/fr-ca/prendre-rendez-vous/" target="_blank" rel="noopener noreferrer"
                      onClick={() => { if (sidebarItems.length > 0) sendEmail() }}
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
                {!showSidebar && !isGenerating && generations.length === 0 && tryMode !== 'outfits' && (
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

            {generations.length === 0 && !autoGenerating && tryMode !== 'outfits' && (
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
                <AnimatePresence initial={false}>
                {sidebarItems.map((item) => (
                  <motion.div key={item._stepIdx} layout initial={{ opacity: 0, height: 0, x: -12 }} animate={{ opacity: 1, height: 'auto', x: 0 }} exit={{ opacity: 0, height: 0, x: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
                  <div style={s.sideItem}>
                    <img src={item.image} alt={item.nom_fr} style={s.sideImg} />
                    <div style={s.sideInfo}>
                      <div style={s.sideName}>{item.nom_fr}</div>
                      <div style={s.sideCat}>{t.etape} {item._stepIdx + 1}</div>
                      <div style={s.sidePrice}>{displayItemPrice(item.prix)}</div>
                    </div>
                    <div style={s.sideActions}>
                      <button style={s.sideBtn('#C9A96E')} onClick={() => startReplace(item._stepIdx)}>✎</button>
                      <button style={s.sideBtn('#ddd')} onClick={() => removeFromSidebar(item._stepIdx)}>✕</button>
                    </div>
                  </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              )}
            </div>

            <div style={s.totalWrap}>
              {sidebarItems.length > 0 && (
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>{t.totalLabel}</span>
                  <span style={s.totalAmt}>{formatPrice(totalPrice)}</span>
                </div>
              )}
              <a href="https://surmesur.com/fr-ca/prendre-rendez-vous/" target="_blank" rel="noopener noreferrer" onClick={() => { if (sidebarItems.length > 0) sendEmail() }} style={s.btnAppt}>
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
        </motion.div>
      )}
      </AnimatePresence>
      </div>
    </div>
  )
}
