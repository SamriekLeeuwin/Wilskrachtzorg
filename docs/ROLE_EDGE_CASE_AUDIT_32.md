# Edgecase-audit per rol — 32 scenario’s per rol

Datum: 30 juli 2026  
Scope: huidig interactief prototype, broncode-review en bestaande flowtests  
Status: risicoanalyse; geen productieacceptatie

## Legenda

- **Afgedekt**: het prototype voorkomt of verklaart het scenario.
- **Deels**: basisgedrag bestaat, maar bewijs, herstel of autorisatie ontbreekt.
- **Open**: het scenario is niet veilig of volledig afgehandeld.
- **P0**: kan tot verkeerde cliëntdata, bevoegdheidsfout of onterecht afgeronde zorgactie leiden.
- **P1**: blokkeert betrouwbaar dagelijks gebruik.
- **P2**: belangrijke optimalisatie, maar niet direct veiligheidskritisch.

## Begeleider — 32 edgecases

| # | Edgecase | Status | Aanpassing | Prio |
|---:|---|---|---|---|
| 1 | Begeleider opent cliënt buiten eigen caseload | Open | Server-side caseload- en locatiescope; niet alle dossiers laden | P0 |
| 2 | Begeleider opent managementroute via directe URL | Afgedekt | RoleGate geeft geen-toegangstatus; productie nog server-side afdwingen | P0 |
| 3 | Verkeerde of onbekende cliëntcode in dossier-URL | Afgedekt | Foutstatus opent geen fallbackdossier | P0 |
| 4 | Cliënt wordt tijdens invoer afgesloten of overgeplaatst | Open | Vóór opslaan actuele trajectstatus en schrijfrecht opnieuw controleren | P0 |
| 5 | Incidentdatum ligt in de toekomst | Open | Datum maximaal vandaag; fout direct bij datumveld | P0 |
| 6 | Incidenttijd ligt later dan huidige tijd op vandaag | Open | Datum+tijd als één tijdstip valideren | P1 |
| 7 | Medewerker dubbelklikt op “Prototypeconcept opslaan” | Open | Knop tijdens opslag blokkeren en idempotency-key gebruiken | P0 |
| 8 | Dezelfde gebeurtenis wordt door twee begeleiders gemeld | Open | Duplicaatsuggestie op cliënt, tijd, type en onderwerp; niet automatisch samenvoegen | P1 |
| 9 | Acute melding wordt als normale urgentie “Deze week” opgeslagen | Open | Acute veiligheidskeuze koppelen aan verplichte directe escalatie en SLA | P0 |
| 10 | Verplichte geïnformeerde functionaris ontbreekt | Deels | Beleidsafhankelijke ontvangers als gestructureerde checklist valideren | P0 |
| 11 | Internet valt uit tijdens melding | Deels | Nu alleen globale waarschuwing; productie vereist versleutelde conceptwachtrij en syncstatus | P0 |
| 12 | Browseropslag is vol of geblokkeerd | Open | Opslagfout tonen; nooit succes melden zonder bevestigde persistency | P0 |
| 13 | Gebruiker navigeert terug met onopgeslagen invoer | Deels | Waarschuwing bestaat; herstelbaar concept per gebruiker ontbreekt | P1 |
| 14 | Rol wordt gewisseld terwijl formulier openstaat | Open | Formulier sluiten of opnieuw autoriseren; onopgeslagen inhoud veilig behandelen | P0 |
| 15 | Taakdeadline ligt in het verleden | Afgedekt | Nieuwe taak blokkeert verleden; ook tijdzone en zomertijd server-side controleren | P1 |
| 16 | Taak wordt aan medewerker buiten team/locatie gegeven | Open | Eigenaarlijst filteren op team, beschikbaarheid, bevoegdheid en vervanging | P0 |
| 17 | Dezelfde taak bestaat al | Deels | Afspraakflow hergebruikt enkele taaktypen; algemene taakflow mist duplicaatdetectie | P1 |
| 18 | Twee gebruikers wijzigen dezelfde taak | Afgedekt | Optimistische versiecontrole bestaat lokaal; serverrevisie blijft nodig | P0 |
| 19 | Taak is verwijderd/afgerond in ander tabblad | Afgedekt | Conflictmelding bij bewerken/afronden; servertransactie blijft nodig | P0 |
| 20 | UVO/hersteltaak wordt rechtstreeks vanuit werkvoorraad afgerond | Open | Taaktype-afhankelijke gereeddefinitie afdwingen; overleguitkomst en besluit verplicht | P0 |
| 21 | Gewone uitvoertaak wordt zonder controleerbaar resultaat afgerond | Afgedekt | Resultaattekst is verplicht; bewijsvereiste per taaktype ontbreekt | P1 |
| 22 | Afspraak overlapt met andere afspraak van dezelfde cliënt | Afgedekt | Lokale overlapcontrole bestaat | P1 |
| 23 | Afspraak overlapt met agenda van verantwoordelijke medewerker | Open | Agenda-/resourceconflict over alle cliënten controleren | P1 |
| 24 | UVO wordt zonder echte genodigde opgeslagen | Afgedekt | Minimaal één echte genodigde en verplichte rollen worden gecontroleerd | P0 |
| 25 | Ongeldig of dubbel e-mailadres/telefoonnummer | Afgedekt | Formaat- en duplicaatcontrole bestaat binnen het formulier | P1 |
| 26 | Uitnodiging staat “Verzonden” maar er is niets verstuurd | Deels | Waarschuwing bestaat; productie moet delivery-id, kanaalstatus en foutbewijs tonen | P0 |
| 27 | Begeleider wijzigt uitnodigingsstatus van afspraak waarvoor die niet bevoegd is | Open | Uitnodigingspagina mist afspraak-/rolspecifieke mutatiecontrole | P0 |
| 28 | Toekomstige afspraak wordt voortijdig afgerond | Afgedekt | Afronden vóór afspraakdatum wordt geblokkeerd | P0 |
| 29 | Vervolgtaak na gesprek krijgt een datum in het verleden | Open | Vervolgdeadline minimaal vandaag en na gesprek valideren | P1 |
| 30 | Incidentanalyse vanuit dossier verliest cliëntcontext | Afgedekt | Cliëntfilter wordt nu doorgegeven en zichtbaar gemaakt | P1 |
| 31 | Er zijn 400+ cliënten | Open | Serverzoeken, paginering, caseload-default en virtualisatie toevoegen | P1 |
| 32 | Lokale browserdata wordt gewist of apparaat wordt gedeeld | Open | Geen cliëntdata in localStorage; serveropslag, sessiescheiding en apparaatbeleid | P0 |

### Kernbesluit Begeleider

Blokkerend zijn caseload-autorisatie, veilige opslag, idempotente meldingen en vooral het voorkomen dat overleggebonden taken via de generieke werkvoorraad te vroeg worden afgerond.

## Gedragswetenschapper — 32 edgecases

| # | Edgecase | Status | Aanpassing | Prio |
|---:|---|---|---|---|
| 1 | Gedragswetenschapper ziet dossiers buiten toegewezen scope | Open | Caseload-, locatie- en waarnemingsscope server-side toepassen | P0 |
| 2 | Bronsignaal of incident is na openen gewijzigd | Open | Bronrevisie en synchronisatietijd bij beoordeling vastzetten | P0 |
| 3 | Signaal is een duplicaat | Open | Acties toevoegen: accepteren, duplicaat, n.v.t., uitstellen en escaleren | P1 |
| 4 | Signaal is vals positief | Open | Reden, beoordelaar en heropenbare statusmachine toevoegen | P1 |
| 5 | Signaal heeft geen herleidbare bronregels | Deels | UVO-regel toont datums; ieder signaal moet volledige lineage tonen | P0 |
| 6 | Drie aantekeningen vallen net buiten 21 dagen | Afgedekt | UVO-criterium gebruikt incidentdatums, niet alleen totaalteller | P0 |
| 7 | Eén incident wordt achteraf gecorrigeerd | Open | Signaal automatisch herberekenen en wijziging zichtbaar maken | P0 |
| 8 | Twee gedragswetenschappers beoordelen dezelfde melding | Afgedekt | Lokale conflictcontrole bestaat; server-lock/revisie vereist | P0 |
| 9 | Beoordelaar beoordeelt eigen registratie zonder tegenlezing | Open | Functiescheiding of risicogebonden tweede beoordelaar instellen | P1 |
| 10 | Reeds besloten registratie wordt opnieuw beoordeeld | Afgedekt | Knop verdwijnt bij “Besluit vastgelegd” | P0 |
| 11 | Herbeoordeling overschrijft oorspronkelijke feiten | Afgedekt | Beoordeling en advies zijn aparte velden; bron blijft staan | P0 |
| 12 | Advies is inhoudelijk leeg maar lang genoeg | Open | Gestructureerde conclusie, risico, advies, urgentie en onderbouwing | P1 |
| 13 | Advies wordt dubbel opgeslagen door dubbelklik | Open | Pendingstatus en idempotente mutatie toevoegen | P0 |
| 14 | UVO-taak wordt direct in werkvoorraad afgerond | Open | Afronding uitsluitend via gehouden overleg plus besluit toestaan | P0 |
| 15 | Er bestaat al een open UVO-taak | Afgedekt | Afspraakflow hergebruikt passende open taak | P0 |
| 16 | Er bestaan twee oudere UVO-taken | Deels | Eén actieve procesinstantie kiezen; duplicaten gecontroleerd sluiten | P1 |
| 17 | Verplichte mentor of rol ontbreekt bij UVO | Afgedekt | Verplichte deelnemerrollen worden gecontroleerd | P0 |
| 18 | Medewerker heeft op hetzelfde moment andere afspraak | Open | Agenda-overlap voor eigenaar en genodigden controleren | P1 |
| 19 | Uitnodiging faalt technisch | Open | Bezorgstatus, retry, alternatief kanaal en eigenaar tonen | P1 |
| 20 | Uitnodigingsstatus wordt gelijktijdig aangepast | Open | Versiecontrole op deelnemersobject toevoegen | P0 |
| 21 | Genodigde accepteert en trekt later in | Deels | Huidige statusmachine kan niet volledig heropenen; reactiehistorie nodig | P1 |
| 22 | Overleg is no-show | Deels | Uitkomst bestaat; aparte reden, nieuwe afspraak en taakstatus nodig | P1 |
| 23 | Overleg wordt geannuleerd | Deels | Besluittekst is nog verplicht; annuleringsreden en herplanning scheiden | P1 |
| 24 | Gehouden overleg mist één verplicht agendapunt | Open | Agendaresultaten/checklist per overlegtype valideren | P1 |
| 25 | Vervolgdeadline na overleg ligt in verleden | Open | Deadline minimaal vandaag/na overlegdatum valideren | P1 |
| 26 | Gemeentecontact wordt voor toekomstige datum geregistreerd | Afgedekt | Contactdatum maximaal vandaag | P0 |
| 27 | Vorige grondslag of gedeelde inhoud wordt ongemerkt hergebruikt | Afgedekt | Beide moeten nu per deelmoment actief worden gekozen/bevestigd | P0 |
| 28 | Twee gebruikers corrigeren hetzelfde contact tegelijk | Open | Correctietarget vóór commit opnieuw op revisie/gecorrigeerd-status controleren | P0 |
| 29 | Correctie vervangt taak die intussen inhoudelijk gewijzigd is | Open | Correctie en taakvervanging in één servertransactie met revisiecontrole | P0 |
| 30 | Eigenaar is alleen een rolnaam, geen persoon | Deels | Persoon, rol, teamwerkvoorraad en vervanging apart modelleren | P1 |
| 31 | Gedeelde tekst bevat onnodige persoonsgegevens | Open | Dataminimalisatiehulp, gevoelige-datawaarschuwing en review bij hoog risico | P0 |
| 32 | Contact met ouder/school wordt in gemeenteformulier gezet | Deels | Scope is nu expliciet; aparte contactflows/datamodellen ontbreken nog | P1 |

### Kernbesluit Gedragswetenschapper

Blokkerend zijn een echte signaalstatusmachine, gereeddefinities voor UVO/herstel, bronrevisies en transactionele correcties van gemeentecontacten.

## Zorgmanager — 32 edgecases

| # | Edgecase | Status | Aanpassing | Prio |
|---:|---|---|---|---|
| 1 | Zorgmanager ziet andere locaties zonder bevoegdheid | Open | Locatiescope en vervangingsmandaat server-side afdwingen | P0 |
| 2 | Dubbele cliëntcode met andere hoofdletters/spaties | Deels | Code normaliseren vóór duplicaatcontrole | P0 |
| 3 | Intake startdatum ligt in de toekomst | Open | Beleidsregel en expliciete toekomstige-startstatus toevoegen | P1 |
| 4 | Verwachte einddatum ligt vóór startdatum | Afgedekt | Intake blokkeert ongeldige volgorde | P0 |
| 5 | Intake wordt dubbel opgeslagen door dubbelklik | Open | Idempotency-key en pendingstatus | P0 |
| 6 | Intake moet door tweede persoon worden goedgekeurd | Open | Vier-ogenstatus en functiescheiding toevoegen | P0 |
| 7 | Eerste taken/afspraken na intake ontbreken | Open | Configureerbare intake-checklist en automatische starttaken | P1 |
| 8 | Trajectwijziging zet einddatum vóór startdatum | Open | Dossierdialog valideert deze datumrelatie nog niet | P0 |
| 9 | Twee managers wijzigen hetzelfde traject | Open | Revisiecontrole en merge/conflictweergave toevoegen | P0 |
| 10 | Afgesloten traject wordt via dossierdialog gewijzigd | Open | Mutaties blokkeren of formele heropenflow verplichten | P0 |
| 11 | Locatie wijzigt zonder overdrachtsactie | Open | Overdrachtschecklist, nieuwe eigenaar en ingangsdatum verplichten | P1 |
| 12 | Hoofdbegeleider wijzigt naar afwezige medewerker | Open | Beschikbaarheid, contract, team en ingangsdatum controleren | P1 |
| 13 | Advies verandert nadat manager het dialoog opent | Afgedekt | Lokale conflictcontrole herlaadt actuele registratie | P0 |
| 14 | Manager beslist zonder gereed inhoudelijk advies | Afgedekt | Behalve datacorrectie is “Advies gereed” verplicht | P0 |
| 15 | Datacorrectie vereist inhoudelijke/bron-goedkeuring | Open | Correctietype-afhankelijke eigenaar en vier-ogenregel | P1 |
| 16 | Besluit “Escaleren” heeft geen ontvanger of deadline | Open | Directie-/IGJ-escalatieobject met eigenaar, deadline en bewijs | P0 |
| 17 | “Terug voor herbeoordeling” zonder concrete vraag | Deels | Toelichting verplicht, maar gestructureerde herbeoordelingsvraag ontbreekt | P1 |
| 18 | Besluit wordt dubbel opgeslagen | Open | Pendingstatus en idempotente servermutatie | P0 |
| 19 | Vervolgplek springt van “Geplaatst” terug naar “Zoeken” | Deels | Waarschuwing bestaat; toegestane statusovergangen en bevoegd heropenbesluit ontbreken | P0 |
| 20 | Gespreksdatum voor vervolgplek ligt in toekomst | Afgedekt | Datum maximaal vandaag | P1 |
| 21 | Werkelijke uitstroomdatum ligt in toekomst | Afgedekt | Plaatsing vereist vandaag of eerder | P0 |
| 22 | Gewenste uitstroom ligt vóór instroom/start | Open | Relatie met trajectstart valideren | P0 |
| 23 | Definitief akkoord mist aanbieder/besluit/bewijs | Afgedekt | Verplichte velden bestaan | P0 |
| 24 | Dezelfde vervolgplekupdate wordt tweemaal opgeslagen | Deels | Taak wordt deels hergebruikt; gesprekken/besluiten kunnen dupliceren | P1 |
| 25 | Bestaande vervolgtaak is parallel gewijzigd | Open | Vervolgplek-update mist revisiecontrole op taak en traject | P0 |
| 26 | Datakwaliteit keurt “Besluit ontvangen” met open vervolg zonder deadline goed | Open | Validatie baseren op `nextAction`/procesinstantie, niet alleen status | P0 |
| 27 | Incidenttotalen verschillen tussen bron en samenvatting | Afgedekt | Rapportageblokkade bestaat bij reconciliatieverschil | P0 |
| 28 | KPI-definitie wijzigt midden in rapportageperiode | Open | Metric versioning, ingangsdatum en reproduceerbare snapshot | P0 |
| 29 | Rapportage wordt gedeeld zonder freeze/goedkeuring | Open | Rapportversie, freeze, sign-off en publicatiestatus | P0 |
| 30 | 400+ dossiers of taken veroorzaken trage pagina | Open | Serverfilters, paginering, indexen en lazy detailqueries | P1 |
| 31 | Documentmetadata is aanwezig maar bronbestand ontbreekt | Deels | Nu expliciete prototypewaarschuwing; productie vereist bronstatus en retry | P1 |
| 32 | Browseropslag bevat concurrerende managementbesluiten | Open | Geen gevoelige localStorage; transactionele API en append-only auditlog | P0 |

### Kernbesluit Zorgmanager

Blokkerend zijn serverautorisatie, trajectrevisies, vier-ogenregels, formele escalatie, statusmachines voor vervolgplek en reproduceerbare rapportages.

## Directie — 32 edgecases

| # | Edgecase | Status | Aanpassing | Prio |
|---:|---|---|---|---|
| 1 | Directie opent cliëntdossier via directe URL | Afgedekt | Client-side geblokkeerd; productie server-side afdwingen | P0 |
| 2 | Directie voegt `?client=WKZ-001` toe aan incidentanalyse | Afgedekt | Cliëntparameter wordt voor Directie genegeerd | P0 |
| 3 | Iemand wisselt via rolselector zelf naar Directie | Open | Rolselector alleen demo; productie echte identiteit en RBAC | P0 |
| 4 | Locatiekaart toont kleine groep die herleidbaar is | Open | Minimumgroepsgrootte en suppressie op alle directieoppervlakken | P0 |
| 5 | Combinatie van totalen maakt individuele cliënt afleidbaar | Open | Differentiële suppressie/secondary suppression en privacyreview | P0 |
| 6 | Directie ziet alleen drie KPI’s en mist bestuurlijk risico | Open | Bestuurlijke beslis-/uitzonderingenrij toevoegen | P1 |
| 7 | Ernstig incident vereist directiebesluit | Open | Formele ernstige-incidentflow met advies, besluit en deadline | P0 |
| 8 | Mogelijke IGJ-melding moet worden beoordeeld | Open | IGJ-statusmachine, juridisch criterium, eigenaar en bewijs | P0 |
| 9 | Een escalatie heeft geen besluit vóór deadline | Open | Bestuurlijke werkvoorraad met SLA, reminders en plaatsvervanging | P0 |
| 10 | Rapportage bevat blokkades maar wordt toch gedeeld | Deels | Waarschuwing bestaat; export/publicatie technisch blokkeren | P0 |
| 11 | Rapport wordt na beoordeling ongemerkt gewijzigd | Open | Freeze, rapporthash, versie en hergoedkeuring | P0 |
| 12 | Twee directieleden keuren verschillende versies goed | Open | Eén goedkeuringsworkflow met versie- en quorumregels | P0 |
| 13 | Goedkeurder is afwezig | Open | Gedelegeerd mandaat met geldigheidsperiode en audit | P1 |
| 14 | Managementtoelichting ontbreekt bij rode KPI | Open | Oorzaak, maatregel, eigenaar en deadline verplichten | P1 |
| 15 | Conceptnorm wordt geïnterpreteerd als vastgesteld beleid | Deels | “Conceptdoel” staat zichtbaar; formele normstatus en eigenaar toevoegen | P0 |
| 16 | Capaciteit 30 verandert per locatie/periode | Open | Capaciteit als gedateerde brondata modelleren, niet hardcoderen | P0 |
| 17 | Klein uitstroomaantal geeft misleidend percentage | Deels | Teller/noemer zichtbaar; small-n waarschuwing en onzekerheid toevoegen | P1 |
| 18 | Mediaan verbergt uitschieters | Deels | Verdeling bestaat lager; P90/outliers en populatiegrootte toevoegen | P1 |
| 19 | Incidenten worden vergeleken zonder cliëntdagen/bezetting | Open | Veiligheidsratio met exposure en case-mix; absolute aantallen behouden | P1 |
| 20 | Dataconfidence 98% wordt gezien als 98% juist | Open | Compleetheid, juistheid, actualiteit en reconciliatie apart tonen | P0 |
| 21 | Eén bron is verouderd terwijl totale peildatum actueel lijkt | Open | Versheid per bron, stale-status en laatste succesvolle sync | P0 |
| 22 | Historische vervolgplekstatus bestaat niet | Deels | N.v.t./niet beschikbaar wordt getoond; echte snapshots vereist | P1 |
| 23 | Traject wordt achteraf gewijzigd en oud rapport verandert mee | Open | Immutable period snapshots en metric-versioning | P0 |
| 24 | Financiële/contractuele afwijking ontbreekt | Open | Alleen toevoegen na bron- en besluitvalidatie; niet als losse tegel | P1 |
| 25 | Personeelscontinuïteit/capaciteit ontbreekt | Open | Bezetting, verzuim en kritieke vacatures als aparte bronfamilie | P1 |
| 26 | Cliëntuitkomsten ontbreken | Open | Uitkomst-/doelrealisatiemodel samen met zorgprofessionals vaststellen | P1 |
| 27 | Directie kan oorzaak niet veilig verdiepen | Deels | Alleen organisatietotalen; veilige aggregatiedrilldown met suppressie toevoegen | P1 |
| 28 | Dashboard/API faalt en toont lege waarden als nul | Deels | Prototype is lokaal; productie onderscheid fout, stale en werkelijk nul | P0 |
| 29 | Directie gebruikt mobiel en brede tabel is onleesbaar | Deels | Lokale scroll bestaat; mobiele samenvatting en prioriteitskaarten nodig | P2 |
| 30 | Rapport moet printbaar/exporteerbaar zijn | Open | Toegankelijke PDF/CSV met versie, filters, bron en vertrouwelijkheid | P1 |
| 31 | Besluit en maatregel worden niet opgevolgd | Open | Besluitregister met eigenaar, voortgang, bewijs en herbeoordelingsdatum | P0 |
| 32 | Openbare prototype-URL wordt voor echte data gebruikt | Deels | Fictieve-datawaarschuwing bestaat; productie strikt gescheiden hosting en DLP | P0 |

### Kernbesluit Directie

Blokkerend zijn privacy-suppressie over alle directieschermen, een echte bestuurlijke beslisflow, rapportfreeze/sign-off, incident-/IGJ-governance en reproduceerbare brondata.

## Overkoepelende prioriteiten

### P0 — vóór productie

1. Echte identiteit, server-side RBAC, caseload- en locatiescope.
2. Geen gevoelige zorgdata in localStorage; transactionele API met fout- en syncstatus.
3. Taaktype-afhankelijke gereeddefinities: UVO/herstel/evaluatie niet generiek afronden.
4. Append-only serveraudit met revisies, actor, reden en oude/nieuwe waarde.
5. Idempotency voor alle opslaan-/besluitacties.
6. Correcties, gekoppelde taak en contactstatus in één transactie.
7. Formele escalatie-, ernstige-incident-, directie- en eventuele IGJ-flow.
8. Vier-ogenregels voor risicovolle intake-, correctie-, vervolgplek- en rapportageacties.
9. Rapportfreeze, KPI-versies, snapshots, sign-off en publicatieblokkades.
10. Privacy-suppressie en herleidbaarheidscontrole voor kleine groepen.

### P1 — nodig voor betrouwbaar dagelijks gebruik

1. Persoonlijke werkvoorraad, caseload, waarneming en agenda-integratie.
2. Signaalstatusmachine met duplicaat/n.v.t./uitstel/escalatie.
3. Bezorg- en reactiestatus voor uitnodigingen en extern contact.
4. Serverzoeken/paginering voor cliënten, taken en historie.
5. Gestructureerde beslis- en evaluatievelden per proces.
6. Datakwaliteit per bron: compleetheid, juistheid, actualiteit en lineage.
7. Directierapportage rond afwijking → oorzaak → maatregel → besluit → opvolging.

### P2 — optimalisatie

1. Mobiele managementsamenvatting.
2. Opgeslagen filters en persoonlijke defaults.
3. Print-/exportweergaven nadat governance gereed is.
4. Onboarding, begrippenhulp en meetbare gebruiksanalytics.

## Eerlijk validatieoordeel

De audit bevat **128 edgecases: 32 per rol**. De kernflows zijn als prototype duidelijker dan voorheen, maar het grootste resterende risico zit niet in styling. Het zit in serverautorisatie, processtatusmachines, transactionele opslag, functiescheiding en bestuurlijke governance. Zonder die onderdelen is het systeem geschikt om de werkwijze te bespreken en te testen, maar niet om echte cliëntbesluiten of formele verantwoording in vast te leggen.
