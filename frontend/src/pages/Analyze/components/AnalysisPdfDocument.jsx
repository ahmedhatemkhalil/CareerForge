import {
  Circle,
  Document,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'

import { formatAnalysisDate, getScoreStyles, getScoreSummary } from '@/utils/helpers'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#F1F5F9',
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#4F46A0',
    padding: '24 28 36',
    color: '#ffffff',
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.9,
  },
  body: {
    padding: '0 28',
    marginTop: -20,
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    border: '1 solid #E2E8F0',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreInfo: {
    flex: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: 'bold',
    padding: '4 10',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  summary: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  meta: {
    fontSize: 9,
    color: '#94A3B8',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    border: '1 solid #E2E8F0',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    border: '1 solid #E2E8F0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 4,
  },
  listItem: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 6,
    paddingLeft: 8,
    borderLeft: '2 solid #E2E8F0',
  },
  footer: {
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 16,
  },
})

const getScoreColor = (score) => {
  if (score >= 80) return { stroke: '#10B981', text: '#059669', bg: '#ECFDF5' }
  if (score >= 65) return { stroke: '#F59E0B', text: '#D97706', bg: '#FFFBEB' }
  return { stroke: '#EF4444', text: '#DC2626', bg: '#FEF2F2' }
}

const ScoreRing = ({ score, color }) => {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <View style={{ width: 88, height: 88, position: 'relative' }}>
      <Svg width={88} height={88} viewBox="0 0 88 88">
        <Circle
          cx={44}
          cy={44}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={7}
          fill="none"
        />
        <Circle
          cx={44}
          cy={44}
          r={radius}
          stroke={color}
          strokeWidth={7}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 24,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color }}>{score}</Text>
        <Text style={{ fontSize: 8, color: '#64748B' }}>/ 100</Text>
      </View>
    </View>
  )
}

const Section = ({ title, color, items = [] }) => {
  if (!items.length) return null

  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <Text
          key={index}
          style={[styles.listItem, { borderLeftColor: color }]}
        >
          • {item}
        </Text>
      ))}
    </View>
  )
}

const AnalysisPdfDocument = ({
  analysis,
  roleTitle = 'Target Role',
  cvFileName = 'Resume',
}) => {
  const score = Number(analysis.matchScore) || 0
  const scoreStyles = getScoreStyles(score)
  const colors = getScoreColor(score)
  const date = formatAnalysisDate(analysis.createdAt || new Date().toISOString())

  const stats = [
    { label: 'Strengths', value: analysis.strengths?.length ?? 0, color: '#10B981' },
    { label: 'Gaps', value: analysis.weaknesses?.length ?? 0, color: '#EF4444' },
    { label: 'Skill Gaps', value: analysis.skillGaps?.length ?? 0, color: '#F59E0B' },
    { label: 'Actions', value: analysis.recommendedActions?.length ?? 0, color: '#4F46A0' },
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>CareerForge</Text>
          <Text style={styles.subtitle}>AI CV Analysis Report</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.scoreCard}>
            <ScoreRing score={score} color={colors.stroke} />
            <View style={styles.scoreInfo}>
              <Text style={[styles.badge, { color: colors.text, backgroundColor: colors.bg }]}>
                {scoreStyles.label}
              </Text>
              <Text style={styles.roleTitle}>
                {score}% match for {roleTitle}
              </Text>
              <Text style={styles.summary}>{getScoreSummary(score)}</Text>
              <Text style={styles.meta}>
                CV: {cvFileName} · {date}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.contentCard}>
            <Section title="Strengths" color="#10B981" items={analysis.strengths} />
            <Section title="Areas to Improve" color="#EF4444" items={analysis.weaknesses} />
            <Section title="Skill Gaps" color="#F59E0B" items={analysis.skillGaps} />
            <Section title="Recommended Actions" color="#4F46A0" items={analysis.recommendedActions} />
          </View>

          <Text style={styles.footer}>Generated by CareerForge</Text>
        </View>
      </Page>
    </Document>
  )
}

const sanitizeFileName = (value = 'cv-analysis') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'cv-analysis'

export const downloadAnalysisPdf = async ({
  analysis,
  roleTitle = 'analysis',
  cvFileName = 'Resume',
}) => {
  const blob = await pdf(
    <AnalysisPdfDocument
      analysis={analysis}
      roleTitle={roleTitle}
      cvFileName={cvFileName}
    />,
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFileName(roleTitle)}-analysis.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export default AnalysisPdfDocument
