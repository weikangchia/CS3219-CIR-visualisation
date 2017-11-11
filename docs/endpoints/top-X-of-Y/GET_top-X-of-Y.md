# Top N X of Y

    GET top-X-of-Y

## Description
  Returns the top N X of Y in JSON format. <br />
  Top papers are counted by number of inCitations while the rest are counted by number of papers.
  X objects of count 0 are omitted from results.

***

## Parameters
  All parameters are optional. If y is specified, value must be given too and vice versa.

- **topN** — The top number of X to find. (Default: 10)
- **x** — The domain that you are searching. (Default: paper) <br />
Accepted x values are = paper || author || venue || keyphrase || year.  <br />
If x is invalid, default domain will be used. <br />
- **y** — The range that you are searching. <br />
Accepted y values are = paper || author || venue || keyphrase || year.  <br />
- **value** — The value for the range you are searching.

## Return format
A JSON object with the following keys and values:
- **topN** — The top n value.
- **x** — The x domain.
- **y** — The y domain.
- **value** — The search value.
- **results** — An array of x objects.

***

## Errors
- **400 Bad Request** — The request issued is missing one or more of the required parameters or contains parameters in an invalid form.

***

## Example
**Request**

  GET top-X-of-Y?topN=3&x=author&y=venue&value=arxiv

**Return**
``` json
{
  "topN": "3",
  "x": "author",
  "y": "venue",
  "value": "arxiv",
  "results": [
    { "x": { "ids": ["1747337"], "name": "Damien Chablat" }, "count": 6 },
    { "x": { "ids": ["1706805"], "name": "Zhiyuan Yan" }, "count": 4 },
    { "x": { "ids": ["1729425"], "name": "Mita Nasipuri" }, "count": 4 }
  ]
}
```
