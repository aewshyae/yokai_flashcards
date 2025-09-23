import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Yokai = {
  id: number
  name: string
  imageUrl: string | null
  location: string | null
  description: string | null
  reading: string | null
}

type AliasesMap = Record<string, string[]>

function App() {
  const [yokai, setYokai] = useState<Yokai[]>([])
  const [query, setQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [aliases, setAliases] = useState<AliasesMap>({})
  const [deck, setDeck] = useState<Yokai[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}yokai.json`)
      .then((r) => r.json())
      .then((data: Yokai[]) => setYokai(data))
  }, [])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}aliases.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: AliasesMap) => setAliases(data || {}))
      .catch(() => setAliases({}))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim()
    return yokai.filter((y) => {
      if (!q) return true
      const hay = `${y.name} ${y.location ?? ''} ${y.description ?? ''}`
      return hay.includes(q)
    })
  }, [yokai, query])

  useEffect(() => {
    setCurrentIndex(0)
    setFlipped(false)
  }, [query])

  useEffect(() => {
    setDeck(filtered)
    setCurrentIndex(0)
    setFlipped(false)
  }, [filtered])

  const current = deck.length > 0 ? deck[currentIndex % deck.length] : null

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
  const descriptionToShow = current ? (flipped ? current.description : maskedDescription) : null

  function handleCardClick() {
    if (!current) return
    if (!flipped) {
      setFlipped(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  function shuffleArray<T>(arr: T[]): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function shuffleDeck() {
    setDeck((prev) => shuffleArray(prev.length ? prev : filtered))
    setCurrentIndex(0)
    setFlipped(false)
  }

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: 16 }}>
      <h1>妖怪暗記</h1>
      <h2>Yokai Flashcards</h2>
      <p>水木しげる記念館ホームページに公開されている妖怪の情報を元に作成した暗記カード</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="検索(名前・出現地・説明)"
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <button onClick={shuffleDeck} aria-label="shuffle" style={{ padding: '8px 12px' }}>ランダム</button>
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
          <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', background: '#f3f4f6' }}>
            {flipped && current.imageUrl ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img
                src={current.imageUrl}
                alt={`${current.name}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#6b7280' }}>画像はタップ後に表示</div>
            )}
          </div>
          <div style={{ padding: 12 }}>
            <h2 style={{ fontSize: 22, margin: 0, color: '#111827' }}>{flipped ? current.name : '？？？'}</h2>
            {flipped && current.reading && (
              <p style={{ margin: '6px 0', color: '#4b5563' }}>読み：{current.reading}</p>
            )}
            {current.location && (
              <p style={{ margin: '6px 0', color: '#374151' }}>{String(current.location).replace(/^出現地／/, '')}</p>
            )}
            {descriptionToShow && (
              <p style={{ margin: 0, color: '#111827', fontSize: 15, lineHeight: 1.6 }}>{descriptionToShow}</p>
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
        {deck.length > 0 && `${(currentIndex % deck.length) + 1} / ${deck.length}`}
      </div>
      <div className="license" style={{ marginTop: 16, fontSize: 12, lineHeight: 1.6 }}>
        <p className="ja">すべての画像・テキストの権利は<a href="https://mizuki.sakaiminato.net/road/">水木しげる記念館ホームページ</a>が保有しています。</p>
        <p className="en">all contents are originally keeped its license by <a href="https://mizuki.sakaiminato.net/road/">Mizuki Shigeru Memorial Museum</a>.</p>
      </div>
      <div className="contact" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6 }}>
        <p>サポート/お問い合わせは<a href="https://github.com/aewshyae">GitHub@aewshyae</a>まで</p>
      </div>
    </div>
  )
}

export default App
