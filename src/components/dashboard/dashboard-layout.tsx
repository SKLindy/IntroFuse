'use client'

import { Header } from '@/components/layout/header'
import { ContentInput } from './content-input'
import { SongDetails } from './song-details'
import { StyleSelector } from './style-selector'
import { ScriptGenerator } from './script-generator'
import { ScriptOutput } from './script-output'
import { useState } from 'react'
import { ContentType } from '@/types/database'

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

  const updateState = (updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const canGenerate = state.contentSource && state.artist && state.songTitle && state.selectedStyle

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 16:9 aspect ratio layout */}
          <div className="aspect-video bg-background rounded-lg shadow-lg border p-6">
            <div className="h-full flex flex-col">
              {/* Above the fold content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Import Content Section */}
                <div className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 text-primary">Import Content</h2>
                  <ContentInput
                    contentSource={state.contentSource}
                    contentType={state.contentType}
                    onContentChange={(source, type) => updateState({ contentSource: source, contentType: type })}
                  />
                </div>

                {/* Song Details Section */}
                <div className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 text-primary">Song Details</h2>
                  <SongDetails
                    artist={state.artist}
                    songTitle={state.songTitle}
                    onArtistChange={(artist) => updateState({ artist })}
                    onSongTitleChange={(songTitle) => updateState({ songTitle })}
                  />
                </div>

                {/* Select Style Section */}
                <div className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 text-primary">Select Style</h2>
                  <StyleSelector
                    selectedStyle={state.selectedStyle}
                    onStyleChange={(selectedStyle) => updateState({ selectedStyle })}
                  />
                </div>
              </div>

              {/* Generate Scripts Button */}
              <div className="flex justify-center mb-6">
                <ScriptGenerator
                  disabled={!canGenerate}
                  onGenerate={async (scripts) => updateState({ scripts })}
                  contentSource={state.contentSource}
                  contentType={state.contentType}
                  artist={state.artist}
                  songTitle={state.songTitle}
                  selectedStyle={state.selectedStyle}
                />
              </div>

              {/* Script Output */}
              {state.scripts && (
                <div className="flex-1 overflow-y-auto">
                  <ScriptOutput
                    shortScript={state.scripts.short}
                    longScript={state.scripts.long}
                    onRegenerate={() => {
                      // Trigger regeneration
                      updateState({ scripts: null })
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}