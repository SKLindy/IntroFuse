'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Upload, Link, Type, Search } from 'lucide-react'
import { ContentType } from '@/types/database'
import { toast } from 'sonner'
import { performWebSearch } from '@/lib/web-search'

interface ContentInputProps {
  contentSource: string
  contentType: ContentType | null
  onContentChange: (source: string, type: ContentType) => void
}

export function ContentInput({ contentSource, contentType, onContentChange }: ContentInputProps) {
  const [urlInput, setUrlInput] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isProcessingUrl, setIsProcessingUrl] = useState(false)
  const [isProcessingSearch, setIsProcessingSearch] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL')
      return
    }

    try {
      new URL(urlInput)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsProcessingUrl(true)
    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extract URL content')
      }

      const data = await response.json()
      onContentChange(data.content, 'url')
      toast.success('URL content extracted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to process URL content')
    } finally {
      setIsProcessingUrl(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 'text/html', 'application/msword']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|html|htm|doc|docx)$/i)) {
      toast.error('Please upload a text, PDF, HTML, or Word document')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadedFile(file)
    
    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onContentChange(content, 'upload')
      toast.success(`File "${file.name}" uploaded successfully`)
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsText(file)
  }

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter some content')
      return
    }

    onContentChange(manualInput, 'manual')
    toast.success('Manual content added successfully')
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
    // Immediately set the search query as content when user types
    if (value.trim()) {
      onContentChange(value, 'search')
    }
  }

  return (
    <Tabs defaultValue="url" className="w-full">
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
        <div>
          <Label htmlFor="url-input">Website URL</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isProcessingUrl}
            />
            <Button 
              onClick={handleUrlSubmit} 
              disabled={isProcessingUrl || !urlInput.trim()}
              size="sm"
            >
              {isProcessingUrl ? 'Processing...' : 'Extract'}
            </Button>
          </div>
        </div>
        {contentType === 'url' && contentSource && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            ✓ Content extracted from URL
          </div>
        )}
      </TabsContent>

      <TabsContent value="search" className="space-y-3">
        <div>
          <Label htmlFor="search-input">Search Keywords or Topic</Label>
          <Input
            id="search-input"
            type="text"
            placeholder="e.g., robert redford, latest AI breakthrough, trending news"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Enter keywords or topics to search for current news
          </div>
        </div>
        {contentType === 'search' && contentSource && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            ✓ Search query ready: "{contentSource}"
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="space-y-3">
        <div>
          <Label htmlFor="file-upload">Document Upload</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".txt,.pdf,.html,.htm,.doc,.docx"
            onChange={handleFileUpload}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Supported formats: TXT, PDF, HTML, DOC, DOCX (max 5MB)
          </div>
        </div>
        {uploadedFile && contentType === 'upload' && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            ✓ File &quot;{uploadedFile.name}&quot; processed successfully
          </div>
        )}
      </TabsContent>

      <TabsContent value="manual" className="space-y-3">
        <div>
          <Label htmlFor="manual-input">Enter Content Manually</Label>
          <Textarea
            id="manual-input"
            placeholder="Paste or type your content here..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            rows={4}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handleManualSubmit}
          disabled={!manualInput.trim()}
          size="sm"
          className="w-full"
        >
          Use This Content
        </Button>
        {contentType === 'manual' && contentSource && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            ✓ Manual content added
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}