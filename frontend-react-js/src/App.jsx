
import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://enterprise-ingestion-firewall-api.onrender.com'

function App() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load all conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`)

      if (!response.ok) {
        throw new Error('Could not load conversations')
      }

      const data = await response.json()
      setConversations(data.items || [])
    } catch (err) {
      console.error('Conversation list error:', err)
    }
  }, [])

  // Fetch conversations when the app loads
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Start a new conversation
  function handleNewChat() {
    setSessionId(crypto.randomUUID())
    setMessages([])
    setMessage('')
    setError('')
  }

  // Load an existing conversation
  async function handleSelectConversation(id) {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${id}/messages`
      )

      if (!response.ok) {
        throw new Error('Could not load conversation')
      }

      const data = await response.json()

      setSessionId(data.session_id || id)
      setMessages(data.items || [])
      setMessage('')
    } catch (err) {
      console.error('Conversation loading error:', err)
      setError('Could not load this conversation.')
    } finally {
      setLoading(false)
    }
  }

  // Send message to AI
  async function handleSubmit(event) {
    event.preventDefault()

    if (!message.trim() || loading) return

    const currentMessage = message.trim()

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentMessage,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.response_markdown) {
        throw new Error('AI response is missing from backend')
      }

      setSessionId(data.session_id || sessionId)

      setMessages((previous) => [
        ...previous,
        {
          role: 'user',
          content: currentMessage,
        },
        {
          role: 'assistant',
          content: data.response_markdown,
        },
      ])

      await loadConversations()
    } catch (err) {
      console.error('Analysis error:', err)
      setError(
        'Could not get an AI response. Please try again.'
      )
      setMessage(currentMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-heading">
            <h2>AI Workspace</h2>
            <span className="workspace-tag">PERSONAL</span>
          </div>

          <button
            className="new-chat-button"
            onClick={handleNewChat}
            disabled={loading}
          >
            <span>＋</span> New Conversation
          </button>

          <h3 className="sidebar-section-title">
            YOUR CONVERSATIONS
          </h3>

          <div className="conversation-list">
            {conversations.map((chat) => (
              <button
                key={chat.session_id}
                className={`conversation-item ${
                  sessionId === chat.session_id ? 'active' : ''
                }`}
                onClick={() =>
                  handleSelectConversation(chat.session_id)
                }
                disabled={loading}
                title={chat.title}
              >
                <span className="chat-icon">◷</span>
                <span className="conversation-title">
                  {chat.title || 'New Chat'}
                </span>
              </button>
            ))}

            {conversations.length === 0 && (
              <p className="empty-history">
                No conversations yet.
              </p>
            )}
          </div>

          <div className="sidebar-footer">
            <span className="status-dot"></span>
            AI Assistant Workspace
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="chat-main">

        <header className="chat-header">
          <div className="header-left">
            <button
              className="icon-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <div>
              <h1>Enterprise AI Assistant</h1>
              <p>Your intelligent conversation workspace</p>
            </div>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            aria-label="Toggle light and dark mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>

        <section className="chat-messages" aria-live="polite">

          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-icon">✦</div>
              <h2>Welcome to your AI workspace</h2>
              <p>
                Start a conversation. Your chat history will be saved.
              </p>
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={`${sessionId}-${index}`}
              className={`message-bubble ${item.role}`}
            >
              <strong>
                {item.role === 'user' ? 'You' : 'AI Assistant'}
              </strong>

              {item.role === 'assistant' ? (
                <ReactMarkdown>
                  {item.content || ''}
                </ReactMarkdown>
              ) : (
                <p>{item.content}</p>
              )}
            </div>
          ))}

          {loading && (
            <div className="loading-message">
              <span className="loading-dot"></span>
              AI is thinking...
            </div>
          )}
        </section>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="message-form">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask anything..."
            rows={3}
            maxLength={5000}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? 'Sending...' : 'Send ↑'}
          </button>
        </form>

        <p className="input-caption">
          AI responses may contain mistakes. Verify important information.
        </p>

      </main>
    </div>
  )
}

export default App
