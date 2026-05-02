/* built by twelve. — bytw12ve */
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://yxucqsofablzsgyeyrmb.supabase.co',
  'sb_publishable_uI_UEqvYgcmmMHwDF2iS8A_N0fPk4mj'
)

// ── helpers ──────────────────────────────────────────────────────

export function buildSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function getArt(build) {
  if (build.art) return build.art
  const mat = (build.case_material || '').toLowerCase()
  if (mat.includes('polycarbonate') || mat.includes('pc')) return 'blue'
  if (mat.includes('brass')) return 'lavender'
  if (mat.includes('carbon')) return 'slate'
  if (mat.includes('steel')) return 'olive'
  if (mat.includes('aluminum') || mat.includes('aluminium')) return 'pink'
  return 'cream'
}

export function getLayoutCode(layout) {
  if (!layout) return '75'
  const l = layout.toLowerCase()
  if (l.includes('40')) return '40'
  if (l.includes('60')) return '60'
  if (l.includes('65')) return '65'
  if (l.includes('75')) return '75'
  if (l.includes('tkl') || l.includes('wkl') || l.includes('80') || l.includes('full')) return 'tkl'
  return '75'
}

export function getBuildTags(build) {
  const tags = []
  if (build.layout) tags.push(build.layout)
  if (build.switches) tags.push(build.switches)
  if (build.case_material) tags.push(build.case_material)
  return tags
}

function cleanSearchTerm(value) {
  return String(value || '')
    .trim()
    .replace(/[,%()*]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 80)
}

export async function fetchBuilds({ q = '', filter = 'all' } = {}) {
  let query = supabase.from('builds').select('*').order('created_at', { ascending: false })
  const search = cleanSearchTerm(q)

  if (search) {
    query = query.or(`name.ilike.%${search}%,switches.ilike.%${search}%,layout.ilike.%${search}%`)
  }

  if (filter && filter !== 'all') {
    const layoutFilters = ['60%','65%','75%','tkl','wkl','full','40%']
    const materialFilters = ['brass','aluminum','polycarbonate','steel','carbon fiber','pom']
    const switchTypeFilters = ['linear','tactile','clicky']
    const f = cleanSearchTerm(filter).toLowerCase()

    if (switchTypeFilters.includes(f)) {
      query = query.eq('switch_type', f)
    } else if (layoutFilters.some(l => f === l.replace('%','')||f===l)) {
      query = query.ilike('layout', `%${f}%`)
    } else if (materialFilters.includes(f)) {
      query = query.ilike('case_material', `%${f}%`)
    } else {
      query = query.ilike('layout', `%${f}%`)
    }
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export async function fetchBuildBySlug(slug) {
  const safeSlug = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120)
  if (!safeSlug) return { data: null, error: new Error('Invalid build slug') }
  const nameGuess = safeSlug.replace(/-/g, ' ')
  const { data, error } = await supabase
    .from('builds')
    .select('*')
    .or(`slug.eq.${safeSlug},name.ilike.${nameGuess}`)
    .limit(1)
    .single()
  return { data, error }
}

// ── wiki ─────────────────────────────────────────────────────────

const CATEGORY_SLUG_MAP = {
  'beginner guides': 'beginner-guides',
  'modding guides': 'modding-guides',
  'parts glossary': 'parts-glossary',
  'sound & feel': 'sound-feel',
  'community & buying': 'community-buying',
  'about': 'about',
}

export async function fetchWikiArticles({ category, status = 'published', limit } = {}) {
  let query = supabase
    .from('wiki_articles')
    .select('*')
    .eq('status', status)
    .order('updated_at', { ascending: false })
  if (category) query = query.eq('category', category)
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  return { data: data || [], error }
}

export async function fetchWikiArticleBySlug(slug) {
  const safeSlug = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120)
  if (!safeSlug) return { data: null, error: new Error('Invalid article slug') }
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('slug', safeSlug)
    .single()
  return { data, error }
}

export async function searchWikiArticles(q) {
  const search = cleanSearchTerm(q)
  if (!search) return { data: [], error: null }
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${search}%,short_description.ilike.%${search}%`)
    .order('updated_at', { ascending: false })
  return { data: data || [], error }
}

export async function submitWikiArticle({ title, category, description, tags, format, sections, combined }) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const uniqueTags = [...new Set((tags || []).map(t => String(t).trim().toLowerCase()).filter(Boolean))]
  const { data, error } = await supabase
    .from('wiki_articles')
    .insert({
      slug,
      title,
      category: CATEGORY_SLUG_MAP[category] || category,
      short_description: description,
      tags: uniqueTags,
      format,
      content: format === 'sections'
        ? sections
            .map(s => ({ heading: s.heading.trim(), body: s.content.trim() }))
            .filter(s => s.heading || s.body)
        : null,
      combined_content: format === 'combined' ? combined : null,
      status: 'pending',
    })
    .select()
    .single()
  return { data, error }
}
