'use client'

import { useState, useRef, useCallback } from 'react'

const BASE_URL = 'https://surmesur-tryon.vercel.app'

const CATALOGUE = {
  suits: {
    label: 'Complets',
    label_en: 'Suits',
    icon: '🤵',
    categorie: 'one-pieces',
    items: [
      { id: 's1', nom_fr: 'Complet Bleu Pétrole', nom: 'Oil Blue Wool Suit', image: `${BASE_URL}/suit1.png`, prix: '$1,200', desc: '3-Piece · Pure Wool' },
      { id: 's2', nom_fr: 'Complet Charbon', nom: 'Charcoal Wool Suit', image: `${BASE_URL}/suit2.png`, prix: '$1,140', desc: '3-Piece · Plain Wool' },
      { id: 's3', nom_fr: 'Flanelle Prince de Galles', nom: 'Prince of Wales Flannel', image: `${BASE_URL}/suit3.png`, prix: '$1,165', desc: '3-Piece · Flannel' },
      { id: 's4', nom_fr: 'Complet Gris Chevron', nom: 'Grey Herringbone Suit', image: `${BASE_URL}/suit4.png`, prix: '$1,180', desc: '3-Piece · Herringbone' },
      { id: 's5', nom_fr: 'Complet Lin Naturel', nom: 'Natural Linen Suit', image: `${BASE_URL}/suit5.png`, prix: '$1,100', desc: '3-Piece · Premium Linen' },
      { id: 's6', nom_fr: 'Complet Brun Foncé', nom: 'Dark Brown Flannel Suit', image: `${BASE_URL}/suit6.png`, prix: '$1,220', desc: '3-Piece · Wool Flannel' },
    ]
  },
  jackets: {
    label: 'Vestons',
    label_en: 'Jackets',
    icon: '🧥',
    categorie: 'tops',
    items: [
      { id: 'j1', nom_fr: 'Sport Coat Écossais', nom: 'H&S Crystal Springs Plaid Sport Coat', image: `${BASE_URL}/jacket1.png`, prix: '$2,164', desc: 'Wool-Silk Linen · Plaid' },
      { id: 'j2', nom_fr: 'Blazer Lin Cobalt', nom: 'Cobalt Blue Single Breasted Linen Blazer', image: `${BASE_URL}/jacket2.png`, prix: '$645', desc: 'Premium Linen · Single Breasted' },
      { id: 'j3', nom_fr: 'Sport Jacket Framboise', nom: 'Reda Raspberry Red Wool Linen Silk Sport Jacket', image: `${BASE_URL}/jacket3.png`, prix: '$1,529', desc: 'Wool-Linen-Silk · Double Breasted' },
      { id: 'j4', nom_fr: 'Blazer Rose Lavande', nom: 'Rose and Lavender Window Pane Blazer', image: `${BASE_URL}/jacket4.png`, prix: '$1,294', desc: 'Single Breasted · Window Pane' },
    ]
  },
  coats: {
    label: 'Manteaux',
    label_en: 'Overcoats',
    icon: '🧤',
    categorie: 'tops',
    items: [
      { id: 'c1', nom_fr: 'Manteau Laine Orange', nom: 'Orange Wool Overcoat', image: `${BASE_URL}/coat1.png`, prix: '$1,600', desc: 'Pure Wool · Double Breasted' },
      { id: 'c2', nom_fr: 'Manteau Camel Laine', nom: 'Camel Wool Overcoat', image: `${BASE_URL}/coat2.png`, prix: '$870', desc: 'Wool · Classic Cut' },
      { id: 'c3', nom_fr: 'Tan Wool Greatcoat', nom: 'Tan Wool Greatcoat', image: `${BASE_URL}/coat3.png`, prix: '$1,340', desc: 'Pure Wool · Best Seller' },
      { id: 'c4', nom_fr: 'Manteau Écossais Vert', nom: 'Black Watch Plaid Wool Greatcoat', image: `${BASE_URL}/coat4.png`, prix: '$1,250', desc: 'Wool · Double Breasted' },
    ]
  },
  shirts: {
    label: 'Chemises',
    label_en: 'Shirts',
    icon: '👔',
    categorie: 'tops',
    items: [
      { id: 'sh1', nom_fr: 'Chemise Lin Beige', nom: 'Beige Wool and Linen Shirt', image: `${BASE_URL}/shirt1.png`, prix: '$225', desc: 'Wool-Linen · Sport Shirt' },
      { id: 'sh2', nom_fr: 'Chemise Florale Lin', nom: 'Beige Linen Shirt with Blue Floral Pattern', image: `${BASE_URL}/shirt2.png`, prix: '$225', desc: 'Linen · Sport Shirt' },
      { id: 'sh3', nom_fr: 'Chemise Florale Bleue', nom: 'Blue Floral Linen Shirt', image: `${BASE_URL}/shirt3.png`, prix: '$350', desc: 'Linen · Sport Shirt' },
      { id: 'sh4', nom_fr: 'Chemise Rayée Lin', nom: 'Yellow and Blue Pencil Stripe Linen Shirt', image: `${BASE_URL}/shirt4.png`, prix: '$350', desc: 'Linen · Dress Shirt' },
    ]
  },
  jeans: {
    label: 'Jeans',
    label_en: 'Jeans',
    icon: '👖',
    categorie: 'bottoms',
    items: [
      { id: 'jn1', nom_fr: 'Jean Blanc Terio', nom: 'White Terio Jeans', image: `${BASE_URL}/jean1.png`, prix: '$250', desc: 'Custom Fit · White' },
      { id: 'jn2', nom_fr: 'Jean Bleu Foncé Stretch', nom: 'Custom Fit Stretch Dark Blue Jeans', image: `${BASE_URL}/jean2.png`, prix: '$215', desc: 'Stretch · Dark Blue' },
      { id: 'jn3', nom_fr: 'Jean Jogger Bleu Clair', nom: 'Light Wash Relaxed Fit Denim Joggers', image: `${BASE_URL}/jean3.png`, prix: '$165', desc: 'Relaxed Fit · Light Wash' },
      { id: 'jn4', nom_fr: 'Jean Bleu Foncé Slim', nom: 'Custom Fit Dark Blue Jeans', image: `${BASE_URL}/jean4.png`, prix: '$215', desc: 'Custom Fit · Dark Blue' },
    ]
  }
}

export default function Home() {
  const [photoClient, setPhotoClient] = useState(null)
  const [photoClientPreview, setPhotoClientPreview] = useState(null)
  const [etape, setEtape] = useState(1)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [photoConfirmation, setPhotoConfirmation] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [activeTab, setActiveTab] = useState('suits')
  const [outfitSelections, setOutfitSelections] = useState([])
  const [currentSelection, setCurrentSelection] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [currentResultUrl, setCurrentResultUrl] = useState(null)
  const [generationCount, setGenerationCount] = useState(0)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoClient(file)
      setPhotoClientPreview(URL.createObjectURL(file))
      setEtape(2)
      setErreur(null)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setCameraStream(stream)
      setCameraActive(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      setErreur('Caméra non accessible. Utilisez le bouton galerie.')
    }
  }

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setCameraActive(false)
    setPhotoConfirmation(null)
  }, [cameraStream])

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
    if (!canvasRef.current || !photoConfirmation) return
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
      setPhotoClient(file)
      setPhotoClientPreview(photoConfirmation)
      setEtape(2)
      setErreur(null)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const retakePhoto = () => {
    setPhotoConfirmation(null)
    setTimeout(() => {
      if (videoRef.current && cameraStream) {
        videoRef.current.srcObject = cameraStream
        videoRef.current.play()
      }
    }, 100)
  }

  const handleGenerer = async () => {
    if (!currentSelection) return
    setChargement(true)
    setErreur(null)

    try {
      const formData = new FormData()
      formData.append('garment_url', currentSelection.image)
      formData.append('category', CATALOGUE[activeTab].categorie)

      if (currentResultUrl && generationCount > 0) {
        // Génération séquentielle — utiliser le résultat précédent comme modèle
        formData.append('model_image_url', currentResultUrl)
      } else {
        // Première génération — utiliser la photo originale
        formData.append('model_image', photoClient)
      }

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setErreur(data.error || 'Une erreur est survenue')
      } else {
        setCurrentResultUrl(data.output)
        setOutfitSelections(prev => [...prev, { ...currentSelection, categorie: activeTab }])
        setGenerationCount(prev => prev + 1)
        setCurrentSelection(null)
        setEtape(3)
      }
    } catch (err) {
      setErreur('Erreur de connexion. Réessayez.')
    } finally {
      setChargement(false)
    }
  }

  const recommencer = () => {
    setPhotoClient(null)
    setPhotoClientPreview(null)
    setEtape(1)
    setCurrentSelection(null)
    setOutfitSelections([])
    setCurrentResultUrl(null)
    setGenerationCount(0)
    setErreur(null)
    stopCamera()
  }

  const ajouterPiece = () => {
    setEtape(2)
    setCurrentSelection(null)
  }

  const allItems = Object.values(CATALOGUE).flatMap(c => c.items)

  return (
    <main style={s.main}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes loadingBar { 0%{width:0%} 50%{width:70%} 100%{width:95%} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .gold-shimmer { background: linear-gradient(90deg,#C9A96E 0%,#E8D5B0 40%,#C9A96E 60%,#9A7A45 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 4s linear infinite; }
        .suit-card { transition: all 0.35s ease; cursor: pointer; }
        .suit-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); }
        .suit-card:hover img { transform: scale(1.04); }
        .suit-card img { transition: transform 0.5s ease; }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .btn-generate { transition: all 0.3s ease; }
        .btn-generate:hover:not(:disabled) { box-shadow: inset 0 0 0 1px #C9A96E; letter-spacing: 0.22em !important; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 2px; }
      `}</style>

      {/* TOP BAR */}
      <div style={s.topBar}>
        <span style={s.topBarText}>CUSTOM CLOTHING MADE TO BE LIVED IN</span>
        <span style={s.topBarDot}>·</span>
        <span style={s.topBarText}>B CORP CERTIFIED</span>
        <span style={s.topBarDot}>·</span>
        <span style={s.topBarText}>MTL · TOR · VAN · OTT · PIТ · MEX</span>
      </div>

      {/* HEADER */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <div style={s.logo}>SURMESUR</div>
            <div style={s.logoLine} />
          </div>
          <nav style={s.nav}>
            <span style={s.navItem}>Collections</span>
            <span style={s.navItem}>Nos Boutiques</span>
            <span style={s.navItem}>Mariages</span>
            <span style={{...s.navItem, ...s.navActive}}>Virtual Try-On ✦</span>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroInner}>
          <p style={s.eyebrow} className="fade-up">NOUVELLE EXPÉRIENCE EXCLUSIVE · NEW EXCLUSIVE EXPERIENCE</p>
          <h1 style={s.heroTitle} className="fade-up-1">
            Essayez nos <em className="gold-shimmer">collections</em><br />sans sortir de la maison.
          </h1>
          <p style={s.heroSub} className="fade-up-2">
            Uploadez votre photo ou prenez-en une en direct.<br />
            Notre IA vous habille en 30 secondes — chez vous, à votre rythme.
          </p>
          <p style={s.heroSubEn} className="fade-up-3">
            Try our collections without leaving home. Build your complete outfit piece by piece.
          </p>
          <div style={s.heroStats} className="fade-up-3">
            <div style={s.heroStat}><span style={s.heroStatN}>30s</span><span style={s.heroStatL}>Par génération</span></div>
            <div style={s.heroStatDiv} />
            <div style={s.heroStat}><span style={s.heroStatN}>5</span><span style={s.heroStatL}>Catégories</span></div>
            <div style={s.heroStatDiv} />
            <div style={s.heroStat}><span style={s.heroStatN}>∞</span><span style={s.heroStatL}>Combinaisons</span></div>
          </div>
        </div>
        <div style={s.heroLine} />
      </section>

      {/* PROGRESS */}
      <div style={s.progress}>
        {[{n:1,l:'Votre photo'},{n:2,l:'Choisir une pièce'},{n:3,l:'Résultat & Builder'}].map((e,i) => (
          <div key={e.n} style={s.progressItem}>
            <div style={{...s.progressDot, background: etape>=e.n?'#000':'transparent', borderColor: etape>=e.n?'#000':'#ddd', boxShadow: etape===e.n?'0 0 0 3px rgba(201,169,110,0.2)':'none'}}>
              <span style={{color: etape>=e.n?'#fff':'#bbb', fontSize:'11px', fontWeight:500}}>{e.n}</span>
            </div>
            <span style={{...s.progressLabel, color: etape>=e.n?'#000':'#ccc', fontWeight: etape===e.n?500:300}}>{e.l}</span>
            {i < 2 && <div style={{...s.progressLine, background: etape>e.n?'linear-gradient(90deg,#000,#C9A96E)':'#eee'}} />}
          </div>
        ))}
      </div>

      <div style={s.content}>

        {/* STEP 1 — PHOTO */}
        <section style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionNum}>01</span>
            <div>
              <h2 style={s.sectionTitle}>Votre photo <span style={s.sectionEn}>/ Your photo</span></h2>
              <p style={s.sectionSub}>Prenez une photo en direct ou uploadez depuis votre galerie</p>
            </div>
          </div>

          {cameraActive && (
            <div style={s.cameraContainer}>
              {!photoConfirmation ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted style={s.cameraVideo} />
                  <div style={s.cameraGuide}><div /></div>
                  <p style={s.cameraHint}>Placez-vous debout, corps entier visible · Stand upright, full body visible</p>
                  <p style={s.cameraTimer}>⏱ Appuyez sur le bouton — vous aurez 3 secondes pour vous placer</p>
                  <div style={s.cameraControls}>
                    <button onClick={stopCamera} style={s.btnCancel}>✕ Annuler</button>
                    <button onClick={capturePhoto} disabled={countdown !== null} style={s.btnCapture}>
                      {countdown ? <span style={{color:'#fff',fontSize:'1.8rem',fontFamily:"'Cormorant Garamond',serif"}}>{countdown}</span> : <div style={s.btnCaptureInner} />}
                    </button>
                    <div style={{width:'80px'}} />
                  </div>
                </>
              ) : (
                <>
                  <img src={photoConfirmation} alt="Photo" style={s.cameraVideo} />
                  <p style={s.cameraHint}>Cette photo vous convient ? · Happy with this photo?</p>
                  <div style={s.cameraControls}>
                    <button onClick={retakePhoto} style={s.btnCancel}>↩ Reprendre</button>
                    <button onClick={confirmPhoto} style={s.btnConfirm}>✓ Utiliser cette photo</button>
                  </div>
                </>
              )}
              <canvas ref={canvasRef} style={{display:'none'}} />
            </div>
          )}

          {!cameraActive && photoClientPreview && (
            <div style={s.previewWrap}>
              <img src={photoClientPreview} alt="Votre photo" style={s.previewImg} />
              <div style={s.previewBadge}>✓ Photo sélectionnée</div>
            </div>
          )}

          {!cameraActive && (
            <div style={s.uploadOptions}>
              <button onClick={() => fileInputRef.current?.click()} style={photoClientPreview ? s.btnGalleryActive : s.btnGallery}>
                <span style={s.btnIcon}>🖼</span>
                <div>
                  <p style={s.btnLabel}>{photoClientPreview ? 'Changer la photo · Change photo' : 'Choisir dans ma galerie'}</p>
                  <p style={s.btnLabelEn}>{photoClientPreview ? '' : 'Choose from gallery'}</p>
                </div>
              </button>
              <div style={s.divider}><div style={s.dividerLine}/><span style={s.dividerText}>ou · or</span><div style={s.dividerLine}/></div>
              <button onClick={() => { setPhotoClient(null); setPhotoClientPreview(null); startCamera() }} style={s.btnCamera}>
                <span style={s.btnIcon}>📷</span>
                <div>
                  <p style={s.btnLabel}>Prendre une photo en direct</p>
                  <p style={s.btnLabelEn}>Take a live photo</p>
                </div>
              </button>
              {!photoClientPreview && <p style={s.uploadTip}>💡 Photo debout, corps entier, fond simple</p>}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}} />
        </section>

        {/* STEP 2 — CATALOGUE PAR CATÉGORIES */}
        {etape >= 2 && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>02</span>
              <div>
                <h2 style={s.sectionTitle}>
                  {generationCount > 0 ? 'Ajouter une pièce' : 'Choisissez votre première pièce'}
                  <span style={s.sectionEn}> / {generationCount > 0 ? 'Add another piece' : 'Choose your first piece'}</span>
                </h2>
                <p style={s.sectionSub}>
                  {generationCount > 0
                    ? `${generationCount} pièce${generationCount > 1 ? 's' : ''} ajoutée${generationCount > 1 ? 's' : ''} · Continuez à construire votre tenue`
                    : 'Sélectionnez une catégorie puis une pièce'}
                </p>
              </div>
            </div>

            {/* TABS */}
            <div style={s.tabs}>
              {Object.entries(CATALOGUE).map(([key, cat]) => (
                <button
                  key={key}
                  className="tab-btn"
                  onClick={() => { setActiveTab(key); setCurrentSelection(null) }}
                  style={{
                    ...s.tab,
                    background: activeTab === key ? '#000' : '#fff',
                    color: activeTab === key ? '#fff' : '#666',
                    borderColor: activeTab === key ? '#000' : '#e5e5e5',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span style={s.tabLabel}>{cat.label}</span>
                  <span style={s.tabLabelEn}>{cat.label_en}</span>
                </button>
              ))}
            </div>

            {/* ITEMS GRID */}
            <div style={s.grid}>
              {CATALOGUE[activeTab].items.map((item) => (
                <div
                  key={item.id}
                  className="suit-card"
                  style={{
                    ...s.card,
                    border: currentSelection?.id === item.id ? '2px solid #C9A96E' : '1px solid #e8e8e8',
                    background: currentSelection?.id === item.id ? '#fdfbf7' : '#fff',
                  }}
                  onClick={() => setCurrentSelection(item)}
                >
                  <div style={s.cardImgWrap}>
                    <img src={item.image} alt={item.nom} style={s.cardImg} />
                    {currentSelection?.id === item.id && <div style={s.cardCheck}>✓</div>}
                  </div>
                  <div style={s.cardInfo}>
                    <p style={s.cardNom}>{item.nom_fr}</p>
                    <p style={s.cardNomEn}>{item.nom}</p>
                    <div style={s.cardFooter}>
                      <span style={s.cardDesc}>{item.desc}</span>
                      <span style={currentSelection?.id === item.id ? s.cardPrixActive : s.cardPrix}>{item.prix}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RÉSUMÉ DE SÉLECTION + BOUTON GÉNÉRER */}
            {currentSelection && (
              <div style={s.selectionBar}>
                <div style={s.selectionInfo}>
                  <img src={currentSelection.image} alt={currentSelection.nom_fr} style={s.selectionImg} />
                  <div>
                    <p style={s.selectionNom}>{currentSelection.nom_fr}</p>
                    <p style={s.selectionDesc}>{currentSelection.desc} · {currentSelection.prix}</p>
                  </div>
                </div>
                {erreur && <div style={s.erreur}>⚠ {erreur}</div>}
                <button onClick={handleGenerer} disabled={chargement} style={s.btnGenerer} className="btn-generate">
                  {chargement ? (
                    <span style={{display:'flex',alignItems:'center',gap:'0.75rem',justifyContent:'center'}}>
                      <span style={s.spinner} />
                      Génération en cours... · Generating...
                    </span>
                  ) : generationCount > 0 ? (
                    'AJOUTER CETTE PIÈCE → ADD THIS PIECE'
                  ) : (
                    'ESSAYER CETTE PIÈCE → TRY THIS PIECE'
                  )}
                </button>
                {chargement && (
                  <div style={s.loadingWrap}>
                    <div style={s.loadingBar}><div style={s.loadingBarInner} /></div>
                    <p style={s.loadingText}>Notre IA adapte la pièce à votre silhouette · Our AI is fitting this piece to your body. 30–60 seconds.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* STEP 3 — RÉSULTAT + OUTFIT BUILDER */}
        {etape >= 3 && currentResultUrl && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>03</span>
              <div>
                <h2 style={s.sectionTitle}>Votre tenue <span style={s.sectionEn}>/ Your outfit</span></h2>
                <p style={s.sectionSub}>{generationCount} pièce{generationCount > 1 ? 's' : ''} · Continuez à construire ou prenez rendez-vous</p>
              </div>
            </div>

            <div style={s.resultatLayout}>
              {/* RÉSULTAT PRINCIPAL */}
              <div style={s.resultatMain}>
                <p style={s.resultatLabel}>VOTRE LOOK ACTUEL · YOUR CURRENT LOOK</p>
                <div style={s.resultatWrap}>
                  <img src={currentResultUrl} alt="Votre look" style={s.resultatImg} />
                  <div style={s.resultatBadge}>AI GENERATED · IA GÉNÉRÉE</div>
                </div>
              </div>

              {/* OUTFIT SO FAR */}
              <div style={s.outfitSidebar}>
                <p style={s.outfitTitle}>VOTRE SÉLECTION · YOUR OUTFIT</p>
                <div style={s.outfitItems}>
                  {outfitSelections.map((item, i) => (
                    <div key={i} style={s.outfitItem}>
                      <img src={item.image} alt={item.nom_fr} style={s.outfitItemImg} />
                      <div>
                        <p style={s.outfitItemNom}>{item.nom_fr}</p>
                        <p style={s.outfitItemDesc}>{item.desc}</p>
                        <p style={s.outfitItemPrix}>{item.prix}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL */}
                <div style={s.outfitTotal}>
                  <span style={s.outfitTotalLabel}>TOTAL ESTIMÉ</span>
                  <span style={s.outfitTotalValue}>
                    ${outfitSelections.reduce((acc, item) => acc + parseInt(item.prix.replace('$','').replace(',','')), 0).toLocaleString()}
                  </span>
                </div>

                {/* ACTIONS */}
                <button onClick={ajouterPiece} style={s.btnAjouter}>
                  + Ajouter une pièce · Add a piece
                </button>

                <div style={s.ctaGoldLine} />

                <a href="https://www.surmesur.com" target="_blank" rel="noopener noreferrer" style={s.btnRDV}>
                  PRENDRE MON RENDEZ-VOUS<br />
                  <span style={s.btnRDVSub}>BOOK MY FREE APPOINTMENT</span>
                </a>

                <button onClick={recommencer} style={s.btnReset}>
                  ↩ Recommencer · Start over
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerGoldLine} />
        <p style={s.footerLogo}>SURMESUR</p>
        <p style={s.footerCities}>MTL · TOR · VAN · OTT · PIТ · MEX</p>
        <p style={s.footerSub}>Custom Clothing Made To Be Lived In · B Corp Certified</p>
      </footer>
    </main>
  )
}

const s = {
  main: { minHeight:'100vh', background:'#FAFAF8', color:'#000', fontFamily:"'Montserrat',sans-serif", fontWeight:300 },
  topBar: { background:'#0A0A0A', color:'#888', textAlign:'center', padding:'7px 1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.85rem', flexWrap:'wrap' },
  topBarText: { fontSize:'9px', letterSpacing:'0.22em', fontWeight:400 },
  topBarDot: { color:'#444', fontSize:'9px' },
  header: { background:'#fff', borderBottom:'1px solid #efefef', padding:'0 2.5rem' },
  headerInner: { maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'80px', flexWrap:'wrap', gap:'1rem' },
  logo: { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.75rem', fontWeight:400, letterSpacing:'0.38em' },
  logoLine: { height:'1.5px', background:'linear-gradient(90deg,#C9A96E,#E8D5B0,#C9A96E)', marginTop:'3px' },
  nav: { display:'flex', gap:'2rem', alignItems:'center', flexWrap:'wrap' },
  navItem: { fontSize:'10px', letterSpacing:'0.14em', color:'#888', textTransform:'uppercase', cursor:'pointer' },
  navActive: { color:'#000', fontWeight:500, borderBottom:'1px solid #C9A96E', paddingBottom:'2px' },
  hero: { position:'relative', background:'#fff', overflow:'hidden' },
  heroBg: { position:'absolute', top:0, left:0, right:0, bottom:0, background:'radial-gradient(ellipse at 80% 50%,rgba(201,169,110,0.04) 0%,transparent 70%)', pointerEvents:'none' },
  heroInner: { maxWidth:'1200px', margin:'0 auto', padding:'clamp(3rem,8vw,6rem) 2.5rem clamp(2rem,4vw,3rem)', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', position:'relative' },
  eyebrow: { fontSize:'9px', letterSpacing:'0.28em', color:'#C9A96E', textTransform:'uppercase', marginBottom:'1.5rem', fontWeight:400 },
  heroTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(3rem,7vw,5.5rem)', fontWeight:300, lineHeight:1.08, marginBottom:'2rem', maxWidth:'750px', textAlign:'center' },
  heroSub: { fontSize:'clamp(13px,1.5vw,15px)', color:'#555', lineHeight:1.8, marginBottom:'0.5rem', maxWidth:'520px', textAlign:'center' },
  heroSubEn: { fontSize:'12px', color:'#aaa', fontStyle:'italic', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:'520px', textAlign:'center' },
  heroStats: { display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap', justifyContent:'center' },
  heroStat: { display:'flex', flexDirection:'column', gap:'4px', alignItems:'center' },
  heroStatN: { fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', fontWeight:300, lineHeight:1 },
  heroStatL: { fontSize:'9px', letterSpacing:'0.15em', color:'#999', textTransform:'uppercase' },
  heroStatDiv: { width:'1px', height:'40px', background:'#e5e5e5' },
  heroLine: { height:'1px', background:'linear-gradient(90deg,transparent,#e5e5e5 20%,#C9A96E 50%,#e5e5e5 80%,transparent)' },
  progress: { maxWidth:'1200px', margin:'0 auto', padding:'1.75rem 2.5rem', display:'flex', alignItems:'center', background:'#fff', borderBottom:'1px solid #f0f0f0', flexWrap:'wrap', gap:'0.5rem' },
  progressItem: { display:'flex', alignItems:'center', gap:'0.6rem' },
  progressDot: { width:'26px', height:'26px', borderRadius:'50%', border:'1.5px solid', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.4s' },
  progressLabel: { fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap', transition:'color 0.3s' },
  progressLine: { width:'clamp(1rem,4vw,4rem)', height:'1px', margin:'0 0.5rem', transition:'background 0.4s' },
  content: { maxWidth:'1200px', margin:'0 auto', padding:'0 2.5rem 5rem' },
  section: { marginBottom:'4rem', paddingTop:'3rem', borderTop:'1px solid #f0f0f0' },
  sectionHead: { display:'flex', gap:'1.5rem', alignItems:'flex-start', marginBottom:'2rem' },
  sectionNum: { fontFamily:"'Cormorant Garamond',serif", fontSize:'5rem', fontWeight:300, color:'#f0ede8', lineHeight:1, flexShrink:0 },
  sectionTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:400, marginBottom:'0.4rem' },
  sectionEn: { fontStyle:'italic', color:'#bbb', fontSize:'0.7em' },
  sectionSub: { fontSize:'11px', color:'#aaa', letterSpacing:'0.06em', lineHeight:1.6 },
  cameraContainer: { position:'relative', background:'#000', borderRadius:'2px', overflow:'hidden', marginBottom:'1rem' },
  cameraVideo: { width:'100%', maxHeight:'500px', objectFit:'cover', display:'block' },
  cameraGuide: { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'200px', height:'400px', border:'1.5px dashed rgba(201,169,110,0.6)', borderRadius:'100px', pointerEvents:'none' },
  cameraHint: { textAlign:'center', color:'#fff', fontSize:'11px', padding:'0.75rem', background:'rgba(0,0,0,0.7)', letterSpacing:'0.05em' },
  cameraTimer: { textAlign:'center', color:'#C9A96E', fontSize:'10px', padding:'0.5rem', background:'rgba(0,0,0,0.85)', fontStyle:'italic', letterSpacing:'0.08em' },
  cameraControls: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem 2rem', background:'#0A0A0A' },
  btnCancel: { background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', padding:'0.6rem 1.2rem', fontSize:'11px', cursor:'pointer', borderRadius:'2px', fontFamily:"'Montserrat',sans-serif", letterSpacing:'0.1em' },
  btnCapture: { width:'68px', height:'68px', borderRadius:'50%', background:'transparent', border:'3px solid #C9A96E', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0 },
  btnCaptureInner: { width:'54px', height:'54px', borderRadius:'50%', background:'#C9A96E' },
  btnConfirm: { background:'#C9A96E', border:'none', color:'#000', padding:'0.75rem 1.5rem', fontSize:'11px', cursor:'pointer', borderRadius:'2px', fontFamily:"'Montserrat',sans-serif", fontWeight:500, letterSpacing:'0.1em' },
  previewWrap: { position:'relative', borderRadius:'2px', overflow:'hidden', marginBottom:'1rem', border:'1px solid #e8e8e8' },
  previewImg: { width:'100%', maxHeight:'400px', objectFit:'cover', display:'block' },
  previewBadge: { position:'absolute', top:'1rem', left:'1rem', background:'rgba(201,169,110,0.9)', color:'#000', padding:'0.4rem 0.85rem', fontSize:'10px', letterSpacing:'0.15em', fontWeight:500 },
  uploadOptions: { border:'1px solid #efefef', borderRadius:'2px', padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1rem', background:'#fff' },
  btnCamera: { display:'flex', alignItems:'center', gap:'1rem', padding:'1.25rem 1.5rem', background:'#0A0A0A', color:'#fff', border:'none', cursor:'pointer', borderRadius:'2px', textAlign:'left', fontFamily:"'Montserrat',sans-serif" },
  btnGallery: { display:'flex', alignItems:'center', gap:'1rem', padding:'1.25rem 1.5rem', background:'#fff', color:'#000', border:'1px solid #ddd', cursor:'pointer', borderRadius:'2px', textAlign:'left', fontFamily:"'Montserrat',sans-serif" },
  btnGalleryActive: { display:'flex', alignItems:'center', gap:'1rem', padding:'1.25rem 1.5rem', background:'#fff', color:'#000', border:'1px solid #C9A96E', cursor:'pointer', borderRadius:'2px', textAlign:'left', fontFamily:"'Montserrat',sans-serif" },
  btnIcon: { fontSize:'1.4rem', flexShrink:0 },
  btnLabel: { fontSize:'12px', fontWeight:500, marginBottom:'2px', letterSpacing:'0.06em' },
  btnLabelEn: { fontSize:'10px', color:'#999', fontStyle:'italic' },
  divider: { display:'flex', alignItems:'center', gap:'1rem' },
  dividerLine: { flex:1, height:'1px', background:'#efefef' },
  dividerText: { fontSize:'10px', color:'#ccc', letterSpacing:'0.12em' },
  uploadTip: { fontSize:'11px', color:'#bbb', textAlign:'center', fontStyle:'italic' },
  tabs: { display:'flex', gap:'8px', marginBottom:'1.5rem', flexWrap:'wrap' },
  tab: { display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', padding:'0.75rem 1.25rem', border:'1px solid', borderRadius:'2px', fontFamily:"'Montserrat',sans-serif", fontSize:'11px', minWidth:'80px' },
  tabLabel: { fontSize:'11px', fontWeight:500, letterSpacing:'0.06em' },
  tabLabelEn: { fontSize:'9px', opacity:0.6, letterSpacing:'0.08em' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1.5px', background:'#e8e8e8', border:'1px solid #e8e8e8', marginBottom:'1.5rem' },
  card: { background:'#fff', position:'relative', overflow:'hidden' },
  cardImgWrap: { height:'300px', overflow:'hidden', position:'relative', background:'#f7f7f5' },
  cardImg: { width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' },
  cardCheck: { position:'absolute', top:'0.75rem', right:'0.75rem', width:'28px', height:'28px', background:'#C9A96E', color:'#000', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:600 },
  cardInfo: { padding:'0.85rem 1rem' },
  cardNom: { fontSize:'12px', fontWeight:500, marginBottom:'2px' },
  cardNomEn: { fontSize:'9px', color:'#bbb', fontStyle:'italic', marginBottom:'0.4rem' },
  cardFooter: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  cardDesc: { fontSize:'9px', color:'#bbb', letterSpacing:'0.08em', textTransform:'uppercase' },
  cardPrix: { fontSize:'12px', color:'#666' },
  cardPrixActive: { fontSize:'12px', color:'#C9A96E', fontWeight:500 },
  selectionBar: { background:'#fff', border:'1px solid #C9A96E', borderRadius:'2px', padding:'1.5rem', marginTop:'0.5rem' },
  selectionInfo: { display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' },
  selectionImg: { width:'60px', height:'75px', objectFit:'cover', objectPosition:'top', border:'1px solid #efefef', flexShrink:0 },
  selectionNom: { fontSize:'13px', fontWeight:500, marginBottom:'3px' },
  selectionDesc: { fontSize:'11px', color:'#999' },
  erreur: { background:'#fff8f8', border:'1px solid #f5cccc', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'12px', color:'#cc3333', borderRadius:'2px' },
  btnGenerer: { width:'100%', padding:'1.25rem', background:'#0A0A0A', color:'#fff', border:'1px solid transparent', fontSize:'11px', letterSpacing:'0.18em', cursor:'pointer', fontFamily:"'Montserrat',sans-serif", fontWeight:400, display:'block' },
  spinner: { width:'14px', height:'14px', border:'1.5px solid rgba(255,255,255,0.3)', borderTop:'1.5px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite', flexShrink:0 },
  loadingWrap: { marginTop:'1rem', textAlign:'center' },
  loadingBar: { height:'1.5px', background:'#efefef', overflow:'hidden', marginBottom:'0.75rem' },
  loadingBarInner: { height:'100%', background:'linear-gradient(90deg,#C9A96E,#E8D5B0)', animation:'loadingBar 60s ease forwards' },
  loadingText: { fontSize:'11px', color:'#aaa', lineHeight:1.7 },
  resultatLayout: { display:'grid', gridTemplateColumns:'2fr 1fr', gap:'2rem', alignItems:'start' },
  resultatMain: {},
  resultatLabel: { fontSize:'9px', letterSpacing:'0.28em', color:'#C9A96E', marginBottom:'0.75rem', fontWeight:400 },
  resultatWrap: { position:'relative' },
  resultatImg: { width:'100%', maxHeight:'700px', objectFit:'contain', background:'#f7f7f5', display:'block', border:'1px solid #efefef' },
  resultatBadge: { position:'absolute', bottom:'1rem', right:'1rem', background:'rgba(10,10,10,0.85)', color:'#C9A96E', padding:'0.4rem 0.9rem', fontSize:'8px', letterSpacing:'0.22em' },
  outfitSidebar: { display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:'2rem' },
  outfitTitle: { fontSize:'9px', letterSpacing:'0.25em', color:'#C9A96E', fontWeight:400 },
  outfitItems: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  outfitItem: { display:'flex', gap:'0.75rem', alignItems:'center', padding:'0.75rem', background:'#fff', border:'1px solid #efefef', borderRadius:'2px' },
  outfitItemImg: { width:'45px', height:'55px', objectFit:'cover', objectPosition:'top', flexShrink:0, border:'1px solid #f0f0f0' },
  outfitItemNom: { fontSize:'11px', fontWeight:500, marginBottom:'2px' },
  outfitItemDesc: { fontSize:'9px', color:'#bbb', letterSpacing:'0.06em' },
  outfitItemPrix: { fontSize:'11px', color:'#C9A96E', fontWeight:500, marginTop:'2px' },
  outfitTotal: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', background:'#0A0A0A', borderRadius:'2px' },
  outfitTotalLabel: { fontSize:'9px', letterSpacing:'0.2em', color:'#888' },
  outfitTotalValue: { fontSize:'1.1rem', fontFamily:"'Cormorant Garamond',serif", color:'#C9A96E', fontWeight:400 },
  btnAjouter: { width:'100%', padding:'1rem', background:'transparent', border:'1px solid #000', color:'#000', fontSize:'11px', letterSpacing:'0.14em', cursor:'pointer', fontFamily:"'Montserrat',sans-serif", transition:'all 0.2s' },
  ctaGoldLine: { height:'1px', background:'linear-gradient(90deg,transparent,#C9A96E,transparent)' },
  btnRDV: { display:'block', textAlign:'center', padding:'1.1rem 1.5rem', background:'#0A0A0A', color:'#fff', textDecoration:'none', fontSize:'10px', letterSpacing:'0.18em', lineHeight:2 },
  btnRDVSub: { fontSize:'9px', opacity:0.5, letterSpacing:'0.1em', display:'block' },
  btnReset: { width:'100%', padding:'0.75rem', background:'transparent', border:'1px solid #efefef', color:'#bbb', fontSize:'10px', letterSpacing:'0.12em', cursor:'pointer', fontFamily:"'Montserrat',sans-serif" },
  footer: { borderTop:'1px solid #efefef', textAlign:'center', padding:'3.5rem 1rem', background:'#fff' },
  footerGoldLine: { height:'1px', background:'linear-gradient(90deg,transparent,#C9A96E,transparent)', maxWidth:'200px', margin:'0 auto 2rem' },
  footerLogo: { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.6rem', letterSpacing:'0.38em', marginBottom:'0.75rem', fontWeight:300 },
  footerCities: { fontSize:'9px', letterSpacing:'0.24em', color:'#bbb', marginBottom:'0.5rem' },
  footerSub: { fontSize:'9px', color:'#ccc', letterSpacing:'0.12em' },
}
