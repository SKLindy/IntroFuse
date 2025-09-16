'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link, Type, Search } from 'lucide-react'

export default function TestPage() {
  const [contentSource, setContentSource] = useState('')
  const [contentType, setContentType] = useState<'url' | 'search' | 'upload' | 'manual'>('manual')
  const [artist, setArtist] = useState('')
  const [song, setSong] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('Conversational')
  const [scripts, setScripts] = useState<{ short: string; long: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const generateScripts = async () => {
    if (!contentSource || !artist || !song) {
      alert('Please fill in all fields')
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
          contentSource,
          contentType,
          artist,
          songTitle: song,
          selectedStyle: selectedStyle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate scripts')
      }

      const data = await response.json()
      setScripts({
        short: data.shortScript,
        long: data.longScript,
      })
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">IntroFuse Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Content & Song Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Content Source</Label>
                <Tabs value={contentType} onValueChange={(value) => setContentType(value as any)} className="w-full mt-2">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="url" className="flex items-center gap-1">
                      <Link className="w-4 h-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="search" className="flex items-center gap-1">
                      <Search className="w-4 h-4" />
                      Search
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center gap-1">
                      <Type className="w-4 h-4" />
                      Manual
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-3">
                    <Input
                      placeholder="https://example.com/article"
                      value={contentSource}
                      onChange={(e) => setContentSource(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground">
                      Enter a website URL to extract content from
                    </div>
                  </TabsContent>

                  <TabsContent value="search" className="space-y-3">
                    <Input
                      placeholder="e.g., robert redford, latest AI breakthrough, trending news"
                      value={contentSource}
                      onChange={(e) => setContentSource(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground">
                      Enter keywords or topics to search for current news
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-3">
                    <Input
                      type="file"
                      accept=".txt,.pdf,.html,.htm,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            setContentSource(event.target?.result as string)
                          }
                          reader.readAsText(file)
                        }
                      }}
                    />
                    <div className="text-xs text-muted-foreground">
                      Upload a document (TXT, PDF, HTML, DOC, DOCX)
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-3">
                    <Textarea
                      placeholder="Enter your content here... (e.g., news story, trending topic)"
                      value={contentSource}
                      onChange={(e) => setContentSource(e.target.value)}
                      rows={4}
                    />
                    <div className="text-xs text-muted-foreground">
                      Type or paste content directly
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div>
                <Label>Artist</Label>
                <Input
                  placeholder="Artist name"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
              <div>
                <Label>Song</Label>
                <Input
                  placeholder="Song title"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                />
              </div>
              <div>
                <Label>Writing Style</Label>
                <div className="flex gap-2 mt-1">
                  {['Conversational', 'Humorous', 'Thoughtful'].map((style) => (
                    <Button
                      key={style}
                      variant={selectedStyle === style ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStyle(style)}
                      className="flex-1"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedStyle === 'Conversational' && 'Natural and approachable, like talking to a friend'}
                  {selectedStyle === 'Humorous' && 'Witty and entertaining with clever observations'}
                  {selectedStyle === 'Thoughtful' && 'Reflective and insightful, connecting deeper themes'}
                </div>
              </div>
              <Button 
                onClick={generateScripts} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                size="lg"
              >
                {loading ? 'Generating Scripts...' : 'Generate Scripts'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Scripts</CardTitle>
            </CardHeader>
            <CardContent>
              {scripts ? (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold">5-10 Second Script:</Label>
                    <div className="bg-muted p-4 rounded-md text-sm mt-2 font-mono">
                      {scripts.short}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(scripts.short)}
                    >
                      Copy Short Script
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">15-20 Second Script:</Label>
                    <div className="bg-muted p-4 rounded-md text-sm mt-2 font-mono">
                      {scripts.long}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(scripts.long)}
                    >
                      Copy Long Script
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Scripts will appear here after generation.</p>
                  <p className="text-xs mt-2">Try with sample content like news stories or trending topics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>Test page - bypasses authentication for debugging</p>
        </div>
      </div>
    </div>
  )
}