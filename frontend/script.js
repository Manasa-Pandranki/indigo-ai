
const API_URL = "http://127.0.0.1:8000";

// Keep the same session ID for messages in one conversation.
let sessionId = crypto.randomUUID();

const form = document.querySelector("#analyze-form");
const messageInput = document.querySelector("#message");
const result = document.querySelector("#result");
const statusText = document.querySelector("#status");
const submitButton = document.querySelector("#submit-button");
const copyButton = document.querySelector("#copy-button");

// Optional New Chat button, if your HTML contains one.
const newChatButton = document.querySelector("#new-chat-button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    statusText.textContent = "Please enter a message.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Analyzing...";
  copyButton.disabled = true;
  statusText.textContent = "Sending your message...";

  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      result.textContent = JSON.stringify(data, null, 2);
      statusText.textContent =
        `Request failed (${response.status}). Check the error details below.`;
      return;
    }

    result.textContent = JSON.stringify(data, null, 2);
    statusText.textContent = "Success — response received.";
    copyButton.disabled = false;
  } catch (error) {
    statusText.textContent =
      "Could not connect. Check that the FastAPI backend is running.";
    result.textContent = String(error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML =
      'Analyze message <span aria-hidden="true">→</span>';
  }
});

if (newChatButton) {
  newChatButton.addEventListener("click", () => {
    sessionId = crypto.randomUUID();
    messageInput.value = "";
    result.textContent = "Your structured result will appear here.";
    statusText.textContent = "Started a new conversation.";
    copyButton.disabled = true;
  });
}

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(result.textContent);
    statusText.textContent = "JSON copied to clipboard.";
  } catch {
    statusText.textContent =
      "Clipboard access failed. Select and copy the JSON manually.";
  }
});
