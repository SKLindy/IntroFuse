'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function TestPage() {
  const [content, setContent] = useState('')
  const [artist, setArtist] = useState('')
  const [song, setSong] = useState('')
  const [scripts, setScripts] = useState<{ short: string; long: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const generateScripts = async () => {
    if (!content || !artist || !song) {
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
          contentSource: content,
          contentType: 'manual',
          artist,
          songTitle: song,
          selectedStyle: 'Casual',
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
                <Textarea
                  placeholder="Enter your content here... (e.g., news story, trending topic)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
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