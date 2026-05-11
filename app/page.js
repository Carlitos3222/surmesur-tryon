'use client'

import { useState, useRef } from 'react'

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
  const fileInputRef = useRef(null)

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
            Uploadez votre photo. Choisissez votre complet.<br />
            Notre IA vous habille en 30 secondes.
          </p>
          <p style={s.heroSubEn}>
            Upload your photo. Choose your suit. Our AI dresses you in 30 seconds.
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

        {/* STEP 1 */}
        <section style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionNum}>01</span>
            <div>
              <h2 style={s.sectionTitle}>Votre photo <span style={s.sectionTitleEn}>/ Your photo</span></h2>
              <p style={s.sectionSub}>Photo debout, fond neutre de préférence · Standing photo, neutral background preferred</p>
            </div>
          </div>

          <div
            style={{
              ...s.uploadZone,
              borderColor: photoClientPreview ? '#000' : '#ddd',
              background: photoClientPreview ? '#f9f9f9' : '#fff',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoClientPreview ? (
              <div style={s.previewWrap}>
                <img src={photoClientPreview} alt="Votre photo" style={s.previewImg} />
                <div style={s.previewOverlay}>
                  <span style={s.previewOverlayText}>CHANGER · CHANGE</span>
                </div>
              </div>
            ) : (
              <div style={s.uploadPlaceholder}>
                <div style={s.uploadArrow}>↑</div>
                <p style={s.uploadText}>Cliquez pour uploader votre photo</p>
                <p style={s.uploadTextEn}>Click to upload your photo</p>
                <p style={s.uploadMeta}>JPG, PNG · Max 10MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </div>
        </section>

        {/* STEP 2 */}
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

        {/* STEP 3 */}
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

            {erreur && (
              <div style={s.erreur}>⚠ {erreur}</div>
            )}

            <button
              onClick={handleGenerer}
              disabled={chargement}
              style={{ ...s.btnGenerer, opacity: chargement ? 0.6 : 1 }}
            >
              {chargement
                ? 'Génération en cours... · Generating...'
                : 'VOIR COMMENT ÇA ME VA · SEE HOW IT FITS →'
              }
            </button>

            {chargement && (
              <p style={s.loadingText}>
                Notre IA analyse votre silhouette et adapte le complet à votre morphologie.<br />
                <em>Our AI is tailoring the suit to your exact body shape. Please wait 30–60 seconds.</em>
              </p>
            )}
          </section>
        )}

        {/* STEP 4 */}
        {resultat && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionNum}>04</span>
              <div>
                <h2 style={s.sectionTitle}>Votre look Surmesur <span style={s.sectionTitleEn}>/ Your Surmesur look</span></h2>
                <p style={s.sectionSub}>Taillé sur mesure pour vous · Custom tailored for you</p>
              </div>
            </div>

            <div style={s.resultatWrap}>
              <img src={resultat} alt="Votre look" style={s.resultatImg} />
              <div style={s.resultatBadge}>AI GENERATED · IA GÉNÉRÉE</div>
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
        <div style={s.footerLine} />
        <p style={s.footerLogo}>SURMESUR</p>
        <p style={s.footerCities}>MTL · TOR · VAN · OTT · PIТ · MEX</p>
        <p style={s.footerSub}>Custom Clothing Made To Be Lived In · B Corp Certified</p>
      </footer>
    </main>
  )
}

const s = {
  main: { minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 },
  topBar: { background: '#000', color: '#fff', textAlign: 'center', padding: '8px 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  topBarText: { fontSize: '10px', letterSpacing: '0.2em', fontWeight: 400 },
  topBarDot: { color: '#666', fontSize: '10px' },
  header: { borderBottom: '1px solid #e5e5e5', padding: '0 2rem' },
  headerInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' },
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 400, letterSpacing: '0.3em' },
  nav: { display: 'flex', gap: '2rem', alignItems: 'center' },
  navItem: { fontSize: '11px', letterSpacing: '0.12em', color: '#666', cursor: 'pointer' },
  navItemActive: { fontSize: '11px', letterSpacing: '0.12em', color: '#000', fontWeight: 500, cursor: 'pointer', borderBottom: '1px solid #000', paddingBottom: '2px' },
  hero: { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem, 8vw, 6rem) 2rem clamp(2rem, 4vw, 3rem)' },
  heroInner: { maxWidth: '600px' },
  heroEyebrow: { fontSize: '10px', letterSpacing: '0.25em', color: '#999', marginBottom: '1.5rem' },
  heroTitre: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '1.5rem', color: '#000' },
  heroEm: { fontStyle: 'italic' },
  heroSub: { fontSize: '14px', color: '#444', lineHeight: 1.7, marginBottom: '0.5rem' },
  heroSubEn: { fontSize: '12px', color: '#999', fontStyle: 'italic', lineHeight: 1.7 },
  heroLine: { height: '1px', background: '#e5e5e5', marginTop: '3rem' },
  progress: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center' },
  progressItem: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  progressDot: { width: '24px', height: '24px', borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  progressLabel: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  progressLine: { width: 'clamp(1rem, 5vw, 4rem)', height: '1px', margin: '0 0.5rem' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' },
  section: { marginBottom: '4rem', paddingTop: '2rem', borderTop: '1px solid #f0f0f0' },
  sectionHead: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' },
  sectionNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: '3.5rem', fontWeight: 300, color: '#e5e5e5', lineHeight: 1, flexShrink: 0 },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, marginBottom: '0.5rem' },
  sectionTitleEn: { fontStyle: 'italic', color: '#999', fontSize: '0.75em' },
  sectionSub: { fontSize: '11px', color: '#999', letterSpacing: '0.05em' },
  uploadZone: { border: '1px dashed', borderRadius: '2px', minHeight: '300px', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.2s' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '2rem', textAlign: 'center' },
  uploadArrow: { fontSize: '2rem', marginBottom: '1rem', color: '#000' },
  uploadText: { fontSize: '14px', color: '#000', marginBottom: '0.25rem' },
  uploadTextEn: { fontSize: '12px', color: '#999', fontStyle: 'italic', marginBottom: '0.5rem' },
  uploadMeta: { fontSize: '11px', color: '#bbb' },
  previewWrap: { position: 'relative' },
  previewImg: { width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' },
  previewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.75rem', textAlign: 'center' },
  previewOverlayText: { fontSize: '10px', color: '#fff', letterSpacing: '0.2em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: '#e5e5e5', border: '1px solid #e5e5e5' },
  card: { background: '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  cardImgWrap: { height: '380px', overflow: 'hidden', position: 'relative', background: '#f9f9f9' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform 0.4s ease' },
  cardCheck: { position: 'absolute', top: '1rem', right: '1rem', width: '28px', height: '28px', background: '#000', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 },
  cardInfo: { padding: '1rem' },
  cardNom: { fontSize: '13px', fontWeight: 500, color: '#000', marginBottom: '2px' },
  cardNomEn: { fontSize: '11px', color: '#999', fontStyle: 'italic', marginBottom: '0.5rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardDesc: { fontSize: '10px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' },
  cardPrix: { fontSize: '13px', fontWeight: 500, color: '#000' },
  resume: { display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', background: '#f9f9f9', border: '1px solid #e5e5e5', marginBottom: '2rem', flexWrap: 'wrap' },
  resumeItem: { textAlign: 'center', flex: 1, minWidth: '120px' },
  resumePhoto: { width: '100px', height: '120px', objectFit: 'cover', objectPosition: 'top', display: 'block', margin: '0 auto 0.5rem', border: '1px solid #e5e5e5' },
  resumeLabel: { fontSize: '11px', color: '#666' },
  resumePlus: { fontSize: '1.5rem', color: '#ccc', flexShrink: 0 },
  erreur: { background: '#fff5f5', border: '1px solid #ffcccc', padding: '1rem', marginBottom: '1.5rem', fontSize: '13px', color: '#cc0000', borderRadius: '2px' },
  btnGenerer: { width: '100%', padding: '1.25rem', background: '#000', color: '#fff', border: 'none', fontSize: '12px', letterSpacing: '0.15em', cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: "'Montserrat', sans-serif", fontWeight: 400 },
  loadingText: { textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '1.25rem', lineHeight: 1.7 },
  resultatWrap: { position: 'relative', marginBottom: '2rem', border: '1px solid #e5e5e5' },
  resultatImg: { width: '100%', maxHeight: '700px', objectFit: 'contain', background: '#f9f9f9', display: 'block' },
  resultatBadge: { position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '0.4rem 0.85rem', fontSize: '9px', letterSpacing: '0.2em' },
  ctaWrap: { textAlign: 'center' },
  ctaText: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', marginBottom: '2rem', lineHeight: 1.5, color: '#000' },
  btnRDV: { display: 'inline-block', padding: '1.25rem 3rem', background: '#000', color: '#fff', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '1rem', lineHeight: 1.8 },
  btnRDVSub: { fontSize: '9px', opacity: 0.7, letterSpacing: '0.1em' },
  btnReset: { display: 'block', width: '100%', padding: '0.85rem', background: '#fff', border: '1px solid #e5e5e5', color: '#999', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '0.75rem', fontFamily: "'Montserrat', sans-serif' " },
  footer: { borderTop: '1px solid #e5e5e5', textAlign: 'center', padding: '3rem 1rem' },
  footerLine: { display: 'none' },
  footerLogo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', letterSpacing: '0.35em', marginBottom: '0.75rem' },
  footerCities: { fontSize: '10px', letterSpacing: '0.2em', color: '#999', marginBottom: '0.5rem' },
  footerSub: { fontSize: '10px', color: '#bbb', letterSpacing: '0.1em' },
}
