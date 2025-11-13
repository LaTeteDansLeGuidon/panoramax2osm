# panoramax2osm

## L'idée

A gauche, une carte avec des POIs.
A droite, une visionneuse Panoramax.

Lorsque l'utilisateurice clique sur un POI, les images Panoramax les plus proches apparaissent dans une galerie. Sur le modèle de panolinker, l'utilisateurice sélectionne l'image la plus appropriée, et en un clic elle est ajoutée à l'objet OSM. Et pourquoi pas en profiter pour renseigner les tags de l'image sur Panoramax !

## Avancement

- [x] une web app en vue
- [x] une galerie de miniatures cliquables, permettant d'afficher les intégrations panoramax correspondantes
- [x] une carte leaflet avec des markers (requête overpass)
- [ ] appel à l'API Panoramax pour obtenir les images à proximité
- [ ] connexion oauth à openstreetmap
- [ ] enregistrement d'un changeset
- [ ] connexion à Panoramax
- [ ] ajout des tags dans Panoramax
- [ ] compléter le filtre 'Vélo', créer un filtre 'Commerces', un filtre 'Espace public' (pour les bancs, toilettes publiques etc)
