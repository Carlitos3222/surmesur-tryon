'use client'

import { useState, useRef, useCallback } from 'react'

const BASE_URL = 'https://surmesur-tryon.vercel.app'

const TENUES = [
  {
    id: 1,
    nom: 'Oil Blue Wool Suit',
    nom_fr: 'Complet Bleu Pétrole',
    categorie: 'one-pieces',
    image: `${BASE_URL}/suit1.png`,
    prix: '$1,200',
    description: '3-Piece · Pure Wool',
  },
  {
    id: 2,
    nom: 'Charcoal Wool Suit',
    nom_fr: 'Complet Charbon',
    categorie: 'one-pieces',
    image: `${BASE_URL}/suit2.png`,
    prix: '$1,140',
    description: '3-Piece · Plain Wool',
  },
  {
    id: 3,
    nom: 'Prince of Wales Flannel',
    nom_fr: 'Flanelle Prince de Galles',
    categorie: 'one-pieces',
    image: `${BASE_URL}/suit3.png`,
    prix: '$1,165',
    description: '3-Piece · Flannel',
  },
  {
    id: 4,
    nom: 'Grey Herringbone Suit',
    nom_fr: 'Complet Gris Chevron',
    categorie: 'one-pieces',
    image: `${BASE_URL}/suit4.png`,
    prix: '$1,180',
    description: '3-Piece · Herringbone',
  },
  {
    id: 5,
    nom: 'Natural Linen Suit',
    nom_fr: 'Complet Lin Naturel',
    categorie: 'one-pieces',
    image: `${BASE_URL}/suit5.png`,
    prix: '$1,100',
    description: '3-Piece · Premium Linen',
  },
  {
    id: 6,
    nom: 'Dark Brown Flannel Suit',
    nom_fr: 'Complet Brun Foncé',
    categorie: 'one-pieces',
    image: `${BASE_URL}/suit6.png`,
    prix: '$1,220',
    description: '3-Piece · Wool Flannel',
  },
]

export default function Home() {
  const [photoClient, setPhotoClient] = useState(null)
  const [photoClientPreview, setPhotoClientPreview] = useState(null)
  const [tenueSelectionnee, setTenueSelectionnee] = useState(null)
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [etape, setEtape] = useState(1)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [photoConfirmation, setPhotoConfirmation] = useState(null)
  const [countdown, setCountdown] = useState(null)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoClient(file)
      setPhotoClientPreview(URL.createObjectURL(file))
      setEtape(2)
      setResultat(null)
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
      setResultat(null)
      setErreur(null)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const retakePhoto = () => {
    setPhotoConfirmation(null)
    // Redémarrer le stream vidéo sur l'élément video
    setTimeout(() => {
      if (videoRef.current && cameraStream) {
        videoRef.current.srcObject = cameraStream
        videoRef.current.play()
      }
    }, 100)
  }

  const handleTenueSelect = (tenue) => {
    setTenueSelectionnee(tenue)
    setEtape(3)
    setResultat(null)
    setErreur(null)
  }

  const handleGenerer = async () => {
    if (!photoClient || !tenueSelectionnee) return
    setChargement(true)
    setErreur(null)
    setResultat(null)

    try {
      const formData = new FormData()
      formData.append('model_image', photoClient)
      formData.append('garment_url', tenueSelectionnee.image)
      formData.append('category', tenueSelectionnee.categorie)

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setErreur(data.error || 'Une erreur est survenue')
      } else {
        setResultat(data.output)
        setEtape(4)
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
    setTenueSelectionnee(null)
    setResultat(null)
    setErreur(null)
    setEtape(1)
    stopCamera()
  }

  return (
    <main style={s.main}>
      {/* TOP BAR */}
      <div style={s.topBar}>
        <span style={s.topBarText}>CUSTOM CLOTHING MADE TO BE LIVED IN</span>
        <span style={s.topBarDot}>·</span>
        <span style={s.topBarText}>B CORP CERTIFIED</span>
      </div>

      {/* HEADER */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>SURMESUR</div>
          <nav style={s.nav}>
            <span style={s.navItem}>Collections</span>
            <span style={s.navItem}>Nos Boutiques</span>
            <span style={s.navItem}>Mariages</span>
            <span style={s.navItemActive}>Virtual Try-On ✦</span>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.heroEyebrow}>NOUVELLE EXPÉRIENCE · NEW EXPERIENCE</p>
          <h1 style={s.heroTitre}>
            Voyez-vous dans<br />
            <em style={s.heroEm}>nos collections.</em>
          </h1>
          <p style={s.heroSub}>
            Prenez une photo ou uploadez la vôtre. Choisissez votre complet.<br />
            Notre IA vous habille en 30 secondes.
          </p>
          <p style={s.heroSubEn}>
            Take a photo or upload yours. Choose your suit. Our AI dresses you in 30 seconds.
          </p>
        </div>
        <div style={s.heroLine} />
      </section>

      {/* PROGRESS */}
      <div style={s.progress}>
        {[
          { n: 1, label: 'Votre photo' },
          { n: 2, label: 'Votre tenue' },
          { n: 3, label: 'Générer' },
          { n: 4, label: 'Résultat' },
        ].map((e, i) => (
          <div key={e.n} style={s.progressItem}>
            <div style={{
              ...s.progressDot,
              background: etape >= e.n ? '#000' : 'transparent',
              borderColor: etape >= e.n ? '#000' : '#ccc',
            }}>
              <span style={{ color: etape >= e.n ? '#fff' : '#999', fontSize: '11px', fontWeight: 500 }}>{e.n}</span>
            </div>
            <span style={{ ...s.progressLabel, color: etape >= e.n ? '#000' : '#bbb' }}>{e.label}</span>
            {i < 3 && <div style={{ ...s.progressLine, background: etape > e.n ? '#000' : '#e5e5e5' }} />}
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        {/* STEP 1 — PHOTO */}
        <section style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionNum}>01</span>
            <div>
              <h2 style={s.sectionTitle}>Votre photo <span style={s.sectionTitleEn}>/ Your photo</span></h2>
              <p style={s.sectionSub}>Prenez une photo en direct ou uploadez depuis votre galerie · Take a live photo or upload from your gallery</p>
            </div>
          </div>

          {/* CAMERA ACTIVE */}
          {cameraActive && (
            <div style={s.cameraContainer}>
              {!photoConfirmation ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={s.cameraVideo}
                  />
                  <div style={s.cameraGuide}>
                    <div style={s.cameraGuideInner} />
                  </div>
                  <p style={s.cameraHint}>Placez-vous debout, corps entier visible · Stand upright, full body visible</p>
                  <div style={s.cameraControls}>
                    <button onClick={stopCamera} style={s.btnCameraCancel}>✕ Annuler</button>
                    <button onClick={capturePhoto} disabled={countdown !== null} style={s.btnCapture}>
                      {countdown ? (
                        <span style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>{countdown}</span>
                      ) : (
                        <div style={s.btnCaptureInner} />
                      )}
                    </button>
                    <div style={{ width: '80px' }} />
                  </div>
                </>
              ) : (
                <>
                  <img src={photoConfirmation} alt="Photo prise" style={s.cameraVideo} />
                  <p style={s.cameraHint}>Cette photo vous convient ? · Happy with this photo?</p>
                  <div style={s.cameraControls}>
                    <button onClick={retakePhoto} style={s.btnCameraCancel}>↩ Reprendre</button>
                    <button onClick={confirmPhoto} style={s.btnCameraConfirm}>✓ Utiliser cette photo</button>
                  </div>
                </>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {/* PHOTO UPLOADED */}
          {!cameraActive && photoClientPreview && (
            <div>
              <div style={s.previewWrap}>
                <img src={photoClientPreview} alt="Votre photo" style={s.previewImg} />
              </div>
              <div style={s.previewActions}>
                <button onClick={() => fileInputRef.current?.click()} style={s.btnPreviewChange}>
                  🖼 Changer la photo · Change photo
                </button>
                <button onClick={() => { setPhotoClient(null); setPhotoClientPreview(null); setEtape(1); }} style={s.btnPreviewCamera}>
                  📷 Prendre une photo · Take a photo
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD OPTIONS */}
          {!cameraActive && !photoClientPreview && (
            <div style={s.uploadOptions}>
              <button onClick={startCamera} style={s.btnCamera}>
                <span style={s.btnIcon}>📷</span>
                <div>
                  <p style={s.btnLabel}>Prendre une photo</p>
                  <p style={s.btnLabelEn}>Take a live photo</p>
                </div>
              </button>
              <div style={s.uploadDivider}>
                <div style={s.uploadDividerLine} />
                <span style={s.uploadDividerText}>ou · or</span>
                <div style={s.uploadDividerLine} />
              </div>
              <button onClick={() => fileInputRef.current?.click()} style={s.btnGallery}>
                <span style={s.btnIcon}>🖼</span>
                <div>
                  <p style={s.btnLabel}>Choisir dans ma galerie</p>
                  <p style={s.btnLabelEn}>Choose from gallery</p>
                </div>
              </button>
              <p style={s.uploadTip}>💡 Photo debout, corps entier, fond simple · Standing, full body, simple background</p>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </section>

        {/* STEP 2 — TENUE */}
        {etape >= 2 && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>02</span>
              <div>
                <h2 style={s.sectionTitle}>Choisissez votre complet <span style={s.sectionTitleEn}>/ Choose your suit</span></h2>
                <p style={s.sectionSub}>Collection exclusive · Sur mesure pour vous</p>
              </div>
            </div>

            <div style={s.grid}>
              {TENUES.map((t) => (
                <div
                  key={t.id}
                  style={{
                    ...s.card,
                    border: tenueSelectionnee?.id === t.id ? '2px solid #000' : '1px solid #e5e5e5',
                  }}
                  onClick={() => handleTenueSelect(t)}
                >
                  <div style={s.cardImgWrap}>
                    <img src={t.image} alt={t.nom} style={s.cardImg} />
                    {tenueSelectionnee?.id === t.id && (
                      <div style={s.cardCheck}>✓</div>
                    )}
                  </div>
                  <div style={s.cardInfo}>
                    <p style={s.cardNom}>{t.nom_fr}</p>
                    <p style={s.cardNomEn}>{t.nom}</p>
                    <div style={s.cardFooter}>
                      <span style={s.cardDesc}>{t.description}</span>
                      <span style={s.cardPrix}>{t.prix}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STEP 3 — GÉNÉRER */}
        {etape >= 3 && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>03</span>
              <div>
                <h2 style={s.sectionTitle}>Générer votre look <span style={s.sectionTitleEn}>/ Generate your look</span></h2>
                <p style={s.sectionSub}>Notre IA va créer votre essayage virtuel · Our AI will create your virtual try-on</p>
              </div>
            </div>

            <div style={s.resume}>
              <div style={s.resumeItem}>
                {photoClientPreview && <img src={photoClientPreview} alt="Vous" style={s.resumePhoto} />}
                <p style={s.resumeLabel}>Votre photo</p>
              </div>
              <div style={s.resumePlus}>+</div>
              <div style={s.resumeItem}>
                {tenueSelectionnee && <img src={tenueSelectionnee.image} alt={tenueSelectionnee.nom} style={s.resumePhoto} />}
                <p style={s.resumeLabel}>{tenueSelectionnee?.nom_fr}</p>
              </div>
            </div>

            {erreur && <div style={s.erreur}>⚠ {erreur}</div>}

            <button
              onClick={handleGenerer}
              disabled={chargement}
              style={{ ...s.btnGenerer, opacity: chargement ? 0.6 : 1 }}
            >
              {chargement ? 'Génération en cours... · Generating...' : 'VOIR COMMENT ÇA ME VA · SEE HOW IT FITS →'}
            </button>

            {chargement && (
              <div style={s.loadingWrap}>
                <div style={s.loadingBar}>
                  <div style={s.loadingBarInner} />
                </div>
                <p style={s.loadingText}>
                  Notre IA analyse votre silhouette et adapte le complet à votre morphologie.<br />
                  <em>Our AI is tailoring the suit to your exact body shape. Please wait 30–60 seconds.</em>
                </p>
              </div>
            )}
          </section>
        )}

        {/* STEP 4 — RÉSULTAT */}
        {resultat && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>04</span>
              <div>
                <h2 style={s.sectionTitle}>Votre look Surmesur <span style={s.sectionTitleEn}>/ Your Surmesur look</span></h2>
                <p style={s.sectionSub}>Taillé sur mesure pour vous · Custom tailored for you</p>
              </div>
            </div>

            <div style={s.resultatGrid}>
              <div style={s.resultatAvant}>
                <p style={s.resultatLabel}>AVANT · BEFORE</p>
                <img src={photoClientPreview} alt="Avant" style={s.resultatImgSmall} />
              </div>
              <div style={s.resultatApres}>
                <p style={s.resultatLabel}>APRÈS · AFTER</p>
                <div style={s.resultatWrap}>
                  <img src={resultat} alt="Votre look" style={s.resultatImg} />
                  <div style={s.resultatBadge}>AI GENERATED · IA GÉNÉRÉE</div>
                </div>
              </div>
            </div>

            <div style={s.ctaWrap}>
              <p style={s.ctaText}>
                Prêt à le faire tailler à vos mesures exactes ?<br />
                <em>Ready to have it made to your exact measurements?</em>
              </p>
              <a
                href="https://www.surmesur.com"
                target="_blank"
                rel="noopener noreferrer"
                style={s.btnRDV}
              >
                PRENDRE MON RENDEZ-VOUS GRATUIT<br />
                <span style={s.btnRDVSub}>BOOK MY FREE APPOINTMENT</span>
              </a>
              <button onClick={recommencer} style={s.btnReset}>
                Essayer une autre tenue · Try another outfit
              </button>
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <p style={s.footerLogo}>SURMESUR</p>
        <p style={s.footerCities}>MTL · TOR · VAN · OTT · PIТ · MEX</p>
        <p style={s.footerSub}>Custom Clothing Made To Be Lived In · B Corp Certified</p>
      </footer>

      {/* LOADING ANIMATION */}
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  )
}

const s = {
  main: { minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 },
  topBar: { background: '#000', color: '#fff', textAlign: 'center', padding: '8px 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' },
  topBarText: { fontSize: '10px', letterSpacing: '0.2em', fontWeight: 400 },
  topBarDot: { color: '#666', fontSize: '10px' },
  header: { borderBottom: '1px solid #e5e5e5', padding: '0 2rem' },
  headerInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', flexWrap: 'wrap', gap: '1rem' },
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.3em' },
  nav: { display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' },
  navItem: { fontSize: '11px', letterSpacing: '0.12em', color: '#666', cursor: 'pointer' },
  navItemActive: { fontSize: '11px', letterSpacing: '0.12em', color: '#000', fontWeight: 500, cursor: 'pointer', borderBottom: '1px solid #000', paddingBottom: '2px' },
  hero: { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2rem, 6vw, 5rem) 2rem clamp(1.5rem, 3vw, 2.5rem)' },
  heroInner: { maxWidth: '600px' },
  heroEyebrow: { fontSize: '10px', letterSpacing: '0.25em', color: '#999', marginBottom: '1.5rem' },
  heroTitre: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '1.5rem', color: '#000' },
  heroEm: { fontStyle: 'italic' },
  heroSub: { fontSize: '14px', color: '#444', lineHeight: 1.7, marginBottom: '0.5rem' },
  heroSubEn: { fontSize: '12px', color: '#999', fontStyle: 'italic', lineHeight: 1.7 },
  heroLine: { height: '1px', background: '#e5e5e5', marginTop: '3rem' },
  progress: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' },
  progressItem: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  progressDot: { width: '24px', height: '24px', borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' },
  progressLabel: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.3s' },
  progressLine: { width: 'clamp(0.5rem, 3vw, 3rem)', height: '1px', margin: '0 0.5rem', transition: 'background 0.3s' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' },
  section: { marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #f0f0f0' },
  sectionHead: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' },
  sectionNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: '3.5rem', fontWeight: 300, color: '#e5e5e5', lineHeight: 1, flexShrink: 0 },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 400, marginBottom: '0.5rem' },
  sectionTitleEn: { fontStyle: 'italic', color: '#999', fontSize: '0.75em' },
  sectionSub: { fontSize: '11px', color: '#999', letterSpacing: '0.05em' },

  // CAMERA
  cameraContainer: { position: 'relative', background: '#000', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' },
  cameraVideo: { width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' },
  cameraGuide: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '400px', border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '100px', pointerEvents: 'none' },
  cameraGuideInner: { width: '100%', height: '100%' },
  cameraHint: { textAlign: 'center', color: '#fff', fontSize: '11px', padding: '0.75rem', background: 'rgba(0,0,0,0.6)', letterSpacing: '0.05em' },
  cameraControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#000' },
  btnCameraCancel: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.2rem', fontSize: '12px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.08em' },
  btnCapture: { width: '64px', height: '64px', borderRadius: '50%', background: 'transparent', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 },
  btnCaptureInner: { width: '52px', height: '52px', borderRadius: '50%', background: '#fff' },
  btnCameraConfirm: { background: '#fff', border: 'none', color: '#000', padding: '0.75rem 1.5rem', fontSize: '12px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, letterSpacing: '0.08em' },

  // UPLOAD OPTIONS
  uploadOptions: { border: '1px dashed #ddd', borderRadius: '2px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' },
  btnCamera: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '2px', textAlign: 'left', fontFamily: "'Montserrat', sans-serif", transition: 'opacity 0.2s' },
  btnGallery: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', color: '#000', border: '1px solid #000', cursor: 'pointer', borderRadius: '2px', textAlign: 'left', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s' },
  btnIcon: { fontSize: '1.5rem', flexShrink: 0 },
  btnLabel: { fontSize: '13px', fontWeight: 500, marginBottom: '2px', letterSpacing: '0.05em' },
  btnLabelEn: { fontSize: '11px', color: '#999', fontStyle: 'italic' },
  uploadDivider: { display: 'flex', alignItems: 'center', gap: '1rem' },
  uploadDividerLine: { flex: 1, height: '1px', background: '#e5e5e5' },
  uploadDividerText: { fontSize: '11px', color: '#bbb', letterSpacing: '0.1em', whiteSpace: 'nowrap' },
  uploadTip: { fontSize: '11px', color: '#999', textAlign: 'center', fontStyle: 'italic' },

  // PREVIEW
  previewWrap: { position: 'relative', cursor: 'pointer', borderRadius: '2px', overflow: 'hidden' },
  previewImg: { width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' },
  previewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.75rem', textAlign: 'center' },
  previewOverlayText: { fontSize: '10px', color: '#fff', letterSpacing: '0.2em' },

  // GRID
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#e5e5e5', border: '1px solid #e5e5e5' },
  card: { background: '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  cardImgWrap: { height: '360px', overflow: 'hidden', position: 'relative', background: '#f9f9f9' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  cardCheck: { position: 'absolute', top: '1rem', right: '1rem', width: '28px', height: '28px', background: '#000', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 },
  cardInfo: { padding: '1rem' },
  cardNom: { fontSize: '13px', fontWeight: 500, color: '#000', marginBottom: '2px' },
  cardNomEn: { fontSize: '11px', color: '#999', fontStyle: 'italic', marginBottom: '0.5rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardDesc: { fontSize: '10px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' },
  cardPrix: { fontSize: '13px', fontWeight: 500, color: '#000' },

  // RESUME
  resume: { display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', background: '#f9f9f9', border: '1px solid #e5e5e5', marginBottom: '2rem', flexWrap: 'wrap' },
  resumeItem: { textAlign: 'center', flex: 1, minWidth: '100px' },
  resumePhoto: { width: '90px', height: '110px', objectFit: 'cover', objectPosition: 'top', display: 'block', margin: '0 auto 0.5rem', border: '1px solid #e5e5e5' },
  resumeLabel: { fontSize: '11px', color: '#666' },
  resumePlus: { fontSize: '1.5rem', color: '#ccc', flexShrink: 0 },

  // ERRORS & BUTTONS
  erreur: { background: '#fff5f5', border: '1px solid #ffcccc', padding: '1rem', marginBottom: '1.5rem', fontSize: '13px', color: '#cc0000', borderRadius: '2px' },
  btnGenerer: { width: '100%', padding: '1.25rem', background: '#000', color: '#fff', border: 'none', fontSize: '12px', letterSpacing: '0.15em', cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: "'Montserrat', sans-serif", fontWeight: 400 },

  // LOADING
  loadingWrap: { marginTop: '1.5rem', textAlign: 'center' },
  loadingBar: { height: '2px', background: '#e5e5e5', borderRadius: '1px', overflow: 'hidden', marginBottom: '1rem' },
  loadingBarInner: { height: '100%', background: '#000', animation: 'loadingBar 60s ease forwards', borderRadius: '1px' },
  loadingText: { fontSize: '12px', color: '#999', lineHeight: 1.7 },

  // RÉSULTAT
  resultatGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '2rem' },
  resultatAvant: { textAlign: 'center' },
  resultatApres: { textAlign: 'center' },
  resultatLabel: { fontSize: '9px', letterSpacing: '0.25em', color: '#999', marginBottom: '0.75rem' },
  resultatImgSmall: { width: '100%', maxHeight: '500px', objectFit: 'cover', objectPosition: 'top', border: '1px solid #e5e5e5', display: 'block' },
  resultatWrap: { position: 'relative' },
  resultatImg: { width: '100%', maxHeight: '600px', objectFit: 'contain', background: '#f9f9f9', display: 'block', border: '1px solid #e5e5e5' },
  resultatBadge: { position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '0.4rem 0.85rem', fontSize: '9px', letterSpacing: '0.2em' },

  // CTA
  ctaWrap: { textAlign: 'center' },
  ctaText: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', marginBottom: '2rem', lineHeight: 1.5, color: '#000' },
  btnRDV: { display: 'inline-block', padding: '1.25rem 3rem', background: '#000', color: '#fff', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '1rem', lineHeight: 1.8 },
  btnRDVSub: { fontSize: '9px', opacity: 0.7, letterSpacing: '0.1em' },
  btnReset: { display: 'block', width: '100%', padding: '0.85rem', background: '#fff', border: '1px solid #e5e5e5', color: '#999', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '0.75rem', fontFamily: "'Montserrat', sans-serif" },

  // FOOTER
  footer: { borderTop: '1px solid #e5e5e5', textAlign: 'center', padding: '3rem 1rem' },
  footerLogo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', letterSpacing: '0.35em', marginBottom: '0.75rem' },
  footerCities: { fontSize: '10px', letterSpacing: '0.2em', color: '#999', marginBottom: '0.5rem' },
  footerSub: { fontSize: '10px', color: '#bbb', letterSpacing: '0.1em' },
  previewActions: { display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' },
  btnPreviewChange: { flex: 1, padding: '0.85rem 1rem', background: '#fff', border: '1px solid #000', color: '#000', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", borderRadius: '2px' },
  btnPreviewCamera: { flex: 1, padding: '0.85rem 1rem', background: '#000', border: 'none', color: '#fff', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", borderRadius: '2px' },
}
