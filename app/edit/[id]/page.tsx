'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type VoiceActor = {
  id: string
  name: string
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

export default function EditActorPage() {
  const params = useParams()
  const router = useRouter()
  const actorId = params.id as string

  const [actorName, setActorName] = useState('')
  const [actorImage, setActorImage] = useState('')
  const [actorProfile, setActorProfile] = useState('')

  const [characters, setCharacters] = useState<Character[]>([])

  const [newCharName, setNewCharName] = useState('')
  const [newCharWork, setNewCharWork] = useState('')
  const [newCharImage, setNewCharImage] = useState('')

  const [editingCharId, setEditingCharId] = useState<string | null>(null)
  const [editCharName, setEditCharName] = useState('')
  const [editCharWork, setEditCharWork] = useState('')
  const [editCharImage, setEditCharImage] = useState('')

  // ドラッグ＆ドロップ用の状態管理
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const fetchData = async () => {
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

    setActorName(actorData.name)
    setActorImage(actorData.image_url || '')
    setActorProfile(actorData.profile || '')

    const { data: charData } = await supabase
      .from('characters')
      .select('*')
      .eq('voice_actor_id', actorId)
      .order('sort_order', { ascending: true })

    if (charData) setCharacters(charData)
  }

  useEffect(() => {
    if (actorId) fetchData()
  }, [actorId])

  const handleUpdateActor = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('voice_actors')
      .update({
        name: actorName,
        image_url: actorImage,
        profile: actorProfile,
      })
      .eq('id', actorId)

    if (error) {
      alert('更新エラー: ' + error.message)
    } else {
      alert('声優情報を更新しました！')
    }
  }

  const handleDeleteActor = async () => {
    if (!confirm('この声優と、紐づくキャラクターをすべて削除しますか？')) return

    const { error } = await supabase.from('voice_actors').delete().eq('id', actorId)
    if (error) {
      alert('削除エラー: ' + error.message)
    } else {
      router.push('/')
    }
  }

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCharName || !newCharWork) return

    const nextOrder = characters.length > 0 ? Math.max(...characters.map(c => c.sort_order)) + 1 : 0

    const { error } = await supabase.from('characters').insert([
      {
        voice_actor_id: actorId,
        name: newCharName,
        work_title: newCharWork,
        image_url: newCharImage,
        sort_order: nextOrder,
      },
    ])

    if (error) {
      alert('キャラクター追加エラー: ' + error.message)
    } else {
      setNewCharName('')
      setNewCharWork('')
      setNewCharImage('')
      fetchData()
    }
  }

  const startEditCharacter = (char: Character) => {
    setEditingCharId(char.id)
    setEditCharName(char.name)
    setEditCharWork(char.work_title)
    setEditCharImage(char.image_url || '')
  }

  const handleUpdateCharacter = async (charId: string) => {
    const { error } = await supabase
      .from('characters')
      .update({
        name: editCharName,
        work_title: editCharWork,
        image_url: editCharImage,
      })
      .eq('id', charId)

    if (error) {
      alert('キャラクター更新エラー: ' + error.message)
    } else {
      setEditingCharId(null)
      fetchData()
    }
  }

  const handleDeleteCharacter = async (charId: string) => {
    if (!confirm('このキャラクターを削除しますか？')) return

    const { error } = await supabase.from('characters').delete().eq('id', charId)
    if (error) {
      alert('削除エラー: ' + error.message)
    } else {
      fetchData()
    }
  }

  // ドラッグ＆ドロップのハンドラー
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const updated = [...characters]
    const [movedItem] = updated.splice(draggedIndex, 1)
    updated.splice(targetIndex, 0, movedItem)

    setCharacters(updated)
    setDraggedIndex(null)

    // データベースの sort_order を新しい並び順で一括更新
    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from('characters')
        .update({ sort_order: i })
        .eq('id', updated[i].id)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">声優・キャラクター編集</h1>
            <p className="text-sm text-gray-500 mt-1">情報の更新およびキャラクターの管理・並び替え</p>
          </div>
          <Link
            href="/"
            className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            ← 一覧に戻る
          </Link>
        </header>

        {/* 声優情報 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">声優情報</h2>
            <button
              onClick={handleDeleteActor}
              className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-sm hover:bg-red-100 transition"
            >
              この声優を削除
            </button>
          </div>

          <form onSubmit={handleUpdateActor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">名前 *</label>
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">画像URL</label>
              <input
                type="url"
                value={actorImage}
                onChange={(e) => setActorImage(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">プロフィール</label>
              <textarea
                value={actorProfile}
                onChange={(e) => setActorProfile(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition text-sm font-medium"
            >
              声優情報を保存
            </button>
          </form>
        </section>

        {/* 担当キャラクター管理（ドラッグ＆ドロップ対応） */}
        <section className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <div>
            <h2 className="text-xl font-semibold">担当キャラクター管理</h2>
            <p className="text-xs text-gray-500 mt-1">※ カードをドラッグ＆ドロップして並び替えることができます。</p>
          </div>

          <div className="space-y-3">
            {characters.length === 0 ? (
              <p className="text-sm text-gray-500">担当キャラクターはまだ登録されていません。</p>
            ) : (
              characters.map((char, index) => (
                <div
                  key={char.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className="border p-4 rounded-lg bg-gray-50 flex items-center justify-between cursor-move hover:border-indigo-400 transition"
                >
                  {editingCharId === char.id ? (
                    <div className="space-y-3 w-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">キャラ名</label>
                          <input
                            type="text"
                            value={editCharName}
                            onChange={(e) => setEditCharName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">作品名</label>
                          <input
                            type="text"
                            value={editCharWork}
                            onChange={(e) => setEditCharWork(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">画像URL</label>
                        <input
                          type="url"
                          value={editCharImage}
                          onChange={(e) => setEditCharImage(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateCharacter(char.id)}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-emerald-700"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCharId(null)}
                          className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 font-bold select-none">☰</span>
                        {char.image_url ? (
                          <div className="w-12 h-12 rounded-md bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img src={char.image_url} alt={char.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold flex-shrink-0">
                            キャラ
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{char.name}</p>
                          <p className="text-xs text-gray-500">{char.work_title}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditCharacter(char)}
                          className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteCharacter(char.id)}
                          className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-100 transition"
                        >
                          削除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 新規キャラクター追加 */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">新しいキャラクターを追加</h3>
            <form onSubmit={handleAddCharacter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">キャラ名 *</label>
                  <input
                    type="text"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">作品名 *</label>
                  <input
                    type="text"
                    value={newCharWork}
                    onChange={(e) => setNewCharWork(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">画像URL</label>
                <input
                  type="url"
                  value={newCharImage}
                  onChange={(e) => setNewCharImage(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition text-sm font-medium"
              >
                キャラクターを追加する
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}