import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, RotateCw, Loader2, Paperclip, Sparkles, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jaelAvatarDefault from "@/assets/jael-avatar.png";
import jaelButtonDefault from "@/assets/jael-button.png";

// Configure PDF.js worker (lazy import to keep bundle lean)
const loadPdfJs = async () => {
  const pdfjs = await import("pdfjs-dist");
  // @ts-ignore
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfjs;
};

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type Msg = {
  role: "user" | "assistant";
  content: string | ContentPart[];
  displayText?: string;
  attachmentName?: string;
  attachmentPreview?: string;
  attachmentKind?: "image" | "pdf";
  feedback?: "up" | "down";
  question?: string; // for assistant msgs: the user question that produced it
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-chat`;

const SUGGESTIONS = [
  "How do I enroll in a course?",
  "What courses do you offer?",
  "Take me to my dashboard",
  "How do I verify my certificate?",
  "How do I submit a task?",
  "How do payments work?",
  "How do I apply for an internship?",
  "How do I contact support?",
];

const INITIAL_MESSAGE: Msg = {
  role: "assistant",
  content:
    "Hi! I'm **Jael**, your DTEN assistant. Ask me anything about the website, courses, enrollment, dashboards, certificates, or payments. You can also attach an **image or PDF** and I'll summarize it for you. How can I help today?",
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const extractPdfText = async (file: File): Promise<string> => {
  const pdfjs = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const maxPages = Math.min(pdf.numPages, 20);
  let out = "";
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it: any) => it.str).join(" ");
    out += `\n\n--- Page ${i} ---\n${pageText}`;
  }
  return out.trim();
};

type Attachment = {
  file: File;
  preview: string; // dataURL for image, or icon placeholder for pdf
  kind: "image" | "pdf";
  extractedText?: string; // for pdf with text layer
  asImage?: boolean; // for scanned pdfs sent as image
};

const StudentChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(jaelAvatarDefault);
  const [buttonUrl, setButtonUrl] = useState<string>(jaelButtonDefault);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key,value")
        .in("key", ["jael_avatar_url", "jael_button_url"]);
      data?.forEach((r: any) => {
        if (r.key === "jael_avatar_url" && r.value) setAvatarUrl(r.value);
        if (r.key === "jael_button_url" && r.value) setButtonUrl(r.value);
      });
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    setAttachment(null);
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      toast({
        title: "Unsupported file",
        description: "Please attach an image or PDF.",
        variant: "destructive",
      });
      return;
    }

    setParsing(true);
    try {
      if (isImage) {
        const preview = await fileToBase64(file);
        setAttachment({ file, preview, kind: "image" });
      } else {
        const preview = await fileToBase64(file);
        // Try PDF.js text extraction first
        let extractedText = "";
        try {
          extractedText = await extractPdfText(file);
        } catch (e) {
          console.warn("PDF text extract failed", e);
        }

        if (extractedText && extractedText.replace(/\s/g, "").length > 40) {
          setAttachment({ file, preview, kind: "pdf", extractedText });
          toast({ title: "PDF ready", description: `Extracted text from ${file.name}` });
        } else {
          // Scanned PDF — send first page as image to Gemini for OCR
          toast({
            title: "Scanned PDF detected",
            description: "Will send to Jael for OCR (multimodal).",
          });
          // Render first page to canvas
          const pdfjs = await loadPdfJs();
          const buf = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: buf }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          const imgData = canvas.toDataURL("image/png");
          setAttachment({ file, preview: imgData, kind: "pdf", asImage: true });
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Could not read file", description: err.message, variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if ((!text && !attachment) || isLoading) return;

    let userText = text;
    if (!userText && attachment) {
      userText = attachment.kind === "pdf" ? "Please summarize this document." : "Please summarize this image.";
    }

    // Build payload content
    let userContentForAPI: string | ContentPart[];
    let displayText = userText;

    if (attachment?.kind === "image" || attachment?.asImage) {
      userContentForAPI = [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: attachment.preview } },
      ];
    } else if (attachment?.kind === "pdf" && attachment.extractedText) {
      const truncated = attachment.extractedText.slice(0, 25000);
      userContentForAPI = `${userText}\n\n[Attached PDF: ${attachment.file.name}]\n\n${truncated}`;
    } else {
      userContentForAPI = userText;
    }

    const userMsg: Msg = {
      role: "user",
      content: userContentForAPI,
      displayText,
      attachmentName: attachment?.file.name,
      attachmentPreview: attachment?.kind === "image" ? attachment.preview : undefined,
      attachmentKind: attachment?.kind,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachment(null);
    setIsLoading(true);

    const history = [...messages.filter((m) => m !== INITIAL_MESSAGE), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar, question: displayText } : m,
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar, question: displayText }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (!assistantSoFar) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I'm sorry, I couldn't generate a response. Please try again." },
        ]);
      }
    } catch (e: any) {
      console.error("Chat error:", e);
      toast({ title: "Chat Error", description: e.message, variant: "destructive" });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (msgIndex: number, rating: "up" | "down") => {
    const msg = messages[msgIndex];
    if (!msg || msg.role !== "assistant") return;
    const answer = typeof msg.content === "string" ? msg.content : "";

    setMessages((prev) => prev.map((m, i) => (i === msgIndex ? { ...m, feedback: rating } : m)));

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("jael_feedback").insert({
      user_id: userData?.user?.id ?? null,
      rating,
      question: msg.question || null,
      answer,
    });
    if (error) {
      toast({ title: "Feedback failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Thanks for the feedback!" });
    }
  };

  const showSuggestions = messages.length === 1 && !isLoading;

  // Markdown link renderer — internal links use react-router <Link>
  const mdLink = ({ href, children }: any) => {
    const isInternal = typeof href === "string" && href.startsWith("/");
    if (isInternal) {
      return (
        <Link to={href} className="text-primary underline underline-offset-2 hover:opacity-80" onClick={() => setOpen(false)}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
        {children}
      </a>
    );
  };

  const renderAssistant = (text: string) => (
    <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: mdLink }}>
        {text}
      </ReactMarkdown>
    </div>
  );

  const renderUser = (msg: Msg) => {
    const text = msg.displayText || (typeof msg.content === "string" ? msg.content : "");
    return (
      <>
        {msg.attachmentPreview && msg.attachmentKind === "image" && (
          <img
            src={msg.attachmentPreview}
            alt={msg.attachmentName || "attachment"}
            className="mb-2 max-h-40 rounded-lg border border-primary-foreground/20 object-cover"
          />
        )}
        {msg.attachmentKind === "pdf" && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-2 py-1.5 text-xs">
            <FileText size={14} />
            <span className="truncate">{msg.attachmentName}</span>
          </div>
        )}
        {text && <p className="whitespace-pre-wrap break-words leading-relaxed">{text}</p>}
      </>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-3 text-primary-foreground shadow-2xl hover-glow hover:scale-105 transition-transform"
            aria-label="Chat with Jael"
          >
            <img
              src={buttonUrl}
              alt="Jael"
              className="h-9 w-9 rounded-full object-cover border-2 border-primary-foreground/30"
            />
            <span className="text-sm font-semibold pr-1 hidden sm:inline">Chat with Jael</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-gradient-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <img src={avatarUrl} alt="Jael" className="h-10 w-10 rounded-full object-cover border-2 border-primary-foreground/30" />
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1">Chat with Jael <Sparkles size={12} /></p>
                  <p className="text-xs opacity-90">DTEN Virtual Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10" onClick={reset} aria-label="Reset">
                  <RotateCw size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setOpen(false)} aria-label="Close">
                  <X size={16} />
                </Button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? renderAssistant(typeof msg.content === "string" ? msg.content : "")
                      : renderUser(msg)}
                  </div>

                  {msg.role === "assistant" && i !== 0 && typeof msg.content === "string" && msg.content.length > 0 && !isLoading && (
                    <div className="mt-1 flex items-center gap-1 px-1">
                      <button
                        onClick={() => submitFeedback(i, "up")}
                        disabled={!!msg.feedback}
                        className={`rounded p-1 transition-colors ${
                          msg.feedback === "up" ? "text-primary" : "text-muted-foreground hover:text-primary"
                        } disabled:cursor-default`}
                        aria-label="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => submitFeedback(i, "down")}
                        disabled={!!msg.feedback}
                        className={`rounded p-1 transition-colors ${
                          msg.feedback === "down" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                        } disabled:cursor-default`}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown size={12} />
                      </button>
                      {msg.feedback && (
                        <span className="text-[10px] text-muted-foreground">Thanks!</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-card border border-border px-4 py-2.5 shadow-sm">
                    <Loader2 size={14} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {(attachment || parsing) && (
              <div className="border-t border-border bg-muted/40 px-3 py-2 flex items-center gap-2">
                {parsing ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Reading file...</p>
                  </>
                ) : attachment ? (
                  <>
                    {attachment.kind === "image" ? (
                      <img src={attachment.preview} alt="preview" className="h-10 w-10 rounded object-cover border border-border" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-border bg-card">
                        <FileText size={18} className="text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate text-foreground">{attachment.file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {attachment.kind === "pdf" && attachment.extractedText
                          ? `${attachment.extractedText.length.toLocaleString()} chars extracted`
                          : attachment.asImage
                            ? "Scanned — sending as image for OCR"
                            : "Ready to send with your message"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAttachment(null)}>
                      <X size={14} />
                    </Button>
                  </>
                ) : null}
              </div>
            )}

            <div className="border-t border-border p-3 bg-card">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || parsing}
                  aria-label="Attach image or PDF"
                >
                  <Paperclip size={16} />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={attachment ? "Ask about the attachment..." : "Ask Jael anything..."}
                  className="flex-1 text-sm rounded-full"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={isLoading || (!input.trim() && !attachment)}>
                  <Send size={16} />
                </Button>
              </form>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Powered by Daryl Tech Educational Network
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentChatbot;
