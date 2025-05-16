'use client';

import { useState, useRef, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatPanel() {
  const [open, setOpen]   = useState(false);
  const [input, setInput] = useState('');
  const [msgs,  setMsgs]  = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom on every update
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: 'user', content: input };
    const history      = [...msgs, userMsg];
    setMsgs(history);
    setInput('');
    setLoading(true);

    // create a placeholder for the streaming assistant message
    const assistantIndex = history.length;
    setMsgs((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ messages: history }),
      });

      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              const piece = json?.message?.content;
              if (piece) {
                assistantText += piece;
                // update the placeholder content in real time
                setMsgs((prev) => {
                  const next = [...prev];
                  next[assistantIndex] = { role: 'assistant', content: assistantText };
                  return next;
                });
              }
            } catch {
              /* ignore non-JSON keep-alive lines */
            }
          }
        }
      }
    } catch (err) {
      console.error('stream error', err);
      setMsgs((m) => [...m, { role: 'assistant', content: '[error]' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
      >
        💬 Chat
      </button>

      {/* panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 h-96 bg-white border rounded-lg shadow-lg flex flex-col
                     resize overflow-hidden"
        >
          {/* header */}
          <div className="p-2 bg-blue-600 text-white flex justify-between items-center select-none">
            AI Assistant
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-2 p-2 text-sm"
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user'
                  ? 'text-right'
                  : 'text-left'}
              >
                <span
                  className={`inline-block px-2 py-1 rounded
                    ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {loading && <span className="text-xs text-gray-400">typing…</span>}
          </div>

          {/* input */}
          <div className="p-2 border-t flex">
            <input
              className="flex-1 border p-1 rounded text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask something…"
            />
            <button
              className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
