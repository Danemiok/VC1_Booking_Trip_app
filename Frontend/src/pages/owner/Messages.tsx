import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, Mail, Search, Send, MessageCircle, Phone, Video, MoreVertical, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';

type AppUser = {
  id: number | string;
  name?: string | null;
  full_name?: string | null;
  email: string;
  role?: string | null;
  avatar?: string | null;
  phone?: string | null;
};

type MessageItem = {
  id: number | string;
  sender_id: number | string;
  receiver_id: number | string;
  message: string;
  created_at: string;
  sender?: AppUser | null;
  receiver?: AppUser | null;
};

function displayName(user: AppUser) {
  return user.name?.trim() || user.full_name?.trim() || user.email.split('@')[0] || 'Customer';
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function OwnerMessagesPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AppUser | null>(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [lookupResult, setLookupResult] = useState<AppUser | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lookupRef = useRef('');

  const customers = useMemo(() => {
    return users.filter((user) => (user.role || '').toLowerCase() === 'customer');
  }, [users]);

  const customerMap = useMemo(() => {
    return new Map(customers.map((user) => [String(user.id), user]));
  }, [customers]);

  const recentCustomers = useMemo(() => {
    const seen = new Set<string>();
    const ordered: AppUser[] = [];

    [...messages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach((message) => {
        const otherId =
          customerMap.has(String(message.sender_id)) ? String(message.sender_id) : String(message.receiver_id);
        const customer = customerMap.get(otherId);
        if (!customer || seen.has(String(customer.id))) return;
        seen.add(String(customer.id));
        ordered.push(customer);
      });

    return ordered;
  }, [messages, customerMap]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recentCustomers.length > 0 ? recentCustomers : customers;
    const matches = customers.filter((user) => {
      const name = displayName(user).toLowerCase();
      const email = user.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
    if (matches.length > 0) {
      return matches;
    }
    if (lookupResult && String(lookupResult.id) !== String(selectedCustomer?.id ?? '')) {
      return [lookupResult];
    }
    return [];
  }, [search, customers, recentCustomers, lookupResult, selectedCustomer]);

  const activeConversationId = selectedCustomer ? String(selectedCustomer.id) : null;

  const conversationMessages = useMemo(() => {
    if (!selectedCustomer) return [];
    const id = String(selectedCustomer.id);
    return messages
      .filter(
        (message) =>
          String(message.sender_id) === id || String(message.receiver_id) === id,
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, selectedCustomer]);

  async function loadUsers() {
    const payload = await apiRequest<{ data?: AppUser[] } | AppUser[]>('/users');
    const list = Array.isArray(payload) ? payload : payload.data || [];
    setUsers(list);
  }

  async function loadMessages() {
    const payload = await apiRequest<{ data?: MessageItem[] } | MessageItem[]>('/messages');
    const list = Array.isArray(payload) ? payload : payload.data || [];
    setMessages(list);
  }

  async function refreshAll() {
    try {
      setError(null);
      await Promise.all([loadUsers(), loadMessages()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  const lookupCustomerByEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setLookupResult(null);
      setLookupError(null);
      setLookupLoading(false);
      lookupRef.current = '';
      return;
    }

    if (lookupRef.current === email) {
      return;
    }

    lookupRef.current = email;
    setLookupLoading(true);
    setLookupError(null);

    try {
      const payload = await apiRequest<{ customer?: AppUser }>('/owner/customers/search?email=' + encodeURIComponent(email));
      const customer = payload?.customer ?? null;
      setLookupResult(customer);
    } catch (err) {
      setLookupResult(null);
      setLookupError(err instanceof Error ? err.message : 'Customer not found');
    } finally {
      setLookupLoading(false);
    }
  };

  async function openConversation(customer: AppUser) {
    setSelectedCustomer(customer);
    setLoadingConversation(true);
    setError(null);
    try {
      const payload = await apiRequest<{ data?: MessageItem[] } | MessageItem[]>(
        `/messages/${customer.id}`,
      );
      const list = Array.isArray(payload) ? payload : payload.data || [];
      setMessages((current) => {
        const rest = current.filter(
          (message) =>
            String(message.sender_id) !== String(customer.id) &&
            String(message.receiver_id) !== String(customer.id),
        );
        return [...rest, ...list];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoadingConversation(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selectedCustomer || !draft.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      await apiRequest('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: selectedCustomer.id,
          message: draft.trim(),
        }),
      });
      setDraft('');
      const payload = await apiRequest<{ data?: MessageItem[] } | MessageItem[]>(
        `/messages/${selectedCustomer.id}`,
      );
      const list = Array.isArray(payload) ? payload : payload.data || [];
      setMessages((current) => {
        const rest = current.filter(
          (message) =>
            String(message.sender_id) !== String(selectedCustomer.id) &&
            String(message.receiver_id) !== String(selectedCustomer.id),
        );
        return [...rest, ...list];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) {
      setLookupResult(null);
      setLookupError(null);
      setLookupLoading(false);
      lookupRef.current = '';
      return;
    }

    const timer = window.setTimeout(() => {
      void lookupCustomerByEmail(trimmed);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadMessages().catch(() => undefined);
    }, 10000);

    const onFocus = () => {
      loadMessages().catch(() => undefined);
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  const groupedMessages = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: MessageItem[] }> = [];
    let currentLabel = '';

    conversationMessages.forEach((item) => {
      const label = formatDateLabel(item.created_at);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ key: `${item.id}-${label}`, label, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    });

    return groups;
  }, [conversationMessages]);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <Link
            to="/owner/dashboard"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="text-sm text-slate-500">
              Search a customer by email and start chatting right away.
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[360px_1fr]">
          <aside className="border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer email..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                Try `leakk@gmail.com`
              </p>
            </div>

            <div className="max-h-[calc(100vh-175px)] overflow-y-auto">
              {loading && (
                <div className="p-6 text-sm text-slate-500">Loading conversations...</div>
              )}

              {!loading && lookupLoading && (
                <div className="p-6 text-sm text-slate-500">Looking up customer by email...</div>
              )}

              {!loading && !lookupLoading && lookupError && (
                <div className="p-6 text-sm text-slate-500 text-rose-500">
                  {lookupError}
                </div>
              )}

              {!loading && !lookupLoading && !lookupError && searchResults.length === 0 && (
                <div className="p-6 text-sm text-slate-500">
                  No customer found for this email. Check that the account exists and is signed in once.
                </div>
              )}

              {searchResults.map((user) => {
                const isActive = activeConversationId === String(user.id);
                const lastMessage = [...conversationMessages]
                  .filter(
                    (message) =>
                      String(message.sender_id) === String(user.id) ||
                      String(message.receiver_id) === String(user.id),
                  )
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                return (
                  <button
                    key={String(user.id)}
                    type="button"
                    onClick={() => void openConversation(user)}
                    className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
                      isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {(displayName(user)[0] || 'C').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-slate-900">{displayName(user)}</p>
                        <span className="shrink-0 text-xs text-slate-400">{user.email}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Mail size={14} />
                        <span className="truncate">
                          {lastMessage ? lastMessage.message : 'Start a new conversation'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!loading && recentCustomers.length > 0 && search.trim() === '' && (
                <div className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Recent customers
                </div>
              )}
            </div>
          </aside>

          <main className="flex min-h-0 flex-col bg-slate-50 relative overflow-hidden">
            {selectedCustomer ? (
              <div className="flex h-full flex-col overflow-hidden relative">
                {/* Sticky Premium Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-md shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {selectedCustomer.avatar ? (
                        <img
                          src={selectedCustomer.avatar}
                          alt={displayName(selectedCustomer)}
                          className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 shadow-sm border-2 border-white">
                          {(displayName(selectedCustomer)[0] || 'C').toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {displayName(selectedCustomer)}
                      </h2>
                      <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-600 transition hover:bg-blue-50" title="Video Call">
                      <Video size={20} />
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-blue-600 transition hover:bg-blue-50" title="Voice Call">
                      <Phone size={18} />
                    </button>
                    <button 
                      onClick={() => setShowProfile(!showProfile)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${showProfile ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                      title="Profile Info"
                    >
                      <Info size={20} />
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                <div className="relative flex flex-1 overflow-hidden">
                  {/* Chat Messages Area with Wallpaper */}
                  <div 
                    className="flex-1 overflow-y-auto px-6 py-8"
                    style={{
                      backgroundColor: '#e5ddd5',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm66 3c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-40-39c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm14-26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-8 48c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-10-10c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm20-20c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm4-4c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-12 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-4-4c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM42 70c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-8-2c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-4-4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm12 12c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm4 4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-12-12c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-4-4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    }}
                  >
                    {error && (
                      <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                        {error}
                      </div>
                    )}

                    {groupedMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="max-w-md rounded-[2.5rem] border border-dashed border-slate-300 bg-white/60 backdrop-blur-sm px-8 py-10 text-center shadow-lg">
                          <MessageCircle className="mx-auto text-blue-500" size={40} />
                          <h3 className="mt-4 text-xl font-bold text-slate-900">No messages yet</h3>
                          <p className="mt-2 text-sm text-slate-500">
                            Send the first message to start the conversation with this customer.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {groupedMessages.map((group) => (
                          <div key={group.key} className="space-y-4">
                            <div className="flex justify-center sticky top-4 z-10">
                              <span className="rounded-full border border-slate-200/50 bg-white/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
                                {group.label}
                              </span>
                            </div>

                            {group.items.map((message) => {
                              const incoming = String(message.sender_id) === String(selectedCustomer.id);
                              return (
                                <div
                                  key={String(message.id)}
                                  className={`flex ${incoming ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                  <div
                                    className={`relative max-w-[80%] rounded-[1.5rem] px-5 py-3 shadow-sm ${
                                      incoming
                                        ? 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                                        : 'rounded-tr-none bg-blue-600 text-white shadow-blue-100'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                                    <div
                                      className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] font-medium ${
                                        incoming ? 'text-slate-400' : 'text-blue-100/80'
                                      }`}
                                    >
                                      <span>{formatTimestamp(message.created_at)}</span>
                                      {!incoming && <div className="flex items-center gap-0.5"><div className="h-1 w-1 rounded-full bg-blue-100" /><div className="h-1 w-1 rounded-full bg-blue-100" /></div>}
                                    </div>
                                    
                                    {/* Bubble Tails */}
                                    <div className={`absolute top-0 h-4 w-4 ${
                                      incoming 
                                        ? '-left-2 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)] border-l border-t border-slate-200' 
                                        : '-right-2 bg-blue-600 [clip-path:polygon(0_0,100%_0,0_100%)]'
                                    }`} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </div>

                  {/* Profile Sidebar (Right Column) */}
                  {showProfile && (
                    <div className="w-[320px] border-l border-slate-200 bg-white p-8 transition-all overflow-y-auto animate-in slide-in-from-right duration-300">
                      <div className="text-center">
                        {selectedCustomer.avatar ? (
                          <img
                            src={selectedCustomer.avatar}
                            alt={displayName(selectedCustomer)}
                            className="mx-auto h-32 w-32 rounded-full border-4 border-slate-50 object-cover shadow-xl"
                          />
                        ) : (
                          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-blue-50 text-4xl font-black text-blue-600 shadow-inner border-4 border-slate-50">
                            {(displayName(selectedCustomer)[0] || 'C').toUpperCase()}
                          </div>
                        )}
                        <h3 className="mt-6 text-xl font-bold text-slate-900 leading-tight">{displayName(selectedCustomer)}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">{selectedCustomer.email}</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border border-emerald-100">Verified</span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border border-blue-100">Customer</span>
                        </div>
                      </div>

                      <div className="mt-12 space-y-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Profile Details</p>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-4 group">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                <Mail size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Email</p>
                                <p className="text-sm font-semibold text-slate-700 truncate">{selectedCustomer.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                <Phone size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Phone</p>
                                <p className="text-sm font-semibold text-slate-700">{selectedCustomer.phone || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Actions</p>
                          <div className="mt-4 space-y-2">
                            <button className="w-full rounded-2xl py-3.5 px-4 text-center text-sm font-bold text-rose-600 bg-rose-50/50 transition hover:bg-rose-600 hover:text-white group">
                              Block Customer
                            </button>
                            <button className="w-full rounded-2xl py-3.5 px-4 text-center text-sm font-bold text-slate-600 border border-slate-200 transition hover:bg-slate-50">
                              View Full History
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md z-20"
                >
                  <div className="flex items-end gap-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Type your message here..."
                      rows={1}
                      className="min-h-[56px] flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6">
                <div className="max-w-lg rounded-[3rem] border border-dashed border-slate-300 bg-white px-8 py-12 text-center shadow-sm">
                  <div className="mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6 shadow-inner">
                    <MessageCircle size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Select a customer</h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500 font-medium">
                    Choose a conversation from the sidebar or search by email<br/>
                    to start a secure chat session.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
