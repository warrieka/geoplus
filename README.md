Geoplus
====

English
----
GeoPlus is a web app on the opendata infrastructure of Antwerp and Ghent.
With this application, a non-programmer can download the data from the opendata-service in a common format for geodata and use in their own (desktop) applications. For example, for analysis or cartography.

Nederlands 
----

###Doelstelling 

Geoplus is een webapp tegen de opendata infrastructuur van de steden Gent en Antwerpen.
Deze steden bieden een groot deel van hun data waaronder geodata als opendata aan. Externen kunnen via http://data.stad.gent en http://opendata.antwerpen.be deze gegevens downloaden. Voor gewone burgers die data willen raadplegen is het mogelijk dit te doen via google earth met een kml-file die ze kunnen downloaden of bekijken via de preview Map. Programmeurs kunnen de JSON of XML formaten gebruiken. 

Voor niet-programerende  technische eindgebruikers zoals landmeters, studiebureua's, cartografen, architecten, stedebouwkundigen, ... en ook voor Openstreetmap, GPS- en geocaching hobbyisten zijn deze formaten niet geschikt. 
Voor deze gebruikers probeert deze app een oplossing te bieden. 

Met deze toepassing kan een niet-programmeur de data van de opendata-service downloaden in een courant geodata formaat, zodat ze die op hun eigen (desktop) toepassing gebruiken. Bijvoorbeeld GEOJSON, GML voor QGIS of Shapefile of ESRI json voor Arcgis voor analyse en cartografie. Openstreetmappers kunnen de gewenste gegevens opladen via GPX, ook geocachers en andere gebruikers geavanceerde GPS-toestellen gebruiken GPX. GML is een OGC-standaard voor  Geografsche data in XMLen GEOJSON is een standaard in JSON.

###Werking

Door te klikken op "Lagen" krijg je een formulier met 2 tabbladen: Gent en Antwerpen.
Aan de linkerkant krijg je de lijst van lagen, als je een laag aanklikt, wordt aan de rechterkant de beschrijving getoond. 
Dit gebeurd via een nodejs-app die de site http://data.stad.gent en http://opendata.antwerpen.be indexeerd, zodat we ook een beschrijving meekrijgen. 

Als een gebruikers een gewenste laag gevonden heeft, kan hij op "Voeg toe aan kaart" klikken om de laag toe toe te voegen aan de kaart. 
Dit gebeurt voledig browserside via ajax-call in javascript. Het is dus steeds de laatste LIVE-data uit de opendata-API.
Alle pagina's worden doorlopen via de volgende call op de volgende json laag voor Antwerpen:

> http://datasets.antwerpen.be/v4/public/gis/ &lt;datasetnaam&gt; .json?page= &lt;paginaNr&gt;

of voor gent via kml

> http://datatank.stad.gent/4/ &lt;datasetnaam&gt; .kml?page= &lt;paginaNr&gt;

De json of kml wordt geparseerd en in een openlayers vectorlaag geladen.

De gebruiker kan de voledige laag bekijken en bevragen. 
Indien ze de laag geschikt vindt haar doelstelling, kan de gebruiker deze downloaden in een gewenst formaat en CRS.
Op dit moment wordt GEOJSON - GPX en ESRI Json, Shapefile en GML onsteund als output formaten.
Deze worden browserside gegenereerd. 

###Andere kaart elementen 

De basiskaart is de grijze GRB van AGIV en de Geocoder (zoeken op adres) is de geolocation-tool uit CRAB. 
http://agiv.be

