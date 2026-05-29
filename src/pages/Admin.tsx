import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { PageShell } from "@/components/layout/PageShell";
import { Shield, Mail, User, Clock, MessageSquare, Eye, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  const { data: contacts, isLoading: contactsLoading } =
    trpc.contact.list.useQuery(undefined, {
      enabled: isAdmin,
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel px-8 py-6 flex items-center gap-3 text-white/70">
          <Shield className="w-5 h-5 text-amber-400 animate-pulse" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const unread = contacts?.filter((c) => !c.isRead).length ?? 0;

  return (
    <PageShell
      title="Admin"
      maxWidth="max-w-4xl"
      icon={<Shield className="w-5 h-5 text-red-400" />}
    >
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-panel p-5 text-center opacity-0-start animate-scale-in stagger-1">
          <MessageSquare className="w-7 h-7 text-amber-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gradient-gold">
            {contacts?.length ?? 0}
          </div>
          <div className="text-white/50 text-xs uppercase tracking-wider mt-1">
            Total messages
          </div>
        </div>
        <div className="glass-panel p-5 text-center opacity-0-start animate-scale-in stagger-2">
          <Eye className="w-7 h-7 text-blue-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{unread}</div>
          <div className="text-white/50 text-xs uppercase tracking-wider mt-1">
            Unread
          </div>
        </div>
      </div>

      <div className="glass-panel-strong overflow-hidden opacity-0-start animate-fade-up stagger-3">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-amber-400" />
          <h2 className="font-display font-bold text-white">Contact inbox</h2>
        </div>

        {contactsLoading ? (
          <div className="p-10 text-center text-white/50">Loading messages…</div>
        ) : !contacts || contacts.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/45 text-xs border-b border-white/10">
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Message</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      "border-b border-white/5 hover:bg-white/5 transition-colors",
                      !contact.isRead && "bg-amber-500/8",
                    )}
                  >
                    <td className="px-4 py-3 text-white/45">#{contact.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <User className="w-4 h-4 text-white/35 flex-shrink-0" />
                        {contact.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-amber-300/90 hover:text-amber-200 hover:underline"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0 opacity-60" />
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-white/75">
                      {contact.message}
                    </td>
                    <td className="px-4 py-3 text-white/45">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {contact.createdAt
                          ? new Date(contact.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-bold px-2.5 py-0.5 rounded-full",
                          contact.isRead
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/25 text-amber-300",
                        )}
                      >
                        {contact.isRead ? "Read" : "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
