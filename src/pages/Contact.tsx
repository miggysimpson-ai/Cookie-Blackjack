import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createContact = trpc.contact.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createContact.mutate({ name, email, message });
  };

  return (
    <PageShell
      title="Contact"
      icon={<MessageSquare className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-lg"
    >
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
            <p className="text-white/60 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
            <Button onClick={() => { setSubmitted(false); setName(""); setEmail(""); setMessage(""); }} className="bg-amber-500 hover:bg-amber-600">
              Send Another
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <img src="/assets/cookie-icon.png" alt="" className="w-16 h-16 mx-auto mb-3 opacity-60" />
              <p className="text-white/60">
                Have feedback, found a bug, or just want to say hi? Drop us a note!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" /> Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <Button
                type="submit"
                disabled={createContact.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-5"
              >
                <Send className="w-5 h-5 mr-2" />
                {createContact.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>

            {/* Contact Info */}
            <div className="mt-8 glass-panel p-4 text-center">
              <p className="text-white/50 text-sm">You can also find us at</p>
              <p className="text-amber-400 font-bold mt-1">support@cookieblackjack.game</p>
            </div>
          </>
        )}
    </PageShell>
  );
}
