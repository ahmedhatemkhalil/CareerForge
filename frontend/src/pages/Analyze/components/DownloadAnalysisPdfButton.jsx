import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'

const PdfIcon = ({ className = 'size-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      fill="#EF4444"
    />
    <path d="M14 2v6h6" fill="#DC2626" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="white"
      fontSize="5.5"
      fontWeight="700"
      fontFamily="Arial, sans-serif"
    >
      PDF
    </text>
  </svg>
)

const DownloadAnalysisPdfButton = ({
  analysis,
  roleTitle,
  cvFileName,
}) => {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!analysis) return

    setLoading(true)
    try {
      const { downloadAnalysisPdf } = await import('./AnalysisPdfDocument')
      await downloadAnalysisPdf({ analysis, roleTitle, cvFileName })
      toast.success('PDF downloaded!')
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      onClick={handleDownload}
      disabled={loading || !analysis}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <PdfIcon />
      )}
      Download PDF
    </Button>
  )
}

export default DownloadAnalysisPdfButton
