'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase'
import { useDemoStore } from '@/store/demoStore'

interface SaveSessionModalProps {
  module: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData: () => any
  onSaved?: () => void
}

export default function SaveSessionModal({ module, getData, onSaved }: SaveSessionModalProps) {
  const router = useRouter()
  const { sessionId, sessionName, setSessionId } = useDemoStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setOpen(false)
      router.push('/login')
      return
    }

    try {
      let currentSessionId = sessionId

      if (!currentSessionId) {
        if (!name.trim()) { setError('Masukkan nama sesi'); setLoading(false); return }
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })
        if (!res.ok) throw new Error('Gagal membuat sesi')
        const sess = await res.json()
        currentSessionId = sess.id
        setSessionId(sess.id, name.trim())
      }

      const res = await fetch(`/api/sessions/${currentSessionId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, data: getData() }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan data')

      setSaved(true)
      setTimeout(() => { setOpen(false); setSaved(false); onSaved?.() }, 1200)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Save className="h-3.5 w-3.5" />
        Simpan Sesi
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Simpan ke Sesi</DialogTitle>
            <DialogDescription>
              {sessionId
                ? `Menyimpan ke sesi: ${sessionName}`
                : 'Beri nama sesi ini untuk disimpan ke akun Anda.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {saved && <Alert><AlertDescription className="text-primary font-medium">✓ Berhasil disimpan!</AlertDescription></Alert>}

            {!sessionId && (
              <div className="space-y-1.5">
                <Label htmlFor="session-name">Nama Sesi</Label>
                <Input
                  id="session-name"
                  placeholder="cth: Analisis Agustus 2025"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Batal</Button>
              <Button size="sm" onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {saved ? 'Tersimpan!' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
