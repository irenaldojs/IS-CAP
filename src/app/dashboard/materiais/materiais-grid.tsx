import { getMaterials } from '@/actions/materiais'
import { DeleteMaterialButton } from './delete-material-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Download,
  FileText,
  FileImage,
  FileCode,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface MateriaisGridProps {
  selectedSubjectId: string
  searchQuery: string
}

export async function MateriaisGrid({ selectedSubjectId, searchQuery }: MateriaisGridProps) {
  const materials = await getMaterials()

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return <FileText className="size-8 text-rose-500" />
      case 'FOTO':
      case 'SCAN':
      case 'IMAGEM':
        return <FileImage className="size-8 text-emerald-500" />
      case 'DOCUMENTO':
      case 'DOC':
      case 'DOCX':
        return <FileText className="size-8 text-blue-500" />
      default:
        return <FileCode className="size-8 text-slate-400" />
    }
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // Filtragem no Servidor
  const filteredMaterials = materials.filter(m => {
    const matchSubject = selectedSubjectId === 'all' || m.subjectId === selectedSubjectId
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  if (filteredMaterials.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900/10 py-16 text-center">
        <CardContent className="flex flex-col items-center justify-center">
          <BookOpen className="size-12 text-slate-700 mb-3" />
          <h3 className="font-semibold text-slate-300">Nenhum arquivo encontrado</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Faça o upload do seu primeiro arquivo de exercícios ou fotos clicando no botão acima.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {filteredMaterials.map((material) => (
        <Card 
          key={material.id} 
          className="border-slate-800 bg-slate-900/20 hover:bg-slate-900/30 transition-all backdrop-blur-md relative overflow-hidden group flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row items-start gap-4 pb-3">
            <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 shrink-0">
              {getFileIcon(material.type)}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  style={{ color: material.subject.color, backgroundColor: `${material.subject.color}15` }}
                  className="px-2 py-0.5 text-[10px] font-bold rounded border border-slate-800"
                >
                  {material.subject.name}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  {material.schoolYear}
                </span>
              </div>
              <h3 className="font-semibold text-slate-200 truncate group-hover:text-white transition-colors" title={material.title}>
                {material.title}
              </h3>
              <p className="text-xs text-slate-500 truncate" title={material.fileName}>
                {material.fileName}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            {material.description && (
              <p className="text-xs text-slate-400 bg-slate-950/45 p-2 rounded mb-3 line-clamp-2">
                {material.description}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
              <span className="text-xs text-slate-500 font-mono">
                {formatBytes(material.fileSize)}
              </span>
              
              <div className="flex items-center gap-2">
                <DeleteMaterialButton id={material.id} />
                <a 
                  href={material.fileUrl} 
                  download={material.fileName} 
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "h-8 gap-1.5 cursor-pointer border-slate-800")}
                >
                  <Download className="size-3.5 text-indigo-400" />
                  Download
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
