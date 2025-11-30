/**
 * Lens Protocol Service - 去中心化社交身份服务 (预留框架)
 * 
 * Lens Protocol 是 Polygon 上的去中心化社交图谱协议
 * 
 * 功能规划：
 * - Lens Profile 认证
 * - Profile NFT 验证
 * - 社交图谱集成
 * - 内容发布 (Posts, Comments, Mirrors)
 * - 关注/粉丝关系
 * 
 * API 文档: https://docs.lens.xyz/
 */

import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';

const { users, activityLogs, lensProfiles } = schema;

// Lens Protocol 配置
const LENS_API_URL = 'https://api-v2.lens.dev/graphql';
const LENS_CHAIN_ID = 137; // Polygon Mainnet

// Lens Profile 数据结构
interface LensProfileData {
  id: string;           // Profile ID (hex)
  handle: string;       // Handle (e.g., "username.lens")
  ownedBy: string;      // Wallet address
  metadata?: {
    displayName?: string;
    bio?: string;
    picture?: string;
    coverPicture?: string;
  };
  stats?: {
    followers: number;
    following: number;
    posts: number;
  };
}

/**
 * 执行 Lens GraphQL 查询
 */
async function lensGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(LENS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Lens API error: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Lens API query failed');
  }

  return result.data;
}

/**
 * 验证用户是否拥有 Lens Profile
 */
export async function verifyLensOwnership(
  walletAddress: string,
  profileId: string
): Promise<boolean> {
  try {
    const query = `
      query Profile($profileId: ProfileId!) {
        profile(request: { forProfileId: $profileId }) {
          id
          ownedBy {
            address
          }
        }
      }
    `;

    const data = await lensGraphQL<{
      profile: { id: string; ownedBy: { address: string } } | null;
    }>(query, { profileId });

    if (!data.profile) {
      return false;
    }

    return data.profile.ownedBy.address.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('[Lens] Ownership verification failed:', error);
    return false;
  }
}

/**
 * 获取用户的 Lens Profiles
 */
export async function getLensProfiles(walletAddress: string): Promise<LensProfileData[]> {
  try {
    const query = `
      query Profiles($ownedBy: [EvmAddress!]) {
        profiles(request: { where: { ownedBy: $ownedBy } }) {
          items {
            id
            handle {
              localName
              fullHandle
            }
            ownedBy {
              address
            }
            metadata {
              displayName
              bio
              picture {
                ... on ImageSet {
                  optimized {
                    uri
                  }
                }
              }
              coverPicture {
                ... on ImageSet {
                  optimized {
                    uri
                  }
                }
              }
            }
            stats {
              followers
              following
              posts
            }
          }
        }
      }
    `;

    const data = await lensGraphQL<{
      profiles: {
        items: Array<{
          id: string;
          handle: { localName: string; fullHandle: string };
          ownedBy: { address: string };
          metadata?: {
            displayName?: string;
            bio?: string;
            picture?: { optimized?: { uri: string } };
            coverPicture?: { optimized?: { uri: string } };
          };
          stats?: { followers: number; following: number; posts: number };
        }>;
      };
    }>(query, { ownedBy: [walletAddress] });

    return data.profiles.items.map((item) => ({
      id: item.id,
      handle: item.handle.fullHandle,
      ownedBy: item.ownedBy.address,
      metadata: {
        displayName: item.metadata?.displayName,
        bio: item.metadata?.bio,
        picture: item.metadata?.picture?.optimized?.uri,
        coverPicture: item.metadata?.coverPicture?.optimized?.uri,
      },
      stats: item.stats,
    }));
  } catch (error) {
    console.error('[Lens] Failed to fetch profiles:', error);
    return [];
  }
}

/**
 * 链接 Lens Profile 到 VDID 账户
 */
export async function linkLensProfile(params: {
  userId: number;
  profileId: string;
  handle: string;
  walletAddress: string;
  signature: string;
}): Promise<{ success: boolean; profile?: any }> {
  // 验证签名和所有权
  const isOwner = await verifyLensOwnership(params.walletAddress, params.profileId);
  
  if (!isOwner) {
    throw new Error('You do not own this Lens Profile');
  }
  
  // 检查 profile 是否已被其他用户链接
  const existing = await db.select()
    .from(lensProfiles)
    .where(eq(lensProfiles.profileId, params.profileId))
    .limit(1);
  
  if (existing.length > 0 && existing[0].userId !== params.userId) {
    throw new Error('This Lens Profile is already linked to another account');
  }
  
  // 获取用户当前是否有主 profile
  const userProfiles = await db.select()
    .from(lensProfiles)
    .where(eq(lensProfiles.userId, params.userId));
  
  const isPrimary = userProfiles.length === 0;
  
  // 创建或更新 Lens Profile 记录
  const [profile] = await db.insert(lensProfiles)
    .values({
      userId: params.userId,
      profileId: params.profileId,
      handle: params.handle,
      ownedBy: params.walletAddress,
      isVerified: true,
      verifiedAt: new Date(),
      isPrimary,
    })
    .onConflictDoUpdate({
      target: lensProfiles.profileId,
      set: {
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();
  
  // 更新用户主表
  if (isPrimary) {
    await db.update(users)
      .set({
        lensHandle: params.handle,
        lensProfileId: params.profileId,
        lensVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.userId));
  }
  
  // 记录活动日志
  await db.insert(activityLogs)
    .values({
      userId: params.userId,
      action: 'lens_link',
      category: 'social',
      details: {
        profileId: params.profileId,
        handle: params.handle,
      },
      status: 'success',
      vscoreImpact: 30,
      vscoreCategory: 'social',
    });
  
  return { success: true, profile };
}

/**
 * 获取用户链接的 Lens Profiles
 */
export async function getUserLensProfiles(userId: number) {
  return db.select()
    .from(lensProfiles)
    .where(eq(lensProfiles.userId, userId));
}

/**
 * 解除 Lens Profile 链接
 */
export async function unlinkLensProfile(userId: number, profileId: string): Promise<void> {
  const profile = await db.select()
    .from(lensProfiles)
    .where(and(
      eq(lensProfiles.userId, userId),
      eq(lensProfiles.profileId, profileId)
    ))
    .limit(1)
    .then(rows => rows[0]);
  
  if (!profile) {
    throw new Error('Lens Profile not found');
  }
  
  // 删除记录
  await db.delete(lensProfiles)
    .where(eq(lensProfiles.id, profile.id));
  
  // 如果是主 profile，清除用户主表的 Lens 信息
  if (profile.isPrimary) {
    await db.update(users)
      .set({
        lensHandle: null,
        lensProfileId: null,
        lensVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    // 如果还有其他 profile，设置为主 profile
    const remainingProfiles = await db.select()
      .from(lensProfiles)
      .where(eq(lensProfiles.userId, userId))
      .limit(1);
    
    if (remainingProfiles.length > 0) {
      await db.update(lensProfiles)
        .set({ isPrimary: true })
        .where(eq(lensProfiles.id, remainingProfiles[0].id));
      
      await db.update(users)
        .set({
          lensHandle: remainingProfiles[0].handle,
          lensProfileId: remainingProfiles[0].profileId,
          lensVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }
  
  // 记录日志
  await db.insert(activityLogs)
    .values({
      userId,
      action: 'lens_unlink',
      category: 'social',
      details: {
        profileId,
        handle: profile.handle,
      },
      status: 'success',
    });
}

/**
 * 设置主 Lens Profile
 */
export async function setPrimaryLensProfile(userId: number, profileId: string): Promise<void> {
  // 取消当前主 profile
  await db.update(lensProfiles)
    .set({ isPrimary: false })
    .where(eq(lensProfiles.userId, userId));
  
  // 设置新的主 profile
  const [profile] = await db.update(lensProfiles)
    .set({ isPrimary: true })
    .where(and(
      eq(lensProfiles.userId, userId),
      eq(lensProfiles.profileId, profileId)
    ))
    .returning();
  
  if (!profile) {
    throw new Error('Lens Profile not found');
  }
  
  // 更新用户主表
  await db.update(users)
    .set({
      lensHandle: profile.handle,
      lensProfileId: profile.profileId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * 同步 Lens Profile 数据
 */
export async function syncLensProfile(profileId: string): Promise<void> {
  try {
    const query = `
      query Profile($profileId: ProfileId!) {
        profile(request: { forProfileId: $profileId }) {
          id
          handle {
            fullHandle
          }
          metadata {
            displayName
            bio
          }
          stats {
            followers
            following
            posts
          }
        }
      }
    `;

    const data = await lensGraphQL<{
      profile: {
        id: string;
        handle: { fullHandle: string };
        metadata?: { displayName?: string; bio?: string };
        stats?: { followers: number; following: number; posts: number };
      } | null;
    }>(query, { profileId });

    if (!data.profile) {
      console.log(`[Lens] Profile not found: ${profileId}`);
      return;
    }

    // 更新数据库中的 profile 信息
    await db.update(lensProfiles)
      .set({
        handle: data.profile.handle.fullHandle,
        displayName: data.profile.metadata?.displayName,
        bio: data.profile.metadata?.bio,
        followersCount: data.profile.stats?.followers ?? 0,
        followingCount: data.profile.stats?.following ?? 0,
        postsCount: data.profile.stats?.posts ?? 0,
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lensProfiles.profileId, profileId));

    console.log(`[Lens] Synced profile: ${profileId}`);
  } catch (error) {
    console.error(`[Lens] Failed to sync profile ${profileId}:`, error);
  }
}

/**
 * Lens 认证登录
 * 
 * 使用 Lens Profile 进行认证
 * TODO: 实现完整的 Lens 认证流程
 */
export async function lensAuth(params: {
  profileId: string;
  signature: string;
  message: string;
}): Promise<{ user: any; tokens: any; isNewUser: boolean }> {
  // TODO: 实现 Lens 认证
  // 1. 验证签名
  // 2. 获取 Profile 信息
  // 3. 创建或查找用户
  // 4. 生成 tokens
  
  throw new Error('Lens authentication not yet implemented');
}

// ============================================
// 预留的 Lens 社交功能
// ============================================

/**
 * 关注用户 (预留)
 */
export async function followProfile(
  followerUserId: number,
  targetProfileId: string
): Promise<void> {
  // TODO: 调用 Lens API 关注
  console.log(`[Lens] Follow: ${followerUserId} -> ${targetProfileId}`);
}

/**
 * 取消关注 (预留)
 */
export async function unfollowProfile(
  followerUserId: number,
  targetProfileId: string
): Promise<void> {
  // TODO: 调用 Lens API 取消关注
  console.log(`[Lens] Unfollow: ${followerUserId} -> ${targetProfileId}`);
}

/**
 * 获取关注者列表 (预留)
 */
export async function getFollowers(profileId: string): Promise<any[]> {
  // TODO: 调用 Lens API
  console.log(`[Lens] Get followers for: ${profileId}`);
  return [];
}

/**
 * 获取关注列表 (预留)
 */
export async function getFollowing(profileId: string): Promise<any[]> {
  // TODO: 调用 Lens API
  console.log(`[Lens] Get following for: ${profileId}`);
  return [];
}
