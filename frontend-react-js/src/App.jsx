import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://enterprise-ingestion-firewall-api.onrender.com'

const suggestions = [
  { icon: '✧', title: 'Explain simply', subtitle: 'Understand any topic easily' },
  { icon: '✎', title: 'Write for me', subtitle: 'Create clear, polished content' },
  { icon: '✦', title: 'Brainstorm', subtitle: 'Explore ideas and possibilities' },
]

function App() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`)
      if (!response.ok) throw new Error('Could not load conversations')

      const data = await response.json()
      setConversations(data.items || [])
    } catch (err) {
      console.error('Conversation list error:', err)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  function handleNewChat() {
    setSessionId(crypto.randomUUID())
    setMessages([])
    setMessage('')
    setError('')
  }

  async function handleSelectConversation(id) {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${id}/messages`
      )

      if (!response.ok) throw new Error('Could not load conversation')

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
        headers: { 'Content-Type': 'application/json' },
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
        { role: 'user', content: currentMessage },
        { role: 'assistant', content: data.response_markdown },
      ])

      await loadConversations()
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Could not get an AI response. Please try again.')
      setMessage(currentMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((chat) =>
    (chat.title || 'New Chat')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  function handleSuggestion(title) {
    const prompts = {
      'Explain simply': 'Explain a topic to me in simple words.',
      'Write for me': 'Help me write something professionally.',
      Brainstorm: 'Help me brainstorm some creative ideas.',
    }

    setMessage(prompts[title] || '')
  }

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">✦</div>
            <span>Indigo<span className="brand-accent">.ai</span></span>
          </div>

          <button
            className="new-chat-button"
            onClick={handleNewChat}
            disabled={loading}
          >
            <span>＋</span> New chat
          </button>

          <div className="sidebar-search">
            <span>⌕</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search chats..."
              aria-label="Search conversations"
            />
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active" onClick={handleNewChat}>
              <span>⌂</span> Home
            </button>
            <div className="nav-item nav-static">
              <span>▤</span> Conversations
            </div>
          </nav>

          <div className="history-heading">YOUR CHATS</div>

          <div className="conversation-list">
            {filteredConversations.map((chat) => (
              <button
                key={chat.session_id}
                className={`conversation-item ${
                  sessionId === chat.session_id ? 'active' : ''
                }`}
                onClick={() => handleSelectConversation(chat.session_id)}
                disabled={loading}
                title={chat.title}
              >
                <span className="chat-icon">◷</span>
                <span className="conversation-title">
                  {chat.title || 'New Chat'}
                </span>
              </button>
            ))}

            {filteredConversations.length === 0 && (
              <p className="empty-history">
                {searchTerm ? 'No matching chats.' : 'Your conversations will appear here.'}
              </p>
            )}
          </div>

          <div className="sidebar-bottom">
            <div className="connection-card">
              <span className="status-dot" />
              <div>
                <strong>Connected</strong>
                <small>Ready to chat</small>
              </div>
              <span className="connection-sparkle">✦</span>
            </div>
            <p>Powered by AI</p>
          </div>
        </aside>
      )}

      <main className="chat-main">
        <header className="chat-header">
  <div className="header-left">
    <button
      className="icon-button"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label="Toggle sidebar"
    >
      ☰
    </button>

    <div className="brand header-brand">
      <div className="brand-icon">✦</div>
      <span>Indigo<span className="brand-accent">.ai</span></span>
    </div>
  </div>

  <nav className="top-navigation">
    <button onClick={handleNewChat}>Home</button>
    <button onClick={() =>
      document.querySelector('.suggestion-grid')?.scrollIntoView({ behavior: 'smooth' })
    }>Features</button>
    <button onClick={() =>
      document.querySelector('.composer-area')?.scrollIntoView({ behavior: 'smooth' })
    }>How it works</button>
    <button onClick={() => setError('Documentation will be available soon.')}>
      Documentation
    </button>
  </nav>

  <div className="header-actions">
    <button
      className="theme-toggle"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle theme"
    >
      {darkMode ? '☀️' : '☾'}
    </button>

    <button className="get-started-button" onClick={handleNewChat}>
      Get Started →
    </button>
  </div>
</header>

        <section className={`chat-messages ${messages.length === 0 ? 'empty-chat' : ''}`} aria-live="polite">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-orb">
                <span>✦</span>
              </div>

              <div className="welcome-label">
                <span>✧</span> Your intent-aware AI assistant
              </div>

              <h1>
                Hello there
                <br />
                <span>How can I assist you today?</span>
              </h1>

              <p className="welcome-description">
                Welcome to your personal AI workspace.
                Ask anything and get clear, helpful answers.
              </p>

              <div className="suggestion-grid">
                {suggestions.map((item) => (
                  <button
                    className="suggestion-card"
                    key={item.title}
                    onClick={() => handleSuggestion(item.title)}
                  >
                    <span className="suggestion-icon">{item.icon}</span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={`${sessionId}-${index}`}
              className={`message-bubble ${item.role}`}
            >
              <div className="message-author">
                <span className="message-avatar">
                  {item.role === 'user' ? 'You' : '✦'}
                </span>
                <strong>
                  {item.role === 'user' ? 'You' : 'Indigo.ai'}
                </strong>
              </div>

              {item.role === 'assistant' ? (
                <ReactMarkdown>{item.content || ''}</ReactMarkdown>
              ) : (
                <p>{item.content}</p>
              )}
            </div>
          ))}

          {loading && (
            <div className="loading-message">
              <span className="loading-dot" />
              Indigo.ai is thinking...
            </div>
          )}
        </section>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="composer-area">
          <form onSubmit={handleSubmit} className="message-form">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask me anything..."
              rows={2}
              maxLength={5000}
              disabled={loading}
              aria-label="Message"
            />

            <div className="composer-bottom">
              <span className="intent-label">
                <span>✧</span> Intent detection
              </span>

              <button
                type="submit"
                className="send-button"
                disabled={loading || !message.trim()}
                aria-label="Send message"
              >
                {loading ? '…' : '↑'}
              </button>
            </div>
          </form>

          <div className="composer-hints">
            <span><kbd>Enter</kbd> to send</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line</span>
            <span className="memory-hint">✧ Remembers this chat</span>
          </div>
        </div>

        <p className="input-caption">
          AI responses may contain mistakes. Please verify important information.
        </p>
      </main>
    </div>
  )
}

export default App