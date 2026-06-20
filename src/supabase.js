import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qhhdnuvmnpduauwntzyu.supabase.co'
const SUPABASE_KEY = 'sb_publishable_0FBHjTVmwokCbLucw1FVoA_ihQXh6An'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
