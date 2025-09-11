'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Download, RefreshCw, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface ScriptOutputProps {
  shortScript: string
  longScript: string
  onRegenerate: () => void
}

export function ScriptOutput({ shortScript, longScript, onRegenerate }: ScriptOutputProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [editingShort, setEditingShort] = useState(false)
  const [editingLong, setEditingLong] = useState(false)
  const [shortScriptEdit, setShortScriptEdit] = useState(shortScript)
  const [longScriptEdit, setLongScriptEdit] = useState(longScript)

  const copyToClipboard = async (text: string, type: 'short' | 'long') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type === 'short' ? '5-10 second' : '15-20 second'} script copied to clipboard`)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadScript = (text: string, type: 'short' | 'long') => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `introfuse-${type}-script-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${type === 'short' ? '5-10 second' : '15-20 second'} script downloaded`)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      onRegenerate()
      toast.success('Regenerating scripts...')
    } catch (error) {
      toast.error('Failed to regenerate scripts')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Scripts Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Short Script (5-10 seconds) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              5-10 Second Script
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingShort(!editingShort)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(editingShort ? shortScriptEdit : shortScript, 'short')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadScript(editingShort ? shortScriptEdit : shortScript, 'short')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingShort ? (
              <div className="space-y-2">
                <Textarea
                  value={shortScriptEdit}
                  onChange={(e) => setShortScriptEdit(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setEditingShort(false)}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setShortScriptEdit(shortScript)
                      setEditingShort(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap font-mono text-sm bg-muted p-3 rounded">
                  {shortScript}
                </p>
              </div>
            )}
            <div className="mt-3 text-xs text-muted-foreground">
              <strong>Performance Notes:</strong> Keep it punchy and engaging. Perfect for quick transitions.
            </div>
          </CardContent>
        </Card>

        {/* Long Script (15-20 seconds) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              15-20 Second Script
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingLong(!editingLong)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(editingLong ? longScriptEdit : longScript, 'long')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadScript(editingLong ? longScriptEdit : longScript, 'long')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingLong ? (
              <div className="space-y-2">
                <Textarea
                  value={longScriptEdit}
                  onChange={(e) => setLongScriptEdit(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setEditingLong(false)}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setLongScriptEdit(longScript)
                      setEditingLong(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap font-mono text-sm bg-muted p-3 rounded">
                  {longScript}
                </p>
              </div>
            )}
            <div className="mt-3 text-xs text-muted-foreground">
              <strong>Performance Notes:</strong> Build momentum and create anticipation. Great for setting the mood.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          variant="outline"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate All
            </>
          )}
        </Button>
        
        <Button variant="outline">
          Regenerate with Prompt
        </Button>
      </div>
    </div>
  )
}