# Conference Trends

    GET trends/conference

## Description
Returns trend information for a particular conference.

***

## Parameters
Parameter **name** is required.

- **name** — The name of the conference.
- **minYear** — The minimum year for the trend that you want to search for. (Default: 1800)
- **maxYear** — The maximum year for the trend that you want to search for. (Default: 1800)

## Return format
An array of trend data.

***

## Errors
- **400 Bad Request** — The request issued is missing one or more of the required parameters or contains parameters in an invalid form.


***

## Example
**Request**

  GET trends/conference?name=icse&minYear=2010&maxYear=2017

**Return**
``` json
[
  {
    "count": 5,
    "year": 2010
  },
  {
    "count": 6,
    "year": 2011
  },
  {
    "count": 3,
    "year": 2012
  },
  {
    "count": 8,
    "year": 2013
  },
  {
    "count": 2,
    "year": 2014
  },
  {
    "count": 4,
    "year": 2015
  },
  {
    "count": 9,
    "year": 2016
  },
  {
    "year": 2017,
    "count": 0
  }
]
```
