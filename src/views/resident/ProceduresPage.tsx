import type { Residence } from '../../data/types'
import { useI18n } from '../../i18n'
import type { StringKey } from '../../i18n/strings'
import { Callout, Icon, PageTitle } from '../../components/ui'

const GUIDE: { title: StringKey; items: StringKey[] }[] = [
  { title: 'proc.g1', items: ['proc.g1.1', 'proc.g1.2', 'proc.g1.3'] },
  { title: 'proc.g2', items: ['proc.g2.1', 'proc.g2.2', 'proc.g2.3'] },
  { title: 'proc.g3', items: ['proc.g3.1', 'proc.g3.2', 'proc.g3.3'] },
]

const EXTERNAL: { name: StringKey; text: StringKey; url: string }[] = [
  { name: 'ext.adoma.name', text: 'ext.adoma.text', url: 'https://www.adoma.cdc-habitat.fr/' },
  { name: 'ext.caf.name', text: 'ext.caf.text', url: 'https://www.caf.fr/' },
  { name: 'ext.ft.name', text: 'ext.ft.text', url: 'https://www.francetravail.fr/' },
]

export function ProceduresPage({ residence, link }: { residence: Residence; link: (...p: string[]) => string }) {
  const { t } = useI18n()
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead={t('proc.lead')}>
        {t('nav.procedures')}
      </PageTitle>

      <section aria-labelledby="guide-title" className="stack-md">
        <h2 id="guide-title">{t('proc.guide')}</h2>
        <div className="accordion">
          {GUIDE.map((g, i) => (
            <details key={g.title} open={i === 0}>
              <summary>{t(g.title)}</summary>
              <ul className="check-list">
                {g.items.map((it) => (
                  <li key={it}>
                    <Icon name="check" size={18} />
                    {t(it)}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <p>
          {t('proc.question')} <a href={link('contacts')}>{t('proc.question.link')}</a>.
        </p>
      </section>

      <section aria-labelledby="ext-title" className="stack-md">
        <h2 id="ext-title">{t('proc.online')}</h2>
        <p>{t('proc.online.intro')}</p>
        <ul className="card-grid plain-list">
          {EXTERNAL.map((e) => (
            <li key={e.url} className="card card--padded external-card">
              <h3>{t(e.name)}</h3>
              <p>{t(e.text)}</p>
              <a className="btn btn--secondary btn--md" href={e.url} target="_blank" rel="noopener noreferrer">
                <span>{t('proc.open')}</span>
                <Icon name="external" size={18} />
                <span className="visually-hidden">
                  {' '}
                  {t(e.name)} {t('proc.newTab')}
                </span>
              </a>
              <p className="external-card__url" dir="ltr">
                {e.url.replace(/^https:\/\//, '').replace(/\/$/, '')}
              </p>
            </li>
          ))}
        </ul>
        <Callout tone="neutral" title={t('proc.not.title')}>
          <p>{t('proc.not.text')}</p>
        </Callout>
      </section>
    </div>
  )
}
