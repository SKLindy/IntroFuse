'use client'

import { Header } from '@/components/layout/header'
import { ContentInput } from './content-input'
import { SongDetails } from './song-details'
import { StyleSelector } from './style-selector'
import { ScriptGenerator } from './script-generator'
import { ScriptOutput } from './script-output'
import { useState } from 'react'
import { ContentType } from '@/types/database'
import { SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'

interface DashboardState {
  contentSource: string
  contentType: ContentType | null
  artist: string
  songTitle: string
  selectedStyle: string
  scripts: {
    short: string
    long: string
  } | null
}

export function DashboardLayout() {
  const [state, setState] = useState<DashboardState>({
    contentSource: '',
    contentType: null,
    artist: '',
    songTitle: '',
    selectedStyle: 'Conversational',
    scripts: null
  })
  const [loading, setLoading] = useState(false)
  const [copiedShort, setCopiedShort] = useState(false)
  const [copiedLong, setCopiedLong] = useState(false)

  const updateState = (updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const copyShortScript = async () => {
    if (state.scripts?.short) {
      await navigator.clipboard.writeText(state.scripts.short)
      setCopiedShort(true)
      setTimeout(() => setCopiedShort(false), 2000) // Reset after 2 seconds
    }
  }

  const copyLongScript = async () => {
    if (state.scripts?.long) {
      await navigator.clipboard.writeText(state.scripts.long)
      setCopiedLong(true)
      setTimeout(() => setCopiedLong(false), 2000) // Reset after 2 seconds
    }
  }

  const canGenerate = state.contentSource && state.artist && state.songTitle && state.selectedStyle

  const generateScripts = async () => {
    if (!canGenerate) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentSource: state.contentSource,
          contentType: state.contentType,
          artist: state.artist,
          songTitle: state.songTitle,
          selectedStyle: state.selectedStyle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate scripts')
      }

      const data = await response.json()
      updateState({
        scripts: {
          short: data.shortScript,
          long: data.longScript,
        }
      })
    } catch (error: any) {
      console.error('Error generating scripts:', error)
      // You might want to add a toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900 dark:via-indigo-900 dark:to-blue-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">IntroFuse</h1>
            <p className="text-sm text-blue-900 dark:text-blue-100 mt-1">by Lindy Media AI</p>
          </div>
          <SignOutButton>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-blue-200 rounded-md hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-800 transition-colors shadow-md">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Input */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-blue-100 dark:border-slate-700">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Content & Song Details</h2>
              </div>

              {/* Content Input */}
              <div>
                <h3 className="text-sm font-medium mb-2">Content Source</h3>
                <ContentInput
                  contentSource={state.contentSource}
                  contentType={state.contentType}
                  onContentChange={(source, type) => updateState({ contentSource: source, contentType: type })}
                />
              </div>

              {/* Song Details */}
              <div>
                <h3 className="text-sm font-medium mb-2">Song Details</h3>
                <SongDetails
                  artist={state.artist}
                  songTitle={state.songTitle}
                  onArtistChange={(artist) => updateState({ artist })}
                  onSongTitleChange={(songTitle) => updateState({ songTitle })}
                />
              </div>

              {/* Style Selector */}
              <div>
                <h3 className="text-sm font-medium mb-2">Writing Style</h3>
                <StyleSelector
                  selectedStyle={state.selectedStyle}
                  onStyleChange={(selectedStyle) => updateState({ selectedStyle })}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateScripts}
                disabled={!canGenerate || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? 'Generating Scripts...' : 'Generate Scripts'}
              </button>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-blue-100 dark:border-slate-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Generated Scripts</h2>

              {state.scripts ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">5-10 Second Script:</h3>
                    <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-md text-sm font-mono border border-blue-100 dark:border-slate-600 shadow-inner">
                      {state.scripts.short}
                    </div>
                    <button
                      className={`mt-2 text-sm px-3 py-1 border rounded transition-all duration-200 shadow-md ${
                        copiedShort
                          ? 'bg-green-500 text-white border-green-500 shadow-green-200'
                          : 'border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-700'
                      }`}
                      onClick={copyShortScript}
                    >
                      {copiedShort ? '✓ Copied!' : 'Copy Short Script'}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">15-20 Second Script:</h3>
                    <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-md text-sm font-mono border border-blue-100 dark:border-slate-600 shadow-inner">
                      {state.scripts.long}
                    </div>
                    <button
                      className={`mt-2 text-sm px-3 py-1 border rounded transition-all duration-200 shadow-md ${
                        copiedLong
                          ? 'bg-green-500 text-white border-green-500 shadow-green-200'
                          : 'border-blue-200 hover:bg-blue-50 dark:border-slate-600 dark:hover:bg-slate-700'
                      }`}
                      onClick={copyLongScript}
                    >
                      {copiedLong ? '✓ Copied!' : 'Copy Long Script'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Scripts will appear here after generation.</p>
                  <p className="text-xs mt-2">Try with sample content like news stories or trending topics</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">2025 Lindy Media AI Consulting. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}