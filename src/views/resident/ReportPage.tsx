// « Signaler une panne » — simulation : le signalement est enregistré sur ce navigateur
// et apparaît dans la console de l'administration de résidence. Il n'est transmis à personne.

import { useState } from 'react'
import type { Report, ReportCategory, Residence } from '../../data/types'
import { useI18n } from '../../i18n'
import { newId, useStore } from '../../lib/store'
import { Field, focusSoon } from '../../components/form'
import { Callout, EmptyState, Icon, PageTitle } from '../../components/ui'

export const REPORT_CATEGORIES: ReportCategory[] = [
  'plomberie',
  'electricite',
  'chauffage',
  'serrurerie',
  'equipement',
  'parties-communes',
  'autre',
]

export function nextReference(reports: Report[]): string {
  const max = reports.reduce((m, r) => Math.max(m, Number(r.reference.replace(/\D/g, '')) || 0), 400)
  return `SIG-${String(max + 1).padStart(4, '0')}`
}

export function ReportPage({ residence }: { residence: Residence }) {
  const { t, dateTime } = useI18n()
  const { data, addReport, notify } = useStore()
  const [category, setCategory] = useState<ReportCategory>('plomberie')
  const [unit, setUnit] = useState('')
  const [description, setDescription] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const mine = data.reports.filter((r) => r.residenceId === residence.id && r.mine)

  const submit = () => {
    const e: Record<string, string> = {}
    if (!unit.trim()) e['report-unit'] = t('report.err.unit')
    if (!description.trim()) e['report-desc'] = t('report.err.desc')
    setErrors(e)
    if (Object.keys(e).length) return focusSoon('report-errors')
    const now = new Date().toISOString()
    const report: Report = {
      id: newId('sig'),
      reference: nextReference(data.reports),
      residenceId: residence.id,
      category,
      unit: unit.trim(),
      description: description.trim(),
      urgent,
      status: 'recu',
      mine: true,
      createdAt: now,
      updatedAt: now,
    }
    addReport(report)
    notify(t('report.sent', { ref: report.reference }))
    setUnit('')
    setDescription('')
    setUrgent(false)
    focusSoon('mine-title')
  }

  return (
    <div className="container reading stack-lg">
      <PageTitle eyebrow={residence.name} lead={t('report.lead')}>
        {t('report.title')}
      </PageTitle>
      <Callout tone="neutral" title={t('report.sim')} icon="info" />

      {Object.keys(errors).length > 0 && (
        <div className="error-summary" role="alert" tabIndex={-1} id="report-errors">
          <p className="error-summary__title">{t('report.err.title')}</p>
          <ul>
            {Object.entries(errors).map(([k, msg]) => (
              <li key={k}>
                <a
                  href={`#${k}`}
                  onClick={(ev) => {
                    ev.preventDefault()
                    document.getElementById(k)?.focus()
                  }}
                >
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        className="form-section stack-md"
        noValidate
        onSubmit={(ev) => {
          ev.preventDefault()
          submit()
        }}
      >
        <Field id="report-category" label={t('report.category')} required>
          {(p) => (
            <select {...p} className="input" value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)}>
              {REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}`)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="report-unit" label={t('report.unit')} required hint={t('report.unit.hint')} error={errors['report-unit']}>
          {(p) => <input {...p} className="input" value={unit} onChange={(e) => setUnit(e.target.value)} autoComplete="off" maxLength={20} />}
        </Field>
        <Field id="report-desc" label={t('report.desc')} required hint={t('report.desc.hint')} error={errors['report-desc']}>
          {(p) => <textarea {...p} className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} />}
        </Field>
        <label className="checkbox">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          <span>{t('report.urgent')}</span>
        </label>
        {urgent && (
          <Callout tone="warning" title={t('report.urgent.help')}>
            <p>{residence.technical.emergency}</p>
          </Callout>
        )}
        <div>
          <button type="submit" className="btn btn--primary btn--md">
            <Icon name="tool" size={18} />
            <span>{t('report.send')}</span>
          </button>
        </div>
      </form>

      <section aria-labelledby="mine-title" className="stack-md">
        <h2 id="mine-title" tabIndex={-1}>
          {t('report.mine')}
        </h2>
        {mine.length ? (
          <ul className="plain-list admin-list">
            {mine.map((r) => (
              <li key={r.id} className="report-row">
                <div className="report-row__head">
                  <span className={`badge badge--report-${r.status}`}>
                    <span className="visually-hidden">{t('report.status')} : </span>
                    {t(`status.${r.status}`)}
                  </span>
                  <span className="report-row__ref" dir="ltr">
                    {r.reference}
                  </span>
                </div>
                <p className="report-row__title">
                  {t(`cat.${r.category}`)} · {r.unit}
                </p>
                <p className="report-row__desc">{r.description}</p>
                <p className="small muted">{t('report.sentOn', { date: dateTime(r.createdAt) })}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t('report.mine.empty')} />
        )}
      </section>
    </div>
  )
}
