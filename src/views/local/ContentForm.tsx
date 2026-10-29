// Formulaire de création / modification d'une information locale.
// Étape 1 : saisie et « Préparer le message ». Étape 2 : prévisualisation, puis publication.

import { useState } from 'react'
import type { LocalContent, LocalTemplate, Residence } from '../../data/types'
import { addDays, formatShortDate, today } from '../../lib/dates'
import { generateDraft } from '../../lib/draft'
import { navigate } from '../../lib/router'
import { newId, useStore } from '../../lib/store'
import { displayStatus, STATUS_LABELS, TEMPLATE_LABELS } from '../../lib/visibility'
import { ErrorSummary, Field, focusSoon } from '../../components/form'
import { Button, Callout, ConfirmDialog, Icon, PageTitle, StatusBadge, Stepper } from '../../components/ui'
import { ContentDetail } from '../resident/details'
import { EventCard, NewsCard, contentAsFeed } from '../resident/cards'

const TEMPLATES: { id: LocalTemplate; hint: string }[] = [
  { id: 'travaux', hint: 'Coupure, réparation, entretien, passage d’une entreprise.' },
  { id: 'pratique', hint: 'Changement d’horaires, rappel de règles, nouveau service.' },
  { id: 'evenement', hint: 'Atelier, réunion, moment convivial. Apparaît dans l’agenda.' },
]

const LABELS: Record<string, string> = {
  title: 'Titre',
  startDate: 'Date de début',
  endDate: 'Date de fin',
  endTime: 'Heure de fin',
  description: 'Description factuelle',
  message: 'Message aux résidents',
  publishAt: 'Date de publication',
  expireAt: 'Date d’expiration',
}

function emptyContent(residenceId: string): LocalContent {
  const now = new Date().toISOString()
  return {
    id: newId('info'),
    residenceId,
    template: 'travaux',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    description: '',
    consequences: '',
    participation: '',
    contact: '',
    message: '',
    important: false,
    publishAt: today(),
    expireAt: '',
    status: 'brouillon',
    createdAt: now,
    updatedAt: now,
  }
}

function validate(c: LocalContent, forPublication: boolean): Record<string, string> {
  const e: Record<string, string> = {}
  if (!c.title.trim()) e.title = 'indiquez un titre.'
  if (!forPublication) return e
  if (!c.description.trim()) e.description = 'décrivez les faits en quelques mots.'
  if (c.template === 'evenement' && !c.startDate) e.startDate = 'indiquez la date de l’événement.'
  if (c.endDate && c.startDate && c.endDate < c.startDate) e.endDate = 'la date de fin doit être après la date de début.'
  if (c.startDate === c.endDate && c.startTime && c.endTime && c.endTime <= c.startTime)
    e.endTime = 'l’heure de fin doit être après l’heure de début.'
  if (!c.message.trim()) e.message = 'préparez ou rédigez le message avant de publier.'
  if (!c.publishAt) e.publishAt = 'indiquez la date de publication.'
  if (!c.expireAt) e.expireAt = 'indiquez une date d’expiration pour que l’information ne reste pas affichée trop longtemps.'
  else if (c.publishAt && c.expireAt < c.publishAt) e.expireAt = 'la date d’expiration doit être après la date de publication.'
  return e
}

export function ContentForm({
  residence,
  link,
  existing,
}: {
  residence: Residence
  link: (...p: string[]) => string
  existing?: LocalContent
}) {
  const { data, saveContent, notify } = useStore()
  const [c, setC] = useState<LocalContent>(() => existing ?? emptyContent(residence.id))
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [missing, setMissing] = useState<string[] | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  const contacts = data.contacts.filter((x) => x.residenceId === residence.id)
  const isEvent = c.template === 'evenement'
  const wasPublished = existing && existing.status === 'publie'

  const set = <K extends keyof LocalContent>(key: K, value: LocalContent[K]) => {
    setC((prev) => {
      const next = { ...prev, [key]: value }
      // Commodité : sans expiration choisie, on propose la fin de l'intervention ou de l'événement.
      if ((key === 'endDate' || key === 'startDate') && !prev.expireAt && value) next.expireAt = String(next.endDate || next.startDate)
      return next
    })
    if (errors[key as string]) setErrors(({ [key as string]: _, ...rest }) => rest)
  }

  const runDraft = () => {
    const result = generateDraft(c)
    set('message', result.text)
    setMissing(result.missing)
    notify('Message préparé. Relisez-le et corrigez-le avant de publier.')
    focusSoon('message')
  }

  const prepare = () => {
    if (c.message.trim() && c.message !== generateDraft(c).text) setConfirmReplace(true)
    else runDraft()
  }

  const fillExample = () => {
    const start = addDays(today(), 3)
    const contact = contacts.find((x) => x.id === residence.proximityContactId)
    setC((prev) => ({
      ...prev,
      template: 'travaux',
      title: 'Fermeture temporaire de la laverie',
      location: residence.laundry.place,
      startDate: start,
      endDate: addDays(start, 1),
      startTime: '08:00',
      endTime: '17:00',
      description: 'entretien des machines à laver et des sèche-linge par une entreprise spécialisée',
      consequences: 'la laverie est fermée pendant l’entretien. Pensez à laver votre linge avant.',
      contact: contact ? `${contact.role}, accueil — ${contact.phone} (numéro fictif)` : '',
      expireAt: addDays(start, 1),
    }))
    setErrors({})
    notify('Exemple de démonstration rempli. Vous pouvez modifier chaque champ.')
  }

  const saveDraft = () => {
    const e = validate(c, false)
    setErrors(e)
    if (Object.keys(e).length) return focusSoon('error-summary')
    saveContent({ ...c, status: 'brouillon' })
    notify(`Brouillon enregistré : « ${c.title} ». Il n’est pas visible par les résidents.`)
    navigate({ residenceId: residence.id, view: 'gestion', path: [] })
  }

  const toPreview = () => {
    const e = validate(c, true)
    setErrors(e)
    if (Object.keys(e).length) return focusSoon('error-summary')
    setStep('preview')
    focusSoon('page-title')
  }

  const publish = () => {
    const saved = { ...c, status: 'publie' as const }
    saveContent(saved)
    const status = displayStatus(saved, today())
    notify(
      status === 'programme'
        ? `Information programmée pour le ${formatShortDate(saved.publishAt)} dans ${residence.name}.`
        : `Information publiée dans ${residence.name}.`,
    )
    navigate({ residenceId: residence.id, view: 'gestion', path: ['publie', saved.id] })
  }

  if (step === 'preview') {
    const status = displayStatus({ ...c, status: 'publie' }, today())
    return (
      <div className="stack-lg">
        <PageTitle eyebrow={existing ? 'Modifier' : 'Créer'} lead="Vérifiez l’information telle que les résidents la verront.">
          Prévisualisation
        </PageTitle>
        <Stepper steps={['Saisie', 'Prévisualisation et publication']} current={1} />
        <div className="summary-box">
          <dl className="summary-list">
            <div>
              <dt>Résidence</dt>
              <dd>{residence.name} uniquement</dd>
            </div>
            <div>
              <dt>Publication</dt>
              <dd>
                {formatShortDate(c.publishAt)}
                {status === 'programme' && ' (programmée)'}
              </dd>
            </div>
            <div>
              <dt>Expiration</dt>
              <dd>Après le {formatShortDate(c.expireAt)}</dd>
            </div>
            <div>
              <dt>Bandeau d’accueil</dt>
              <dd>{c.important ? 'Oui' : 'Non'}</dd>
            </div>
          </dl>
        </div>

        <div className="preview-grid">
          <section aria-labelledby="prev-card" className="stack-sm">
            <h2 id="prev-card" className="h4">
              Dans la liste {isEvent ? 'de l’agenda' : 'des actualités'}
            </h2>
            <div className="preview-frame">
              {isEvent ? <EventCard event={c} /> : <NewsCard item={contentAsFeed(c)} />}
            </div>
          </section>
          <section aria-labelledby="prev-detail" className="stack-sm">
            <h2 id="prev-detail" className="h4">
              Page de détail
            </h2>
            <div className="preview-frame">
              <ContentDetail content={c} headingLevel={2} />
            </div>
          </section>
        </div>

        <div className="action-row action-row--sticky">
          <Button onClick={publish} icon="check">
            {wasPublished ? 'Publier les modifications' : 'Publier dans la résidence'}
          </Button>
          <Button
            variant="secondary"
            icon="edit"
            onClick={() => {
              setStep('form')
              focusSoon('page-title')
            }}
          >
            Revenir au formulaire
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <PageTitle
        eyebrow={existing ? 'Modifier' : 'Créer'}
        lead={`Cette information sera publiée uniquement dans ${residence.name}.`}
      >
        {existing ? 'Modifier une information' : 'Créer une information'}
      </PageTitle>
      <Stepper steps={['Saisie', 'Prévisualisation et publication']} current={0} />

      {existing && (
        <p className="status-line">
          Statut actuel : <StatusBadge status={displayStatus(existing, today())} />
          {existing.status === 'retire' && <span className="muted small"> Publiez-la à nouveau pour la rendre visible.</span>}
        </p>
      )}

      {!existing && (
        <div className="demo-hint">
          <p>
            <strong>Démonstration :</strong> remplir le formulaire avec l’exemple « fermeture de la laverie ».
          </p>
          <Button size="sm" variant="secondary" onClick={fillExample}>
            Utiliser l’exemple
          </Button>
        </div>
      )}

      <ErrorSummary errors={errors} labels={LABELS} />

      <form
        className="form stack-lg"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          toPreview()
        }}
      >
        <fieldset className="form-section">
          <legend>1. Choisir un modèle</legend>
          <div className="radio-cards">
            {TEMPLATES.map((t) => (
              <label key={t.id} className="radio-card">
                <input
                  type="radio"
                  name="template"
                  value={t.id}
                  checked={c.template === t.id}
                  onChange={() => set('template', t.id)}
                  aria-describedby={`tpl-${t.id}`}
                />
                <span className="radio-card__label">{TEMPLATE_LABELS[t.id]}</span>
                <span className="radio-card__hint" id={`tpl-${t.id}`}>
                  {t.hint}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>2. Les informations</legend>
          <Field id="title" label="Titre" required error={errors.title} hint="Court et explicite. Exemple : « Fermeture de la laverie »">
            {(p) => <input {...p} className="input" value={c.title} onChange={(e) => set('title', e.target.value)} maxLength={90} />}
          </Field>
          <Field id="location" label="Lieu" hint="Bâtiment, étage, salle…">
            {(p) => <input {...p} className="input" value={c.location} onChange={(e) => set('location', e.target.value)} />}
          </Field>
          <div className="field-row">
            <Field id="startDate" label="Date de début" required={isEvent} error={errors.startDate}>
              {(p) => <input {...p} type="date" className="input" value={c.startDate} onChange={(e) => set('startDate', e.target.value)} />}
            </Field>
            <Field id="endDate" label="Date de fin" error={errors.endDate} hint="Si sur plusieurs jours.">
              {(p) => <input {...p} type="date" className="input" value={c.endDate} onChange={(e) => set('endDate', e.target.value)} />}
            </Field>
          </div>
          <div className="field-row">
            <Field id="startTime" label="Heure de début">
              {(p) => <input {...p} type="time" className="input" value={c.startTime} onChange={(e) => set('startTime', e.target.value)} />}
            </Field>
            <Field id="endTime" label="Heure de fin" error={errors.endTime}>
              {(p) => <input {...p} type="time" className="input" value={c.endTime} onChange={(e) => set('endTime', e.target.value)} />}
            </Field>
          </div>
          <Field id="description" label="Description factuelle" required error={errors.description} hint="Ce qui se passe, sans interprétation.">
            {(p) => <textarea {...p} className="input" rows={3} value={c.description} onChange={(e) => set('description', e.target.value)} />}
          </Field>
          {isEvent ? (
            <Field id="participation" label="Modalités de participation" hint="Comment s’inscrire ou venir. Pas d’inscription en ligne dans cette version.">
              {(p) => <textarea {...p} className="input" rows={2} value={c.participation} onChange={(e) => set('participation', e.target.value)} />}
            </Field>
          ) : (
            <Field id="consequences" label="Conséquences pratiques pour les résidents" hint="Ce qui change pour eux, ce qu’ils doivent faire.">
              {(p) => <textarea {...p} className="input" rows={2} value={c.consequences} onChange={(e) => set('consequences', e.target.value)} />}
            </Field>
          )}
          <Field id="contact" label="Contact utile" hint="Choisissez dans la liste ou saisissez un contact.">
            {(p) => (
              <>
                <input {...p} className="input" list="contact-options" value={c.contact} onChange={(e) => set('contact', e.target.value)} />
                <datalist id="contact-options">
                  {contacts.map((x) => (
                    <option key={x.id} value={`${x.name}, ${x.role.toLowerCase()} — ${x.phone} (numéro fictif)`} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
        </fieldset>

        <fieldset className="form-section">
          <legend>3. Le message aux résidents</legend>
          <div className="assist">
            <div>
              <p className="assist__title">
                <Icon name="sparkle" size={18} /> Simulation d’aide à la rédaction
              </p>
              <p className="small">
                Le texte est assemblé localement à partir des champs ci-dessus, toujours de la même façon. Aucun service
                d’intelligence artificielle n’est utilisé et aucune information n’est ajoutée.
              </p>
            </div>
            <Button variant="secondary" icon="sparkle" onClick={prepare}>
              Préparer le message
            </Button>
          </div>
          {missing && missing.length > 0 && (
            <Callout tone="warning" title="Informations non renseignées">
              <p>Ces éléments n’ont pas été renseignés : {missing.join(', ')}. Rien n’a été inventé à leur place. Complétez les champs si besoin, puis préparez à nouveau le message.</p>
            </Callout>
          )}
          <Field
            id="message"
            label="Message aux résidents"
            required
            error={errors.message}
            hint="Texte modifiable. Relisez-le et vérifiez chaque information avant publication. La date, les horaires, le lieu et le contact s’affichent automatiquement à côté du message."
          >
            {(p) => <textarea {...p} className="input input--message" rows={9} value={c.message} onChange={(e) => set('message', e.target.value)} />}
          </Field>
          <label className="checkbox">
            <input type="checkbox" checked={c.important} onChange={(e) => set('important', e.target.checked)} />
            <span>
              Information importante : l’afficher en bandeau sur l’accueil de l’espace résident
            </span>
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>4. Publication</legend>
          <div className="field-row">
            <Field id="publishAt" label="Date de publication" required error={errors.publishAt} hint="Aujourd’hui ou plus tard.">
              {(p) => <input {...p} type="date" className="input" value={c.publishAt} onChange={(e) => set('publishAt', e.target.value)} />}
            </Field>
            <Field
              id="expireAt"
              label="Date d’expiration"
              required
              error={errors.expireAt}
              hint="Dernier jour d’affichage. Ensuite, l’information disparaît automatiquement."
            >
              {(p) => <input {...p} type="date" className="input" value={c.expireAt} onChange={(e) => set('expireAt', e.target.value)} />}
            </Field>
          </div>
        </fieldset>

        <div className="action-row action-row--sticky">
          <Button type="submit" iconAfter="arrow">
            Prévisualiser avant publication
          </Button>
          <Button variant="secondary" onClick={saveDraft}>
            {wasPublished ? 'Enregistrer comme brouillon (retire l’affichage)' : 'Enregistrer le brouillon'}
          </Button>
          <Button variant="ghost" href={link()}>
            Annuler
          </Button>
        </div>
        {existing && (
          <p className="small muted">
            Statut enregistré : {STATUS_LABELS[displayStatus(existing, today())]}. Les changements ne sont visibles qu’après
            publication.
          </p>
        )}
      </form>

      <ConfirmDialog
        open={confirmReplace}
        title="Remplacer le message actuel ?"
        confirmLabel="Oui, remplacer"
        onCancel={() => setConfirmReplace(false)}
        onConfirm={() => {
          setConfirmReplace(false)
          runDraft()
        }}
      >
        <p>Le message contient des modifications. Préparer un nouveau message remplacera le texte actuel.</p>
      </ConfirmDialog>
    </div>
  )
}
