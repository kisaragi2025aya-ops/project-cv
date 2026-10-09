'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type VoiceActor = {
  id: string
  name: string
  name_kana: string | null
  image_url: string | null
  profile: string | null
}

type Character = {
  id: string
  voice_actor_id: string
  name: string
  work_title: string
  image_url: string | null
  description: string | null
  sort_order: number
}

export default function ActorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const actorId = params.id as string

  const [actor, setActor] = useState<VoiceActor | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    const fetchActorDetail = async () => {
      const { data: actorData, error: actorError } = await supabase
        .from('voice_actors')
        .select('*')
        .eq('id', actorId)
        .single()

      if (actorError || !actorData) {
        alert('声優データが見つかりません')
        router.push('/')
        return
      }

      setActor(actorData)

      const { data: charData } = await supabase
        .from('characters')
        .select('*')
        .eq('voice_actor_id', actorId)
        .order('sort_order', { ascending: true })

      if (charData) setCharacters(charData)
    }

    if (actorId) {
      fetchActorDetail()
    }
  }, [actorId, router])

  if (!actor) {
    return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">読み込み中...</main>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">声優詳細</h1>
            <p className="text-sm text-gray-500 mt-1">登録キャラクター一覧</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/edit/${actor.id}`}
              className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-2 rounded-md hover:bg-indigo-100 transition font-medium"
            >
              編集する
            </Link>
            <Link
              href="/"
              className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              ← 一覧に戻る
            </Link>
          </div>
        </header>

        {/* 声優情報ブロック */}
        <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex items-start space-x-4">
            {actor.image_url ? (
              <div className="w-16 h-16 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={actor.image_url} alt={actor.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl flex-shrink-0">
                {actor.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-baseline space-x-2">
                <h2 className="text-2xl font-bold">{actor.name}</h2>
                {actor.name_kana && <span className="text-sm text-gray-400">({actor.name_kana})</span>}
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                {actor.profile || 'プロフィール未設定'}
              </p>
            </div>
          </div>
        </section>

        {/* すべてのキャラクター一覧 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">担当キャラクター一覧</h3>
            <span className="text-xs text-gray-500">全 {characters.length} 件</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {characters.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-full py-4">担当キャラクターはまだ登録されていません。</p>
            ) : (
              characters.map((char) => (
                <div key={char.id} className="bg-gray-50 p-3 rounded-lg border flex items-center space-x-3">
                  {char.image_url ? (
                    <div className="w-10 h-10 rounded-md bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img src={char.image_url} alt={char.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold flex-shrink-0">
                      キャラ
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{char.name}</p>
                    <p className="text-xs text-gray-500 truncate">{char.work_title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}