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
- changer de vue : **Vue résident**, **Administration de résidence**, **Administration centrale**, **Affichage hall (TV)** (simulation, pas un contrôle d'accès) ;
- choisir la résidence : **Les Tilleuls** (résidence sociale) ou **Les Passerelles** (jeunes actifs) ;
- **réinitialiser** les données (avec confirmation).

Scénarios :
- **A** — Administration de résidence (Tilleuls) → *Créer une information* → *Utiliser l'exemple* (fermeture de la laverie) → *Préparer le message* → corriger → *Prévisualiser* → *Publier* → *Préparer l'affiche à imprimer*. L'information n'apparaît qu'aux Tilleuls.
- **B** — Administration centrale → *Créer une campagne* → *Utiliser l'exemple* (économies d'énergie) → deux résidences cochées → *Prévisualiser* → *Publier*. La campagne apparaît dans les deux espaces, marquée « Campagne nationale ».
- **C** — Tableau de bord local → *Retirer* → confirmer. L'information disparaît de la vue résident.
- **D** — Vue résident → *Signaler une panne* → formulaire → *Envoyer*. Le signalement apparaît dans *Administration de résidence → Signalements* ; quand l'équipe le prend en charge ou le résout, le statut se met à jour côté résident.
- **E** — Agenda → *Je participe* : le nombre d'inscrits augmente, côté résident et dans le tableau de bord de la résidence.
- **F** — Sélecteur de langue (FR · EN · العربية · РУ) en haut de l'espace résident ; *Écouter* sur une actualité ; *Affichage hall (TV)* dans la barre de démo.

## Ce qui fonctionne réellement / ce qui est simulé

| Fonctionne réellement | Simulé ou absent |
|---|---|
| Enregistrement, modification, retrait des contenus et campagnes | Pas de serveur : données dans le `localStorage` **de ce navigateur uniquement** |
| Filtrage par résidence, statut, date de publication et d'expiration | Changement de vue : simple bascule, sans authentification |
| Séparation des contenus entre résidences, campagnes multi-résidences | « Préparer le message » : assemblage local et déterministe des champs — **aucune IA** |
| Prévisualisation avant publication, affiche A4 via l'impression du navigateur | Signalements de panne : enregistrés sur ce navigateur et visibles dans la console de la résidence ; **rien n'est transmis**, aucun ticket de maintenance |
| Persistance après rechargement, réinitialisation | Inscriptions aux ateliers : enregistrées sur ce navigateur ; les autres inscrits sont des nombres fictifs |
| Interface résident en français, anglais, arabe (de droite à gauche) et russe | Les contenus publiés par la résidence restent en français (signalé à l'écran) ; **traductions à faire relire par des locuteurs natifs** |
| Lecteur vocal : synthèse vocale du navigateur (Web Speech API), lecture en français | Voix et disponibilité selon le navigateur et le système |
| Affichage hall : défilement automatique des alertes, actualités et événements publiés, avec pause | Aucun écran réel n'est piloté |
| Liens externes vers le site Adoma, la CAF et France Travail | Aucun paiement, suivi de dossier ni donnée de résident |

Les exemples sont générés autour de la date d'ouverture du prototype, pour que l'agenda ne soit jamais vide. Après plusieurs semaines, *Réinitialiser* les recrée à la date du jour.

## Structure

```
src/
  data/types.ts       modèle commun : résidences, contacts, contenus (dont événements), campagnes, signalements
  data/seed.ts        deux résidences fictives
  lib/visibility.ts   règles d'affichage (statut, dates, résidence)
  lib/draft.ts        simulation d'aide à la rédaction
  lib/store.tsx       stockage local
  styles/tokens.css   variables de design (couleurs, typographie, espacements…)
  i18n/               textes de l'interface résident en quatre langues
  views/resident|local|central|hall
```

Ajouter une résidence = ajouter une entrée `Residence` et ses `Contact` : composants et règles sont communs.

## Design system et accessibilité

Couleurs, typographie, espacements, formes et composants reprennent le design system « DESIGN SYSTEM ADOMA » (https://tweak-aged-65309564.figma.site/) : rouge `#E30613`, encre `#101828`, brume `#F4F6F8`, Arial / Helvetica Neue, échelle H1 52/56 · H2 36/42 · corps 16/26, grille de 4, rayons 4 (champs) et 8 (cartes), boutons, champs, cases à cocher, étapes de parcours, messages de retour, couverture et barre latérale. Toutes les valeurs sont centralisées dans `src/styles/tokens.css`, avec le nom d'origine en commentaire. Seul écart volontaire : la bordure des champs est foncée (`#7B8597` au lieu de `#98A2B3`) pour atteindre un contraste de 3:1. La couleur des campagnes nationales (bleu) n'existe pas dans le design system et reste à valider. Le logo CDC Habitat Adoma (`src/assets/brand/`) a été fourni pour le prototype ; il apparaît dans l'en-tête résident et la barre latérale des administrations, toujours accompagné de la mention « Prototype exploratoire — données fictives ».

Visuels des cartes :
- **Photos d'illustration** (cartes résidence, et un bandeau par encart de « Logement & services » : laverie, déchets et tri, équipements du logement, espaces communs) : fournies pour le prototype, dans `src/assets/photos/`. Elles ne représentent pas les résidences fictives et portent toujours la mention « Photo d'illustration ». Le panneau nominatif d'une résidence réelle et les plaques d'immatriculation ont été floutés. **Avant toute diffusion publique, vérifier les droits d'utilisation et le crédit photographe.**
- **Illustrations vectorielles** (`src/components/visuals.tsx`) : visuel de secours pour une résidence sans photo.

Portraits de l'équipe (Les Passerelles) : photos de banque d'images (Unsplash) associées à des noms fictifs et signalées comme photos d'illustration ; les membres sans portrait sont représentés par leurs initiales.

Le prototype a été conçu avec attention à l'accessibilité : navigation au clavier, focus visible, champs étiquetés, messages annoncés aux lecteurs d'écran, informations jamais portées par la seule couleur. **Aucun audit RGAA n'a été réalisé** : aucune conformité n'est revendiquée.

Toutes les données sont fictives. Les numéros en 01 99 00 xx xx sont réservés aux œuvres de fiction.
