import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!message.trim()) {
      setError('Please enter a message.')
      setAnswer('')
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      })

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status)
      }

      const data = await response.json()

      const markdownAnswer = data.answer

      setAnswer(markdownAnswer)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(
        'Could not connect to the backend. Check that the FastAPI server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>AI Message Analyzer</h1>
        <p>Analyze messages and view structured AI results.</p>
      </header>

      <form onSubmit={handleSubmit} className="message-form">
        <label htmlFor="message">Enter your message</label>

        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Example: Where is my order?"
          rows={4}
          maxLength={5000}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Message'}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {answer && (
        <section className="answer-panel" aria-live="polite">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </section>
      )}
    </main>
  )
}

export default App