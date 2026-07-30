# Beleidsregels naar prototypeflows

Deze notitie legt vast welke productkeuzes aantoonbaar zijn gebaseerd op de twee aangeleverde beleidsdocumenten. Het prototype is geen formeel cliëntdossier en vervangt geen vastgestelde procedure.

## Gebruikte bronnen

- `Nieuw pedagogisch beleid + actie sanctie beleid WKZ def.pdf`
- `Medewerkershandboek 2026 (1).pdf`

## Traceerbare regels

| Beleidsregel | Bron | Productvertaling |
|---|---|---|
| Na drie aantekeningen binnen circa twee tot drie weken wordt het netwerk uitgenodigd voor een UVO. | Pedagogisch beleid, gedeelte actie- en sanctiebeleid rond p. 15 | UVO blijft een in te plannen gesprekstaak en kan niet als losse administratieve taak worden afgerond. |
| Na ieder incident wordt een herstelgesprek ingepland; herstel vraagt bereidheid van betrokken partijen. | Pedagogisch beleid, p. 16–17 | Een veiligheidsmelding maakt herstelopvolging zichtbaar. Afronding vereist een afspraakuitkomst, samenvatting en besluit. |
| Zwaardere maatregelen worden situationeel beoordeeld met gedragswetenschapper, locatiehoofd/zorgmanager en veiligheidsteam; ingrijpende beslissingen vragen directie. | Pedagogisch beleid, p. 15–17 | Registratie, inhoudelijk advies, zorgmanagementbesluit en bestuurlijke escalatie zijn afzonderlijke stappen. Directie ontvangt alleen een beperkte beslissamenvatting. |
| Een officiële waarschuwing wordt ondertekend en in het dossier opgenomen; na twee waarschuwingen volgt een laatste-kansgesprek. | Pedagogisch beleid, p. 15–16 | Dit is als productievereiste gemarkeerd; documentondertekening en formele dossieropname worden niet gesimuleerd als werkend. |
| Bij een incident: eerst veiligheid, daarna snel melden, volgens protocol registreren en zo nodig gedragswetenschapper/zorgmanager consulteren. | Medewerkershandboek, p. 26 | Het incidentformulier vraagt incidentmoment, locatie, directe veiligheidsmaatregel en wie is geïnformeerd; een toekomstig incidentmoment wordt geblokkeerd. |
| Meldingswaardige incidenten worden met directie/management besproken; IGJ-melding gebeurt door of namens de organisatie. | Medewerkershandboek, p. 27 | De zorgmanager kan een beoordeelde melding bestuurlijk escaleren. Het prototype claimt niet dat hiermee een IGJ-melding is gedaan. |
| Vertrouwelijke informatie wordt alleen volgens afspraken opgeslagen en dossiers worden niet zonder bevoegdheid getoond. | Medewerkershandboek, privacy- en informatiegedeelten | Directie ziet geen cliëntdossier vanuit de escalatiewerkvoorraad. Kleine aantallen per locatie worden als `<5` weergegeven. |

## Bewuste productiegrenzen

De volgende controles kunnen niet betrouwbaar uitsluitend in de browser worden afgedwongen:

- server-side autorisatie op medewerker, caseload, locatie en waarneming;
- onveranderbare auditlog en versiebeheer;
- transacties en idempotency bij gelijktijdige opslag;
- echte e-mail-, sms-, Zilliz-, document- en IGJ-koppelingen;
- digitale ondertekening en formele dossierarchivering;
- geautomatiseerde telling van aantekeningen wanneer de bronregistratie ontbreekt.

Voor deze onderdelen toont het prototype een duidelijke grens in plaats van een niet-bestaande koppeling als voltooid te presenteren.
