import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import PdfIcon from '@/components/common/PdfIcon'

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
