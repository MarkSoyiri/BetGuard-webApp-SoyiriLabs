import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { samplePosts } from '@/data/sample';
import type { CommunityPost } from '@/types';
import { uid } from '@/utils/format';

interface CommunityContextValue {
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'liked' | 'comments' | 'date'>) => void;
  deletePost: (id: string) => void;
  toggleLike: (id: string) => void;
  addComment: (postId: string, author: string, content: string) => void;
  resetPosts: () => void;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = usePersistedState<CommunityPost[]>('posts', samplePosts());

  const addPost = useCallback(
    (post: Omit<CommunityPost, 'id' | 'likes' | 'liked' | 'comments' | 'date'>) => {
      setPosts((prev) => [
        {
          ...post,
          id: uid('post'),
          authorId: 'me',
          likes: 0,
          liked: false,
          comments: [],
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [setPosts],
  );

  const deletePost = useCallback(
    (id: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    },
    [setPosts],
  );

  const toggleLike = useCallback(
    (id: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
            : p,
        ),
      );
    },
    [setPosts],
  );

  const addComment = useCallback(
    (postId: string, author: string, content: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  { id: uid('cm'), author, content, date: new Date().toISOString() },
                ],
              }
            : p,
        ),
      );
    },
    [setPosts],
  );

  const resetPosts = useCallback(() => {
    setPosts(samplePosts());
  }, [setPosts]);

  return (
    <CommunityContext.Provider value={{ posts, addPost, deletePost, toggleLike, addComment, resetPosts }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity(): CommunityContextValue {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}
