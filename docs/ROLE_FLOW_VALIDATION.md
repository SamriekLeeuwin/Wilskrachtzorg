# Validatie van rol- en kernflows

Datum: 30 juli 2026
Status: prototypevalidatie, niet geschikt voor cliëntbesluiten of formele verantwoording

## Conclusie

De prototypeflows zijn per rol doorlopen vanuit de vraag: wat moet deze gebruiker binnen vijf seconden zien, welke beslissing volgt, welke handeling is toegestaan en welk bewijs toont dat de handeling is gelukt?

De belangrijkste datarisico’s uit de doorloop zijn hersteld:

- Een onbekende cliëntcode opent nooit meer stil het dossier van een andere jongere.
- Generieke doelen en historie worden niet meer bij ieder dossier als cliëntspecifieke feiten getoond.
- Een UVO-, herstel- of evaluatietaak wordt niet standaard afgerond wanneer alleen een afspraak is gepland.
- Een gekoppelde overlegtaak wordt pas afgerond nadat uitkomst, samenvatting en besluit zijn vastgelegd.
- Twee taakafrondingen vanuit verschillende tabbladen overschrijven elkaar niet meer; bij wijziging van dezelfde taak volgt een conflictmelding.
- Administratie ziet een administratieve dossierweergave en geen klinische doelen, afspraken of incidentdetails.
- Niet-toegestane routes geven een duidelijke rechtenmelding in plaats van een stille omleiding.
- Uitnodigingen vereisen valide contactgegevens, volgen een statusvolgorde en blijven herkenbaar als handmatige prototyperegistratie.
- Management- en directiedrilldowns leiden niet meer naar verboden cliëntpagina’s.
- Rapportageperioden scheiden trajecten actief aan periode-einde van uitstroom binnen de periode.

De oplossing is nog geen productieproduct. Echte identiteit, server-side autorisatie, Zilliz-/agenda-/berichtenkoppelingen, synchronisatie, een volledige audittrail en formele incidentgovernance ontbreken.

## Productgrens

Het beoogde systeem moet Zilliz niet opnieuw bouwen.

| Gegeven of proces | Beoogde bron/eigenaar |
|---|---|
| Cliëntidentiteit, zorgplan, rapportage en incidentregistratie | Aangewezen zorgbronsysteem |
| Werkvoorraad, signaalstatus en taak-SLA | Dit workflowproduct |
| Afspraken en uitnodigingsorkestratie | Workflowproduct met agenda-/berichtenkoppeling |
| KPI-definities, peildatum en datakwaliteit | Beheerde datalaag met gegevenseigenaar |
| Rollen, locaties en caseload | Identiteits- en autorisatievoorziening |

Ieder productieveld heeft daarom nodig: bron, laatste synchronisatietijd, eigenaar, lees-/schrijfrecht en auditstatus.

## Verantwoordelijkheid voor data

| Rol | Maakt of wijzigt | Ziet terug | Geeft door aan |
|---|---|---|---|
| Begeleider | Feitelijke melding, taak, afspraak en uitvoeringsresultaat | Eigen werkvoorraad, dossierhistorie en status van beoordeling/besluit | Gedragswetenschapper en zorgmanager |
| Gedragswetenschapper | Inhoudelijke beoordeling, advies, UVO-/herstelvoorbereiding en besluit uit overleg | Brongegeven zonder dit te overschrijven, open beoordelingen, incidentpatronen en dossierhistorie | Zorgmanager |
| Zorgmanager | Akkoord, herbeoordeling of escalatie; intake-, traject- en vervolgplekgegevens binnen bevoegdheid | Operationele werkvoorraad, volledig advies, locaties, KPI’s en datakwaliteit | Directie als uitsluitend geaggregeerde uitkomst of formele escalatie |
| Directie | In dit prototype geen cliëntgebonden operationele gegevens | Alleen geaggregeerde uitkomsten, databetrouwbaarheid en escalatieaantallen | Formele bestuurlijke/IGJ-flow ontbreekt nog |

Een volgende rol mag de oorspronkelijke registratie of beoordeling niet stil overschrijven. Elke stap krijgt een eigen status, rol, tijdstip en toelichting.

## Rolflows

### Begeleider

Binnen vijf seconden: relevante jongeren, urgente signalen, afspraken en taken vandaag of te laat.

Gewenste dataflow:

1. Juiste cliëntdossier en actuele afspraken controleren.
2. Waarneming, zorgsignaal of veiligheidsincident feitelijk registreren.
3. Directe veiligheidsmaatregel en geïnformeerde personen vastleggen.
4. Controleren dat de registratie de status `Ter beoordeling` heeft en als opvolgtaak zichtbaar is.
5. Afspraken of vervolgtaken uitvoeren en van resultaat voorzien.
6. In het dossier terugzien of de gedragswetenschapper advies heeft gegeven en de zorgmanager een besluit heeft genomen.

Prototype: rolgebonden signalen en taken, dossier, melding, afspraak, afronding en terugkoppeling van beoordelingsstatus zijn aanwezig. Persoonlijke caseload, dienstoverdracht, echte berichten en synchronisatie ontbreken.

### Gedragswetenschapper

Binnen vijf seconden: zware incidenten, nieuwe veiligheidssignalen, open herstel/UVO, te late taken en afspraken.

Gewenste flow:

1. Signaal met bronincidenten en criterium openen.
2. Accepteren, duplicaat/niet-van-toepassing markeren, toewijzen of escaleren.
3. UVO samen met mentor plannen; mentor verzorgt berichtgeving.
4. Verzending, reacties en ontbrekende deelnemers opvolgen.
5. Overleg houden of no-show registreren.
6. Besluit en één of meer vervolgtaken vastleggen.
7. Bronincident, signaal, taak en dossierhistorie gecontroleerd sluiten.

Prototype: incidentanalyse, aantoonbare 21-dagencontrole voor drie aantekeningen, UVO-/hersteltaken, afspraak, uitnodigingen en gestructureerde beoordeling bestaan. De beoordeling legt inhoudelijke duiding, advies, rol en tijd vast en geeft dit door aan de zorgmanager. Terugkoppeling naar het externe incidentbronsysteem ontbreekt.

### Zorgmanager

Binnen vijf seconden: registraties die op een besluit wachten, acute veiligheid, te late taken, doorstroom, datakwaliteit en afwijkingen per locatie.

Gewenste flow:

1. Advies van de gedragswetenschapper met bronregistratie openen.
2. Controleren dat feiten, beoordeling, advies, eigenaar en urgentie compleet zijn.
3. Kiezen: akkoord, terug voor herbeoordeling of escaleren.
4. Besluit en vervolgstap met rol en tijd vastleggen.
5. Operationeel doorklikken naar dossier, taak, intake, traject- of vervolgplekstatus.
6. Geaggregeerd sturen op capaciteit, doorstroom, incidenten en databetrouwbaarheid.

Prototype: de volledige beslisketen, operationele drilldowns, intake, trajectwijziging, vervolgplekverwerking, KPI’s en locaties bestaan. Persoonlijke locatie-/caseloadscope, vier-ogen-goedkeuring, personeelsinzet en serveraudit ontbreken.

### Directie

Binnen vijf seconden: uitzonderlijke organisatie-uitkomsten, ernstige/meldplichtige incidenten, vereiste besluiten en databetrouwbaarheid.

Gewenste flow:

1. Ernstige melding met samenvatting en advies openen.
2. Directiebesluit en eventuele IGJ-status vastleggen.
3. Verantwoordelijke, deadline en bewijs volgen.
4. Maand-/kwartaalrapport met managementtoelichting beoordelen.
5. Versie goedkeuren en publiceren.

Prototype: directie ziet alleen geaggregeerde rapportage, locatie-, incident-, datakwaliteits- en dataketen-aantallen. Cliëntcodes, dossierlinks en de beoordelingswerkvoorraad zijn afgeschermd. Lokale prototypeconcepten tellen niet stil mee in het bronbevestigde incidentcijfer. De formele IGJ-, sign-off- en publicatieworkflow ontbreekt.

## Validatie van kernflows

| Kernflow | Resultaat |
|---|---|
| Onbekende dossier-URL | Geblokkeerd met foutmelding; geen fallbackdata |
| Geen rechten | Uitleg en veilige terugweg; niets gewijzigd |
| Signaal naar taak | Bestaande taak wordt herkend; duplicaatknop wordt vervangen |
| UVO-criterium | Gebaseerd op drie incidentdatums binnen 21 dagen, niet alleen een totaalteller |
| Taak naar afspraak | Gekoppelde taak blijft standaard open |
| Afspraaktype wijzigen | Deelnemer- en agendaopties wijzigen mee |
| Uitnodiging toevoegen | Contactformaat en duplicaat worden gecontroleerd |
| Uitnodigingsstatus | Concept → handmatig verzonden → bevestigd/afgezegd |
| Afspraak afronden | Niet vóór afspraakdatum; gehouden/no-show/geannuleerd; besluit verplicht |
| Gekoppelde taak afronden | Pas na vastgelegde afspraakuitkomst en besluit |
| Vervolgplek definitief/geplaatst | Type, aanbieder, besluitnemer en bronreferentie verplicht |
| Intake | Dubbele cliëntcode en ongeldige datumvolgorde worden geblokkeerd |
| Parallelle taakupdates | Nieuwste opslagversie wordt gelezen; dezelfde taak geeft conflict |
| Offline | Globale waarschuwing; lokale opslag wordt niet als synchronisatie gepresenteerd |
| Niet-opgeslagen formulier | Waarschuwing bij linknavigatie en herladen |
| Lege lijsten | Aparte melding voor geen resultaat/geen bronitem |

## UX-audit na deze iteratie

| Onderdeel | Score | Waarom nog geen 10 |
|---|---:|---|
| Gebruiksvriendelijkheid | 8 | Dienst-, bezoek- en signaaltriageflow zijn nog niet volledig |
| Duidelijkheid | 8 | Prototype versus bronstatus is duidelijker; enkele beleidsdefinities wachten op akkoord |
| Vindbaarheid | 8 | Rolnavigatie werkt, maar globaal zoeken en persoonlijke caseload ontbreken |
| Snelheid | 8 | Kernacties zijn direct; 400+ dossiers vereisen serverzoek/paginering |
| Consistentie | 8 | Taak- en verantwoordelijketerminologie is verbeterd; enkele oude componenten zijn nog niet verwijderd |
| Visuele hiërarchie | 8 | Kritieke items staan bovenaan; validatie met echte medewerkers ontbreekt |
| Toegankelijkheid | 7 | H1, skiplink en grotere doelen bestaan; kleine lokale teksten en screenreader-QA blijven |
| Leerbaarheid | 8 | Rolteksten en foutfeedback helpen; onboarding ontbreekt |
| Foutpreventie | 8 | P0-datafouten en enkele conflicten zijn afgevangen; serverversies en vier-ogen ontbreken |
| Efficiëntie | 7 | Geen agenda-, berichten- of Zilliz-write-back en geen persoonlijke defaults |

Een score 10 is niet verantwoord zonder echte medewerkers, echte brondefinities, assistive-technologytests en productie-integraties.

## Blokkerend vóór productie

1. Server-side identiteit, RBAC, locatie-/caseloadscope en veldrechten.
2. Async repository/API met pending, synced, failed en retry; geen gevoelige localStorage als productopslag.
3. Append-only audittrail met actor, tijd, reden, oude/nieuwe waarde en revisie.
4. Signaalstatusmachine en idempotente koppeling met bronincidenten.
5. Formele ernstige-incident-/IGJ-/directiebesluitflow.
6. Documentinzage en wijzigingsvoorstel met versie, toestemming, goedkeuring en bron.
7. Persoonlijke werkvoorraad, vervanging/waarneming en SLA.
8. Paginering/serverzoeken, route-lazy-loading en echte fout-/loadingstates.
9. Gebruikerstest per rol en privacy/security review.
