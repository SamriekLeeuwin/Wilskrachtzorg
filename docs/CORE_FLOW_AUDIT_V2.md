# Kernflow- en promptaudit v2

Datum: 30 juli 2026
Status: gevalideerd deelbaar prototype, niet geschikt als zorgbronsysteem of voor externe verantwoording

## Productbesluit

Het prototype gebruikt exact vier werkruimterollen:

| Rol | Primaire verantwoordelijkheid | Maakt data | Gebruikt data |
|---|---|---|---|
| Begeleider | Dagelijkse uitvoering, feitelijke registratie en opvolging | Meldingen, uitvoertaken, afspraken en resultaten | Eigen werk, dossiercontext en terugkoppeling |
| Gedragswetenschapper | Inhoudelijke beoordeling, veiligheid, UVO/evaluatie en afstemming met gemeente/verwijzer | Beoordeling, advies, contactmoment, extern besluit en inhoudelijke vervolgactie | Incidentbron, dossier, netwerkstatus en open besluiten |
| Zorgmanager | Operationele sturing, bevoegd besluit, traject- en vervolgplekbeheer en datakwaliteit | Managementbesluit, trajectwijziging, intake, vervolgplekstatus en correctie | Uitzonderingen, locaties, doorstroom, taken en bronkwaliteit |
| Directie | Bestuurlijke sturing op uitkomsten en risico’s | In dit prototype geen cliëntgebonden mutaties | Organisatietotalen, norm, vorige periode en dataconfidence |

“Management” is bewust geen vijfde rol. Operationeel management hoort bij de zorgmanager; bestuurlijke rapportage hoort bij directie.

## Antwoord binnen vijf seconden

| Rol | Eerste antwoord op het dashboard |
|---|---|
| Begeleider | Welke taken, afspraken of signalen moet ik nu uitvoeren? |
| Gedragswetenschapper | Welke veiligheid, UVO, beoordeling of gemeentelijke reactie vraagt nu actie? |
| Zorgmanager | Welke deadline, doorstroom, beslissing of databron blokkeert de operatie? |
| Directie | Hoe staan de belangrijkste uitkomsten ten opzichte van norm en vorige periode, en zijn de cijfers betrouwbaar? |

## Databetekenis

- `Gemeente vóór instroom` is een herkomstkenmerk en geen actuele proceseigenaar.
- `Verantwoordelijke gemeente` is de partij voor actuele afstemming, beschikking of financiering.
- `Verwijzer` is de verwijzende organisatie.
- Een `contactmoment` bevat persoon, rol, kanaal, onderwerp, samenvatting, afspraak/besluit, status, eigenaar, deadline, grondslag en gedeelde scope.
- Een reactie op een gekoppelde contacttaak markeert het eerdere open contactpunt als opgevolgd. Alleen een nieuwe open vervolgactie blijft daarna tellen.
- Dashboard, rapportage en datakwaliteit gebruiken één periodeberekening voor actieve trajecten, uitstroom en verblijfsduur.
- Incidenttotalen worden gereconcilieerd tussen incidentregels en de trajectsamenvatting. Een verschil blokkeert rapportage.

## Kernflowcontrole

| Flow | Binnenkomst | Beslismoment | Mutatie | Succesbewijs | Fout/edgecase |
|---|---|---|---|---|---|
| Melding | Dashboard of dossier | Type en urgentie | Feiten en directe maatregel | Status plus vervolgtaak | Acute instructie, onvolledig formulier, lokaal prototype |
| Taak | Dashboard, dossier of signaal | Type, eigenaar, deadline en gereeddefinitie | Nieuwe of gewijzigde taak | Taak in dezelfde dossiercontext | Geen recht, taak verdwenen, gelijktijdige wijziging |
| Afspraak/UVO | Dossier of taak | Type, doel, deelnemers, genodigden en agenda | Afspraak en eventuele taakkoppeling | Afspraak in dossier; bestaande taak hergebruikt | Verkeerd dossier-ID, overlap, datum/tijd, ontbrekende genodigde |
| Afspraak afronden | Dossier | Gehouden, no-show of geannuleerd | Aanwezigen, samenvatting, besluit en vervolg | Historie en gekoppelde taak | Toekomstige afspraak, verkeerde rol, taak uit ander dossier |
| Gemeente/verwijzer | Dossier of gemeentecontacttaak | Status, besluit, deelgrondslag en vervolg | Contactmoment, afsluiten bronpunt en eventueel nieuwe taak | Contactketen en historie | Verkeerde taak, al verwerkt, datumfout, gelijktijdige wijziging |
| Traject wijzigen | Dossier | Wat wijzigt en waarom? | Einddatum, locatie of begeleider | Chronologische wijzigingshistorie | Geen echte wijziging of ontbrekende reden |
| Vervolgplek/uitstroom | Dossier of monitor | Status, besluit, bewijs en werkelijke datum | Plaatsing, afsluiting of bevoegde heropening | Dossier, monitor, besluit en taak | Toekomstige uitstroom, geen bevestiging, gesloten traject corrigeren |
| Managementrapportage | Dashboard | Periode, norm, vorige periode en confidence | Geen cliëntmutatie | Reproduceerbare organisatie-uitkomst | Historische snapshot ontbreekt of broncontrole faalt |

## De 21 promptonderdelen voor de zes kernoppervlakken

Afkortingen: `D` dashboard, `CD` cliëntdossier, `NC` netwerkcontact, `TA` taak/afspraak, `MR` managementrapportage, `DQ` databetrouwbaarheid.

| Nr. | Onderdeel | D | CD | NC | TA | MR | DQ |
|---:|---|---|---|---|---|---|---|
| 1 | Doel | Rolstart en prioriteit | Eén cliënt begrijpen en handelen | Externe afstemming vastleggen | Werk toewijzen/plannen/afronden | Sturen op uitkomsten | Cijfers vóór delen controleren |
| 2 | Gebruiker | Vier rollen, rolgebonden | Drie zorgrollen | GW en zorgmanager | Bevoegde zorgrollen | Zorgmanager/directie | Zorgmanager/directie |
| 3 | Probleem | Versnipperd werk | Context en volgende stap | Verloren reactie/deadline | Dubbel of oncontroleerbaar werk | Cijfers zonder betekenis | Onbetrouwbare bron |
| 4 | User story | “Wat nu?” | “Wat speelt en wat doe ik?” | “Waarop wachten we?” | “Wie doet wat wanneer?” | “Wat wijkt af en waarom?” | “Mag dit cijfer worden gebruikt?” |
| 5 | Complete flow | Actie → detail → terug | Overzicht → tab → mutatie → terug | Taak/dossier → contact → opvolging | Aanmaken → uitvoeren → bewijs | Filter → uitkomst → duiding | Controle → herstel/definitie |
| 6 | Schermstructuur | Focus, acties, KPI, verdieping | Aandacht, kop, vijf tabs | Vier invoerstappen plus controle | Genummerde stappen plus controle | Waarschuwing, uitleg, KPI, analyse | Vrijgave, controles, woordenboek |
| 7 | Componenten | Acties, KPI’s, lijst | Info, tabs, tijdlijn | Formulier, status, deadline | Templates, uitnodiging, validatie | KPI, tabel, grafiek | Alert, KPI, tabel |
| 8 | Navigatie | Rolmenu en directe route | Terug naar jongeren; context behouden | Terug naar netwerktab | `returnTo` bewaart dossier | Alleen relevante managementroutes | Herstel naar dossier alleen voor ZM |
| 9 | Interactie | Rol en periode | Tab, taak, afspraak, wijziging | Opslaan en taak koppelen | Selecteren, valideren, opslaan | Periode vergelijken | Tab tussen controle/definitie |
| 10 | Validatie | Canonieke KPI | Rechten en wijzigingsreden | Datums, verplichte proces- en deelvelden | Dossier, type, tijd, overlap, rol | Eén berekening | Compleetheid en bronreconciliatie |
| 11 | Error state | Geen bron niet als nul | Niet gevonden ≠ geen recht | Ongeldige/verouderde taak | Conflict, verkeerde rol/dossier | Niet vrijgeven | Blokkade met oorzaak |
| 12 | Empty state | Geen taken expliciet | Geen afspraken/doelen/contacten expliciet | Niet van toepassing | Geen uitnodigingen expliciet | Geen uitstroom/snapshot expliciet | Geen problemen expliciet |
| 13 | Loading | Route-skeleton | Route-skeleton | Route-skeleton | Route-skeleton | Route-skeleton | Route-skeleton |
| 14 | Success | Bijgewerkte teller/lijst | Bericht met vindplaats | Contact en eventuele taak zichtbaar | Afspraak/taak in dossier | Geen mutatie | Controle geslaagd met voorbehoud |
| 15 | Edgecases | Historische periode | Onbekende cliënt | Twee tabbladen, reeds opgevolgd | Duplicaat-UVO, cross-client-ID | Geen historische vervolgpleksnapshot | Kleine groepen en bronverschil |
| 16 | Accessibility | H1, skiplink, toetsenbord | Scrollbare tabs, labels | Gelabelde velden | Gelabelde velden en fouttekst | Tabel plus tekst, niet alleen kleur | Tabel plus tekst, niet alleen kleur |
| 17 | Mobiel | Eén kolom | Geen globale overflow | Eén kolom en sticky controle vervalt | Eén kolom | Kaarten stapelen | Tabellen scrollen lokaal |
| 18 | Desktop | Kern boven de vouw | Context en acties naast elkaar | Invoer plus controlekolom | Invoer plus controlekolom | Drie KPI’s op één rij | Vier controles op één rij |
| 19 | Performance | Afgeleide data gememoized | Lokale dossierselectie | Eén opslagmutatie per bron | Duplicaatcontrole vóór schrijven | Gedeelde snapshotfunctie | Gedeelde snapshotfunctie |
| 20 | Verbetering | Minder acties per rol | Vijf duidelijke tabs | Dossiergebonden contactketen | Volwaardige pagina, geen klein dialoog | Uitkomst/norm/vorige/confidence | Canoniek conceptwoordenboek |
| 21 | Later | Persoonlijke caseload | Documentversies | Echte mail/portaal/CRM-koppeling | Agenda- en deelnemersstatusmachine | Freeze/sign-off/export | Data lineage en eigenaarworkflow |

## Browservalidatie

De lokale productiecode is getest met 23 scenario-controles:

- exact vier rollen;
- directie zonder operationele keten of cliëntcodes;
- directie zonder locatie-/herkomstfilter waarmee één dossier kan worden geïsoleerd;
- correcte periode-eindsnapshot voor kalenderjaar 2025;
- gemeentelijke samenwerking voor de zorgmanager;
- dossierprioriteit en netwerktab voor de gedragswetenschapper;
- contactreactie sluit het vorige contactpunt;
- normale dossierroute hergebruikt de bestaande UVO-taak;
- taak uit een ander dossier wordt geweigerd;
- directe taak-URL respecteert rolrechten;
- mobiel dossier zonder globale horizontale overflow;
- geen console- of runtimefouten.

Build, gerichte lintcontrole en `git diff --check` zijn geslaagd.

## Eerlijke UX-score

| Onderdeel | Score | Reden dat dit nog geen 10 is |
|---|---:|---|
| Gebruiksvriendelijkheid | 8 | Nog niet getest met echte medewerkers |
| Duidelijkheid | 9 | Bronnen en prototypegrens zijn zichtbaar; organisatiebegrippen wachten op akkoord |
| Vindbaarheid | 8 | Persoonlijke caseload en globaal zoeken ontbreken |
| Snelheid | 8 | Geen echte API, agenda of berichtenintegratie |
| Consistentie | 8 | Kernflows zijn gelijkgetrokken; enkele oudere demonstratieroutes blijven losstaand |
| Visuele hiërarchie | 9 | Rolprioriteit staat bovenaan |
| Toegankelijkheid | 8 | Toetsenbord- en screenreaderonderzoek met gebruikers ontbreekt |
| Leerbaarheid | 8 | Geen onboarding of ingebouwde begrippenhulp |
| Foutpreventie | 9 | Rechten, duplicaten, datums, cross-client-ID’s en bronverschillen worden afgevangen |
| Efficiëntie | 8 | Geen echte synchronisatie, persoonlijke defaults of bulkacties |

## Blokkerend vóór productie

1. Echte identiteit, server-side autorisatie, caseload- en locatiescope.
2. Zorgbronsysteem, agenda, beveiligde berichten en gemeente-/verwijzerkoppelingen.
3. Server-side append-only audittrail met revisies en vier-ogenregels.
4. Formele ernstige-incident-, directiebesluit- en eventuele IGJ-flow.
5. Eén deelnemersobject voor uitnodiging, bezorging, reactie en aanwezigheid.
6. Documentinzage en wijzigingsvoorstellen met versie, goedkeuring en bron.
7. Loading, retry, conflict, offline wachtrij en synchronisatiestatus op echte API-calls.
8. KPI-eigenaarschap, formele definitiegoedkeuring, rapportfreeze en publicatie.
9. Gebruikstest per rol, toegankelijkheidstest, privacy/security review en bronvalidatie.

Een score van 10 of de kwalificatie “productieklaar” is zonder deze punten niet verantwoord.
