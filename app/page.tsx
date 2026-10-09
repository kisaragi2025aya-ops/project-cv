'use client'

import { useEffect, useState } from 'react'
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

export default function Home() {
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([])
  const [characters, setCharacters] = useState<Character[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'kana_asc' | 'kana_desc' | 'char_count_desc' | 'char_count_asc'>('kana_asc')

  const fetchData = async () => {
    const { data: actors } = await supabase.from('voice_actors').select('*')
    const { data: chars } = await supabase
      .from('characters')
      .select('*')
      .order('sort_order', { ascending: true })

    if (actors) setVoiceActors(actors)
    if (chars) setCharacters(chars)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const sortedActors = [...voiceActors].sort((a, b) => {
    const countA = characters.filter((c) => c.voice_actor_id === a.id).length
    const countB = characters.filter((c) => c.voice_actor_id === b.id).length

    if (sortOrder === 'char_count_desc') {
      if (countB !== countA) return countB - countA
      const keyA = a.name_kana && a.name_kana.trim() !== '' ? a.name_kana : a.name
      const keyB = b.name_kana && b.name_kana.trim() !== '' ? b.name_kana : b.name
      return keyA.localeCompare(keyB, 'ja')
    } else if (sortOrder === 'char_count_asc') {
      if (countA !== countB) return countA - countB
      const keyA = a.name_kana && a.name_kana.trim() !== '' ? a.name_kana : a.name
      const keyB = b.name_kana && b.name_kana.trim() !== '' ? b.name_kana : b.name
      return keyA.localeCompare(keyB, 'ja')
    } else {
      const keyA = a.name_kana && a.name_kana.trim() !== '' ? a.name_kana : a.name
      const keyB = b.name_kana && b.name_kana.trim() !== '' ? b.name_kana : b.name
      const comparison = keyA.localeCompare(keyB, 'ja')
      return sortOrder === 'kana_asc' ? comparison : -comparison
    }
  })

  const filteredActors = sortedActors.filter((actor) => {
    const query = searchQuery.toLowerCase()
    const actorChars = characters.filter((c) => c.voice_actor_id === actor.id)

    const matchActor =
      actor.name.toLowerCase().includes(query) ||
      (actor.name_kana && actor.name_kana.toLowerCase().includes(query)) ||
      (actor.profile && actor.profile.toLowerCase().includes(query))

    const matchChar = actorChars.some(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.work_title.toLowerCase().includes(query)
    )

    return matchActor || matchChar
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project CV</h1>
            <p className="text-sm text-gray-500 mt-1">声優・キャラクター管理データベース</p>
          </div>
          <Link
            href="/register"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            + 新規登録
          </Link>
        </header>

        {/* 検索・ソートコントロールエリア */}
        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="声優名、キャラクター名、作品名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-sm text-gray-600">並び順:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="kana_asc">五十音順 (昇順)</option>
              <option value="kana_desc">逆五十音順 (降順)</option>
              <option value="char_count_desc">キャラクター登録数が多い順</option>
              <option value="char_count_asc">キャラクター登録数が少ない順</option>
            </select>
          </div>
        </div>

        {/* 一覧表示エリア */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">登録声優・キャラクター一覧</h2>
          <div className="space-y-6">
            {filteredActors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {voiceActors.length === 0
                  ? 'まだ声優が登録されていません。「新規登録」から追加してください。'
                  : '一致する声優・キャラクターが見つかりませんでした。'}
              </p>
            ) : (
              filteredActors.map((actor) => {
                const actorChars = characters.filter((c) => c.voice_actor_id === actor.id)
                const displayedChars = actorChars.slice(0, 6)
                const remainingCount = actorChars.length - displayedChars.length

                return (
                  <div key={actor.id} className="relative border-b pb-6 last:border-b-0 last:pb-0">
                    {/* 右上に配置する編集ボタン */}
                    <div className="absolute top-0 right-0">
                      <Link
                        href={`/edit/${actor.id}`}
                        className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-md transition font-medium shadow-sm"
                      >
                        編集
                      </Link>
                    </div>

                    {/* 声優情報ブロック */}
                    <div className="flex items-start space-x-4 pr-16 mb-4">
                      {actor.image_url ? (
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={actor.image_url} alt={actor.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-baseline space-x-2">
                          <Link href={`/detail/${actor.id}`} className="text-lg font-bold hover:text-indigo-600 transition">
                            {actor.name}
                          </Link>
                          {actor.name_kana && (
                            <span className="text-xs text-gray-400">({actor.name_kana})</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {actor.profile || 'プロフィール未設定'}
                        </p>
                      </div>
                    </div>

                    {/* キャラクター一覧（最大6件まで表示） */}
                    <div className="pl-16 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {displayedChars.length === 0 ? (
                          <p className="text-xs text-gray-400">担当キャラクターはまだ登録されていません。</p>
                        ) : (
                          displayedChars.map((char) => (
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

                      {remainingCount > 0 && (
                        <div>
                          <Link
                            href={`/detail/${actor.id}`}
                            className="inline-block text-xs text-indigo-600 hover:underline font-medium"
                          >
                            他 {remainingCount} 件のキャラクターを見る →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </main>
  )
}