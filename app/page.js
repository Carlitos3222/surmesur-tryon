'use client'
import { useState, useRef, useCallback } from 'react'

const BASE_URL = 'https://surmesur-tryon.vercel.app'

const CATALOGUE = {
  suits: {
    label: 'Complets', label_en: 'Suits', icon: '🤵', categorie: 'one-pieces',
    items: [
      { id: 's1', nom_fr: 'Complet Bleu Pétrole', nom_en: 'Oil Blue Wool Suit', image: `${BASE_URL}/suit1.png`, prix: '$1,100', desc: '3-Piece · Wool' },
      { id: 's2', nom_fr: 'Complet Charbon', nom_en: 'Charcoal 3-Piece', image: `${BASE_URL}/suit2.png`, prix: '$1,150', desc: '3-Piece · Premium Wool' },
      { id: 's3', nom_fr: 'Complet Prince de Galles', nom_en: 'Black Ice Flannel Suit', image: `${BASE_URL}/suit3.png`, prix: '$1,200', desc: '3-Piece · Flannel' },
      { id: 's4', nom_fr: 'Complet Gris Chevron', nom_en: 'Grey Herringbone Suit', image: `${BASE_URL}/suit4.png`, prix: '$1,180', desc: '3-Piece · Herringbone' },
      { id: 's5', nom_fr: 'Complet Lin Naturel', nom_en: 'Natural Linen Suit', image: `${BASE_URL}/suit5.png`, prix: '$980', desc: '3-Piece · Linen' },
      { id: 's6', nom_fr: 'Complet Brun Foncé', nom_en: 'Dark Brown Flannel Suit', image: `${BASE_URL}/suit6.png`, prix: '$1,150', desc: '3-Piece · Wool Flannel' },
    ]
  },
  jackets: {
    label: 'Vestons', label_en: 'Jackets', icon: '🧥', categorie: 'tops',
    items: [
      { id: 'j1', nom_fr: 'Blazer Lin Cobalt', nom_en: 'Cobalt Linen Blazer', image: `${BASE_URL}/jacket-1.png`, prix: '$645', desc: 'Premium Linen · Single Breasted' },
      { id: 'j2', nom_fr: 'Veston Tweed Brun', nom_en: 'Brown Tweed Jacket', image: `${BASE_URL}/jacket-2.png`, prix: '$720', desc: 'British Tweed · Notch Lapel' },
      { id: 'j3', nom_fr: 'Blazer Navy Structuré', nom_en: 'Structured Navy Blazer', image: `${BASE_URL}/jacket-3.png`, prix: '$695', desc: 'Wool Blend · Double Breasted' },
      { id: 'j4', nom_fr: 'Veston Crème Été', nom_en: 'Cream Summer Blazer', image: `${BASE_URL}/jacket-4.png`, prix: '$610', desc: 'Cotton Linen · Relaxed Fit' },
    ]
  },
  coats: {
    label: 'Manteaux', label_en: 'Coats', icon: '🧣', categorie: 'tops',
    items: [
      { id: 'c1', nom_fr: 'Manteau Camel Premium', nom_en: 'Premium Camel Overcoat', image: `${BASE_URL}/coat-1.png`, prix: '$1,200', desc: 'Cashmere Blend · Mid-Length' },
      { id: 'c2', nom_fr: 'Manteau Laine Tan', nom_en: 'Tan Wool Greatcoat', image: `${BASE_URL}/coat-2.png`, prix: '$1,350', desc: 'Pure Wool · Full Length' },
      { id: 'c3', nom_fr: 'Pardessus Noir Élégant', nom_en: 'Elegant Black Overcoat', image: `${BASE_URL}/coat-3.png`, prix: '$1,280', desc: 'Wool Cashmere · Slim Fit' },
      { id: 'c4', nom_fr: 'Manteau Gris Anthracite', nom_en: 'Anthracite Grey Coat', image: `${BASE_URL}/coat-4.png`, prix: '$1,180', desc: 'Wool Blend · Classic Cut' },
    ]
  },
  shirts: {
    label: 'Chemises', label_en: 'Shirts', icon: '👔', categorie: 'tops',
    items: [
      { id: 'sh1', nom_fr: 'Chemise Florale Bleue', nom_en: 'Blue Floral Shirt', image: `${BASE_URL}/shirt-1.png`, prix: '$350', desc: 'Linen · Sport Shirt' },
      { id: 'sh2', nom_fr: 'Chemise Blanche Classique', nom_en: 'Classic White Dress Shirt', image: `${BASE_URL}/shirt-2.png`, prix: '$295', desc: 'Egyptian Cotton · French Cuff' },
      { id: 'sh3', nom_fr: 'Chemise Lin Beige', nom_en: 'Beige Linen Shirt', image: `${BASE_URL}/shirt-3.png`, prix: '$320', desc: 'Premium Linen · Relaxed' },
      { id: 'sh4', nom_fr: 'Chemise Carreaux Bleus', nom_en: 'Blue Plaid Shirt', image: `${BASE_URL}/shirt-4.png`, prix: '$310', desc: 'Cotton · Slim Fit' },
    ]
  },
  jeans: {
    label: 'Pantalons', label_en: 'Pants', icon: '👖', categorie: 'bottoms',
    items: [
      { id: 'jn1', nom_fr: 'Jean Blanc Terio', nom_en: 'White Terio Jean', image: `${BASE_URL}/jean-1.png`, prix: '$250', desc: 'Custom Fit · White' },
      { id: 'jn2', nom_fr: 'Pantalon Gris Flanelle', nom_en: 'Grey Flannel Trouser', image: `${BASE_URL}/jean-2.png`, prix: '$280', desc: 'Wool Flannel · Tailored' },
      { id: 'jn3', nom_fr: 'Pantalon Navy Classique', nom_en: 'Classic Navy Trouser', image: `${BASE_URL}/jean-3.png`, prix: '$265', desc: 'Wool Blend · Slim' },
      { id: 'jn4', nom_fr: 'Jean Indigo Premium', nom_en: 'Premium Indigo Jean', image: `${BASE_URL}/jean-4.png`, prix: '$235', desc: 'Selvedge Denim · Straight' },
    ]
  }
}

const BACKGROUNDS = [
  { id: 'studio', label: 'Studio', icon: '⬜', prompt: 'clean white studio background, professional photography' },
  { id: 'office', label: 'Bureau', icon: '🏢', prompt: 'modern luxury office environment, professional setting, glass windows, city view' },
  { id: 'wedding', label: 'Mariage', icon: '💍', prompt: 'elegant wedding venue, garden with flowers, soft bokeh, romantic lighting' },
  { id: 'gala', label: 'Soirée', icon: '🥂', prompt: 'luxury restaurant interior, candlelight, upscale gala event, chandeliers' },
  { id: 'city', label: 'Ville', icon: '🏙️', prompt: 'walking in a beautiful city street, urban lifestyle, golden hour lighting' },
]

const PRIORITY_ORDER = ['suits', 'jackets', 'coats', 'shirts', 'jeans']

export default function SurmesurTryOn() {
  const [step, setStep] = useState(1)
  const [photoClient, setPhotoClient] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedItems, setSelectedItems] = useState({})
  const [selectedBackground, setSelectedBackground] = useState('studio')
  const [activeTab, setActiveTab] = useState('suits')
  const [generating, setGenerating] = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [error, setError] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [photoConfirmation, setPhotoConfirmation] = useState(null)
  const [progress, setProgress] = useState(0)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      setPhotoConfirmation(null)
    } catch {
      setError('Caméra non disponible — utilisez le bouton galerie')
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          const video = videoRef.current
          const canvas = canvasRef.current
          if (!video || !canvas) return null
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
          setPhotoConfirmation(dataUrl)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const confirmPhoto = () => {
    if (!photoConfirmation || !canvasRef.current) return
    canvasRef.current.toBlob(blob => {
      setPhotoClient(blob)
      setPhotoPreview(photoConfirmation)
      stopCamera()
      setPhotoConfirmation(null)
      setStep(2)
    }, 'image/jpeg', 0.9)
  }

  const retakePhoto = () => {
    setPhotoConfirmation(null)
    startCamera()
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoClient(file)
    setPhotoPreview(URL.createObjectURL(file))
    stopCamera()
    setStep(2)
  }

  const toggleItem = (category, item) => {
    setSelectedItems(prev => {
      if (prev[category]?.id === item.id) {
        const next = { ...prev }
        delete next[category]
        return next
      }
      return { ...prev, [category]: item }
    })
  }

  const removeItem = (category) => {
    setSelectedItems(prev => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }

  const getMainGarment = () => {
    for (const cat of PRIORITY_ORDER) {
      if (selectedItems[cat]) return { item: selectedItems[cat], cat }
    }
    return null
  }

  const totalPrice = Object.values(selectedItems).reduce((sum, item) => {
    const price = parseFloat(item.prix.replace('$', '').replace(',', ''))
    return sum + price
  }, 0)

  const formatPrice = (n) => '$' + n.toLocaleString('en-CA')

  const handleGenerate = async () => {
    const main = getMainGarment()
    if (!main) { setError('Sélectionnez au moins une pièce'); return }
    if (!photoClient) { setError('Uploadez votre photo'); return }

    setGenerating(true)
    setError(null)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress(prev => prev < 85 ? prev + Math.random() * 2.5 : prev)
    }, 800)

    try {
      const bg = BACKGROUNDS.find(b => b.id === selectedBackground)
      const formData = new FormData()
      formData.append('model_image', photoClient)
      formData.append('garment_url', main.item.image)
      formData.append('background_prompt', bg?.prompt || '')
      formData.append('seed', Math.floor(Math.random() * 1000000).toString())

      const res = await fetch('/api/tryon', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erreur API')

      clearInterval(progressInterval)
      setProgress(100)
      setResultImage(data.output)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      clearInterval(progressInterval)
      setGenerating(false)
    }
  }

  const reset = () => {
    setStep(1)
    setPhotoClient(null)
    setPhotoPreview(null)
    setSelectedItems({})
    setSelectedBackground('studio')
    setResultImage(null)
    setError(null)
    setProgress(0)
    stopCamera()
  }

  const selectedCount = Object.keys(selectedItems).length
  const mainGarment = getMainGarment()

  const s = {
    page: { minHeight: '100vh', background: '#fafaf8', fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: '#1a1a1a' },
    header: { background: '#000', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.3rem' },
    logo: { color: '#fff', fontSize: '1.1rem', letterSpacing: '0.35em', fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", textAlign: 'center' },
    goldLine: { width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' },
    hero: { textAlign: 'center', padding: '3rem 2rem 2rem', background: '#fff', borderBottom: '1px solid #e8e4df' },
    heroEyebrow: { fontSize: '0.7rem', letterSpacing: '0.25em', color: '#C9A96E', marginBottom: '1rem', fontFamily: 'sans-serif', fontWeight: 500 },
    heroTitle: { fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.2, marginBottom: '0.8rem', color: '#1a1a1a' },
    heroGold: { color: '#C9A96E', fontStyle: 'italic' },
    heroSub: { fontSize: '0.85rem', color: '#888', letterSpacing: '0.05em', fontFamily: 'sans-serif', marginBottom: '1.5rem' },
    stats: { display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' },
    stat: { textAlign: 'center' },
    statNum: { fontSize: '1.4rem', fontWeight: 300, color: '#C9A96E' },
    statLabel: { fontSize: '0.65rem', letterSpacing: '0.15em', color: '#888', fontFamily: 'sans-serif' },
    stepWrap: { display: 'flex', gap: '0', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 200px)' },
    mainCol: { flex: 1, padding: '2rem', minWidth: 0 },
    sideCol: { width: '300px', minWidth: '280px', background: '#fff', borderLeft: '1px solid #e8e4df', padding: '1.5rem', display: 'flex', flexDirection: 'column' },
    sectionTitle: { fontSize: '0.65rem', letterSpacing: '0.2em', color: '#C9A96E', marginBottom: '0.75rem', fontFamily: 'sans-serif', fontWeight: 600 },
    stepNum: { fontSize: '3rem', fontWeight: 300, color: '#e8e4df', lineHeight: 1, marginBottom: '0.25rem' },
    stepTitle: { fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.3rem' },
    stepSub: { fontSize: '0.75rem', color: '#888', fontFamily: 'sans-serif', marginBottom: '1.5rem' },
    uploadZone: { border: '1px dashed #d0cbc4', borderRadius: '4px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', background: '#fafaf8' },
    uploadIcon: { fontSize: '2rem', marginBottom: '0.75rem', color: '#C9A96E' },
    uploadText: { fontSize: '1rem', fontWeight: 300, color: '#333', marginBottom: '0.25rem' },
    uploadSub: { fontSize: '0.7rem', color: '#aaa', fontFamily: 'sans-serif' },
    btnRow: { display: 'flex', gap: '0.75rem', marginTop: '1rem' },
    btnCamera: { flex: 1, padding: '0.9rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' },
    btnGallery: { flex: 1, padding: '0.9rem', background: 'transparent', color: '#000', border: '1px solid #000', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' },
    cameraWrap: { position: 'relative', background: '#000', borderRadius: '4px', overflow: 'hidden', aspectRatio: '4/3' },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    cameraHint: { textAlign: 'center', fontSize: '0.72rem', color: '#C9A96E', fontFamily: 'sans-serif', padding: '0.5rem', fontStyle: 'italic' },
    btnCapture: { display: 'flex', margin: '1rem auto', width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #C9A96E', background: 'transparent', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' },
    btnCaptureInner: { width: '44px', height: '44px', borderRadius: '50%', background: '#C9A96E' },
    confirmImg: { width: '100%', borderRadius: '4px' },
    confirmBtns: { display: 'flex', gap: '0.75rem', marginTop: '0.75rem' },
    btnConfirm: { flex: 1, padding: '0.9rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' },
    btnRetake: { flex: 1, padding: '0.9rem', background: 'transparent', color: '#000', border: '1px solid #ccc', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'sans-serif' },
    photoThumb: { width: '70px', height: '90px', objectFit: 'cover', borderRadius: '2px', border: '2px solid #C9A96E', flexShrink: 0 },
    photoThumbWrap: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '0.75rem', background: '#fff', border: '1px solid #e8e4df', borderRadius: '4px' },
    changePhotoBtn: { fontSize: '0.7rem', color: '#C9A96E', fontFamily: 'sans-serif', cursor: 'pointer', letterSpacing: '0.1em', background: 'none', border: 'none', textDecoration: 'underline', padding: 0 },
    tabs: { display: 'flex', borderBottom: '1px solid #e8e4df', marginBottom: '1.5rem', overflowX: 'auto' },
    tab: (active) => ({ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: active ? '2px solid #C9A96E' : '2px solid transparent', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.08em', fontFamily: 'sans-serif', color: active ? '#C9A96E' : '#888', whiteSpace: 'nowrap', transition: 'all 0.2s' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' },
    itemCard: (selected) => ({ border: selected ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: selected ? '#fffef8' : '#fff', transition: 'all 0.2s', position: 'relative' }),
    itemImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' },
    itemInfo: { padding: '0.6rem' },
    itemName: { fontSize: '0.78rem', fontWeight: 400, marginBottom: '0.2rem', lineHeight: 1.2 },
    itemDesc: { fontSize: '0.62rem', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.3rem' },
    itemPrice: { fontSize: '0.85rem', color: '#C9A96E' },
    checkBadge: { position: 'absolute', top: '8px', right: '8px', width: '22px', height: '22px', borderRadius: '50%', background: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' },
    mainBadge: { fontSize: '0.5rem', background: '#C9A96E', color: '#fff', padding: '0.1rem 0.3rem', letterSpacing: '0.08em', fontFamily: 'sans-serif', borderRadius: '2px', marginLeft: '0.3rem', verticalAlign: 'middle' },
    bgSection: { marginTop: '2rem' },
    bgGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' },
    bgCard: (active) => ({ border: active ? '2px solid #C9A96E' : '1px solid #e8e4df', borderRadius: '4px', padding: '0.5rem 0.25rem', textAlign: 'center', cursor: 'pointer', background: active ? '#fffef8' : '#fff', transition: 'all 0.2s' }),
    bgIcon: { fontSize: '1.1rem', display: 'block', marginBottom: '0.15rem' },
    bgLabel: { fontSize: '0.58rem', fontFamily: 'sans-serif', color: '#333' },
    sideTitle: { fontSize: '0.62rem', letterSpacing: '0.18em', color: '#888', fontFamily: 'sans-serif', fontWeight: 600, borderBottom: '1px solid #e8e4df', paddingBottom: '0.75rem', marginBottom: '1rem' },
    selectedList: { flex: 1, overflowY: 'auto', maxHeight: '380px' },
    selectedItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', borderBottom: '1px solid #f0ece6' },
    selectedImg: { width: '42px', height: '52px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 },
    selectedInfo: { flex: 1, minWidth: 0 },
    selectedName: { fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    selectedCat: { fontSize: '0.6rem', color: '#888', fontFamily: 'sans-serif' },
    selectedPrice: { fontSize: '0.8rem', color: '#C9A96E' },
    removeBtn: { background: 'none', border: '1px solid #e0dbd4', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.6rem', color: '#aaa', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    emptyState: { textAlign: 'center', padding: '2rem 1rem', color: '#ccc' },
    emptyText: { fontSize: '0.72rem', fontFamily: 'sans-serif', lineHeight: 1.6 },
    totalWrap: { borderTop: '1px solid #e8e4df', paddingTop: '1rem', marginTop: 'auto' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' },
    totalLabel: { fontSize: '0.62rem', letterSpacing: '0.15em', color: '#888', fontFamily: 'sans-serif' },
    totalPrice: { fontSize: '1.3rem', fontWeight: 300, color: '#1a1a1a' },
    btnGenerate: { width: '100%', padding: '1.1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.8 },
    btnGenerateDisabled: { width: '100%', padding: '1.1rem', background: '#e0dbd4', color: '#aaa', border: 'none', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center' },
    progressWrap: { width: '100%', height: '2px', background: '#e8e4df', marginTop: '0.75rem' },
    progressBar: (pct) => ({ height: '100%', background: 'linear-gradient(90deg, #C9A96E, #e8c87a)', width: `${pct}%`, transition: 'width 0.6s ease' }),
    progressLabel: { fontSize: '0.62rem', color: '#888', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '0.4rem' },
    resultWrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
    resultGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start', marginTop: '1.5rem' },
    resultImg: { width: '100%', borderRadius: '4px', display: 'block' },
    btnAppt: { display: 'block', width: '100%', padding: '1.1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.18em', fontFamily: 'sans-serif', textAlign: 'center', textDecoration: 'none', lineHeight: 1.8, marginTop: '1rem', boxSizing: 'border-box' },
    btnSecondary: { display: 'block', width: '100%', padding: '0.8rem', background: 'transparent', color: '#888', border: '1px solid #e8e4df', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.12em', fontFamily: 'sans-serif', marginTop: '0.5rem', textAlign: 'center' },
    error: { background: '#fff5f5', border: '1px solid #ffd0d0', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.72rem', color: '#c00', fontFamily: 'sans-serif', marginTop: '1rem' },
  }

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>SURMESUR</div>
        <div style={s.goldLine} />
      </header>

      {/* Hero — Step 1 only */}
      {step === 1 && (
        <div style={s.hero}>
          <div style={s.heroEyebrow}>TECHNOLOGIE VIRTUELLE · VIRTUAL TRY-ON</div>
          <h1 style={s.heroTitle}>
            Essayez nos <span style={s.heroGold}>collections</span><br />
            sans sortir de la maison
          </h1>
          <p style={s.heroSub}>Try our collections without leaving home</p>
          <div style={s.stats}>
            <div style={s.stat}><div style={s.statNum}>1</div><div style={s.statLabel}>SEULE GÉNÉRATION</div></div>
            <div style={s.stat}><div style={s.statNum}>22+</div><div style={s.statLabel}>PIÈCES DISPONIBLES</div></div>
            <div style={s.stat}><div style={s.statNum}>100%</div><div style={s.statLabel}>SUR MESURE</div></div>
          </div>
        </div>
      )}

      {/* STEP 1 — Photo */}
      {step === 1 && (
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem' }}>
          <div style={s.stepNum}>01</div>
          <div style={s.stepTitle}>Votre photo</div>
          <div style={s.stepSub}>Prenez une photo debout, corps entier · Stand tall, full body</div>

          {!cameraActive && !photoConfirmation && (
            <>
              <div style={s.uploadZone} onClick={() => fileInputRef.current?.click()}>
                <div style={s.uploadIcon}>✦</div>
                <div style={s.uploadText}>Cliquez pour uploader votre photo</div>
                <div style={s.uploadSub}>JPG, PNG · Max 10MB · Corps entier de préférence</div>
              </div>
              <div style={s.btnRow}>
                <button style={s.btnCamera} onClick={startCamera}>📷 PRENDRE UNE PHOTO</button>
                <button style={s.btnGallery} onClick={() => fileInputRef.current?.click()}>🖼 MA GALERIE</button>
              </div>
            </>
          )}

          {cameraActive && !photoConfirmation && (
            <>
              <div style={s.cameraWrap}>
                <video ref={videoRef} style={s.video} autoPlay playsInline muted />
              </div>
              <div style={s.cameraHint}>⏱ Appuyez — 3 secondes pour vous placer · 3 seconds to get in position</div>
              <button onClick={capturePhoto} disabled={countdown !== null} style={s.btnCapture}>
                {countdown
                  ? <span style={{ color: '#C9A96E', fontSize: '1.8rem', fontWeight: 300 }}>{countdown}</span>
                  : <div style={s.btnCaptureInner} />}
              </button>
              <div style={s.btnRow}>
                <button style={s.btnGallery} onClick={() => fileInputRef.current?.click()}>🖼 GALERIE</button>
                <button style={s.btnRetake} onClick={stopCamera}>ANNULER</button>
              </div>
            </>
          )}

          {photoConfirmation && (
            <>
              <img src={photoConfirmation} alt="Preview" style={s.confirmImg} />
              <div style={s.confirmBtns}>
                <button style={s.btnConfirm} onClick={confirmPhoto}>✓ UTILISER CETTE PHOTO</button>
                <button style={s.btnRetake} onClick={retakePhoto}>↺ REPRENDRE</button>
              </div>
            </>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* STEP 2 — Outfit Builder */}
      {step === 2 && (
        <div style={s.stepWrap}>
          <div style={s.mainCol}>
            {/* Photo thumb */}
            <div style={s.photoThumbWrap}>
              {photoPreview && <img src={photoPreview} alt="Votre photo" style={s.photoThumb} />}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.4rem' }}>Photo chargée ✓</div>
                <button style={s.changePhotoBtn} onClick={() => { stopCamera(); setStep(1); setPhotoClient(null); setPhotoPreview(null) }}>
                  Changer la photo
                </button>
                {!cameraActive && (
                  <button style={{ ...s.changePhotoBtn, marginLeft: '1rem' }} onClick={startCamera}>
                    📷 Prendre une photo
                  </button>
                )}
              </div>
            </div>

            {/* Camera in step 2 */}
            {cameraActive && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={s.cameraWrap}>
                  <video ref={videoRef} style={s.video} autoPlay playsInline muted />
                </div>
                <div style={s.cameraHint}>⏱ 3 secondes pour vous placer après le bouton</div>
                <button onClick={capturePhoto} disabled={countdown !== null} style={s.btnCapture}>
                  {countdown ? <span style={{ color: '#C9A96E', fontSize: '1.8rem' }}>{countdown}</span> : <div style={s.btnCaptureInner} />}
                </button>
                {photoConfirmation && (
                  <>
                    <img src={photoConfirmation} alt="Preview" style={s.confirmImg} />
                    <div style={s.confirmBtns}>
                      <button style={s.btnConfirm} onClick={confirmPhoto}>✓ UTILISER</button>
                      <button style={s.btnRetake} onClick={retakePhoto}>↺ REPRENDRE</button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={s.stepNum}>02</div>
            <div style={s.stepTitle}>Construisez votre look</div>
            <div style={s.stepSub}>Sélectionnez une pièce par catégorie — rien ne sera généré avant la fin · Select pieces, then generate once</div>

            {/* Tabs */}
            <div style={s.tabs}>
              {Object.entries(CATALOGUE).map(([key, cat]) => (
                <button key={key} style={s.tab(activeTab === key)} onClick={() => setActiveTab(key)}>
                  {cat.icon} {cat.label}
                  {selectedItems[key] && <span style={{ color: '#C9A96E', marginLeft: '3px' }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div style={s.grid}>
              {CATALOGUE[activeTab].items.map(item => {
                const isSelected = selectedItems[activeTab]?.id === item.id
                const isMain = mainGarment?.item?.id === item.id
                return (
                  <div key={item.id} style={s.itemCard(isSelected)} onClick={() => toggleItem(activeTab, item)}>
                    <img src={item.image} alt={item.nom_fr} style={s.itemImg} />
                    {isSelected && <div style={s.checkBadge}>✓</div>}
                    <div style={s.itemInfo}>
                      <div style={s.itemName}>{item.nom_fr}</div>
                      <div style={s.itemDesc}>{item.desc}</div>
                      <div style={s.itemPrice}>
                        {item.prix}
                        {isMain && <span style={s.mainBadge}>PRINCIPAL</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Background */}
            <div style={s.bgSection}>
              <div style={s.sectionTitle}>ARRIÈRE-PLAN · BACKGROUND <span style={{ color: '#bbb', fontWeight: 400 }}>(OPTIONNEL)</span></div>
              <div style={{ fontSize: '0.62rem', color: '#C9A96E', fontFamily: 'sans-serif', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                Par défaut : Studio blanc · Default: White studio
              </div>
              <div style={s.bgGrid}>
                {BACKGROUNDS.map(bg => (
                  <div key={bg.id} style={s.bgCard(selectedBackground === bg.id)} onClick={() => setSelectedBackground(bg.id)}>
                    <span style={s.bgIcon}>{bg.icon}</span>
                    <div style={s.bgLabel}>{bg.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={s.error}>⚠ {error}</div>}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Sidebar */}
          <div style={s.sideCol}>
            <div style={s.sideTitle}>VOTRE SÉLECTION · YOUR OUTFIT</div>

            <div style={s.selectedList}>
              {selectedCount === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#e8e4df' }}>✦</div>
                  <div style={s.emptyText}>Sélectionnez vos pièces<br />dans le catalogue à gauche.<br /><br />Une seule génération<br />pour votre look complet.</div>
                </div>
              ) : (
                Object.entries(selectedItems).map(([cat, item]) => {
                  const isMain = mainGarment?.item?.id === item.id
                  return (
                    <div key={cat} style={s.selectedItem}>
                      <img src={item.image} alt={item.nom_fr} style={s.selectedImg} />
                      <div style={s.selectedInfo}>
                        <div style={s.selectedName}>{item.nom_fr}</div>
                        <div style={s.selectedCat}>
                          {CATALOGUE[cat].label}
                          {isMain && <span style={{ color: '#C9A96E', marginLeft: '4px', fontSize: '0.55rem' }}>· PIÈCE GÉNÉRÉE</span>}
                        </div>
                        <div style={s.selectedPrice}>{item.prix}</div>
                      </div>
                      <button style={s.removeBtn} onClick={() => removeItem(cat)} title="Retirer">✕</button>
                    </div>
                  )
                })
              )}
            </div>

            <div style={s.totalWrap}>
              {selectedCount > 0 && (
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>TOTAL ESTIMÉ</span>
                  <span style={s.totalPrice}>{formatPrice(totalPrice)}</span>
                </div>
              )}

              {generating ? (
                <>
                  <div style={{ ...s.btnGenerateDisabled, textAlign: 'center' }}>GÉNÉRATION EN COURS...</div>
                  <div style={s.progressWrap}>
                    <div style={s.progressBar(progress)} />
                  </div>
                  <div style={s.progressLabel}>L'IA habille votre photo · {Math.round(progress)}%</div>
                </>
              ) : (
                <button
                  style={selectedCount > 0 ? s.btnGenerate : s.btnGenerateDisabled}
                  onClick={selectedCount > 0 ? handleGenerate : undefined}
                  disabled={selectedCount === 0 || generating}
                >
                  GÉNÉRER MON LOOK COMPLET<br />
                  <span style={{ fontSize: '0.6rem', opacity: 0.65 }}>GENERATE MY COMPLETE LOOK</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — Result */}
      {step === 3 && (
        <div style={s.resultWrap}>
          <div style={s.stepNum}>03</div>
          <div style={s.stepTitle}>Votre look · Your look</div>
          <div style={s.stepSub}>{selectedCount} pièce{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''} · Prenez rendez-vous ou modifiez votre look</div>

          <div style={s.resultGrid}>
            <div>
              <div style={s.sectionTitle}>VOTRE LOOK GÉNÉRÉ · YOUR GENERATED LOOK</div>
              {resultImage && <img src={resultImage} alt="Votre look Surmesur" style={s.resultImg} />}
            </div>

            <div>
              <div style={s.sideTitle}>VOTRE SÉLECTION COMPLÈTE</div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {Object.entries(selectedItems).map(([cat, item]) => {
                  const isMain = mainGarment?.item?.id === item.id
                  return (
                    <div key={cat} style={s.selectedItem}>
                      <img src={item.image} alt={item.nom_fr} style={s.selectedImg} />
                      <div style={s.selectedInfo}>
                        <div style={s.selectedName}>{item.nom_fr}</div>
                        <div style={s.selectedCat}>
                          {CATALOGUE[cat].label}
                          {isMain && <span style={{ color: '#C9A96E', marginLeft: '4px', fontSize: '0.55rem' }}>· PIÈCE GÉNÉRÉE</span>}
                        </div>
                        <div style={s.selectedPrice}>{item.prix}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid #e8e4df', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>TOTAL ESTIMÉ</span>
                  <span style={s.totalPrice}>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <a href="https://www.surmesur.com" target="_blank" rel="noopener noreferrer" style={s.btnAppt}>
                PRENDRE MON RENDEZ-VOUS<br />
                <span style={{ fontSize: '0.6rem', opacity: 0.65 }}>BOOK MY FREE APPOINTMENT</span>
              </a>

              <button style={s.btnSecondary} onClick={() => { setStep(2); setResultImage(null) }}>
                ← MODIFIER MON LOOK · EDIT MY OUTFIT
              </button>

              <button style={s.btnSecondary} onClick={reset}>
                ↺ RECOMMENCER · START OVER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
