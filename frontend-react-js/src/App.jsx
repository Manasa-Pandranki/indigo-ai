
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [sessionId, setSessionId] = useState(
    () => crypto.randomUUID()
  )

  function handleNewChat() {
    const newId = crypto.randomUUID()

    console.log('New Session ID:', newId)

    setSessionId(newId)
    setMessage('')
    setAnswer('')
    setError('')
  }

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
      const response = await fetch(
        'http://127.0.0.1:8000/api/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: message.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Request failed with status ' + response.status
        )
      }

      const data = await response.json()
      setAnswer(data.answer)
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

      <button
        type="button"
        onClick={handleNewChat}
        disabled={loading}
      >
        + New Chat
      </button>

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

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {answer && (
        <section className="answer-panel" aria-live="polite">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </section>
      )}
    </main>
  )
}

export default App
