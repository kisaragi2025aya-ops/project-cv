'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type VoiceActor = {
  id: string
  name: string
}

export default function RegisterPage() {
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([])

  const [actorName, setActorName] = useState('')
  const [actorNameKana, setActorNameKana] = useState('') // よみがな用状態
  const [actorImage, setActorImage] = useState('')
  const [actorProfile, setActorProfile] = useState('')

  const [charName, setCharName] = useState('')
  const [charWork, setCharWork] = useState('')
  const [charActorId, setCharActorId] = useState('')
  const [charImage, setCharImage] = useState('')
  const [charDesc, setCharDesc] = useState('')

  const fetchActors = async () => {
    const { data } = await supabase.from('voice_actors').select('id, name')
    if (data) setVoiceActors(data)
  }

  useEffect(() => {
    fetchActors()
  }, [])

  const handleAddActor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actorName) return

    const { error } = await supabase.from('voice_actors').insert([
      {
        name: actorName,
        name_kana: actorNameKana,
        image_url: actorImage,
        profile: actorProfile,
      },
    ])

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('声優を登録しました！')
      setActorName('')
      setActorNameKana('')
      setActorImage('')
      setActorProfile('')
      fetchActors()
    }
  }

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!charName || !charWork || !charActorId) return

    const { error } = await supabase.from('characters').insert([
      {
        voice_actor_id: charActorId,
        name: charName,
        work_title: charWork,
        image_url: charImage,
        description: charDesc,
      },
    ])

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('キャラクターを登録しました！')
      setCharName('')
      setCharWork('')
      setCharImage('')
      setCharDesc('')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">データ登録</h1>
            <p className="text-sm text-gray-500 mt-1">声優・キャラクターの追加</p>
          </div>
          <Link
            href="/"
            className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            ← 一覧に戻る
          </Link>
        </header>

        <div className="space-y-8">
          {/* 声優登録 */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">声優の追加</h2>
            <form onSubmit={handleAddActor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">名前 *</label>
                  <input
                    type="text"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">よみがな（並び替え用）</label>
                  <input
                    type="text"
                    value={actorNameKana}
                    onChange={(e) => setActorNameKana(e.target.value)}
                    placeholder="例: みやのまもる"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">※ 五十音順ソートの基準になります</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">画像URL</label>
                <input
                  type="url"
                  value={actorImage}
                  onChange={(e) => setActorImage(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">プロフィール</label>
                <textarea
                  value={actorProfile}
                  onChange={(e) => setActorProfile(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
              >
                声優を登録
              </button>
            </form>
          </section>

          {/* キャラクター登録 */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">キャラクターの追加</h2>
            <form onSubmit={handleAddCharacter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">担当声優 *</label>
                <select
                  value={charActorId}
                  onChange={(e) => setCharActorId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">声優を選択してください</option>
                  {voiceActors.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {actor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">キャラ名 *</label>
                  <input
                    type="text"
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">作品名 *</label>
                  <input
                    type="text"
                    value={charWork}
                    onChange={(e) => setCharWork(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">画像URL</label>
                <input
                  type="url"
                  value={charImage}
                  onChange={(e) => setCharImage(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition"
              >
                キャラクターを登録
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}