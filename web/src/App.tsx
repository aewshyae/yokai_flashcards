import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Yokai = {
  id: number
  name: string
  imageUrl: string | null
  location: string | null
  description: string | null
}

function App() {
  const [yokai, setYokai] = useState<Yokai[]>([])
  const [query, setQuery] = useState('')
  const [onlyWithImage, setOnlyWithImage] = useState(true)

  useEffect(() => {
    fetch('/yokai.json')
      .then((r) => r.json())
      .then((data: Yokai[]) => setYokai(data))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim()
    return yokai.filter((y) => {
      if (onlyWithImage && !y.imageUrl) return false
      if (!q) return true
      const hay = `${y.name} ${y.location ?? ''} ${y.description ?? ''}`
      return hay.includes(q)
    })
  }, [yokai, query, onlyWithImage])

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 16 }}>
      <h1>妖怪フラッシュカード / Yokai Flashcards</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="検索 / Search"
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={onlyWithImage}
            onChange={(e) => setOnlyWithImage(e.target.checked)}
          />
          画像ありのみ
        </label>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((y) => (
          <article key={`${y.id}-${y.name}`} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            {y.imageUrl ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img src={y.imageUrl} alt={`${y.name} image`} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: 180, display: 'grid', placeItems: 'center', background: '#f3f4f6' }}>No Image</div>
            )}
            <div style={{ padding: 12 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>{y.name}</h2>
              {y.location && <p style={{ margin: '6px 0', color: '#374151' }}>出現地／{y.location}</p>}
              {y.description && <p style={{ margin: 0, color: '#111827', fontSize: 14, lineHeight: 1.5 }}>{y.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default App
