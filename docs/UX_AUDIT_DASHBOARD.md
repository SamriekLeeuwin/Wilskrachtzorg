# UX-analyse – Dashboardoverzicht

## 1. Doel van de pagina

Binnen vijf seconden antwoord geven op drie vragen: wat vraagt nu mijn aandacht, welke actie kan ik direct starten en hoe betrouwbaar/actueel is de getoonde informatie?

## 2. Gebruikers

- Woonbegeleider: dienstoverdracht, open acties, afspraken en acute signalen.
- Ambulant begeleider: eigen caseload, afspraken, vervolgacties en ontbrekende informatie.
- Gedragswetenschapper: veiligheids- en gedragssignalen, UVO en herstelopvolging.
- Locatieleider: achterstanden, veiligheid, capaciteit en taakverdeling per locatie.
- Management: afwijkingen, doorstroom, kwaliteit en trends.
- Administratie: ontbrekende gegevens, instroom, uitstroom en datacorrecties.

## 3. Problemen die worden opgelost

Versnipperde informatie, onduidelijk eigenaarschap, zoeken in meerdere dossiers, gemiste deadlines en cijfers zonder zichtbare bron of peildatum.

## 4. User stories

- Als begeleider wil ik direct mijn urgente werk zien zodat ik mijn dienst kan starten.
- Als gedragswetenschapper wil ik kritieke opvolging zien zodat veiligheidsacties niet blijven liggen.
- Als locatieleider wil ik afwijkingen en eigenaren zien zodat ik werk kan verdelen.
- Als manager wil ik uitkomsten en definities begrijpen zodat ik verantwoord kan sturen.
- Als administratief medewerker wil ik dataproblemen kunnen vinden en corrigeren.

## 5. Complete user flow

Openen → rol en dataversheid herkennen → urgente status lezen → primaire handeling kiezen → bevestiging of detailpagina → terug naar dezelfde context. Bij geen data: expliciete lege status. Bij fout/offline: laatst bekende data met waarschuwing. Na actie: succesfeedback en bijgewerkte teller.

## 6. Schermstructuur

1. Rol, paginanaam en dataversheid.
2. Actiegerichte start: melden, taak, uitnodigen, dossier, wijzigen.
3. Urgente status/signalen.
4. Rolgebonden kernindicatoren.
5. Werkvoorraad en verdiepende managementinformatie.

## 7. Componenten

Rolkeuze, peildatum, actiekaarten, urgente status, KPI-kaarten, filters, actielijst, lege, fout- en laadstatus.

## 8. Navigatie

Voorspelbare linkernavigatie op desktop; inklapbaar menu op mobiel; rolkeuze blijft op alle schermgroottes beschikbaar; skip-link naar hoofdinhoud.

## 9. Interacties

Actiekaarten openen direct de juiste flow. KPI's zijn alleen klikbaar als een onderliggende selectie bestaat. Filters wijzigen uitsluitend managementinformatie. Alle acties zijn met toetsenbord bereikbaar.

## 10. Validaties

Rol moet geldig zijn. Filters moeten onderling consistente cijfers opleveren. Kritieke teller moet overeenkomen met het signaalcentrum.

## 11. Error states

Toon welke gegevens niet konden laden, behoud indien mogelijk laatst bekende informatie en bied opnieuw proberen. Verberg fouten niet als lege data.

## 12. Empty states

Maak onderscheid tussen “geen werk”, “geen toegang”, “geen data” en “filters leveren niets op”. Geef alleen een vervolghandeling wanneer die logisch is.

## 13. Loading states

Behoud de pagina-indeling met skeletons; voorkom verspringen; blokkeer alleen componenten waarvan de data nog ontbreekt.

## 14. Success states

Na een actie verschijnt een korte bevestiging met wat is opgeslagen, waar het terug te vinden is en wie eigenaar is.

## 15. Edge cases

400+ jongeren vereisen zoeken/paginering buiten het dashboard. Gelijktijdige wijzigingen vereisen versiecontrole. Niet-opgeslagen invoer vereist waarschuwing. Offline handelingen mogen niet als definitief opgeslagen worden gepresenteerd.

## 16. Accessibility

Minimaal 16px voor gewone leestekst waar ruimte dit toelaat, voldoende contrast, zichtbare focus, skip-link, semantische koppen, labels voor iconen en geen informatie uitsluitend via kleur.

## 17. Mobiele versie

Acties in één kolom, rolkeuze zichtbaar, kritieke status boven KPI's, geen brede tabellen, aanraakdoelen minimaal circa 44px.

## 18. Desktopversie

Actieblok en urgente status boven de vouw; KPI's daaronder; details pas lager. Maximale leesbreedte voorkomt onnodig scannen.

## 19. Prestatie-optimalisaties

Route-lazy-loading, één gedeeld datamodel per dashboardrender, memoized afleidingen, geen dubbele storage/API-reads, toekomstige serverfilters voor grote datasets.

## 20. UX-verbeteringen

Rollen laten aansluiten op de organisatie, mobiele rolkeuze behouden, skip-link toevoegen, dataversheid explicieter maken, tekstgrootte verhogen en managementinformatie progressief tonen.

## 21. Mogelijke toekomstige uitbreidingen

Persoonlijke caseload, echte autorisatie, Zilliz-koppeling, kalender/e-mail, auditlog, offline wachtrij, notificatievoorkeuren en opgeslagen filters.

## UX-audit voor verbetering

| Onderdeel | Voor | Na beoogde verbetering | Reden dat dit nog geen 10 is |
|---|---:|---:|---|
| Gebruiksvriendelijkheid | 7 | 8 | Nog geen echte gebruikersvalidatie |
| Duidelijkheid | 7 | 9 | KPI-definities kunnen nog dichter bij de cijfers |
| Vindbaarheid | 8 | 9 | Globaal zoeken ontbreekt nog |
| Snelheid | 8 | 9 | Echte API-latency is nog niet getest |
| Consistentie | 8 | 9 | Oude dialogflows bestaan deels nog in code |
| Visuele hiërarchie | 7 | 9 | Moet met zorgmedewerkers worden getest |
| Toegankelijkheid | 6 | 8 | Volledige screenreader- en contrastaudit volgt |
| Leerbaarheid | 8 | 9 | Eerste-gebruik begeleiding kan beter |
| Foutpreventie | 7 | 8 | Gelijktijdige wijzigingscontrole ontbreekt |
| Efficiëntie | 8 | 9 | Persoonlijke defaults en caseload ontbreken |

Een score van 10 is zonder gebruikersonderzoek, echte brondata en assistive-technology-tests niet eerlijk te claimen.
