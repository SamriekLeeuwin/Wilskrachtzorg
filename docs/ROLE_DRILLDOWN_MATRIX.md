# Rolgebaseerde drill-downmatrix

Een KPI is pas bruikbaar wanneer de gebruiker de teller kan verklaren en, indien bevoegd, kan handelen. Deze matrix legt de prototypebestemmingen vast.

| Rol | Dashboardindicator | Bestemming | Detailniveau |
|---|---|---|---|
| Begeleider | Mijn open acties | Werkvoorraad | Eigen rolgebonden taken |
| Begeleider | Vandaag of te laat | Werkvoorraad met urgentiefilter | Eigen urgente taken |
| Begeleider | Actieve dossiers | Jongerenlijst | Bevoegde dossiers |
| Begeleider | Doorstroomsignalen | Signaalcentrum met typefilter | Signaal, reden en volgende stap |
| Gedragswetenschapper | Open veiligheidssignalen | Signaalcentrum met veiligheidsfilter | Signaal en bevoegde dossierroute |
| Gedragswetenschapper | Herstelopvolging open | Werkvoorraad met hersteltype | Inplannen en resultaat vastleggen |
| Gedragswetenschapper | Zware incidenten | Incidentanalyse met zware-incidentfilter | Categorie, locatie en bevoegde dossierroute |
| Gedragswetenschapper | Gemeentelijke opvolging | Werkvoorraad met gemeentecontactfilter | Reactie, eigenaar en deadline |
| Zorgmanager | Boven verwachte einddatum | Jongerenlijst met achterstandsfilter | Betrokken dossiers |
| Zorgmanager | Vervolgplek geregeld | Uitstroommonitor | Status, besluit en actiehouder |
| Zorgmanager | Open acties | Werkvoorraad | Rolgebonden operationele taken |
| Zorgmanager | Datakwaliteit | Databetrouwbaarheid | Veld- en broncontroles |
| Directie | Actief op periode-einde | Managementrapportage met KPI-uitleg | Organisatietotaal en trend |
| Directie | Geplande uitstroom | Managementrapportage met KPI-uitleg | Geaggregeerde uitkomsten |
| Directie | Mediane verblijfsduur | Managementrapportage met grondslag | Geaggregeerde verdeling |
| Directie | Incidenten | Incidentanalyse met verklaringsfilter | Geaggregeerd per categorie en locatie |
| Directie | Zware incidenten | Incidentanalyse met zware-incidentfilter | Kleine aantallen onderdrukt |
| Directie | Herstelgesprek open | Incidentanalyse met herstelfilter | Kleine aantallen onderdrukt |
| Directie | Officiële waarschuwingen | Incidentanalyse met maatregelfilter | Kleine aantallen onderdrukt |
| Directie | Bestuurlijk beslispunt | Beoordelingen en besluiten | Beperkte escalatiesamenvatting, geen dossierlink |

## UX-regels

- De kaart benoemt de vervolghandeling, bijvoorbeeld “Bekijk onderbouwing” of “Open werkvoorraad”.
- Het doelscherm bevestigt een overgenomen dashboardselectie en biedt een zichtbare manier om die selectie te wissen.
- Directie kan een cijfer verklaren, maar krijgt daardoor niet automatisch toegang tot cliëntniveau.
- Zorgrollen krijgen alleen een dossierroute waar de bestaande rolpoort dat toestaat.
- Een nulwaarde blijft navigeerbaar wanneer de onderliggende definitie of controle nog relevant is.
