# Controle op naleving van de UX-opdracht

## Conclusie

De opdracht is nog niet volledig uitgevoerd. De basisrichting is bruikbaar, maar alleen het dashboard heeft een document met de 21 gevraagde onderdelen. Ook dat document beantwoordt niet iedere onderliggende vraag afzonderlijk en beschrijft deels gewenst gedrag dat nog niet in het prototype is geïmplementeerd.

## Compliance-overzicht

| Onderdeel uit de opdracht | Status | Belangrijkste hiaat |
|---|---|---|
| Alle genoemde gebruikersrollen | Voldaan | Rollen zijn toegevoegd; echte autorisatie ontbreekt nog |
| Informatie binnen vijf seconden | Voldaan | Urgentie en directe acties staan bovenaan |
| Dagelijkse, wekelijkse en maandelijkse informatie per rol | Niet voldaan | Frequentiematrix ontbreekt |
| Kritiek versus aanvullende informatie | Deels | Prioriteit bestaat, maar niet expliciet per rol onderbouwd |
| Beslissingen en frustraties per rol | Deels | Alleen korte user stories, geen volledige beslismatrix |
| Alle vereenvoudigingsvragen per pagina | Niet voldaan | Niet per vraag en niet voor alle pagina's uitgevoerd |
| Iedere knop verantwoorden | Niet voldaan | Button-audit ontbreekt |
| Volledige flow inclusief terug, opnieuw openen, fouten en opslag | Deels | Hoofdroutes werken; herstelroutes ontbreken |
| Alle edge cases per flow | Niet voldaan | Offline, conflicten, verwijderen en API-fouten zijn niet uitgewerkt |
| Rechten en geen-toegangstatus | Deels | Alleen client-side RoleGate |
| Empty states | Deels | Niet overal aanwezig of onderscheidend |
| Loading, foutmelding en opnieuw proberen | Niet voldaan | Niet structureel aangesloten |
| Offline gedrag | Niet voldaan | Geen betrouwbare offline-status of wachtrij |
| Nielsen, Hick, Fitts en progressive disclosure aantoonbaar | Deels | Principes deels zichtbaar, geen formele heuristiek-audit |
| Informatiearchitectuur | Deels | Rollen en navigatie verbeterd; alle routes nog niet gevalideerd |
| Workflow van binnenkomst tot vertrek per rol | Niet voldaan | Volledige rolworkflows en frequenties ontbreken |
| Audit met tien scores en herhaling | Deels | Scores bestaan, maar geen gebruikerstest en hertest |
| Schaalbaarheid en componenthergebruik | Deels | Grote pagina-componenten moeten verder worden opgesplitst |
| Lazy loading, caching en minimale API-calls | Niet voldaan | Routes worden nog direct geladen; echte API-laag ontbreekt |
| Accessibility | Deels | Skiplink en labels bestaan; tekstgrootte en aanraakdoelen zijn vaak te klein |
| Mobiel en desktop gevalideerd | Deels | Responsive opbouw bestaat; brede tabellen en echte apparaattests ontbreken |
| Alle 21 onderdelen voor iedere pagina | Niet voldaan | Alleen dashboarddocument bestaat |
| Pas verder na volledige validatie | Niet voldaan | Meerdere pagina's zijn gebouwd vóór volledige pagina-audits |

## Direct gecorrigeerde terminologie

- “Iets melden” is vervangen door “Melding registreren”.
- “Taak maken” is vervangen door “Taak aanmaken”.
- “Iemand uitnodigen” is vervangen door “Afspraak plannen”.
- “Dossier bekijken” is vervangen door “Cliëntdossier openen”.
- “Gegevens wijzigen” is vervangen door “Dossiergegevens wijzigen”.
- “Wat wil je doen?” is vervangen door “Directe acties”.

## Vereiste volgorde vanaf nu

1. Dashboardanalyse aanvullen met frequentiematrix, rolworkflows, button-audit en alle fout-/edgecases.
2. Alleen daadwerkelijk geïmplementeerde states als voltooid markeren.
3. Dashboard opnieuw toetsen op toegankelijkheid, mobiel, lege data en foutgedrag.
4. Daarna pas “Mijn werkvoorraad” volgens dezelfde 21 onderdelen analyseren.
5. Dit herhalen voor iedere overige route.

Een score van 10 wordt niet toegekend zonder aantoonbare gebruikerstest, toegankelijkheidstest en validatie met echte brondata.
