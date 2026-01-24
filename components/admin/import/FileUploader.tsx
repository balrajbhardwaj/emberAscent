'use client'

import { ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
  accepted?: string
  fileName?: string | null
}

export function FileUploader({ onFileSelect, accepted = '.json,.csv', fileName }: FileUploaderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    onFileSelect(file ?? null)
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm">
      <p className="text-slate-600">Drag & drop or select a file to begin. Max 10MB.</p>
      <label className="flex flex-col gap-2">
        <Input type="file" accept={accepted} onChange={handleChange} />
      </label>
      {fileName && <p className="text-xs text-slate-500">Selected: {fileName}</p>}
      <Button variant="link" type="button" size="sm" onClick={() => onFileSelect(null)}>
        Clear selection
      </Button>
    </div>
  )
}
