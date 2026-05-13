'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

const BASE_URL = 'https://surmesur-tryon.vercel.app'

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
      { id: 'j1', nom_fr: 'Blazer Lin Cobalt', image: `${BASE_URL}/jacket-1.png`, prix: '$645', desc: 'Premium Linen · Single Breasted' },
      { id: 'j2', nom_fr: 'Veston Tweed Brun', image: `${BASE_URL}/jacket-2.png`, prix: '$720', desc: 'British Tweed · Notch Lapel' },
      { id: 'j3', nom_fr: 'Blazer Navy Structuré', image: `${BASE_URL}/jacket-3.png`, prix: '$695', desc: 'Wool Blend · Double Breasted' },
      { id: 'j4', nom_fr: 'Veston Crème Été', image: `${BASE_URL}/jacket-4.png`, prix: '$610', desc: 'Cotton Linen · Relaxed Fit' },
    ]
  },
  coats: {
    label: 'Manteaux', label_en: 'Coats', icon: '🧣', categorie: 'tops',
    items: [
      { id: 'c1', nom_fr: 'Manteau Camel Premium', image: `${BASE_URL}/coat-1.png`, prix: '$1,200', desc: 'Cashmere Blend · Mid-Length' },
      { id: 'c2', nom_fr: 'Manteau Laine Tan', image: `${BASE_URL}/coat-2.png`, prix: '$1,350', desc: 'Pure Wool · Full Length' },
      { id: 'c3', nom_fr: 'Pardessus Noir Élégant', image: `${BASE_URL}/coat-3.png`, prix: '$1,280', desc: 'Wool Cashmere · Slim Fit' },
      { id: 'c4', nom_fr: 'Manteau Gris Anthracite', image: `${BASE_URL}/coat-4.png`, prix: '$1,180', desc: 'Wool Blend · Classic Cut' },
    ]
  },
  shirts: {
    label: 'Chemises', label_en: 'Shirts', icon: '👔', categorie: 'tops',
    items: [
      { id: 'sh1', nom_fr: 'Chemise Florale Bleue', image: `${BASE_URL}/shirt-1.png`, prix: '$350', desc: 'Linen · Sport Shirt' },
      { id: 'sh2', nom_fr: 'Chemise Blanche Classique', image: `${BASE_URL}/shirt-2.png`, prix: '$295', desc: 'Egyptian Cotton · French Cuff' },
      { id: 'sh3', nom_fr: 'Chemise Lin Beige', image: `${BASE_URL}/shirt-3.png`, prix: '$320', desc: 'Premium Linen · Relaxed' },
      { id: 'sh4', nom_fr: 'Chemise Carreaux Bleus', image: `${BASE_URL}/shirt-4.png`, prix: '$310', desc: 'Cotton · Slim Fit' },
    ]
  },
  pants: {
    label: 'Pantalons', label_en: 'Pants', icon: '👖', categorie: 'bottoms',
    items: [
      { id: 'p1', nom_fr: 'Jean Blanc Terio', image: `${BASE_URL}/jean-1.png`, prix: '$250', desc: 'Custom Fit · White' },
      { id: 'p2', nom_fr: 'Pantalon Gris Flanelle', image: `${BASE_URL}/jean-2.png`, prix: '$280', desc: 'Wool Flannel · Tailored' },
      { id: 'p3', nom_fr: 'Pantalon Navy Classique', image: `${BASE_URL}/jean-3.png`, prix: '$265', desc: 'Wool Blend · Slim' },
      { id: 'p4', nom_fr: 'Jean Indigo Premium', image: `${BASE_URL}/jean-4.png`, prix: '$235', desc: 'Selvedge Denim · Straight' },
    ]
  }
}

const BACKGROUNDS = [
  { id: 'studio', label: 'Studio', icon: '⬜', prompt: 'clean white studio background, professional photography' },
  { id: 'office', label: 'Bureau', icon: '🏢', prompt: 'modern luxury office environment, professional setting, glass windows' },
  { id: 'wedding', label: 'Mariage', icon: '💍', prompt: 'elegant wedding venue, garden with flowers, soft bokeh, romantic lighting' },
  { id: 'gala', label: 'Soirée', icon: '🥂', prompt: 'luxury restaurant interior, candlelight, upscale gala event, chandeliers' },
  { id: 'city', label: 'Ville', icon: '🏙️', prompt: 'walking in a beautiful city street, urban lifestyle, golden hour lighting' },
]

const MAX_GENERATIONS = 3

export default function SurmesurTryOn() {
  const [phase, setPhase] = useState('photo') // 'photo' | 'build'
  const [photoClient, setPhotoClient] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [activeTab, setActiveTab] = useState('suits')
  const [selectedBackground, setSelectedBackground] = useState('studio')
  const [generations, setGenerations] = useState([])
  const [sidebarItems, setSidebarItems] = useState([])
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [error, setError] = useState(null)
  const [activeResultIdx, setActiveResultIdx] = useState(0)
  const [replaceMode, setReplaceMode] = useState(null)
  const [pendingItem, setPendingItem] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [photoConfirmation, setPhotoConfirmation] = useState(null)

  const LOADING_MESSAGES = [
    { fr: 'Analyse de votre silhouette...', en: 'Analyzing your silhouette...' },
    { fr: 'Application du tissu sur mesure...', en: 'Applying the custom fabric...' },
    { fr: 'Ajustement des proportions...', en: 'Adjusting proportions...' },
    { fr: 'Calibration des couleurs...', en: 'Calibrating colors...' },
    { fr: 'Finalisation de votre look...', en: 'Finalizing your look...' },
    { fr: 'Dernières retouches en cours...', en: 'Last finishing touches...' },
  ]

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const resultRef = useRef(null)

  const totalPrice = sidebarItems.reduce((sum, it) => {
    return sum + parseFloat(it.prix.replace('$', '').replace(',', ''))
  }, 0)
  const formatPrice = (n) => '$' + n.toLocaleString('en-CA')

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

  // Select item in catalog
  const handleSelectItem = (item) => {
    setPendingItem(item)
    setError(null)
  }

  // Generate — normal or replace mode
  const handleGenerate = async () => {
    if (!pendingItem) { setError('Sélectionnez une pièce dans le catalogue'); return }
    if (!photoClient) return

    setGenerating(true); setError(null); setProgress(0); setLoadingMsg(0)
    const piv = setInterval(() => setProgress(p => p < 85 ? p + Math.random() * 2.5 : p), 800)
    const msgiv = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 4000)

    try {
      const bg = BACKGROUNDS.find(b => b.id === selectedBackground)
      // Base image: always original photo for first, or previous result for sequential
      let modelSource
      if (replaceMode !== null) {
        // Replace: use the result BEFORE this step as base
        const baseUrl = replaceMode === 0 ? null : generations[replaceMode - 1]?.resultUrl
        modelSource = baseUrl || null
      } else {
        // New generation: use last result as base, or original photo
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
      fd.append('background_prompt', bg?.prompt || '')
      fd.append('seed', Math.floor(Math.random() * 1000000).toString())

      const res = await fetch('/api/tryon', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')

      clearInterval(piv); setProgress(100)

      if (replaceMode !== null) {
        // Replace step
        setGenerations(prev => {
          const next = [...prev]
          next[replaceMode] = { item: pendingItem, resultUrl: data.output }
          return next
        })
        setSidebarItems(prev => {
          const next = [...prev]
          const idx = next.findIndex(it => it._stepIdx === replaceMode)
          if (idx >= 0) next[idx] = { ...pendingItem, _stepIdx: replaceMode }
          return next
        })
        setActiveResultIdx(replaceMode)
        setReplaceMode(null)
      } else {
        // New generation
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

  const removeFromSidebar = (stepIdx) => {
    setSidebarItems(prev => prev.filter(it => it._stepIdx !== stepIdx))
  }

  const startReplace = (stepIdx) => {
    setReplaceMode(stepIdx)
    setPendingItem(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelReplace = () => { setReplaceMode(null); setPendingItem(null) }

  const reset = () => {
    setPhase('photo'); setPhotoClient(null); setPhotoPreview(null)
    setGenerations([]); setSidebarItems([]); setPendingItem(null)
    setReplaceMode(null); setActiveResultIdx(0); setError(null); setProgress(0)
    stopCamera()
  }

  const canAddMore = generations.length < MAX_GENERATIONS
  const currentResult = generations[activeResultIdx]?.resultUrl

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const s = {
    page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1a1a' },
    header: { background: '#000', padding: '1.1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
    logo: { color: '#fff', fontSize: '1rem', letterSpacing: '0.35em', fontWeight: 300 },
    goldLine: { width: '50px', height: '1px', background: 'linear-gradient(90deg,transparent,#C9A96E,transparent)' },

    // Photo phase
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

    // Build phase layout
    buildWrap: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
    mainCol: { flex: 1, minWidth: 0, padding: '1.5rem' },
    sideCol: { width: '290px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #e8e4df', padding: '1.25rem', display: 'flex', flexDirection: 'column' },

    // Result section
    resultSection: { marginBottom: '2rem' },
    resultLabel: { fontSize: '0.62rem', letterSpacing: '0.18em', color: '#C9A96E', fontFamily: 'sans-serif', marginBottom: '0.75rem' },
    resultImg: { width: '100%', maxHeight: '520px', objectFit: 'contain', borderRadius: '4px', background: '#f5f5f3', display: 'block' },
    thumbRow: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' },
    thumb: (active) => ({ border: active ? '2px solid #C9A96E' : '1px solid #e0dbd4', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer', position: 'relative', width: '72px', flexShrink: 0 }),
    thumbImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' },
    thumbLabel: { fontSize: '0.55rem', fontFamily: 'sans-serif', color: '#888', padding: '0.2rem 0.3rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    thumbEdit: { position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // Replace mode banner
    replaceBanner: { background: '#fff8ee', border: '1px solid #C9A96E', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.72rem', fontFamily: 'sans-serif', color: '#7a5c1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },

    // Catalog section
    catalogLabel: { fontSize: '0.62rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.75rem' },
    tabs: { display: 'flex', borderBottom: '1px solid #e8e4df', marginBottom: '1.25rem', overflowX: 'auto' },
    tab: (a) => ({ padding: '0.6rem 0.9rem', background: 'none', border: 'none', borderBottom: a ? '2px solid #C9A96E' : '2px solid transparent', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.07em', fontFamily: 'sans-serif', color: a ? '#C9A96E' : '#888', whiteSpace: 'nowrap' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.85rem', marginBottom: '1.5rem' },
    card: (sel) => ({ border: sel ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: sel ? '#fffef8' : '#fff', position: 'relative', transition: 'border-color 0.15s' }),
    cardImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' },
    cardInfo: { padding: '0.5rem' },
    cardName: { fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.15rem', lineHeight: 1.2 },
    cardDesc: { fontSize: '0.58rem', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '0.25rem' },
    cardPrice: { fontSize: '0.8rem', color: '#C9A96E' },
    checkBadge: { position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff' },

    // Background
    bgSection: { marginTop: '1.5rem' },
    bgLabel: { fontSize: '0.62rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.3rem' },
    bgSub: { fontSize: '0.58rem', color: '#C9A96E', fontFamily: 'sans-serif', fontStyle: 'italic', marginBottom: '0.6rem' },
    bgGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.35rem' },
    bgCard: (a) => ({ border: a ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '3px', padding: '0.4rem 0.2rem', textAlign: 'center', cursor: 'pointer', background: a ? '#fffef8' : '#fff' }),
    bgIcon: { fontSize: '1rem', display: 'block', marginBottom: '0.1rem' },
    bgName: { fontSize: '0.55rem', fontFamily: 'sans-serif', color: '#555' },

    // Try button
    trySection: { marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e8e4df' },
    tryPreview: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.6rem', background: '#f9f7f4', borderRadius: '4px' },
    tryPreviewImg: { width: '40px', height: '50px', objectFit: 'cover', borderRadius: '2px' },
    tryPreviewName: { fontSize: '0.8rem', fontWeight: 400 },
    tryPreviewPrice: { fontSize: '0.75rem', color: '#C9A96E' },
    btnTry: { width: '100%', padding: '1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.7 },
    btnTryDisabled: { width: '100%', padding: '1rem', background: '#e0dbd4', color: '#aaa', border: 'none', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center' },
    maxMsg: { textAlign: 'center', fontSize: '0.68rem', fontFamily: 'sans-serif', color: '#C9A96E', padding: '0.75rem', border: '1px solid #e8d8b8', borderRadius: '4px', background: '#fffbf2', marginTop: '1rem' },
    progWrap: { height: '2px', background: '#e8e4df', marginTop: '0.6rem' },
    progBar: (p) => ({ height: '100%', background: 'linear-gradient(90deg,#C9A96E,#e8c87a)', width: `${p}%`, transition: 'width 0.5s ease' }),
    progLabel: { fontSize: '0.6rem', color: '#aaa', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '0.3rem' },

    // Sidebar
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
  }

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>SURMESUR</div>
        <div style={s.goldLine} />
      </header>

      {/* ── PHASE PHOTO ── */}
      {phase === 'photo' && (
        <>
          <div style={s.hero}>
            <div style={s.eyebrow}>TECHNOLOGIE VIRTUELLE · VIRTUAL TRY-ON</div>
            <h1 style={s.title}>Essayez nos <span style={s.gold}>collections</span><br />dans le confort de votre foyer</h1>
            <p style={s.sub}>Try our collections from the comfort of your home</p>
            <div style={s.stats}>
              <div><div style={s.statN}>3</div><div style={s.statL}>LOOKS MAX</div></div>
              <div><div style={s.statN}>22+</div><div style={s.statL}>PIÈCES</div></div>
              <div><div style={s.statN}>100%</div><div style={s.statL}>SUR MESURE</div></div>
            </div>
          </div>

          <div style={s.photoWrap}>
            <div style={s.stepNum}>01</div>
            <div style={s.stepTitle}>Votre photo</div>
            <div style={s.stepSub}>Debout, corps entier · Stand tall, full body</div>

            {!cameraActive && !photoConfirmation && (
              <>
                <div style={s.uploadZone} onClick={() => fileInputRef.current?.click()}>
                  <div style={s.uploadIcon}>✦</div>
                  <div style={s.uploadTxt}>Cliquez pour uploader votre photo</div>
                  <div style={s.uploadSub}>JPG, PNG · Max 10MB</div>
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnBlack} onClick={startCamera}>📷 PRENDRE UNE PHOTO</button>
                  <button style={s.btnOutline} onClick={() => fileInputRef.current?.click()}>🖼 MA GALERIE</button>
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
                <button style={{...s.btnGhost, width: '100%', marginTop: '0.5rem'}} onClick={stopCamera}>ANNULER</button>
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
          <div style={s.mainCol}>

            {/* Photo thumb */}
            <div style={s.photoThumbRow}>
              {photoPreview && <img src={photoPreview} alt="Votre photo" style={s.photoThumb} />}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 300, marginBottom: '0.3rem' }}>Photo chargée ✓</div>
                <button style={s.changeBtn} onClick={() => { stopCamera(); setPhase('photo'); setPhotoClient(null); setPhotoPreview(null); setGenerations([]); setSidebarItems([]); setPendingItem(null) }}>
                  Changer la photo
                </button>
                {photoPreview && (
                  <a
                    href={photoPreview}
                    download="ma-photo-surmesur.jpg"
                    style={{ ...s.changeBtn, marginLeft: '0.75rem', color: '#C9A96E' }}
                  >
                    ⬇ Sauvegarder ma photo
                  </a>
                )}
              </div>
            </div>

            {/* Results section */}
            {generations.length > 0 && (
              <div style={s.resultSection} ref={resultRef}>
                <div style={s.resultLabel}>VOTRE LOOK ACTUEL · YOUR CURRENT LOOK</div>
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
                        } catch {
                          window.open(currentResult, '_blank')
                        }
                      }}
                      style={{ display: 'inline-block', marginTop: '0.6rem', fontSize: '0.68rem', color: '#C9A96E', fontFamily: 'sans-serif', letterSpacing: '0.1em', background: 'none', border: '1px solid #C9A96E', padding: '0.4rem 0.85rem', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      ⬇ TÉLÉCHARGER CE LOOK · DOWNLOAD
                    </button>
                  </>
                )}
                {/* Thumbnail history */}
                <div style={s.thumbRow}>
                  {generations.map((gen, i) => (
                    <div key={i} style={s.thumb(i === activeResultIdx)} onClick={() => setActiveResultIdx(i)}>
                      <img src={gen.resultUrl} alt={gen.item.nom_fr} style={s.thumbImg} />
                      <div style={s.thumbLabel}>{gen.item.nom_fr}</div>
                      <button style={s.thumbEdit} onClick={(e) => { e.stopPropagation(); startReplace(i) }} title="Modifier cette pièce">✎</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replace mode banner */}
            {replaceMode !== null && (
              <div style={s.replaceBanner}>
                <span>✎ Mode remplacement — Étape {replaceMode + 1} : <strong>{generations[replaceMode]?.item.nom_fr}</strong></span>
                <button onClick={cancelReplace} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a5c1e', fontFamily: 'sans-serif', fontSize: '0.68rem', textDecoration: 'underline' }}>Annuler</button>
              </div>
            )}

            {/* Catalog */}
            <div style={s.stepNum}>0{generations.length === 0 ? '2' : generations.length + 1}</div>
            <div style={s.stepTitle}>{replaceMode !== null ? 'Choisissez la pièce de remplacement' : generations.length === 0 ? 'Choisissez votre première pièce' : 'Ajouter une pièce'}</div>
            <div style={s.stepSub}>
              {replaceMode !== null
                ? `Remplacer : ${generations[replaceMode]?.item.nom_fr}`
                : `${generations.length}/${MAX_GENERATIONS} générations · Sélectionnez une pièce puis cliquez "Essayer"`}
            </div>

            <div style={s.catalogLabel}>CATALOGUE · {CATALOGUE[activeTab].label.toUpperCase()}</div>
            <div style={s.tabs}>
              {Object.entries(CATALOGUE).map(([key, cat]) => (
                <button key={key} style={s.tab(activeTab === key)} onClick={() => setActiveTab(key)}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <div style={s.grid}>
              {CATALOGUE[activeTab].items.map(item => {
                const isSel = pendingItem?.id === item.id
                return (
                  <div key={item.id} style={s.card(isSel)} onClick={() => handleSelectItem(item)}>
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

            {/* Try button */}
            <div style={s.trySection}>
              {pendingItem && (
                <div style={s.tryPreview}>
                  <img src={pendingItem.image} alt={pendingItem.nom_fr} style={s.tryPreviewImg} />
                  <div>
                    <div style={s.tryPreviewName}>{pendingItem.nom_fr}</div>
                    <div style={s.tryPreviewPrice}>{pendingItem.prix}</div>
                  </div>
                </div>
              )}

              {(canAddMore || replaceMode !== null) ? (
                generating ? (
                  <div style={{ background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px', padding: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>
                    {/* Vêtement en cours */}
                    {pendingItem && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#fafaf8', borderRadius: '3px', textAlign: 'left' }}>
                        <img src={pendingItem.image} alt={pendingItem.nom_fr} style={{ width: '52px', height: '65px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.15rem' }}>{pendingItem.nom_fr}</div>
                          <div style={{ fontSize: '0.65rem', color: '#C9A96E', fontFamily: 'sans-serif' }}>{pendingItem.prix}</div>
                        </div>
                      </div>
                    )}
                    {/* Animation shimmer */}
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '50%', border: '2px solid #e8e4df', borderTop: '2px solid #C9A96E', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    {/* Message changeant */}
                    <div style={{ fontSize: '0.85rem', fontWeight: 300, color: '#1a1a1a', marginBottom: '0.25rem' }}>
                      {LOADING_MESSAGES[loadingMsg].fr}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '1rem' }}>
                      {LOADING_MESSAGES[loadingMsg].en}
                    </div>
                    {/* Barre de progression */}
                    <div style={s.progWrap}><div style={s.progBar(progress)} /></div>
                    <div style={{ fontSize: '0.6rem', color: '#C9A96E', fontFamily: 'sans-serif', marginTop: '0.4rem' }}>
                      {Math.round(progress)}% · L'IA Surmesur travaille pour vous
                    </div>
                  </div>
                ) : (
                  <button style={pendingItem ? s.btnTry : s.btnTryDisabled} onClick={pendingItem ? handleGenerate : undefined} disabled={!pendingItem}>
                    {replaceMode !== null ? 'REMPLACER CETTE PIÈCE' : 'ESSAYER CETTE PIÈCE'}<br />
                    <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{replaceMode !== null ? 'REPLACE THIS PIECE' : 'TRY THIS PIECE'}</span>
                  </button>
                )
              ) : (
                <div style={s.maxMsg}>
                  ✦ Maximum {MAX_GENERATIONS} looks atteint<br />
                  <span style={{ fontSize: '0.6rem', color: '#aaa' }}>Modifiez un look existant ou prenez rendez-vous</span>
                </div>
              )}

              {error && <div style={s.error}>⚠ {error}</div>}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Sidebar */}
          <div style={s.sideCol}>
            <div style={s.sideTitle}>VOTRE SÉLECTION · YOUR OUTFIT</div>

            <div style={s.sideList}>
              {sidebarItems.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>✦</div>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>Sélectionnez et essayez<br />vos pièces dans le catalogue</div>
                </div>
              ) : (
                sidebarItems.map((item) => (
                  <div key={item._stepIdx} style={s.sideItem}>
                    <img src={item.image} alt={item.nom_fr} style={s.sideImg} />
                    <div style={s.sideInfo}>
                      <div style={s.sideName}>{item.nom_fr}</div>
                      <div style={s.sideCat}>Étape {item._stepIdx + 1}</div>
                      <div style={s.sidePrice}>{item.prix}</div>
                    </div>
                    <div style={s.sideActions}>
                      <button style={s.sideBtn('#C9A96E')} onClick={() => startReplace(item._stepIdx)} title="Modifier cette pièce">✎</button>
                      <button style={s.sideBtn('#ddd')} onClick={() => removeFromSidebar(item._stepIdx)} title="Retirer cette pièce">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={s.totalWrap}>
              {sidebarItems.length > 0 && (
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>TOTAL ESTIMÉ</span>
                  <span style={s.totalAmt}>{formatPrice(totalPrice)}</span>
                </div>
              )}
              <a href="https://www.surmesur.com" target="_blank" rel="noopener noreferrer" style={s.btnAppt}>
                PRENDRE MON RENDEZ-VOUS<br />
                <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>BOOK MY FREE APPOINTMENT</span>
              </a>

              {sidebarItems.length > 0 && (
                <button
                  style={{ width: '100%', padding: '0.9rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.15em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.7, marginTop: '0.5rem', boxSizing: 'border-box' }}
                  onClick={() => {
                    const VENDOR_EMAIL = 'vendeur@surmesur.com' // ← changer cet email
                    const itemsList = sidebarItems.map(it =>
                      `• ${it.nom_fr} — ${it.prix}\n  Photo: ${it.image}`
                    ).join('\n\n')
                    const total = formatPrice(totalPrice)
                    const subject = encodeURIComponent('Sélection client Surmesur Try-On')
                    const body = encodeURIComponent(
                      `Bonjour,\n\nUn client a effectué une sélection via l'application Surmesur Try-On.\n\nSÉLECTION DU CLIENT :\n\n${itemsList}\n\nTOTAL ESTIMÉ : ${total}\n\nMerci de préparer ce dossier pour le rendez-vous.\n\nCordialement,\nSurmesur Try-On`
                    )
                    window.location.href = `mailto:${VENDOR_EMAIL}?subject=${subject}&body=${body}`
                  }}
                >
                  ✉ ENVOYER AU VENDEUR<br />
                  <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>SEND TO STYLIST</span>
                </button>
              )}
              <button style={s.btnRestart} onClick={reset}>↺ RECOMMENCER · START OVER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
