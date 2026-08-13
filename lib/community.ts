import { createClient } from '@/lib/supabase/server';

export type CommunityRoom = { id:string; slug:string; title:string; description:string; category:string; moderation_mode:'pre_publish'|'post_publish'; is_official:boolean; member_count:number; post_count:number };
export type CommunityPost = { id:string; slug:string; title:string; summary:string; body:string; post_type:string; topics:string[]; keywords:string[]; comments_count:number; useful_count:number; views_count:number; published_at:string|null; seo_indexable:boolean; seo_title:string|null; seo_description:string|null; room_id:string; author_id:string };

export async function getCommunityRooms(){
  const supabase=await createClient();
  const {data,error}=await supabase.from('community_rooms').select('id,slug,title,description,category,moderation_mode,is_official,member_count,post_count').eq('status','active').order('is_official',{ascending:false}).order('title');
  if(error) throw error; return (data??[]) as CommunityRoom[];
}
export async function getCommunityFeed(limit=24){
  const supabase=await createClient();
  const {data,error}=await supabase.from('community_posts').select('id,slug,title,summary,body,post_type,topics,keywords,comments_count,useful_count,views_count,published_at,seo_indexable,seo_title,seo_description,room_id,author_id').eq('status','published').order('published_at',{ascending:false}).limit(limit);
  if(error) throw error; return (data??[]) as CommunityPost[];
}
export async function getCommunityPost(slug:string){
  const supabase=await createClient();
  const {data,error}=await supabase.from('community_posts').select('id,slug,title,summary,body,post_type,topics,keywords,comments_count,useful_count,views_count,published_at,seo_indexable,seo_title,seo_description,room_id,author_id').eq('slug',slug).eq('status','published').maybeSingle();
  if(error) throw error; return data as CommunityPost|null;
}
export async function getRoomById(id:string){
  const supabase=await createClient();
  const {data}=await supabase.from('community_rooms').select('id,slug,title,description,category,moderation_mode,is_official,member_count,post_count').eq('id',id).maybeSingle();
  return data as CommunityRoom|null;
}
export async function getPostComments(postId:string){
  const supabase=await createClient();
  const {data,error}=await supabase.from('community_comments').select('id,post_id,author_id,parent_id,body,useful_count,created_at').eq('post_id',postId).eq('status','published').order('created_at');
  if(error) throw error; return data??[];
}
