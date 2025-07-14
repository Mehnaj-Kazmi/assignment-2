'use client'

import { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [urdu, setUrdu] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/summarise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      setSummary(data.summary)
      setUrdu(data.urdu)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center p-10 gap-4">
      <h1 className="text-2xl font-bold">Blog Summariser</h1>
      <input
        type="text"
        placeholder="Enter blog URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border px-4 py-2 w-full max-w-md rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        disabled={loading || !url}
      >
        {loading ? 'Summarising...' : 'Summarise'}
      </button>

      {summary && (
        <div className="mt-8 text-left max-w-xl w-full">
          <h2 className="text-xl font-semibold mb-2">Summary:</h2>
          <p className="mb-4">{summary}</p>
          <h2 className="text-xl font-semibold mb-2">Urdu:</h2>
          <p>{urdu}</p>
        </div>
      )}
    </main>
  )
}
