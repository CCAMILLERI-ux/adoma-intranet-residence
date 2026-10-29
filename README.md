# Mon espace résidence

**Prototype exploratoire — données fictives.** POC de candidature qui illustre une plateforme de communication entre une résidence Adoma et ses résidents, et sa logique de déploiement multi-résidences. Ce n'est pas une application prête pour la production.

Adresse de publication : `https://<compte>.github.io/adoma-intranet-residence/`

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:5173/adoma-intranet-residence/
npm test           # tests des règles d'affichage et de l'aide à la rédaction
npm run build      # site statique dans dist/
npm run preview    # sert dist/ à l'adresse finale
```

Aucun backend, compte, clé d'API ni service payant n'est nécessaire.

## Publication sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit le site et le déploie à chaque push sur `main` (ou à la demande depuis l'onglet *Actions*).
Une seule configuration manuelle : **Settings → Pages → Source : GitHub Actions**.

- `base: '/adoma-intranet-residence/'` dans `vite.config.ts` : tous les fichiers sont servis sous ce chemin.
- La navigation utilise des adresses en `#/…` : un rechargement ou un lien direct fonctionne sans configuration serveur.

## Parcourir la démonstration

La barre « Démo » en haut de l'écran permet de :
- changer de vue : **Vue résident**, **Administration de résidence**, **Administration centrale** (simulation, pas un contrôle d'accès) ;
- choisir la résidence : **Les Tilleuls** (résidence sociale) ou **Les Passerelles** (jeunes actifs) ;
- **réinitialiser** les données (avec confirmation).

Scénarios :
- **A** — Administration de résidence (Tilleuls) → *Créer une information* → *Utiliser l'exemple* (fermeture de la laverie) → *Préparer le message* → corriger → *Prévisualiser* → *Publier* → *Préparer l'affiche à imprimer*. L'information n'apparaît qu'aux Tilleuls.
- **B** — Administration centrale → *Créer une campagne* → *Utiliser l'exemple* (économies d'énergie) → deux résidences cochées → *Prévisualiser* → *Publier*. La campagne apparaît dans les deux espaces, marquée « Campagne nationale ».
- **C** — Tableau de bord local → *Retirer* → confirmer. L'information disparaît de la vue résident.

## Ce qui fonctionne réellement / ce qui est simulé

| Fonctionne réellement | Simulé ou absent |
|---|---|
| Enregistrement, modification, retrait des contenus et campagnes | Pas de serveur : données dans le `localStorage` **de ce navigateur uniquement** |
| Filtrage par résidence, statut, date de publication et d'expiration | Changement de vue : simple bascule, sans authentification |
| Séparation des contenus entre résidences, campagnes multi-résidences | « Préparer le message » : assemblage local et déterministe des champs — **aucune IA** |
| Prévisualisation avant publication, affiche A4 via l'impression du navigateur | Inscriptions aux événements : via le contact indiqué, pas de module |
| Persistance après rechargement, réinitialisation | Problèmes techniques : démarche et contact affichés, aucune demande envoyée |
| Liens externes vers le site Adoma, la CAF et France Travail | Aucun paiement, suivi de dossier ni donnée de résident |

Les exemples sont générés autour de la date d'ouverture du prototype, pour que l'agenda ne soit jamais vide. Après plusieurs semaines, *Réinitialiser* les recrée à la date du jour.

## Structure

```
src/
  data/types.ts       modèle commun : résidences, contacts, contenus (dont événements), campagnes
  data/seed.ts        deux résidences fictives
  lib/visibility.ts   règles d'affichage (statut, dates, résidence)
  lib/draft.ts        simulation d'aide à la rédaction
  lib/store.tsx       stockage local
  styles/tokens.css   variables de design (couleurs, typographie, espacements…)
  views/resident|local|central
```

Ajouter une résidence = ajouter une entrée `Residence` et ses `Contact` : composants et règles sont communs.

## Design system et accessibilité

Couleurs, typographie, espacements, formes et composants reprennent le design system « DESIGN SYSTEM ADOMA » (https://tweak-aged-65309564.figma.site/) : rouge `#E30613`, encre `#101828`, brume `#F4F6F8`, Arial / Helvetica Neue, échelle H1 52/56 · H2 36/42 · corps 16/26, grille de 4, rayons 4 (champs) et 8 (cartes), boutons, champs, cases à cocher, étapes de parcours, messages de retour, couverture et barre latérale. Toutes les valeurs sont centralisées dans `src/styles/tokens.css`, avec le nom d'origine en commentaire. Seul écart volontaire : la bordure des champs est foncée (`#7B8597` au lieu de `#98A2B3`) pour atteindre un contraste de 3:1. La couleur des campagnes nationales (bleu) n'existe pas dans le design system et reste à valider. Aucun logo n'est reproduit.

Les visuels des cartes (composant « Carte résidence » et espaces communs) sont des illustrations vectorielles dessinées pour le prototype (`src/components/visuals.tsx`) : aucun bâtiment réel, aucune personne, aucune dépendance externe. Elles sont signalées comme « Illustration » et peuvent être remplacées par des photos libres de droits.

Le prototype a été conçu avec attention à l'accessibilité : navigation au clavier, focus visible, champs étiquetés, messages annoncés aux lecteurs d'écran, informations jamais portées par la seule couleur. **Aucun audit RGAA n'a été réalisé** : aucune conformité n'est revendiquée.

Toutes les données sont fictives. Les numéros en 01 99 00 xx xx sont réservés aux œuvres de fiction.
