'use client'

import { useState, useRef, useCallback } from 'react'

const BASE_URL = 'https://surmesur-tryon.vercel.app'

const TENUES = [
  { id: 1, nom: 'Oil Blue Wool Suit', nom_fr: 'Complet Bleu Pétrole', categorie: 'one-pieces', image: `${BASE_URL}/suit1.png`, prix: '$1,200', description: '3-Piece · Pure Wool' },
  { id: 2, nom: 'Charcoal Wool Suit', nom_fr: 'Complet Charbon', categorie: 'one-pieces', image: `${BASE_URL}/suit2.png`, prix: '$1,140', description: '3-Piece · Plain Wool' },
  { id: 3, nom: 'Prince of Wales Flannel', nom_fr: 'Flanelle Prince de Galles', categorie: 'one-pieces', image: `${BASE_URL}/suit3.png`, prix: '$1,165', description: '3-Piece · Flannel' },
  { id: 4, nom: 'Grey Herringbone Suit', nom_fr: 'Complet Gris Chevron', categorie: 'one-pieces', image: `${BASE_URL}/suit4.png`, prix: '$1,180', description: '3-Piece · Herringbone' },
  { id: 5, nom: 'Natural Linen Suit', nom_fr: 'Complet Lin Naturel', categorie: 'one-pieces', image: `${BASE_URL}/suit5.png`, prix: '$1,100', description: '3-Piece · Premium Linen' },
  { id: 6, nom: 'Dark Brown Flannel Suit', nom_fr: 'Complet Brun Foncé', categorie: 'one-pieces', image: `${BASE_URL}/suit6.png`, prix: '$1,220', description: '3-Piece · Wool Flannel' },
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
  const [hoveredCard, setHoveredCard] = useState(null)

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
      const response = await fetch('/api/tryon', { method: 'POST', body: formData })
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Montserrat:wght@300;400;500&display=swap');
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
        @keyframes goldPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .fade-up { animation: fadeUp 0.8s ease both; }
        .fade-up-1 { animation: fadeUp 0.8s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.8s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.8s 0.4s ease both; }

        .suit-card { transition: all 0.4s ease; }
        .suit-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        .suit-card:hover .suit-img { transform: scale(1.04); }
        .suit-img { transition: transform 0.6s ease; }

        .btn-generate { transition: all 0.3s ease; }
        .btn-generate:hover:not(:disabled) { background: #111 !important; box-shadow: inset 0 0 0 1px #C9A96E; letter-spacing: 0.2em !important; }

        .gold-shimmer {
          background: linear-gradient(90deg, #C9A96E 0%, #E8D5B0 40%, #C9A96E 60%, #9A7A45 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .nav-item { transition: color 0.2s; cursor: pointer; }
        .nav-item:hover { color: #000 !important; }

        .progress-dot { transition: all 0.4s ease; }
        .section-reveal { animation: fadeUp 0.6s ease both; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #fafafa; }
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
      <header style={s.header} className="fade-up">
        <div style={s.headerInner}>
          <div>
            <div style={s.logo}>SURMESUR</div>
            <div style={s.logoGoldLine} />
          </div>
          <nav style={s.nav}>
            <span style={s.navItem} className="nav-item">Collections</span>
            <span style={s.navItem} className="nav-item">Nos Boutiques</span>
            <span style={s.navItem} className="nav-item">Mariages</span>
            <span style={{...s.navItem, ...s.navItemActive}} className="nav-item">Virtual Try-On ✦</span>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroInner}>
          <p style={s.heroEyebrow} className="fade-up">NOUVELLE EXPÉRIENCE EXCLUSIVE · NEW EXCLUSIVE EXPERIENCE</p>
          <h1 style={s.heroTitre} className="fade-up-1">
            Essayez nos{' '}
            <em className="gold-shimmer">collections</em>
            <br />sans sortir de chez vous.
          </h1>
          <p style={s.heroSub} className="fade-up-2">
            Uploadez votre photo ou prenez-en une en direct.<br />
            Notre IA vous habille en 30 secondes — avant même votre rendez-vous.
          </p>
          <p style={s.heroSubEn} className="fade-up-3">
            Try our collections without leaving home. Upload your photo or take one live. Our AI dresses you in 30 seconds.
          </p>
          <div style={s.heroStats} className="fade-up-4">
            <div style={s.heroStat}>
              <span style={s.heroStatNum}>30s</span>
              <span style={s.heroStatLabel}>Génération · Generation</span>
            </div>
            <div style={s.heroStatDivider} />
            <div style={s.heroStat}>
              <span style={s.heroStatNum}>6</span>
              <span style={s.heroStatLabel}>Collections disponibles</span>
            </div>
            <div style={s.heroStatDivider} />
            <div style={s.heroStat}>
              <span style={s.heroStatNum}>100%</span>
              <span style={s.heroStatLabel}>Sur mesure · Custom</span>
            </div>
          </div>
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
            <div className="progress-dot" style={{
              ...s.progressDot,
              background: etape >= e.n ? '#000' : 'transparent',
              borderColor: etape >= e.n ? '#000' : '#ddd',
              boxShadow: etape === e.n ? '0 0 0 3px rgba(201,169,110,0.2)' : 'none',
            }}>
              <span style={{ color: etape >= e.n ? '#fff' : '#bbb', fontSize: '11px', fontWeight: 500 }}>{e.n}</span>
            </div>
            <span style={{ ...s.progressLabel, color: etape >= e.n ? '#000' : '#ccc', fontWeight: etape === e.n ? 500 : 300 }}>{e.label}</span>
            {i < 3 && <div style={{ ...s.progressLine, background: etape > e.n ? 'linear-gradient(90deg, #000, #C9A96E)' : '#eee' }} />}
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        {/* STEP 1 */}
        <section style={s.section} className="section-reveal">
          <div style={s.sectionHead}>
            <span style={s.sectionNum}>01</span>
            <div>
              <h2 style={s.sectionTitle}>Votre photo <span style={s.sectionTitleEn}>/ Your photo</span></h2>
              <p style={s.sectionSub}>Prenez une photo en direct ou uploadez depuis votre galerie · Take a live photo or upload from your gallery</p>
            </div>
          </div>

          {/* CAMERA */}
          {cameraActive && (
            <div style={s.cameraContainer}>
              {!photoConfirmation ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted style={s.cameraVideo} />
                  <div style={s.cameraGuide}><div style={s.cameraGuideInner} /></div>
                  <p style={s.cameraHint}>Placez-vous debout, corps entier visible · Stand upright, full body visible</p>
                  <p style={s.cameraTimer}>⏱ Appuyez sur le bouton — vous aurez 3 secondes pour vous placer · Press the button — you'll have 3 seconds to get in position</p>
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

          {/* PHOTO PREVIEW */}
          {!cameraActive && photoClientPreview && (
            <div style={s.previewWrap}>
              <img src={photoClientPreview} alt="Votre photo" style={s.previewImg} />
              <div style={s.previewBadge}>✓ Photo sélectionnée</div>
            </div>
          )}

          {/* TOUJOURS VISIBLE — LES DEUX BOUTONS */}
          {!cameraActive && (
            <div style={s.uploadOptions}>
              <button onClick={() => fileInputRef.current?.click()} style={photoClientPreview ? s.btnGalleryActive : s.btnGallery}>
                <span style={s.btnIcon}>🖼</span>
                <div>
                  <p style={s.btnLabel}>{photoClientPreview ? 'Changer la photo · Change photo' : 'Choisir dans ma galerie'}</p>
                  <p style={s.btnLabelEn}>{photoClientPreview ? '' : 'Choose from gallery'}</p>
                </div>
              </button>
              <div style={s.uploadDivider}>
                <div style={s.uploadDividerLine} />
                <span style={s.uploadDividerText}>ou · or</span>
                <div style={s.uploadDividerLine} />
              </div>
              <button onClick={() => { setPhotoClient(null); setPhotoClientPreview(null); startCamera() }} style={s.btnCamera}>
                <span style={s.btnIcon}>📷</span>
                <div>
                  <p style={s.btnLabel}>Prendre une photo en direct</p>
                  <p style={s.btnLabelEn}>Take a live photo</p>
                </div>
              </button>
              {!photoClientPreview && (
                <p style={s.uploadTip}>💡 Photo debout, corps entier, fond simple · Standing, full body, simple background</p>
              )}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </section>

        {/* STEP 2 */}
        {etape >= 2 && (
          <section style={s.section} className="section-reveal">
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>02</span>
              <div>
                <h2 style={s.sectionTitle}>Choisissez votre complet <span style={s.sectionTitleEn}>/ Choose your suit</span></h2>
                <p style={s.sectionSub}>Collection exclusive · Chaque pièce taillée sur mesure pour vous</p>
              </div>
            </div>
            <div style={s.grid}>
              {TENUES.map((t) => (
                <div
                  key={t.id}
                  className="suit-card"
                  style={{
                    ...s.card,
                    border: tenueSelectionnee?.id === t.id ? '2px solid #C9A96E' : '1px solid #e8e8e8',
                    background: tenueSelectionnee?.id === t.id ? '#fdfbf7' : '#fff',
                  }}
                  onClick={() => handleTenueSelect(t)}
                >
                  <div style={s.cardImgWrap}>
                    <img src={t.image} alt={t.nom} style={s.cardImg} className="suit-img" />
                    {tenueSelectionnee?.id === t.id && (
                      <div style={s.cardCheck}>✓</div>
                    )}
                    <div style={s.cardImgOverlay} />
                  </div>
                  <div style={s.cardInfo}>
                    <p style={s.cardNom}>{t.nom_fr}</p>
                    <p style={s.cardNomEn}>{t.nom}</p>
                    <div style={s.cardFooter}>
                      <span style={s.cardDesc}>{t.description}</span>
                      <span style={tenueSelectionnee?.id === t.id ? s.cardPrixActive : s.cardPrix}>{t.prix}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STEP 3 */}
        {etape >= 3 && (
          <section style={s.section} className="section-reveal">
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>03</span>
              <div>
                <h2 style={s.sectionTitle}>Générer votre look <span style={s.sectionTitleEn}>/ Generate your look</span></h2>
                <p style={s.sectionSub}>Notre IA analyse votre silhouette et adapte le complet à votre morphologie</p>
              </div>
            </div>

            <div style={s.resume}>
              <div style={s.resumeItem}>
                {photoClientPreview && <img src={photoClientPreview} alt="Vous" style={s.resumePhoto} />}
                <p style={s.resumeLabel}>Votre photo</p>
              </div>
              <div style={s.resumePlus}>
                <span style={s.resumePlusIcon}>+</span>
              </div>
              <div style={s.resumeItem}>
                {tenueSelectionnee && <img src={tenueSelectionnee.image} alt={tenueSelectionnee.nom} style={s.resumePhoto} />}
                <p style={s.resumeLabel}>{tenueSelectionnee?.nom_fr}</p>
              </div>
              <div style={s.resumeArrow}>→</div>
              <div style={s.resumeResultPlaceholder}>
                <p style={s.resumeResultText}>Votre look</p>
                <p style={s.resumeResultSub}>généré par IA</p>
              </div>
            </div>

            {erreur && <div style={s.erreur}>⚠ {erreur}</div>}

            <button onClick={handleGenerer} disabled={chargement} style={s.btnGenerer} className="btn-generate">
              {chargement ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                  <span style={s.spinner} />
                  Génération en cours... · Generating...
                </span>
              ) : (
                'VOIR COMMENT ÇA ME VA · SEE HOW IT FITS →'
              )}
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

        {/* STEP 4 */}
        {resultat && (
          <section style={s.section} className="section-reveal">
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
              <div style={s.ctaGoldLine} />
              <p style={s.ctaText}>
                Prêt à le faire tailler à vos mesures exactes ?<br />
                <em>Ready to have it made to your exact measurements?</em>
              </p>
              <a href="https://www.surmesur.com" target="_blank" rel="noopener noreferrer" style={s.btnRDV}>
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
        <div style={s.footerGoldLine} />
        <p style={s.footerLogo}>SURMESUR</p>
        <p style={s.footerCities}>MTL · TOR · VAN · OTT · PIТ · MEX</p>
        <p style={s.footerSub}>Custom Clothing Made To Be Lived In · B Corp Certified</p>
      </footer>
    </main>
  )
}

const s = {
  main: { minHeight: '100vh', background: '#FAFAF8', color: '#000', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 },
  
  topBar: { background: '#0A0A0A', color: '#888', textAlign: 'center', padding: '7px 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' },
  topBarText: { fontSize: '9px', letterSpacing: '0.22em', fontWeight: 400 },
  topBarDot: { color: '#444', fontSize: '9px' },

  header: { background: '#fff', borderBottom: '1px solid #efefef', padding: '0 2.5rem' },
  headerInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', flexWrap: 'wrap', gap: '1rem' },
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '0.38em', color: '#000' },
  logoGoldLine: { height: '1.5px', background: 'linear-gradient(90deg, #C9A96E, #E8D5B0, #C9A96E)', marginTop: '3px', width: '100%' },
  nav: { display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' },
  navItem: { fontSize: '10px', letterSpacing: '0.14em', color: '#888', textTransform: 'uppercase' },
  navItemActive: { color: '#000', fontWeight: 500, borderBottom: '1px solid #C9A96E', paddingBottom: '2px' },

  hero: { position: 'relative', maxWidth: '100%', overflow: 'hidden', background: '#fff' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)', pointerEvents: 'none' },
  heroInner: { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem, 8vw, 6rem) 2.5rem clamp(2rem, 4vw, 3rem)', position: 'relative' },
  heroEyebrow: { fontSize: '9px', letterSpacing: '0.28em', color: '#C9A96E', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 400 },
  heroTitre: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 300, lineHeight: 1.05, marginBottom: '2rem', color: '#000', maxWidth: '700px' },
  heroSub: { fontSize: 'clamp(13px, 1.5vw, 15px)', color: '#555', lineHeight: 1.8, marginBottom: '0.5rem', maxWidth: '520px' },
  heroSubEn: { fontSize: '12px', color: '#aaa', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '520px' },
  heroStats: { display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' },
  heroStat: { display: 'flex', flexDirection: 'column', gap: '4px' },
  heroStatNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: '#000', lineHeight: 1 },
  heroStatLabel: { fontSize: '9px', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' },
  heroStatDivider: { width: '1px', height: '40px', background: '#e5e5e5' },
  heroLine: { height: '1px', background: 'linear-gradient(90deg, transparent, #e5e5e5 20%, #C9A96E 50%, #e5e5e5 80%, transparent)' },

  progress: { maxWidth: '1200px', margin: '0 auto', padding: '1.75rem 2.5rem', display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '0.5rem' },
  progressItem: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  progressDot: { width: '26px', height: '26px', borderRadius: '50%', border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  progressLabel: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  progressLine: { width: 'clamp(1rem, 4vw, 4rem)', height: '1px', margin: '0 0.5rem' },

  content: { maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem 5rem' },
  section: { marginBottom: '5rem', paddingTop: '3rem', borderTop: '1px solid #f0f0f0' },
  sectionHead: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2.5rem' },
  sectionNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: '5rem', fontWeight: 300, color: '#f0ede8', lineHeight: 1, flexShrink: 0, letterSpacing: '-0.02em' },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, marginBottom: '0.4rem', letterSpacing: '0.01em' },
  sectionTitleEn: { fontStyle: 'italic', color: '#bbb', fontSize: '0.7em' },
  sectionSub: { fontSize: '11px', color: '#aaa', letterSpacing: '0.06em', lineHeight: 1.6 },

  cameraContainer: { position: 'relative', background: '#000', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' },
  cameraVideo: { width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' },
  cameraGuide: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '400px', border: '1.5px dashed rgba(201,169,110,0.6)', borderRadius: '100px', pointerEvents: 'none' },
  cameraGuideInner: { width: '100%', height: '100%' },
  cameraHint: { textAlign: 'center', color: '#fff', fontSize: '11px', padding: '0.75rem', background: 'rgba(0,0,0,0.7)', letterSpacing: '0.05em' },
  cameraTimer: { textAlign: 'center', color: '#C9A96E', fontSize: '10px', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.85)', letterSpacing: '0.08em', fontStyle: 'italic' },
  cameraControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#0A0A0A' },
  btnCameraCancel: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.6rem 1.2rem', fontSize: '11px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.1em' },
  btnCapture: { width: '68px', height: '68px', borderRadius: '50%', background: 'transparent', border: '3px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 },
  btnCaptureInner: { width: '54px', height: '54px', borderRadius: '50%', background: '#C9A96E' },
  btnCameraConfirm: { background: '#C9A96E', border: 'none', color: '#000', padding: '0.75rem 1.5rem', fontSize: '11px', cursor: 'pointer', borderRadius: '2px', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, letterSpacing: '0.1em' },

  previewWrap: { position: 'relative', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid #e8e8e8' },
  previewImg: { width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' },
  previewBadge: { position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(201,169,110,0.9)', color: '#000', padding: '0.4rem 0.85rem', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 500 },

  uploadOptions: { border: '1px solid #efefef', borderRadius: '2px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch', background: '#fff' },
  btnCamera: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#0A0A0A', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '2px', textAlign: 'left', fontFamily: "'Montserrat', sans-serif", transition: 'background 0.2s' },
  btnGallery: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', color: '#000', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '2px', textAlign: 'left', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s' },
  btnGalleryActive: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', color: '#000', border: '1px solid #C9A96E', cursor: 'pointer', borderRadius: '2px', textAlign: 'left', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s' },
  btnIcon: { fontSize: '1.4rem', flexShrink: 0 },
  btnLabel: { fontSize: '12px', fontWeight: 500, marginBottom: '2px', letterSpacing: '0.06em' },
  btnLabelEn: { fontSize: '10px', color: '#999', fontStyle: 'italic' },
  uploadDivider: { display: 'flex', alignItems: 'center', gap: '1rem' },
  uploadDividerLine: { flex: 1, height: '1px', background: '#efefef' },
  uploadDividerText: { fontSize: '10px', color: '#ccc', letterSpacing: '0.12em', whiteSpace: 'nowrap' },
  uploadTip: { fontSize: '11px', color: '#bbb', textAlign: 'center', fontStyle: 'italic', paddingTop: '0.5rem' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5px', background: '#e8e8e8', border: '1px solid #e8e8e8' },
  card: { background: '#fff', cursor: 'pointer', position: 'relative', overflow: 'hidden' },
  cardImgWrap: { height: '380px', overflow: 'hidden', position: 'relative', background: '#f7f7f5' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  cardImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, rgba(0,0,0,0.04))' },
  cardCheck: { position: 'absolute', top: '1rem', right: '1rem', width: '30px', height: '30px', background: '#C9A96E', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 },
  cardInfo: { padding: '1.1rem 1.25rem' },
  cardNom: { fontSize: '13px', fontWeight: 500, color: '#000', marginBottom: '2px', letterSpacing: '0.02em' },
  cardNomEn: { fontSize: '10px', color: '#bbb', fontStyle: 'italic', marginBottom: '0.6rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardDesc: { fontSize: '9px', color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase' },
  cardPrix: { fontSize: '13px', fontWeight: 400, color: '#666' },
  cardPrixActive: { fontSize: '13px', fontWeight: 500, color: '#C9A96E' },

  resume: { display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem', background: '#fff', border: '1px solid #efefef', marginBottom: '2rem', flexWrap: 'wrap', borderRadius: '2px' },
  resumeItem: { textAlign: 'center', flex: 1, minWidth: '90px' },
  resumePhoto: { width: '90px', height: '110px', objectFit: 'cover', objectPosition: 'top', display: 'block', margin: '0 auto 0.5rem', border: '1px solid #efefef' },
  resumeLabel: { fontSize: '10px', color: '#aaa', letterSpacing: '0.08em' },
  resumePlus: { flexShrink: 0 },
  resumePlusIcon: { fontSize: '1.25rem', color: '#ddd', display: 'block' },
  resumeArrow: { fontSize: '1.25rem', color: '#C9A96E', flexShrink: 0 },
  resumeResultPlaceholder: { flex: 1, minWidth: '90px', textAlign: 'center', padding: '1rem', border: '1px dashed #e0d5c5', borderRadius: '2px', background: '#fdfbf7' },
  resumeResultText: { fontSize: '12px', color: '#C9A96E', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', marginBottom: '2px' },
  resumeResultSub: { fontSize: '9px', color: '#ccc', letterSpacing: '0.1em' },

  erreur: { background: '#fff8f8', border: '1px solid #f5cccc', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '12px', color: '#cc3333', borderRadius: '2px', letterSpacing: '0.03em' },
  btnGenerer: { width: '100%', padding: '1.35rem', background: '#0A0A0A', color: '#fff', border: '1px solid transparent', fontSize: '11px', letterSpacing: '0.18em', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", fontWeight: 400, display: 'block' },
  spinner: { width: '14px', height: '14px', border: '1.5px solid rgba(255,255,255,0.3)', borderTop: '1.5px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 },

  loadingWrap: { marginTop: '1.5rem', textAlign: 'center' },
  loadingBar: { height: '1.5px', background: '#efefef', overflow: 'hidden', marginBottom: '1.25rem' },
  loadingBarInner: { height: '100%', background: 'linear-gradient(90deg, #C9A96E, #E8D5B0)', animation: 'loadingBar 60s ease forwards' },
  loadingText: { fontSize: '11px', color: '#aaa', lineHeight: 1.8 },

  resultatGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2.5rem' },
  resultatAvant: { textAlign: 'center' },
  resultatApres: { textAlign: 'center' },
  resultatLabel: { fontSize: '9px', letterSpacing: '0.28em', color: '#C9A96E', marginBottom: '0.85rem', fontWeight: 400 },
  resultatImgSmall: { width: '100%', maxHeight: '500px', objectFit: 'cover', objectPosition: 'top', border: '1px solid #efefef', display: 'block' },
  resultatWrap: { position: 'relative' },
  resultatImg: { width: '100%', maxHeight: '650px', objectFit: 'contain', background: '#f7f7f5', display: 'block', border: '1px solid #efefef' },
  resultatBadge: { position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(10,10,10,0.85)', color: '#C9A96E', padding: '0.4rem 0.9rem', fontSize: '8px', letterSpacing: '0.22em', fontWeight: 400 },

  ctaWrap: { textAlign: 'center', paddingTop: '1rem' },
  ctaGoldLine: { height: '1px', background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)', marginBottom: '2rem' },
  ctaText: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', marginBottom: '2rem', lineHeight: 1.5, color: '#333', fontWeight: 300 },
  btnRDV: { display: 'inline-block', padding: '1.25rem 3.5rem', background: '#0A0A0A', color: '#fff', textDecoration: 'none', fontSize: '10px', letterSpacing: '0.2em', marginBottom: '1rem', lineHeight: 2, border: '1px solid transparent', transition: 'all 0.3s' },
  btnRDVSub: { fontSize: '9px', opacity: 0.5, letterSpacing: '0.12em', display: 'block' },
  btnReset: { display: 'block', width: '100%', padding: '0.9rem', background: 'transparent', border: '1px solid #efefef', color: '#bbb', fontSize: '10px', letterSpacing: '0.14em', cursor: 'pointer', marginTop: '0.75rem', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s' },

  footer: { borderTop: '1px solid #efefef', textAlign: 'center', padding: '3.5rem 1rem', background: '#fff' },
  footerGoldLine: { height: '1px', background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)', marginBottom: '2rem', maxWidth: '200px', margin: '0 auto 2rem' },
  footerLogo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', letterSpacing: '0.38em', marginBottom: '0.75rem', fontWeight: 300 },
  footerCities: { fontSize: '9px', letterSpacing: '0.24em', color: '#bbb', marginBottom: '0.5rem' },
  footerSub: { fontSize: '9px', color: '#ccc', letterSpacing: '0.12em' },
}
