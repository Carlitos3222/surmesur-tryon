'use client'

import { useState, useRef } from 'react'

const TENUES = [
  {
    id: 1,
    nom: 'Complet Navy Double-Breasted',
    nom_en: 'Navy Double-Breasted Suit',
    categorie: 'one-pieces',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    description: 'Laine fine · Coupe italienne',
  },
  {
    id: 2,
    nom: 'Veston Tweed Structuré',
    nom_en: 'Structured Tweed Blazer',
    categorie: 'tops',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    description: 'Tweed britannique · Revers cranté',
  },
  {
    id: 3,
    nom: 'Tailleur Femme Rouge',
    nom_en: 'Women\'s Red Power Suit',
    categorie: 'one-pieces',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5c5e?w=400&q=80',
    description: 'Laine stretch · Coupe architecturale',
  },
  {
    id: 4,
    nom: 'Manteau Camel Premium',
    nom_en: 'Premium Camel Overcoat',
    categorie: 'tops',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    description: 'Cachemire · Longueur mi-cuisse',
  },
  {
    id: 5,
    nom: 'Complet Bordeaux Sur Mesure',
    nom_en: 'Custom Bordeaux Suit',
    categorie: 'one-pieces',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80',
    description: 'Laine italienne · Monopièce',
  },
  {
    id: 6,
    nom: 'Veston Blanc Cérémonie',
    nom_en: 'White Ceremony Blazer',
    categorie: 'tops',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80',
    description: 'Lin premium · Mariage & gala',
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
      // Télécharger l'image de la tenue
      const tenueResponse = await fetch(tenueSelectionnee.image)
      const tenueBlob = await tenueResponse.blob()
      const tenueFile = new File([tenueBlob], 'tenue.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('model_image', photoClient)
      formData.append('garment_image', tenueFile)
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
      setErreur('Connexion impossible. Vérifiez votre connexion internet.')
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
    <main style={styles.main}>
      {/* LIGNE DÉCORATIVE DORÉE */}
      <div style={styles.ligneOr} />

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>SURMESUR</div>
          <div style={styles.logoSub}>ESSAYAGE VIRTUEL · VIRTUAL TRY-ON</div>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <p style={styles.heroEyebrow}>Technologie IA exclusive</p>
        <h1 style={styles.heroTitre}>
          Essayez nos tenues.<br />
          <em style={styles.heroTitreEm}>Sur vous.</em>
        </h1>
        <p style={styles.heroSous}>
          Uploadez votre photo et découvrez comment chaque pièce Surmesur<br />
          transforme votre silhouette — avant même votre rendez-vous.
        </p>
        <p style={styles.heroSousEn}>
          Upload your photo and see how each Surmesur piece transforms your look.
        </p>
      </section>

      {/* ÉTAPES */}
      <div style={styles.etapesContainer}>
        {[
          { num: 1, label: 'Votre photo', label_en: 'Your photo' },
          { num: 2, label: 'Choisir la tenue', label_en: 'Choose outfit' },
          { num: 3, label: 'Générer', label_en: 'Generate' },
          { num: 4, label: 'Résultat', label_en: 'Result' },
        ].map((e) => (
          <div key={e.num} style={styles.etapeItem}>
            <div style={{
              ...styles.etapeNum,
              background: etape >= e.num ? 'var(--or)' : 'transparent',
              color: etape >= e.num ? 'var(--noir)' : 'var(--gris)',
              border: etape >= e.num ? 'none' : '1px solid var(--gris)',
            }}>
              {e.num}
            </div>
            <span style={{
              ...styles.etapeLabel,
              color: etape >= e.num ? 'var(--creme)' : 'var(--gris)',
            }}>
              {e.label}
            </span>
          </div>
        ))}
      </div>

      {/* SECTION PRINCIPALE */}
      <div style={styles.contenu}>

        {/* ÉTAPE 1 — UPLOAD PHOTO */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNum}>01</div>
            <div>
              <h2 style={styles.sectionTitre}>Votre photo</h2>
              <p style={styles.sectionSous}>Uploadez une photo de vous, debout, fond simple de préférence</p>
            </div>
          </div>

          <div
            style={{
              ...styles.uploadZone,
              borderColor: photoClientPreview ? 'var(--or)' : 'rgba(201,169,110,0.3)',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoClientPreview ? (
              <div style={styles.photoPreviewContainer}>
                <img src={photoClientPreview} alt="Votre photo" style={styles.photoPreview} />
                <div style={styles.photoOverlay}>
                  <span style={styles.photoOverlayText}>Changer la photo</span>
                </div>
              </div>
            ) : (
              <div style={styles.uploadPlaceholder}>
                <div style={styles.uploadIcone}>↑</div>
                <p style={styles.uploadTexte}>Cliquez pour uploader votre photo</p>
                <p style={styles.uploadSous}>JPG, PNG · Max 10MB</p>
                <p style={styles.uploadSousEn}>Click to upload your photo</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>
        </section>

        {/* ÉTAPE 2 — CHOISIR TENUE */}
        {etape >= 2 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>02</div>
              <div>
                <h2 style={styles.sectionTitre}>Choisissez votre tenue</h2>
                <p style={styles.sectionSous}>Sélectionnez une pièce de la collection Surmesur</p>
              </div>
            </div>

            <div style={styles.tenuesGrille}>
              {TENUES.map((tenue) => (
                <div
                  key={tenue.id}
                  style={{
                    ...styles.tenueCard,
                    border: tenueSelectionnee?.id === tenue.id
                      ? '2px solid var(--or)'
                      : '1px solid rgba(201,169,110,0.15)',
                    background: tenueSelectionnee?.id === tenue.id
                      ? 'rgba(201,169,110,0.08)'
                      : 'rgba(255,255,255,0.02)',
                  }}
                  onClick={() => handleTenueSelect(tenue)}
                >
                  <div style={styles.tenueImageContainer}>
                    <img
                      src={tenue.image}
                      alt={tenue.nom}
                      style={styles.tenueImage}
                    />
                    {tenueSelectionnee?.id === tenue.id && (
                      <div style={styles.tenueCheck}>✓</div>
                    )}
                  </div>
                  <div style={styles.tenueInfo}>
                    <p style={styles.tenueNom}>{tenue.nom}</p>
                    <p style={styles.tenueDesc}>{tenue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ÉTAPE 3 — GÉNÉRER */}
        {etape >= 3 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>03</div>
              <div>
                <h2 style={styles.sectionTitre}>Générer votre look</h2>
                <p style={styles.sectionSous}>L'IA va créer votre essayage virtuel en 30 secondes</p>
              </div>
            </div>

            <div style={styles.resumeContainer}>
              <div style={styles.resumeItem}>
                {photoClientPreview && (
                  <img src={photoClientPreview} alt="Vous" style={styles.resumePhoto} />
                )}
                <p style={styles.resumeLabel}>Votre photo</p>
              </div>
              <div style={styles.resumePlus}>+</div>
              <div style={styles.resumeItem}>
                {tenueSelectionnee && (
                  <img src={tenueSelectionnee.image} alt={tenueSelectionnee.nom} style={styles.resumePhoto} />
                )}
                <p style={styles.resumeLabel}>{tenueSelectionnee?.nom}</p>
              </div>
            </div>

            {erreur && (
              <div style={styles.erreurBox}>
                <p>⚠ {erreur}</p>
              </div>
            )}

            <button
              onClick={handleGenerer}
              disabled={chargement}
              style={{
                ...styles.btnGenerer,
                opacity: chargement ? 0.7 : 1,
                cursor: chargement ? 'not-allowed' : 'pointer',
              }}
            >
              {chargement ? (
                <span style={styles.btnChargement}>
                  <span style={styles.spinner} />
                  Génération en cours... / Generating...
                </span>
              ) : (
                'Voir comment ça me va → See how it fits'
              )}
            </button>

            {chargement && (
              <p style={styles.chargementInfo}>
                Notre IA analyse votre silhouette et adapte la tenue à votre morphologie.<br />
                <em>Our AI is analyzing your silhouette and adapting the outfit to your body.</em>
              </p>
            )}
          </section>
        )}

        {/* ÉTAPE 4 — RÉSULTAT */}
        {resultat && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNum}>04</div>
              <div>
                <h2 style={styles.sectionTitre}>Votre look Surmesur</h2>
                <p style={styles.sectionSous}>Taillé pour vous · Made to fit you</p>
              </div>
            </div>

            <div style={styles.resultatContainer}>
              <img src={resultat} alt="Votre look Surmesur" style={styles.resultatImage} />
              <div style={styles.resultatBadge}>Généré par IA · AI Generated</div>
            </div>

            <div style={styles.ctaContainer}>
              <p style={styles.ctaTexte}>
                Prêt à le faire tailler à vos mesures exactes ?<br />
                <em>Ready to have it tailored to your exact measurements?</em>
              </p>
              <a
                href="https://www.surmesur.com"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.btnRDV}
              >
                Prendre mon rendez-vous gratuit
                <br />
                <span style={styles.btnRDVSous}>Book my free appointment</span>
              </a>
              <button onClick={recommencer} style={styles.btnRecommencer}>
                Essayer une autre tenue · Try another outfit
              </button>
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLigne} />
        <p style={styles.footerTexte}>
          SURMESUR · MTL · TOR · VAN · OTT · PIT · MEX
        </p>
        <p style={styles.footerSous}>
          Custom Clothing Made To Be Lived In · B Corp Certified
        </p>
      </footer>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0A0A0A 0%, #111108 100%)',
    position: 'relative',
  },
  ligneOr: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
  },
  header: {
    padding: '2rem 2rem 1rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(201,169,110,0.1)',
  },
  logoContainer: {},
  logo: {
    fontFamily: 'var(--font-titre)',
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: 300,
    letterSpacing: '0.4em',
    color: '#F5F0E8',
  },
  logoSub: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.6rem',
    letterSpacing: '0.3em',
    color: '#C9A96E',
    marginTop: '0.25rem',
  },
  hero: {
    textAlign: 'center',
    padding: 'clamp(2rem, 6vw, 4rem) 1.5rem clamp(1.5rem, 4vw, 2.5rem)',
    maxWidth: '700px',
    margin: '0 auto',
  },
  heroEyebrow: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.65rem',
    letterSpacing: '0.25em',
    color: '#C9A96E',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  heroTitre: {
    fontFamily: 'var(--font-titre)',
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontWeight: 300,
    lineHeight: 1.1,
    color: '#F5F0E8',
    marginBottom: '1.5rem',
  },
  heroTitreEm: {
    fontStyle: 'italic',
    color: '#C9A96E',
  },
  heroSous: {
    fontFamily: 'var(--font-corps)',
    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
    fontWeight: 300,
    color: '#888880',
    lineHeight: 1.7,
    marginBottom: '0.5rem',
  },
  heroSousEn: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.75rem',
    color: 'rgba(136,136,128,0.6)',
    fontStyle: 'italic',
  },
  etapesContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(1rem, 4vw, 3rem)',
    padding: '1.5rem 1rem',
    borderTop: '1px solid rgba(201,169,110,0.1)',
    borderBottom: '1px solid rgba(201,169,110,0.1)',
    flexWrap: 'wrap',
  },
  etapeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  etapeNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
  },
  etapeLabel: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    transition: 'color 0.3s ease',
  },
  contenu: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
  },
  section: {
    marginBottom: 'clamp(2rem, 6vw, 4rem)',
    animation: 'fadeUp 0.6s ease both',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  },
  sectionNum: {
    fontFamily: 'var(--font-titre)',
    fontSize: '3rem',
    fontWeight: 300,
    color: 'rgba(201,169,110,0.3)',
    lineHeight: 1,
    flexShrink: 0,
  },
  sectionTitre: {
    fontFamily: 'var(--font-titre)',
    fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    fontWeight: 400,
    color: '#F5F0E8',
    marginBottom: '0.25rem',
  },
  sectionSous: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.75rem',
    color: '#888880',
    letterSpacing: '0.05em',
  },
  uploadZone: {
    border: '1px dashed',
    borderRadius: '2px',
    minHeight: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadPlaceholder: {
    textAlign: 'center',
    padding: '2rem',
  },
  uploadIcone: {
    fontSize: '2.5rem',
    color: '#C9A96E',
    marginBottom: '1rem',
    display: 'block',
  },
  uploadTexte: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.9rem',
    color: '#F5F0E8',
    marginBottom: '0.5rem',
  },
  uploadSous: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.7rem',
    color: '#888880',
    marginBottom: '0.25rem',
  },
  uploadSousEn: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.65rem',
    color: 'rgba(136,136,128,0.5)',
    fontStyle: 'italic',
  },
  photoPreviewContainer: {
    width: '100%',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    display: 'block',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(10,10,10,0.8)',
    padding: '0.75rem',
    textAlign: 'center',
  },
  photoOverlayText: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.7rem',
    color: '#C9A96E',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  tenuesGrille: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  tenueCard: {
    borderRadius: '2px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  tenueImageContainer: {
    position: 'relative',
    height: '280px',
    overflow: 'hidden',
  },
  tenueImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  tenueCheck: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    width: '28px',
    height: '28px',
    background: '#C9A96E',
    color: '#0A0A0A',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  tenueInfo: {
    padding: '0.85rem 1rem',
  },
  tenueNom: {
    fontFamily: 'var(--font-titre)',
    fontSize: '1rem',
    color: '#F5F0E8',
    marginBottom: '0.25rem',
  },
  tenueDesc: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.65rem',
    color: '#888880',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  resumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'rgba(201,169,110,0.05)',
    border: '1px solid rgba(201,169,110,0.15)',
    borderRadius: '2px',
    flexWrap: 'wrap',
  },
  resumeItem: {
    textAlign: 'center',
    flex: 1,
    minWidth: '120px',
  },
  resumePhoto: {
    width: '100px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '2px',
    marginBottom: '0.5rem',
    border: '1px solid rgba(201,169,110,0.2)',
  },
  resumeLabel: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.7rem',
    color: '#888880',
  },
  resumePlus: {
    fontFamily: 'var(--font-titre)',
    fontSize: '2rem',
    color: '#C9A96E',
    flexShrink: 0,
  },
  erreurBox: {
    background: 'rgba(180,50,50,0.1)',
    border: '1px solid rgba(180,50,50,0.3)',
    borderRadius: '2px',
    padding: '1rem',
    marginBottom: '1.5rem',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.8rem',
    color: '#ff8080',
  },
  btnGenerer: {
    width: '100%',
    padding: '1.25rem 2rem',
    background: 'linear-gradient(135deg, #C9A96E, #E8D5B0)',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '2px',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  btnChargement: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(10,10,10,0.3)',
    borderTop: '2px solid #0A0A0A',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  chargementInfo: {
    textAlign: 'center',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.75rem',
    color: '#888880',
    marginTop: '1.25rem',
    lineHeight: 1.7,
  },
  resultatContainer: {
    position: 'relative',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '2rem',
  },
  resultatImage: {
    width: '100%',
    maxHeight: '600px',
    objectFit: 'contain',
    background: '#111',
    display: 'block',
  },
  resultatBadge: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    background: 'rgba(10,10,10,0.85)',
    border: '1px solid rgba(201,169,110,0.3)',
    padding: '0.4rem 0.85rem',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.6rem',
    color: '#C9A96E',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    borderRadius: '1px',
  },
  ctaContainer: {
    textAlign: 'center',
  },
  ctaTexte: {
    fontFamily: 'var(--font-titre)',
    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
    color: '#F5F0E8',
    lineHeight: 1.5,
    marginBottom: '1.5rem',
  },
  btnRDV: {
    display: 'inline-block',
    padding: '1.25rem 2.5rem',
    background: 'transparent',
    color: '#C9A96E',
    border: '1px solid #C9A96E',
    borderRadius: '2px',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.8rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
  },
  btnRDVSous: {
    fontSize: '0.65rem',
    opacity: 0.7,
    fontWeight: 300,
  },
  btnRecommencer: {
    display: 'block',
    width: '100%',
    padding: '0.85rem',
    background: 'transparent',
    color: '#888880',
    border: '1px solid rgba(136,136,128,0.2)',
    borderRadius: '2px',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.75rem',
  },
  footer: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
    marginTop: '2rem',
  },
  footerLigne: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)',
    marginBottom: '1.5rem',
  },
  footerTexte: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.7rem',
    letterSpacing: '0.25em',
    color: '#888880',
    marginBottom: '0.5rem',
  },
  footerSous: {
    fontFamily: 'var(--font-corps)',
    fontSize: '0.6rem',
    color: 'rgba(136,136,128,0.5)',
    letterSpacing: '0.1em',
  },
}
