# Conference Trends

    GET autocomplete

## Description
Returns autocomplete values based on search

***

## Parameters
Parameter **domain** and **search** are required.

- **domain** — The domain ('authors' or 'venues')
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

``` shell
curl -s "localhost:3000/autocomplete?search=a&domain=venues" | python -m json.tool
```

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

**Request**

``` shell
curl -s "localhost:3000/autocomplete?search=ax&domain=venues" | python -m json.tool
```

**Return**
``` json
[
    "Axone",
    "Axioms"
]
```
