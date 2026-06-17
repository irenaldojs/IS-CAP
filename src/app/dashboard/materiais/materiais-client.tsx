'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMaterial } from '@/actions/materiais'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Filter,
  Loader2,
  X,
} from 'lucide-react'

interface Subject {
  id: string
  name: string
  color: string
}

interface MateriaisClientProps {
  subjects: Subject[]
  selectedSubjectId: string
  searchQuery: string
  children: React.ReactNode
}

export function MateriaisClient({
  subjects,
  selectedSubjectId,
  searchQuery,
  children,
}: MateriaisClientProps) {
  const router = useRouter()
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)

  const [title, setTitle] = useState('')
  const [schoolYear, setSchoolYear] = useState('Ensino Médio')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [materialType, setMaterialType] = useState('PDF')

  // Sincroniza localSearch quando searchQuery muda de fora (ex: reset ou navegação direta)
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Debounce ou alteração na URL para a pesquisa
  const handleSearchChange = (val: string) => {
    setLocalSearch(val)
    router.push(`/dashboard/materiais?subjectId=${selectedSubjectId}&q=${val}`)
  }

  const handleSubjectSelect = (id: string) => {
    router.push(`/dashboard/materiais?subjectId=${id}&q=${localSearch}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFileToUpload(selectedFile)
      if (!title) {
        const nameWithoutExtension = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name
        setTitle(nameWithoutExtension.replace(/[-_]/g, ' '))
      }
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        setMaterialType('IMAGEM')
      } else if (['pdf'].includes(ext)) {
        setMaterialType('PDF')
      } else {
        setMaterialType('DOCUMENTO')
      }
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileToUpload) {
      toast.error('Por favor, selecione um arquivo.')
      return
    }
    if (!subjectId) {
      toast.error('Selecione uma matéria associada.')
      return
    }

    setIsUploading(true)
    try {
      // 1. Faz upload via API Route
      const formData = new FormData()
      formData.append('file', fileToUpload)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Falha ao processar o arquivo no servidor')
      }

      const uploadData = await uploadRes.json()

      // 2. Registra o material didático no banco
      await createMaterial({
        subjectId,
        title,
        schoolYear,
        description,
        type: materialType,
        fileUrl: uploadData.url,
        fileName: uploadData.fileName,
        fileSize: uploadData.fileSize,
        mimeType: uploadData.mimeType,
      })

      toast.success('Material didático cadastrado!')
      setIsDialogOpen(false)
      // Reseta formulário
      setFileToUpload(null)
      setTitle('')
      setDescription('')
      router.refresh() // Recarrega os Server Components na tela com os novos dados
    } catch (err) {
      console.error(err)
      toast.error('Erro ao realizar upload do arquivo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Materiais de Apoio</h1>
          <p className="text-muted-foreground mt-1">
            Armazene e compartilhe fotos de lousa, listas de exercícios, slides e PDFs didáticos.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15"
        >
          <Plus className="mr-2 size-4" />
          Adicionar Arquivo
        </Button>
      </div>

      {/* Grid de Busca e Filtro por Matéria */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Painel de Matérias Lateral */}
        <div className="md:col-span-1 space-y-3">
          <Card className="border-slate-800 bg-slate-900/15 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Filter className="size-4 text-indigo-400" />
                Matérias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              <button
                onClick={() => handleSubjectSelect('all')}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedSubjectId === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas as Matérias
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubjectSelect(sub.id)}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all border cursor-pointer flex items-center gap-2 ${
                    selectedSubjectId === sub.id
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  {sub.name}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Busca e Lista de Materiais */}
        <div className="md:col-span-3 space-y-4">
          
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-500" />
            <Input
              placeholder="Pesquisar materiais por título ou descrição..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10.5 bg-slate-900/30 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
            />
          </div>

          {/* Grid de Arquivos (Server Component via children) */}
          {children}

        </div>

      </div>

      {/* MODAL DIALOG PARA ADICIONAR MATERIAL */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Adicionar Material Didático</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="p-6 space-y-4">
                {/* File Input */}
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs font-semibold">
                    Selecionar Arquivo <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700 file:cursor-pointer bg-slate-950 rounded-lg p-2 border border-slate-800"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-slate-300">
                    Título / Nome do Material <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="Ex: Exercícios de Álgebra Linear"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-slate-200"
                  />
                </div>

                {/* Subject Select */}
                <div className="space-y-1">
                  <Label htmlFor="subjectId" className="text-slate-300">
                    Matéria Associada <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="subjectId"
                    required
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="">Selecione...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Ano Escolar & Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="schoolYear" className="text-slate-300">
                      Ano Escolar
                    </Label>
                    <Input
                      id="schoolYear"
                      value={schoolYear}
                      onChange={(e) => setSchoolYear(e.target.value)}
                      placeholder="Ex: 8º Ano, ENEM..."
                      className="bg-slate-900 border-slate-800 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="materialType" className="text-slate-300">
                      Categoria / Tipo
                    </Label>
                    <select
                      id="materialType"
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="PDF">PDF</option>
                      <option value="FOTO">Foto de Lousa</option>
                      <option value="SCAN">Scanner de Papel</option>
                      <option value="DOCUMENTO">Word / Texto</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-slate-300">
                    Descrição Curta
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Anotações curtas sobre o arquivo ou tarefas vinculadas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-16 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUploading}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Salvar Arquivo'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

