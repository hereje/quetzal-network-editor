# Quenedi (quetzal-network-editor)

## Inputs 

To edit existing network, Quenedi takes two input files: **links** and **nodes**.

### Links

GeoJSON table describing network links (EPSG: 4326). [Exemple](static/links_exemple.geojson)

Properties from link table are automatically splited into 2 categories: **links properties** and **lines properties**. Lines propertie should be constant accross all links of a line (with the same *trip_id*).

**Links properties** are:
- ***index*** (non editable): unique identifier.
- ***a*** (non editable): Id of the first node.
- ***b*** (non editable): Id of the last node.
- ***time***: Travel time along the link in seconds.
- ***length*** (optional): distance along the link in meters.
- ***link_sequence***: Order of link for a particular line.
- ***pickup_type***: pickup method at node *a*. As per [gtfs reference](https://developers.google.com/transit/gtfs/reference) (by default 0).
- ***drop_off_type***: drop off method at node *b*. As per [gtfs reference](https://developers.google.com/transit/gtfs/reference) (by default 0).

**Lines properties** are:
- ***trip_id***: Line (or trip) identifier (i.e. 100 Est).
- ***headway***: Line headway in seconds.
- ***route_id*** (optional): Route identifier (i.e. 100).
- ***agency_id*** (optional): Agency identifier.
- ***direction_id*** (optional): Line direction (0: outbound travel, 1: inbound travel).
- ***route_short_name*** (optional): Short name for the route.
- ***route_long_name*** (optional): Long name for the route.
- ***route_type*** (optional): Transportation mode for the line (e.g. bus, subway, tramway, etc.).
- ***route_color*** (optional): Hex route color without '#' (i.e. 4287f5). Will be used for displaying lines.

Any other properties in the table will be considered as link properties and values will be copied from the nearest link when creating a new link.

### Nodes

GeoJSON table describing network nodes (EPSG: 4326). [Exemple](static/nodes_exemple.geojson)

**nodes properties** are:
- ***index*** (non editable): Unique identifier.
- ***stop_name*** (optional): Name for the stop (by default *null*).
- ***stop_code*** (optional): Code for the stop (by default *null*).

Any other properties in the table will be copied from the nearest node when adding a new node.

# Developement Setup 

## Build Setup

```sh
# define BACK_URL and MAPBOX_TOKEN variable or let you guide by the setup
yarn run setup

# install dependencies
yarn install

# compile i18n languages
yarn run i18n-compile

# serve with hot reload at localhost:8080
yarn run start

# build for production with minification
yarn run build:prod
```

You can also use `npm` instead of `yarn`

Then go to [http://localhost:8081/].

You can log in by typing anything you want in credentials inputs.

## Internationalization

```
sudo apt-get install gettext
```

Use `$gettext` in template or script sections of your vue files.

For more information: https://www.npmjs.com/package/vue-gettext

To update the `pot` file and any `po` language file, use:
```
yarn run i18n-extract
```

Then translate any missing strings in your `po` file, using for instance **poedit**.

Then compile the `po` files to a single `json` file using:
```
yarn run i18n-compile
```
