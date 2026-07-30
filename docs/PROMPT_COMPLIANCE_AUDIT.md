# Controle op naleving van de UX-opdracht

## Update na tweede kernflowvalidatie van 30 juli 2026

De kernflows zijn inmiddels per rol doorgelopen en vastgelegd in `ROLE_FLOW_VALIDATION.md`. De zes belangrijkste productoppervlakken zijn langs alle 21 promptonderdelen gecontroleerd in `CORE_FLOW_AUDIT_V2.md`. Het gebruikstestscript met scenario's en open organisatievragen staat in `USER_TEST_SCRIPT.md`.

Sinds de oorspronkelijke controle zijn onder andere dossierfallback, rolgebonden knoppen en mutatierechten, UVO-deduplicatie, cross-client-taakkoppeling, gemeente-/verwijzercontact, contactreacties, gegevensdeling, afspraakuitkomsten, datumvalidaties, parallelle taakupdates, directie-aggregatie en historische rapportageperioden verbeterd.

De opdracht blijft bewust niet als volledig voltooid gemarkeerd. Echte gebruikerstests, server-side autorisatie, bronintegraties, async loading/error/sync, een server-side audittrail, documentflow en formele incidentgovernance ontbreken nog.

## Conclusie

De kern van de opdracht is voor dashboard, cliëntdossier, netwerkcontact, taak/afspraak, managementrapportage en databetrouwbaarheid uitgevoerd en aantoonbaar getest. Niet iedere ondersteunende route heeft al een afzonderlijke 21-puntenaudit; daarom is volledige promptcompliance nog niet eerlijk.

## Compliance-overzicht

| Onderdeel uit de opdracht | Status | Belangrijkste hiaat |
|---|---|---|
| Alle afgesproken gebruikersrollen | Voldaan | Exact vier rollen; echte identiteit en serverautorisatie ontbreken nog |
| Informatie binnen vijf seconden | Voldaan | Urgentie en directe acties staan bovenaan |
| Dagelijkse, wekelijkse en maandelijkse informatie per rol | Deels | Dagflows zijn uitgewerkt; week-/maandfrequenties moeten met medewerkers worden gevalideerd |
| Kritiek versus aanvullende informatie | Deels | Kritieke signalen en werk staan bovenaan; prioriteit wacht op praktijkvalidatie |
| Beslissingen en frustraties per rol | Deels | Kerntaken en beslismomenten zijn uitgewerkt; frustraties moeten uit gebruikerstests komen |
| Alle vereenvoudigingsvragen per pagina | Niet voldaan | Niet per vraag en niet voor alle pagina's uitgevoerd |
| Iedere knop verantwoorden | Deels | Kernoppervlakken zijn gecontroleerd; ondersteunende demonstratieroutes nog niet allemaal |
| Volledige flow inclusief terug, opnieuw openen, fouten en opslag | Deels | Kritieke taak-, melding-, afspraak-, intake- en uitstroomflows zijn hertest; serverherstel ontbreekt |
| Alle edge cases per flow | Deels | Ongeldige URL's, conflicten, datumfouten, duplicaten en offlinewaarschuwing bestaan; API-fouten ontbreken |
| Rechten en geen-toegangstatus | Deels | Alleen client-side RoleGate |
| Empty states | Deels | Kernlijsten en dossiers onderscheiden geen resultaat en niet gevonden; nog niet iedere deelcomponent |
| Loading, foutmelding en opnieuw proberen | Deels | Route-loading bestaat; API-fout en opnieuw proberen wachten op een echte API-laag |
| Offline gedrag | Deels | De interface waarschuwt dat lokale opslag niet synchroniseert; veilige wachtrij ontbreekt |
| Nielsen, Hick, Fitts en progressive disclosure aantoonbaar | Deels | Principes deels zichtbaar, geen formele heuristiek-audit |
| Informatiearchitectuur | Deels | Rollen en navigatie verbeterd; alle routes nog niet gevalideerd |
| Workflow van binnenkomst tot vertrek per rol | Deels | Gewenste rolflows en prototypedekking zijn beschreven; enkele operationele stappen ontbreken |
| Audit met tien scores en herhaling | Deels | Tien scores en technische hertest bestaan; validatie met echte medewerkers ontbreekt |
| Schaalbaarheid en componenthergebruik | Deels | Grote pagina-componenten moeten verder worden opgesplitst |
| Lazy loading, caching en minimale API-calls | Deels | Routes worden lazy geladen; echte API-, cache- en pagineringslaag ontbreekt |
| Accessibility | Deels | Skiplink, H1, labels en grotere kerndoelen bestaan; screenreader- en toetsenbord-QA blijft nodig |
| Mobiel en desktop gevalideerd | Deels | Responsive opbouw bestaat; brede tabellen en echte apparaattests ontbreken |
| Alle 21 onderdelen voor iedere pagina | Deels | Zes kernoppervlakken zijn gedekt; ondersteunende routes nog niet afzonderlijk |
| Pas verder na volledige validatie | Deels | Kernflows zijn opnieuw gebouwd en hertest; gebruikerstest met medewerkers ontbreekt |

## Direct gecorrigeerde terminologie

- “Iets melden” is vervangen door “Melding registreren”.
- “Taak maken” is vervangen door “Taak aanmaken”.
- “Iemand uitnodigen” is vervangen door “Afspraak plannen”.
- “Dossier bekijken” is vervangen door “Cliëntdossier openen”.
- “Gegevens wijzigen” is vervangen door “Dossiergegevens wijzigen”.
- “Wat wil je doen?” is vervangen door “Directe acties”.

## Vereiste volgorde vanaf nu

1. Voer het bestaande gebruikstestscript uit met minimaal één medewerker per rol.
2. Laat Wilskracht Zorg de begrippen, bevoegdheden en KPI-definities formeel vaststellen.
3. Audit daarna de ondersteunende routes afzonderlijk volgens dezelfde 21 onderdelen.
4. Ontwerp pas daarna API, autorisatie, integraties en serveraudittrail.
5. Herhaal browser-, toegankelijkheids-, privacy- en bronvalidatie met echte data.

Een score van 10 wordt niet toegekend zonder aantoonbare gebruikerstest, toegankelijkheidstest en validatie met echte brondata.
