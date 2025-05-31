'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Change theme here

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: 'user', content: input };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput('');
    setLoading(true);

    const assistantIndex = history.length;
    setMsgs((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              const piece = json?.message?.content || json?.text;
              if (piece) {
                assistantText += piece;
                setMsgs((prev) => {
                  const next = [...prev];
                  next[assistantIndex] = { role: 'assistant', content: assistantText };
                  return next;
                });
              }
            } catch {
              // ignore malformed or keep-alive lines
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

  const panelWidth = open ? 'w-[35vw] min-w-[260px]' : 'w-0';
  const canvasPadding = open ? 'pr-[30vw]' : '';

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
      >
        💬 Chat
      </button>

      <style jsx global>{`
        #__NEXT_CONTENT__ { transition: padding-right 0.3s ease; }
      `}</style>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const root = document.getElementById('__NEXT_CONTENT__');
            if (root) root.classList.toggle('${canvasPadding}', ${open});
          `,
        }}
      />

      <div
        className={`fixed top-0 right-0 h-screen ${panelWidth} transition-all duration-300
                    bg-white border-l shadow-lg overflow-hidden flex flex-col z-40`}
      >
        <div className="p-2 bg-blue-600 text-white flex justify-between items-center select-none">
          AI Assistant
          <button onClick={() => setOpen(false)}>✖</button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-2 p-3 text-sm"
        >
          {msgs.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div
                className={`inline-block px-3 py-2 rounded break-words whitespace-pre-wrap max-w-full
                ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100 text-left'}`}
              >
                {m.role === 'assistant' ? (
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({
                        inline,
                        className,
                        children,
                        ...props
                      }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
                        const codeText = String(children).trim();
                        return inline ? (
                          <code className="bg-gray-200 px-1 rounded text-sm">{codeText}</code>
                        ) : (
                          <div className="relative group">
                            <pre className="bg-gray-900 text-white p-3 rounded overflow-auto text-sm">
                              <code className={className} {...props}>
                                {codeText}
                              </code>
                            </pre>
                            <button
                              className="absolute top-1 right-1 text-xs bg-white text-gray-800 border rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition"
                              onClick={() => handleCopy(codeText)}
                            >
                              Copy
                            </button>
                          </div>
                        );
                      },
                      ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {loading && <span className="text-xs text-gray-400">typing…</span>}
        </div>

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
    </>
  );
}
