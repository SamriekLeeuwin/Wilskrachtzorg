# Genspark AI Slides Briefing - Wilskrachtzorg Dashboard en Fasesysteem

Dit document is bedoeld als directe input voor Genspark AI om een professionele presentatie te genereren.
Gebruik Nederlands als voertaal op alle slides.
Doel: duidelijk uitleggen wat er gebouwd is, waarom het waardevol is voor Wilskrachtzorg, en hoe het fasesysteem werkt van registratie tot analyse.

## 1. Algemene instructies voor Genspark AI

- Maak een zakelijke, rustige stijl passend bij jeugdzorg en management.
- Gebruik consistente kleuren:
  - Primair blauw: #07346A
  - Ondersteunend blauw: #1D4ED8
  - Groen (positieve voortgang): #059669
  - Oranje (aandacht): #F97316
  - Rood (hoog risico): #DC2626
  - Achtergrond licht: #F5F7FB
- Gebruik duidelijke iconen: jongeren, begeleiding, rapportage, gedrag, alert, fase-overgang.
- Houd elke slide visueel clean: max 5-7 bullets.
- Voeg bij tabellen en diagrammen altijd korte interpretatie toe.
- Gebruik callouts voor "Wat dit betekent voor zorgpraktijk".

## 2. Presentatie-opbouw (dia voor dia)

### Dia 1 - Titel en context
Wat tonen:
- Titel: "Wilskrachtzorg Digitaal Dashboard en Fasesysteem"
- Subtitel: "Van registratie naar voorspelbare begeleidingssturing"
- Naam organisatie + datum

Spreekpunten:
- Deze presentatie toont het gebouwde platform voor jongerenbegeleiding, uitstroommonitoring en gedragsanalyse.
- Focus op operationele duidelijkheid voor teams en management.

### Dia 2 - Waarom dit project
Wat tonen:
- 3 kernproblemen in de oude situatie:
  - Verspreide informatie
  - Weinig realtime inzicht in fases en incidenten
  - Moeilijk sturen op uitstroomkwaliteit
- 3 doelen van de oplossing

Spreekpunten:
- Het platform centraliseert casusinformatie.
- Het fasesysteem maakt voortgang en risico's inzichtelijk.
- Rapportages ondersteunen managementbesluiten.

### Dia 3 - Scope van wat gebouwd is
Wat tonen:
- Frontend dashboard (React + TypeScript)
- Backend API (Node.js + Express)
- Datamodel (Prisma + PostgreSQL structuur)
- Fasesysteem + incidenten + alerts

Spreekpunten:
- Het systeem is modulair gebouwd.
- Frontend en backend zijn voorbereid op schaalbare doorontwikkeling.

### Dia 4 - Functioneel overzicht van het dashboard
Wat tonen:
- Hoofdonderdelen in navigatie:
  - Dashboard
  - Jongeren
  - Uitstroom Registratie
  - Rapportages
  - Ontwikkeling & Fases
  - Begeleiders
- Eventueel eenvoudige flow: "Registreren -> Volgen -> Analyseren -> Sturen"

Spreekpunten:
- Elke module ondersteunt een specifiek zorgproces.
- Medewerkers kunnen snel filteren en overzichten maken.

### Dia 5 - Technische architectuur
Wat tonen:
- Architectuurdiagram met 4 lagen:
  - UI (React)
  - API (Express routes)
  - Business logic (PhaseService, IncidentService)
  - Data (Prisma schema)

Spreekpunten:
- Scheiding van verantwoordelijkheden maakt onderhoud eenvoudiger.
- Services bevatten beleidslogica, niet alleen CRUD.

### Dia 6 - Frontend: belangrijkste pagina's
Wat tonen:
- Korte kaartjes met modules:
  - DashboardPage
  - JongerenPage
  - UitstroomRegistratiePage
  - RapportagesPage
  - FaseOverzichtPage
  - JongereTimelinePage
  - GedragAnalysePage

Spreekpunten:
- Pagina's zijn consistent opgebouwd met filters, tabellen en KPI-kaarten.
- Gericht op snelle interpretatie door begeleiders en managers.

### Dia 7 - Dashboard KPI's en managementbeeld
Wat tonen:
- Voorbeeld KPI's:
  - Actieve jongeren
  - Uitstroom dit jaar
  - Succespercentage
  - Gemiddelde trajectduur
- Mini trendvisual

Spreekpunten:
- Dashboard geeft direct een managementsnapshot.
- KPI's helpen bij maandelijkse sturing op capaciteit en resultaten.

### Dia 8 - Jongerenbeheer en registratie
Wat tonen:
- Functionaliteiten:
  - Zoeken op client-id/naam
  - Filter op locatie/status
  - Nieuwe jongere toevoegen
- Voorbeeld van tabelvelden

Spreekpunten:
- Basisregistratie is gekoppeld aan trajectstatus.
- Overzicht helpt caseloadbeheer per team en locatie.

### Dia 9 - Uitstroom registratie
Wat tonen:
- Welke data wordt vastgelegd:
  - Reden uitstroom
  - Doorverwijzing ja/nee
  - Organisatie
  - Woonstatus
  - Werk/school
  - Succesvol ja/nee

Spreekpunten:
- Uitstroom is niet alleen een einddatum, maar een kwaliteitsmoment.
- Vastgelegde uitkomsten ondersteunen evaluatie van trajecteffect.

### Dia 10 - Rapportages en export
Wat tonen:
- Filters: jaar, locatie, begeleider
- Kengetallen: totaal uitstroom, gemiddeld succes
- Exportfunctie (mock voorbereid voor CSV/PDF)

Spreekpunten:
- Rapportages zijn gebouwd voor periodieke verantwoording.
- Filtering maakt lokale en team-specifieke analyses mogelijk.

### Dia 11 - Introductie fasesysteem (PBS-gericht)
Wat tonen:
- 4 fasen:
  - Fase 1: Stabilisatie
  - Fase 2: Verantwoordelijkheid
  - Fase 3: Onafhankelijkheid
  - Fase 4: Voorbereiding uitstroom
- Korte uitleg per fase

Spreekpunten:
- Fasering biedt voorspelbaarheid in begeleiding.
- Overgangen maken ontwikkelstappen expliciet en meetbaar.

### Dia 12 - Fase-overgangen en statuslogica
Wat tonen:
- Statussen in traject:
  - ACTIVE
  - COMPLETED
  - REGRESSED
- Overgangslogica:
  - Progress naar volgende fase
  - Regressie naar vorige fase bij risico

Spreekpunten:
- Dit voorkomt subjectieve fasewissels.
- Beslissingen worden traceerbaar in tijdlijn en historie.

### Dia 13 - Gedragsincidenten: model en registratie
Wat tonen:
- Incidentvelden:
  - Categorie
  - Ernst (LOW/MEDIUM/HIGH)
  - Actie (NOTE/TIMEOUT/OFFICIAL_WARNING)
  - PBS stap
  - Omschrijving en melder

Spreekpunten:
- Incidentregistratie is gestandaardiseerd.
- Data ondersteunt zowel dagelijkse opvolging als lange termijnanalyse.

### Dia 14 - Automatische alertregels
Wat tonen:
- De 3 geimplementeerde beleidsregels:
  - 3x NOTE in 21 dagen -> UVO_REQUIRED
  - 2x TIMEOUT in 30 dagen -> OFFICIAL_WARNING_REVIEW
  - HIGH severity incident -> HIGH_SEVERITY_INCIDENT

Spreekpunten:
- Alerts zorgen voor vroegsignalering.
- Team hoeft minder handmatig patronen te herkennen.

### Dia 15 - Fase Overzicht pagina (analytics)
Wat tonen:
- KPI-kaarten op fase niveau
- Grafieken:
  - Jongeren per fase (bar)
  - Incidenten per fase (line)
  - Succesratio per fase (pie)
- Fase detailtabel

Spreekpunten:
- Combineert voortgang en risico in een scherm.
- Helpt management bij capaciteit en kwaliteitssturing.

### Dia 16 - Jongere Timeline pagina
Wat tonen:
- Voorbeeld chronologische tijdlijn per jongere
- Mix van fase-events en incident-events
- Severity badges (laag, gemiddeld, hoog)

Spreekpunten:
- Maakt individuele trajectverhalen leesbaar.
- Sterk hulpmiddel voor casusbespreking en overdracht.

### Dia 17 - Gedrag Analyse pagina
Wat tonen:
- Heatmap: fase x incidentcategorie
- Incidenten per categorie
- Incidenten per fase
- Trends en inzichten

Spreekpunten:
- Patronen worden in een oogopslag zichtbaar.
- Ondersteunt gerichte interventies per fase of team.

### Dia 18 - Datamodel en backendservices
Wat tonen:
- Prisma modellen:
  - Phase
  - YouthPhaseProgress
  - BehaviorIncident
  - Alert
- Service lagen:
  - PhaseService
  - IncidentService
- API routes: /api/phases en /api/incidents

Spreekpunten:
- Datamodel is ontworpen voor auditbaarheid en uitbreiding.
- Services centraliseren beleidslogica voor consistente uitvoering.

### Dia 19 - Seed data en testbaarheid
Wat tonen:
- Seed inhoud:
  - 4 fases
  - 20 jongeren
  - 20+ incidenten
  - Uitstroomvoorbeelden
- Waarom dit belangrijk is

Spreekpunten:
- Maakt demo, validatie en teamtraining mogelijk.
- Versnelt acceptatie en feedbackrondes.

### Dia 20 - Huidige status en bewezen resultaat
Wat tonen:
- Wat al werkt:
  - Build succesvol
  - Navigatie compleet
  - 3 fasepagina's actief
  - Backend structuur en routes klaar
- Korte conclusie

Spreekpunten:
- Er staat een stevige basis die direct doorontwikkeld kan worden.
- Frontend en backend sluiten logisch op elkaar aan.

### Dia 21 - Gaps en aandachtspunten
Wat tonen:
- Nog open:
  - Frontend volledig koppelen aan live backenddata
  - Placeholder modules afronden
  - Productie-auth en rollen verfijnen
  - Monitoring/logging toevoegen

Spreekpunten:
- Dit zijn implementatiestappen, geen herontwerp.
- Kernarchitectuur blijft overeind.

### Dia 22 - Roadmap in 3 fasen
Wat tonen:
- Fase A (kort): data-koppeling + stabilisatie
- Fase B (middel): autorisatie, rapportage-export, workflowverbetering
- Fase C (lang): voorspellende inzichten en proactieve zorgsturing

Spreekpunten:
- Roadmap is realistisch en incrementeel.
- Elke fase levert direct meetbare waarde op.

### Dia 23 - Impact voor Wilskrachtzorg
Wat tonen:
- Verwachte effecten:
  - Sneller inzicht in risicojongeren
  - Betere consistency in fasebesluiten
  - Hogere rapportagekwaliteit
  - Betere samenwerking tussen begeleiders en management

Spreekpunten:
- Het platform ondersteunt zowel operationeel werk als strategische sturing.
- Minder reactief, meer proactief handelen.

### Dia 24 - Afsluiting en besluitvraag
Wat tonen:
- Samenvatting in 3 regels
- Besluitvraag aan management:
  - "Gaan we door naar implementatiefase met live data-integratie?"
- Volgende concrete stap

Spreekpunten:
- Vraag om akkoord op implementatiefase.
- Benoem korte doorlooptijd naar eerste live pilot.

## 3. Extra contentblokken die Genspark mag gebruiken

### A. Kernboodschap (1 slide variant)
"Wilskrachtzorg beschikt nu over een digitaal fundament waarin jongerenontwikkeling, gedragssignalen en uitstroomkwaliteit integraal gevolgd en gestuurd kunnen worden."

### B. Elevator pitch (30 seconden)
"We hebben een modulair dashboard gebouwd dat begeleiding en management samenbrengt. Met het nieuwe fasesysteem, incidentregistratie en automatische alerts kan Wilskrachtzorg sneller risico's zien, consequenter beslissen en beter rapporteren op trajectresultaten."

### C. Spreker-notitie voor managementpubliek
- Leg nadruk op voorspelbaarheid en kwaliteitsborging.
- Vermijd te veel technische details op directieniveau.
- Koppel elke module aan concrete zorguitkomsten.

## 4. Slide-design richtlijnen

- Gebruik per slide 1 hoofdboodschap.
- Gebruik max 1 grafiek plus 3 kernpunten.
- Zet onderaan iedere analytische slide: "Interpretatie voor zorgpraktijk".
- Laat iconen functioneel zijn, niet decoratief.
- Gebruik in tabellen alleen cijfers die je mondeling kunt duiden.

## 5. Korte prompt die je direct in Genspark kunt plakken

"Maak een professionele Nederlandstalige presentatie van 24 slides voor Wilskrachtzorg over een gebouwd digitaal dashboard en fasesysteem voor jeugdzorg. Gebruik deze structuur exact per dia: context, projectdoelen, scope, architectuur, modules, KPI-dashboard, jongerenbeheer, uitstroom, rapportages, PBS-fasesysteem (4 fases), fase-overgangen, incidentmodel, automatische alertregels, fase-analytics, jongere timeline, gedrag heatmap, backend datamodel, seed data, huidige status, gaps, roadmap, impact en besluitvraag. Gebruik zakelijke visual stijl met kleuren #07346A, #1D4ED8, #059669, #F97316, #DC2626 en lichte achtergronden. Voeg per slide korte speaker notes toe met nadruk op zorgpraktijk en managementsturing."