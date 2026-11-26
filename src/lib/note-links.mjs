// Only explicit platform share-copy links verified in a normal logged-in browser
// may be used as direct entry points. The canonical bare URL is identity, not an access promise.
export function isPublicShareUrl(url, canonical) {
  try {
    const u = new URL(url), id = new URL(canonical).pathname.split('/').at(-1);
    if (!/^[0-9a-f]{24}$/.test(id)) return false;
    if (u.origin !== 'https://www.xiaohongshu.com' || u.username || u.password || u.hash) return false;
    if (u.pathname !== '/explore/'+id && u.pathname !== '/discovery/item/'+id) return false;
    const keys = [...u.searchParams.keys()].sort().join(',');
    return keys === 'source,xhsshare,xsec_source,xsec_token'
      && u.searchParams.get('source') === 'webshare'
      && u.searchParams.get('xhsshare') === 'pc_web'
      && u.searchParams.get('xsec_source') === 'pc_share'
      && !!u.searchParams.get('xsec_token');
  } catch { return false; }
}
export function noteAccess(note) {
  const search = 'https://www.xiaohongshu.com/search_result?keyword='+encodeURIComponent(note.title);
  const specificSearch = 'https://www.xiaohongshu.com/search_result?keyword='+encodeURIComponent(note.title+' '+note.author);
  const verified = note.share?.verification === 'logged-in-browser'
    && note.share?.source === 'platform-share-copy'
    && isPublicShareUrl(note.share.url,note.url);
  return {
    url: verified ? note.share.url : specificSearch,
    search,
    mode: verified ? 'share' : 'search',
    label: verified ? '阅读原帖' : '查找原帖',
    status: verified ? '分享直达 · 登录状态下已验证' : '站内搜索入口 · 未验证直达',
  };
}
