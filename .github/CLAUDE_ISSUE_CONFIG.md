# Configuration des Issues GitHub pour Claude Code

Ce fichier définit le pattern standard pour la création d'issues GitHub dans ce projet.

## 🏷️ Labels Standard avec Emojis

Les labels suivants doivent être utilisés pour catégoriser les issues :

| Label | Description | Couleur | Utilisation |
|-------|-------------|---------|-------------|
| 🐛 bug | Quelque chose ne fonctionne pas | `#d73a4a` | Bugs et problèmes |
| ✨ feature | Nouvelle fonctionnalité | `#a2eeef` | Nouvelles features |
| 🔐 auth | Authentification et sécurité | `#0e8a16` | Auth, permissions, sécurité |
| 🚀 high-priority | Priorité élevée | `#e11d21` | Issues bloquantes ou urgentes |
| 📚 documentation | Documentation | `#0075ca` | Docs, README, guides |
| 🔧 config | Configuration et setup | `#fbca04` | Config, env vars, setup |
| 🎨 ui/ux | Interface utilisateur et expérience | `#c5def5` | Design, layout, UX |
| 🧪 testing | Tests et qualité | `#bfd4f2` | Tests unitaires, E2E, QA |
| 🔄 refactor | Refactoring de code | `#d4c5f9` | Refactoring sans nouvelle feature |
| 🐌 performance | Optimisation des performances | `#f9d0c4` | Optimisations, lazy loading |
| 🔌 api | Intégration API backend | `#5319e7` | Intégration backend, endpoints |
| 💾 database | Base de données | `#1d76db` | Schéma, migrations, queries |
| 🌐 i18n | Internationalisation | `#c2e0c6` | Traductions, localisation |
| 👶 good-first-issue | Bon pour débuter | `#7057ff` | Issues simples pour nouveaux contributeurs |

### Commandes pour créer les labels

```bash
gh label create "🐛 bug" --description "Quelque chose ne fonctionne pas" --color "d73a4a"
gh label create "✨ feature" --description "Nouvelle fonctionnalité" --color "a2eeef"
gh label create "🔐 auth" --description "Authentification et sécurité" --color "0e8a16"
gh label create "🚀 high-priority" --description "Priorité élevée" --color "e11d21"
gh label create "📚 documentation" --description "Documentation" --color "0075ca"
gh label create "🔧 config" --description "Configuration et setup" --color "fbca04"
gh label create "🎨 ui/ux" --description "Interface utilisateur et expérience" --color "c5def5"
gh label create "🧪 testing" --description "Tests et qualité" --color "bfd4f2"
gh label create "🔄 refactor" --description "Refactoring de code" --color "d4c5f9"
gh label create "🐌 performance" --description "Optimisation des performances" --color "f9d0c4"
gh label create "🔌 api" --description "Intégration API backend" --color "5319e7"
gh label create "💾 database" --description "Base de données" --color "1d76db"
gh label create "🌐 i18n" --description "Internationalisation" --color "c2e0c6"
gh label create "👶 good-first-issue" --description "Bon pour débuter" --color "7057ff"
```

## 📝 Pattern de Création d'Issues

### 1. Informations obligatoires

Lors de la création d'une issue, toujours remplir :

- ✅ **Title** : Descriptif avec emoji approprié
- ✅ **Body** : Description complète avec structure (voir template ci-dessous)
- ✅ **Labels** : Au moins 1 label de type (feature/bug) + labels contextuels
- ✅ **Assignee** : Assigner automatiquement à `@me` (l'auteur)

### 2. Structure du Body

```markdown
## 🎯 Objectif

[Description claire de ce qui doit être accompli]

## 📋 Contexte

- **Système actuel** : [État actuel]
- **Système cible** : [État souhaité]
- **Autres infos contextuelles**

## ✅ Tâches à réaliser

### 1. [Nom de la tâche]

- [ ] Sous-tâche 1
- [ ] Sous-tâche 2

**Fichier** : `path/to/file.ts`

```typescript
// Code d'exemple si pertinent
```

### 2. [Autre tâche]

...

## 🔧 Patterns de code à respecter

[Référence aux patterns du CLAUDE.md si applicable]

## 🔍 Tests à effectuer

- [ ] Test 1
- [ ] Test 2

## 🔗 Fichiers concernés

**À créer** :
- `path/to/new/file.ts` - Description

**À modifier** :
- `path/to/existing/file.ts` - Description des modifications

## ⚡ Priorité

**[LOW/MEDIUM/HIGH]** - [Justification]
```

### 3. Exemple de commande complète

```bash
gh issue create \
  --title "🔐 Intégrer l'authentification Magic Link" \
  --body-file /path/to/issue_body.md \
  --label "✨ feature,🔐 auth,🚀 high-priority,🔌 api" \
  --assignee "@me"
```

## 🤖 Pour Claude Code

Quand je (Claude Code) crée une issue GitHub, je dois :

1. **Analyser le contexte** pour déterminer les labels appropriés
2. **Utiliser le template** de structure ci-dessus
3. **Assigner automatiquement** l'issue à l'utilisateur (`@me`)
4. **Choisir 2-4 labels** pertinents :
   - 1 label de type (🐛 bug ou ✨ feature)
   - 1-2 labels contextuels (🔐 auth, 🔌 api, 🎨 ui/ux, etc.)
   - 1 label de priorité si applicable (🚀 high-priority)

### Mapping Contexte → Labels

| Type de demande | Labels suggérés |
|-----------------|-----------------|
| Nouvelle feature UI | `✨ feature`, `🎨 ui/ux` |
| Bug visuel | `🐛 bug`, `🎨 ui/ux` |
| Intégration API | `✨ feature`, `🔌 api` |
| Authentification | `✨ feature`, `🔐 auth`, `🚀 high-priority` |
| Performance lente | `🐛 bug`, `🐌 performance` |
| Tests manquants | `🧪 testing` |
| Refactoring | `🔄 refactor` |
| Documentation | `📚 documentation` |
| Configuration env | `🔧 config` |
| Traductions | `🌐 i18n` |

### Détermination de la priorité

- **🚀 high-priority** :
  - Bloquant pour la prod
  - Sécurité
  - Bug critique
  - Feature essentielle

- **Pas de label priorité** :
  - Feature non urgente
  - Amélioration
  - Nice-to-have

## 📊 Workflow après création

Après la création de l'issue :

1. L'issue est automatiquement assignée
2. Les labels permettent le filtrage et la recherche
3. L'utilisateur peut ajouter des milestones manuellement si nécessaire
4. L'utilisateur peut lier à un project board si applicable

## 🔄 Maintenance des labels

Si de nouveaux labels sont nécessaires :

1. Suivre le pattern emoji + nom court
2. Choisir une couleur appropriée
3. Ajouter à ce fichier de config
4. Créer avec `gh label create`

## 📚 Ressources

- [GitHub Labels Best Practices](https://medium.com/@dave_lunny/sane-github-labels-c5d2e6004b63)
- [Emoji Cheat Sheet](https://github.com/ikatyang/emoji-cheat-sheet)
