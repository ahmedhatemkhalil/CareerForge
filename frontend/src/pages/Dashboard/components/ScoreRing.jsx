import { getScoreStyles } from '@/utils/helpers'

const ScoreRing = ({ score, size = 40 }) => {
  const styles = getScoreStyles(score)
  const center = size / 2
  const radius = center - 4
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="stroke-muted"
          strokeWidth="3.5"
          fill="transparent"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={styles.stroke}
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={score > 0 ? strokeDashoffset : circumference}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-[11px] font-bold ${styles.text}`}>
        {score > 0 ? score : '-'}
      </span>
    </div>
  )
}

export default ScoreRing
