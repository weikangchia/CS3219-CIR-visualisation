# Incitation Graphs

    GET graphs/incitation

## Description
Returns incitation graph data points for a base paper.

***

## Parameters
Parameter **title** is required.

- **title** — The title of the base paper.
- **level** — The levels of base paper citation is created.

## Return format
A JSON object with the following keys and values:
- **nodes** — An array of nodes.
- **links** — An array of source and target objects.

***

## Errors
- **400 Bad Request** — The request issued is missing one or more of the required parameters or contains parameters in an invalid form.


***

## Example
**Request**

  GET graphs/incitation?level=2&title=Low-density%20parity%20check%20codes%20over%20GF(q)

**Return**
``` json
{
  "nodes": [
    {
      "id": "36adf8c327b95bdffe2778bf022e0234d433454a",
      "authors": [
        {
          "ids": [
            "2342825"
          ],
          "name": "Matthew C. Davey"
        }
      ],
      "title": "Low-density parity check codes over GF(q)",
      "year": 1998,
      "abstract": "..."
    }
  ],
  "links": [
    {
      "source": "1d2271b6b163399303fcc7b1dc714bdc0b571d02",
      "target": "36adf8c327b95bdffe2778bf022e0234d433454a"
    },
    {
      "source": "c4798fdce54ae2d98306c733e83ee3d1a3cd3feb",
      "target": "36adf8c327b95bdffe2778bf022e0234d433454a"
    },
  ]
}
```
