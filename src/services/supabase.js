// ─────────────────────────────────────────────────────────────────────────────
// supabase.js — Production Serverless Supabase Realtime & Postgres Client
// 100% Free Tier Compatible: Zero server costs, infinite scaling on Vercel
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

function getCleanSupabaseConfig() {
  try {
    let url = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
    let key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

    if (!url || !key) return null;
    if (url.includes('your-project') || key.includes('your-anon-key')) return null;

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    // Validate URL syntax safely
    url = url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    new URL(url);
    return { url, key };
  } catch {
    return null;
  }
}

export const isSupabaseConfigured = () => Boolean(getCleanSupabaseConfig());

export const supabase = (() => {
  const cfg = getCleanSupabaseConfig();
  if (!cfg) return null;
  try {
    const client = createClient(cfg.url, cfg.key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log('[Supabase] 🚀 Initialized Supabase Realtime Client with URL:', cfg.url);
    return client;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client safely:', err.message);
    return null;
  }
})();

// ── Data Transformation Helpers ──────────────────────────────────────────────
export function mapUserFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    loveCode: row.love_code,
    gender: row.gender,
    lookingFor: row.looking_for,
    location: row.location,
    techStack: row.tech_stack || [],
    bio: row.bio,
    indentation: row.indentation,
    drink: row.drink,
    emoji: row.emoji,
    likes: row.likes || 0,
    friends: row.friends || [],
    following: row.following || [],
    followers: row.followers || [],
    status: row.status || 'online',
    currentStatus: row.current_status || '',
    avatarData: row.avatar_data || null,
    avatarUrl: row.avatar_data || null,
    audioIntro: row.audio_intro || null,
    audioUrl: row.audio_intro || null,
    registeredAt: row.registered_at,
    isRegistered: true,
  };
}

export function mapUserToDb(profile) {
  return {
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    love_code: profile.loveCode,
    gender: profile.gender || 'other',
    looking_for: profile.lookingFor || 'any',
    location: profile.location || '',
    tech_stack: profile.techStack || [],
    bio: profile.bio || '',
    indentation: profile.indentation || 'Spaces',
    drink: profile.drink || '☕ Coffee',
    emoji: profile.emoji || '🧑‍💻',
    likes: profile.likes || 0,
    friends: profile.friends || [],
    following: profile.following || [],
    followers: profile.followers || [],
    status: profile.status || 'online',
    current_status: profile.currentStatus || '',
    avatar_data: profile.avatarData || profile.avatarUrl || null,
    audio_intro: profile.audioIntro || profile.audioUrl || null,
    registered_at: profile.registeredAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function mapMessageFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    senderName: row.sender_name,
    senderHandle: row.sender_handle,
    senderEmoji: row.sender_emoji,
    text: row.text,
    imageData: row.image_data,
    voiceData: row.voice_data,
    codeSnippet: row.code_snippet,
    codeLanguage: row.code_language,
    replyTo: row.reply_to,
    status: row.status,
    timestamp: row.timestamp,
  };
}

export function mapNotificationFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    targetUserId: row.target_user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    text: row.body || row.title || '',
    fromUser: row.from_user,
    read: row.read,
    status: row.action_status || 'pending',
    actionStatus: row.action_status,
    createdAt: row.created_at,
    timestamp: row.created_at,
  };
}

// ── Database Operations ──────────────────────────────────────────────────────

export async function sbSaveUser(profile) {
  if (!supabase) return profile;
  try {
    const payload = mapUserToDb(profile);
    const cleanHandle = (payload.handle || '').trim().toLowerCase();

    // 1. Check if user with this handle already exists in Supabase
    const { data: existingRows } = await supabase
      .from('users')
      .select('*')
      .ilike('handle', cleanHandle);

    if (existingRows && existingRows.length > 0) {
      const existing = existingRows[0];
      const targetId = existing.id;
      const targetLoveCode = existing.love_code || payload.love_code;

      const mergedPayload = {
        ...payload,
        id: targetId,
        love_code: targetLoveCode,
      };

      const { data: updated, error: updateErr } = await supabase
        .from('users')
        .update(mergedPayload)
        .eq('id', targetId)
        .select()
        .single();

      if (!updateErr && updated) {
        return mapUserFromDb(updated);
      }
    }

    // 2. Check if user with this love_code already exists
    if (payload.love_code) {
      const { data: existingCodeRows } = await supabase
        .from('users')
        .select('*')
        .eq('love_code', payload.love_code);

      if (existingCodeRows && existingCodeRows.length > 0) {
        const existing = existingCodeRows[0];
        const { data: updated, error: updateErr } = await supabase
          .from('users')
          .update({ ...payload, id: existing.id })
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateErr && updated) {
          return mapUserFromDb(updated);
        }
      }
    }

    // 3. New user upsert by id
    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      // If handle constraint conflict, update directly by handle
      if (error.code === '23505' || (error.message && error.message.includes('users_handle_key'))) {
        const { data: fallbackUpdated, error: fallbackErr } = await supabase
          .from('users')
          .update(payload)
          .ilike('handle', cleanHandle)
          .select()
          .single();
        if (!fallbackErr && fallbackUpdated) {
          return mapUserFromDb(fallbackUpdated);
        }
      }
      console.warn('[Supabase] Non-fatal upsert warning:', error.message);
      return profile;
    }
    return mapUserFromDb(data);
  } catch (err) {
    console.warn('[Supabase] Non-fatal save user exception:', err.message);
    return profile;
  }
}

export async function sbFetchUsers() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapUserFromDb);
  } catch (err) {
    console.error('[Supabase] Error fetching users:', err.message);
    return [];
  }
}

export async function sbLoginWithLoveCode(loveCode) {
  if (!supabase) return null;
  try {
    const clean = (loveCode || '').trim().toUpperCase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('love_code', clean)
      .maybeSingle();

    if (error) throw error;
    return mapUserFromDb(data);
  } catch (err) {
    console.error('[Supabase] Error logging in with Love Code:', err.message);
    return null;
  }
}

export async function sbFetchMessages(u1, u2) {
  if (!supabase || !u1 || !u2) return [];
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${u1},recipient_id.eq.${u2}),and(sender_id.eq.${u2},recipient_id.eq.${u1})`)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapMessageFromDb);
  } catch (err) {
    console.error('[Supabase] Error fetching messages:', err.message);
    return [];
  }
}

export async function sbSendMessage(msg) {
  if (!supabase) return msg;
  try {
    const payload = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_id: msg.senderId,
      recipient_id: msg.recipientId,
      sender_name: msg.senderName,
      sender_handle: msg.senderHandle,
      sender_emoji: msg.senderEmoji || '🧑‍💻',
      text: msg.text || '',
      image_data: msg.imageData || null,
      voice_data: msg.voiceData || null,
      code_snippet: msg.codeSnippet || null,
      code_language: msg.codeLanguage || null,
      reply_to: msg.replyTo || null,
      status: 'sent',
      timestamp: msg.timestamp || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Also auto-create a chat_message notification for recipient
    await sbAddNotification({
      targetUserId: msg.recipientId,
      type: 'chat_message',
      title: `Message from ${msg.senderName || 'Developer'}`,
      body: msg.text || (msg.voiceData ? '🎙️ Voice note' : 'Sent an attachment'),
      fromUser: {
        id: msg.senderId,
        name: msg.senderName,
        handle: msg.senderHandle,
        emoji: msg.senderEmoji,
      },
    });

    return mapMessageFromDb(data);
  } catch (err) {
    console.error('[Supabase] Error sending message:', err.message);
    throw err;
  }
}

export async function sbMarkMessagesSeen(recipientId, senderId, messageIds) {
  if (!supabase || !messageIds?.length) return;
  try {
    await supabase
      .from('messages')
      .update({ status: 'seen' })
      .in('id', messageIds);
  } catch (err) {
    console.error('[Supabase] Error marking messages seen:', err.message);
  }
}

export async function sbFetchNotifications(userId) {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_user_id.eq.${userId},and(type.eq.friend_request,from_user->>id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []).map(mapNotificationFromDb);
  } catch (err) {
    console.error('[Supabase] Error fetching notifications:', err.message);
    return [];
  }
}

export async function sbAddNotification(notif) {
  if (!supabase || !notif?.targetUserId) return null;
  try {
    const payload = {
      id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      target_user_id: notif.targetUserId,
      type: notif.type,
      title: notif.title || 'New notification',
      body: notif.body || '',
      from_user: notif.fromUser || null,
      read: false,
      action_status: notif.actionStatus || 'pending',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapNotificationFromDb(data);
  } catch (err) {
    console.error('[Supabase] Error adding notification:', err.message);
    return null;
  }
}

export async function sbMarkNotificationsRead(userId) {
  if (!supabase || !userId) return;
  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('target_user_id', userId)
      .eq('read', false);
  } catch (err) {
    console.error('[Supabase] Error marking notifications read:', err.message);
  }
}

export async function sbRespondFriendRequest(notificationId, action, currentUserId) {
  if (!supabase || !notificationId) return null;
  try {
    const { data: notif } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (!notif) return null;

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await supabase
      .from('notifications')
      .update({ action_status: newStatus, read: true })
      .eq('id', notificationId);

    if (action === 'accept') {
      await sbInteract('confirm_friend', notif.target_user_id, { id: notif.from_user?.id });
    }

    return { ...mapNotificationFromDb(notif), actionStatus: newStatus };
  } catch (err) {
    console.error('[Supabase] Error responding to friend request:', err.message);
    return null;
  }
}

export async function sbFetchPosts() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase] Error fetching posts:', err.message);
    return [];
  }
}

export async function sbAddPost(post) {
  if (!supabase) return null;
  try {
    const payload = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author_id: post.authorId,
      author_name: post.authorName,
      author_handle: post.authorHandle,
      author_emoji: post.authorEmoji || '🧑‍💻',
      content: post.content,
      likes: 1,
      comments: 0,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Error adding post:', err.message);
    return null;
  }
}

export async function sbInteract(action, targetUserId, actor) {
  if (!supabase || !targetUserId || !actor?.id) return null;
  try {
    // 1. Fetch current target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    // 2. Fetch current actor
    const { data: actorUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', actor.id)
      .single();

    if (!targetUser || !actorUser) return null;

    let targetFriends = targetUser.friends || [];
    let actorFriends = actorUser.friends || [];
    let targetFollowers = targetUser.followers || [];
    let actorFollowing = actorUser.following || [];
    let targetLikes = targetUser.likes || 0;

    if (action === 'like') {
      targetLikes += 1;
      await sbAddNotification({
        targetUserId,
        type: 'like',
        title: `${actor.name} liked your profile! ❤️`,
        body: 'Someone appreciated your developer stack and bio.',
        fromUser: actor,
      });
    } else if (action === 'follow') {
      if (!targetFollowers.includes(actor.id)) targetFollowers.push(actor.id);
      if (!actorFollowing.includes(targetUserId)) actorFollowing.push(targetUserId);
      await sbAddNotification({
        targetUserId,
        type: 'follow',
        title: `${actor.name} started following you! 🚀`,
        body: 'They are now following your activity and status updates.',
        fromUser: actor,
      });
    } else if (action === 'unfollow') {
      targetFollowers = targetFollowers.filter((id) => id !== actor.id);
      actorFollowing = actorFollowing.filter((id) => id !== targetUserId);
    } else if (action === 'friend_request') {
      await sbAddNotification({
        targetUserId,
        type: 'friend_request',
        title: `Friend request from ${actor.name} 🤝`,
        body: `${actor.name} (${actor.handle}) wants to connect as a dev soulmate!`,
        fromUser: actor,
      });
    } else if (action === 'confirm_friend') {
      if (!targetFriends.includes(actor.id)) targetFriends.push(actor.id);
      if (!actorFriends.includes(targetUserId)) actorFriends.push(targetUserId);
      await sbAddNotification({
        targetUserId: actor.id,
        type: 'friend_accepted',
        title: `${targetUser.name} accepted your friend request! 💖`,
        body: 'You are now officially dev soulmate friends!',
        fromUser: mapUserFromDb(targetUser),
      });
    } else if (action === 'wave') {
      await sbAddNotification({
        targetUserId,
        type: 'wave',
        title: `${actor.name} sent you a wave! 👋`,
        body: 'A friendly ping in the developer network!',
        fromUser: actor,
      });
    }

    // Persist updates
    await supabase.from('users').update({
      likes: targetLikes,
      friends: targetFriends,
      followers: targetFollowers,
    }).eq('id', targetUserId);

    await supabase.from('users').update({
      friends: actorFriends,
      following: actorFollowing,
    }).eq('id', actor.id);

    return {
      targetUser: mapUserFromDb({ ...targetUser, likes: targetLikes, friends: targetFriends, followers: targetFollowers }),
      actor: mapUserFromDb({ ...actorUser, friends: actorFriends, following: actorFollowing }),
    };
  } catch (err) {
    console.error('[Supabase] Error interacting:', err.message);
    return null;
  }
}
