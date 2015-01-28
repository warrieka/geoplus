Geoplus
====

English
----
GeoPlus is a web app from the opendata infrastructure of Antwerp.
With this application, a non-programmer can download the data from the opendata-service in a common format for geodata and use in their own (desktop) applications. For example, for analysis or cartography.

Nederlands 
----

###Doelstelling 

Geoplus is een webapp tegen de opendata infrastructuur van stad Antwerpen.
De stad Anwerpen biedt een groot deel van zijn data aan, aan externen via http://opendata.antwerpen.be, waaronder veel geodata. Voor gewone burgers die data willen raadplegen is het mogelijk dit te doen via google earth een kml-file die ze kunnen downloaen of een preview Map. Programmeurs kunnen de JSON of XML formaten gebruiken. 
Voor niet-programerdende  technische eindgebruikers zoals landmeters, studiebureua's, cartografen, architecten, stedebouwkundigen, ... en ook Openstreetmap, GPS- en geocaching hobbyisten zijn de formaten niet geschikt. 
Voor deze gebruikers probeert de app een oplossing te bieden.  
Met deze toepassing kan een niet-programmeur de data van de opendata-service downloaden in een courant geodata formaat zodat ze die hun eigen (desktop) toepassing gebruiken. Bijvoorbeeld voor analyse of cartografie. 

###Werking

De toepassing gebruikt lijst alle GIS-lagen op de opendata app op in een dropdown. 
Dit gebeurd via een nodejs-app die http://opendata.antwerpen.be indexeerd, zodat we ook een beschrijving meekrijgen. 
De oplijsting op http://datasets.antwerpen.be/v4/gis.json bevat enkel de links en geen beschrijvingen of zelfs een gebruiksvriendelijke naam.

Als een gebruikers een gewenste laag gevonden heeft, wordt deze toegvoegd aan de kaart. 
Dit gebeurt voledig browserside via ajax-call in javascript. Het is dus steeds de laatste LIVE-data uit de opendata-API.
Alle pagina's worden doorlopen via de volgende call op de volgdne url:
> http://datasets.antwerpen.be/v4/public/gis/ &lt;datasetnaam&gt; .json?page= &lt;paginaNr&gt;

De json wordt geparseerd en in een openlayers vectorlaag geladen.

De gebruiker kan de voledige laag bekijken en bevragen. 
Indien ze de laag geschikt vindt haar doelstelling, kan de gebruiker deze downloaden in een gewenst formaat en CRS.
Op dit moment wordt goejson - gpx en esri json onsteund als output formaten.  

###Andere kaart elementen 

De basiskart is de grijze GRB van AGIV en de Geocoder (zoeken op adres) is de geolocation-tool uit CRAB. 
http://agiv.be

