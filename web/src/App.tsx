import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Yokai = {
  id: number
  name: string
  imageUrl: string | null
  location: string | null
  description: string | null
}

type AliasesMap = Record<string, string[]>

function App() {
  const [yokai, setYokai] = useState<Yokai[]>([])
  const [query, setQuery] = useState('')
  const [onlyWithImage, setOnlyWithImage] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [aliases, setAliases] = useState<AliasesMap>({})

  useEffect(() => {
    fetch('/yokai.json')
      .then((r) => r.json())
      .then((data: Yokai[]) => setYokai(data))
  }, [])

  useEffect(() => {
    fetch('/aliases.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: AliasesMap) => setAliases(data || {}))
      .catch(() => setAliases({}))
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

  useEffect(() => {
    setCurrentIndex(0)
    setFlipped(false)
  }, [query, onlyWithImage])

  const current = filtered.length > 0 ? filtered[currentIndex % filtered.length] : null

  function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function buildSpacedInsensitiveRegex(name: string): RegExp {
    const chars = Array.from(name)
    const between = '[\\s\\u3000]*'
    const pattern = chars.map((c) => escapeRegExp(c)).join(between)
    return new RegExp(pattern, 'g')
  }

  function maskMatchedPreservingSpaces(matched: string): string {
    return matched.replace(/[^\s\u3000]/g, '◯')
  }

  function maskNamesInText(names: string[], text: string | null): string | null {
    if (!text || names.length === 0) return text
    let result = text
    for (const n of names) {
      if (!n) continue
      const re = buildSpacedInsensitiveRegex(n)
      result = result.replace(re, (m) => maskMatchedPreservingSpaces(m))
    }
    return result
  }

  const namesToMask = current ? [current.name, ...(aliases[current.name] ?? [])] : []
  const maskedDescription = current ? maskNamesInText(namesToMask, current.description) : null

  function handleCardClick() {
    if (!current) return
    if (!flipped) {
      setFlipped(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: 16 }}>
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
      {current ? (
        <article
          onClick={handleCardClick}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#fff',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ width: '100%', aspectRatio: '4 / 3', position: 'relative', background: '#f3f4f6' }}>
            {current.imageUrl ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img
                src={current.imageUrl}
                alt={flipped ? `${current.name}` : '妖怪画像'}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#6b7280' }}>No Image</div>
            )}
          </div>
          <div style={{ padding: 12 }}>
            <h2 style={{ fontSize: 22, margin: 0 }}>{flipped ? current.name : '？？？'}</h2>
            {current.location && (
              <p style={{ margin: '6px 0', color: '#374151' }}>{String(current.location).replace(/^出現地／/, '')}</p>
            )}
            {maskedDescription && (
              <p style={{ margin: 0, color: '#111827', fontSize: 15, lineHeight: 1.6 }}>{maskedDescription}</p>
            )}
          </div>
          <div style={{ padding: 12, color: '#6b7280', fontSize: 13 }}>
            {flipped ? 'クリックで次のカードへ' : 'クリックで反転して名前を表示'}
          </div>
        </article>
      ) : (
        <p>該当するカードがありません</p>
      )}
      <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
        {filtered.length > 0 && `${(currentIndex % filtered.length) + 1} / ${filtered.length}`}
      </div>
    </div>
  )
}

export default App
