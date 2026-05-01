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

export async function fetchBuilds({ q = '', filter = 'all' } = {}) {
  let query = supabase.from('builds').select('*').order('created_at', { ascending: false })

  if (q) {
    query = query.or(`name.ilike.%${q}%,switches.ilike.%${q}%,layout.ilike.%${q}%`)
  }

  if (filter && filter !== 'all') {
    const layoutFilters = ['60%','65%','75%','tkl','wkl','full','40%']
    const materialFilters = ['brass','aluminum','polycarbonate','steel','carbon fiber','pom']
    const switchTypeFilters = ['linear','tactile','clicky']
    const f = filter.toLowerCase()

    if (switchTypeFilters.includes(f)) {
      query = query.eq('switch_type', f)
    } else if (layoutFilters.some(l => f === l.replace('%','')||f===l)) {
      query = query.ilike('layout', `%${filter}%`)
    } else if (materialFilters.includes(f)) {
      query = query.ilike('case_material', `%${filter}%`)
    } else {
      query = query.ilike('layout', `%${filter}%`)
    }
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export async function fetchBuildBySlug(slug) {
  const nameGuess = slug.replace(/-/g, ' ')
  const { data, error } = await supabase
    .from('builds')
    .select('*')
    .or(`slug.eq.${slug},name.ilike.${nameGuess}`)
    .limit(1)
    .single()
  return { data, error }
}
