# Autocomplete

    GET autocomplete

## Description
Returns autocomplete values based on search value

***

## Parameters
Parameter **domain** and **search** are required.

- **domain** — The domain - 'paper' || 'author' || 'venue' || 'keyphrase' || 'year'
- **search** - The search value

## Return format
An array of autocomplete values.

***

## Errors
- **400 Bad Request** — The request issued is missing one or more of the required parameters or contains parameters in an invalid form.


***

## Examples

### Search Venues

**Request**

  GET autocomplete?search=a&domain=venues

**Return**
``` json
[
    "Ayu",
    "Axone",
    "Axioms",
    "Avicenna journal of phytomedicine",
    "Avicenna journal of medicine"
]
```

### Search Authors

**Request**

  GET autocomplete?search=a&domain=authors

**Return**
``` json
[
    "aurora Vizcaino",
    "arko Martinovic",
    "andy Zaidman",
    "andreas Reichpietsch@gmd De",
    "andisabelle Savy"
]
```

**Request**

  GET autocomplete?search=and&domain=authors

**Return**
``` json
[
    "andy Zaidman",
    "andreas Reichpietsch@gmd De",
    "andisabelle Savy",
    "And\u0161tefan Be\u0148u\u0161",
    "And\u00e9tienne Mann"
]
```
