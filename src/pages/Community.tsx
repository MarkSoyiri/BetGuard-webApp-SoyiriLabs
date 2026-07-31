import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Plus, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Chip } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCommunity } from '@/contexts/CommunityContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { timeAgo } from '@/utils/format';
import type { CommunityPost } from '@/types';

interface PostForm {
  title: string;
  content: string;
  tag: string;
}

const EMPTY: PostForm = { title: '', content: '', tag: 'Discussion' };

const TAGS = ['Discussion', 'Success Story', 'Milestone', 'Support'];

const TAG_TONES: Record<string, 'primary' | 'secondary' | 'accent' | 'warning' | 'danger'> = {
  Discussion: 'primary',
  'Success Story': 'secondary',
  Milestone: 'accent',
  Support: 'warning',
};

export function Community() {
  const { posts, addPost, deletePost, toggleLike, addComment } = useCommunity();
  const { profile } = useUser();
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PostForm>(EMPTY);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const authorName = `${profile?.name?.split(' ')[0] ?? 'Anonymous'} (you)`;

  const isOwnPost = (post: CommunityPost) => post.authorId === 'me' || post.author.includes('(you)');

  const postAuthor = (post: CommunityPost) =>
    isOwnPost(post) ? `${profile?.name?.split(' ')[0] ?? 'Anonymous'} (you)` : post.author;

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.title.trim().length < 4) next.title = 'Give your post a short title.';
    if (form.content.trim().length < 10) next.content = 'Share a bit more (min 10 characters).';
    setErrors(next);
    if (Object.keys(next).length) return;
    addPost({ author: authorName, title: form.title.trim(), content: form.content.trim(), tag: form.tag });
    toast('Post published to the community.');
    setForm(EMPTY);
    setCreating(false);
  };

  const handleComment = (postId: string) => {
    const text = (commentText[postId] ?? '').trim();
    if (!text) return;
    addComment(postId, authorName, text);
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
    toast('Comment added.', 'info');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Community"
        subtitle="Anonymous, supportive and judgement-free. You are not alone in this."
        action={
          <Button onClick={() => setCreating(true)} icon={<Plus className="size-4" aria-hidden="true" />}>
            New post
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/[0.06] to-secondary/[0.06] p-4">
        <ShieldCheck className="size-5 shrink-0 text-secondary" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Posts are stored only on your device and shown anonymously. Be kind — someone may be
          going through exactly what you once did.
        </p>
      </div>

      {posts.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Users className="size-8" aria-hidden="true" />}
            title="No posts yet"
            message="Start the conversation — your story might help someone today."
            action={
              <Button onClick={() => setCreating(true)} icon={<Plus className="size-4" aria-hidden="true" />}>
                Write a post
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-xs font-bold text-white">
                  {postAuthor(post).charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink dark:text-white">{postAuthor(post)}</p>
                  <p className="text-xs text-slate-400">{timeAgo(post.date)}</p>
                </div>
                <Chip tone={TAG_TONES[post.tag] ?? 'slate'}>{post.tag}</Chip>
                {isOwnPost(post) && (
                  <button
                    onClick={() => setConfirmingDelete(post.id)}
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-danger/10 hover:text-danger dark:text-slate-600"
                    aria-label={`Delete your post: ${post.title}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-white">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{post.content}</p>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-200/60 pt-4 dark:border-slate-700/60">
                <button
                  onClick={() => {
                    toggleLike(post.id);
                    toast(post.liked ? 'Unliked post.' : 'You liked this post!', 'info');
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    post.liked
                      ? 'bg-danger/10 text-danger'
                      : 'bg-slate-100 text-slate-500 hover:bg-danger/10 hover:text-danger dark:bg-slate-800'
                  }`}
                  aria-pressed={post.liked}
                >
                  <Heart className={`size-3.5 ${post.liked ? 'fill-current' : ''}`} aria-hidden="true" />
                  {post.likes}
                </button>
                <button
                  onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-primary/10 hover:text-primary-light dark:bg-slate-800"
                  aria-expanded={openComments === post.id}
                >
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  {post.comments.length}
                </button>
              </div>

              {openComments === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    {post.comments.length === 0 && (
                      <p className="text-xs text-slate-400">No comments yet — start the conversation.</p>
                    )}
                    {post.comments.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-[10px] font-bold text-white">
                          {c.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-ink dark:text-white">
                            {c.author} <span className="ml-1 font-normal text-slate-400">{timeAgo(c.date)}</span>
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleComment(post.id);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={commentText[post.id] ?? ''}
                        onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a supportive comment…"
                        className="flex-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-ink placeholder-slate-400 outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                        aria-label="Add a comment"
                      />
                      <button
                        type="submit"
                        disabled={!(commentText[post.id] ?? '').trim()}
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-emerald-600 text-white transition hover:scale-105 disabled:opacity-40"
                        aria-label="Send comment"
                      >
                        <Send className="size-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => {
          setCreating(false);
          setForm(EMPTY);
          setErrors({});
        }}
        title="New community post"
        subtitle="Share your journey — anonymously if you prefer."
      >
        <form onSubmit={handleCreate} noValidate className="space-y-4">
          <Input
            label="Title"
            placeholder="What's on your mind?"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={errors.title}
          />
          <Textarea
            label="Story"
            rows={5}
            placeholder="Share your experience, a win, a struggle, or advice…"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            error={errors.content}
          />
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tag
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tag: t }))}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    form.tag === t
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/25'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button type="submit">Publish post</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmingDelete !== null}
        title="Delete this post?"
        message="Your story and its comments will be permanently removed. This cannot be undone."
        confirmLabel="Delete post"
        onConfirm={() => {
          if (confirmingDelete) {
            deletePost(confirmingDelete);
            toast('Post deleted.', 'info');
          }
          setConfirmingDelete(null);
        }}
        onCancel={() => setConfirmingDelete(null)}
      />
    </div>
  );
}
