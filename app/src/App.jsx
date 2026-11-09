import { useState, useEffect } from 'react'
import {
  getDestinatii,
  postDestinatie,
  patchVizitat,
  deleteDestinatie
} from './api/destinatii.js'
import { getNevizitate, totalZile } from './utils/destinatii.js'

import Rezumat from './components/Rezumat.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import Cautare from './components/Cautare.jsx'
import './App.css'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [cautare, setCautare] = useState('')
  const [seTrimite, setSeTrimite] = useState(false)

  useEffect(() => {
    async function incarca() {
      try {
        const date = await getDestinatii()
        setDestinatii(date)
      } catch (err) {
        setEroare(err.message)
      } finally {
        setIncarcare(false)
      }
    }
    incarca()
  }, [])

  async function handleToggle(id) {
    const tinta = destinatii.find((d) => d.id === id)
    if (!tinta) return
    try {
      const salvata = await patchVizitat(id, !tinta.vizitat)
      setDestinatii((curent) =>
        curent.map((d) => (d.id === id ? salvata : d))
      )
    } catch (err) {
      alert(`Nu s-a putut schimba starea: ${err.message}`)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDestinatie(id)
      setDestinatii((curent) => curent.filter((d) => d.id !== id))
    } catch (err) {
      alert(`Nu s-a putut șterge destinația: ${err.message}`)
    }
  }

  async function handleAdd(nouaDestinatie) {
    setSeTrimite(true)
    try {
      const salvata = await postDestinatie(nouaDestinatie)
      setDestinatii((curent) => [...curent, salvata])
    } catch (err) {
      alert(`Nu s-a putut adăuga: ${err.message}`)
    } finally {
      setSeTrimite(false)
    }
  }

  const textCautare = cautare.trim().toLowerCase()
  const afisate = destinatii.filter(
    (d) =>
      d.oras.toLowerCase().includes(textCautare) ||
      d.tara.toLowerCase().includes(textCautare)
  )

  const total = destinatii.length
  const nevizitate = getNevizitate(destinatii).length
  const zile = totalZile(getNevizitate(destinatii))

  return (
    <main>
      <h1>City Explorer</h1>

      {incarcare && <p className="stare">Se încarcă destinațiile...</p>}
      {eroare && <p className="stare eroare">Nu am putut încărca datele: {eroare}</p>}

      {!incarcare && !eroare && (
        <>
          <Rezumat total={total} nevizitate={nevizitate} zile={zile} />
          <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
          <Cautare valoare={cautare} onChange={setCautare} />

          {destinatii.length === 0 ? (
            <p className="gol">Nu există nicio destinație. Adaugă prima din formular.</p>
          ) : afisate.length === 0 ? (
            <p className="gol">Niciun rezultat pentru „{cautare}”.</p>
          ) : (
            <ListaDestinatii
              destinatii={afisate}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </main>
  )
}