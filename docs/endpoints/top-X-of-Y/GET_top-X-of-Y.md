# Top N X of Y

    GET top-X-of-Y

## Description
  Returns the top N X of Y in JSON format. <br />
  Top papers are counted by number of inCitations while the rest are counted by number of papers.

***

## Parameters
  All Params are optional. <br />
  'y' requires a 'value' and vice versa.

- **topN** — The top number of X to find. (Default: 10)
- **x** — The domain that you are searching. (Default: paper) <br />
Accepted x are = paper || author || venue || keyphrase || year.  <br />
If x is invalid, default domain will be used. <br />
- **y** — The range that you are searching.  <br />
Accepted y are = paper || author || venue || keyphrase || year.  <br /> <br />
- **value** — The value for the range you are searching.

## Return format
- **200 Success** - JSON format.
`{` <br />
`topN: 10` <br />
`x: author` <br />
`y: venue` <br />
`value: arxiv` <br />
`results: [` <br />
`{` <br />
`x: {xObj},` <br />
`count: 128,` <br />
`},` <br />
`...]` <br />
`}`

***

## Errors


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
		{
			"x": {
				"ids": [
					"1747337"
				],
				"name": "Damien Chablat"
			},
			"count": 6
		},
		{
			"x": {
				"ids": [
					"1706805"
				],
				"name": "Zhiyuan Yan"
			},
			"count": 4
		},
		{
			"x": {
				"ids": [
					"1729425"
				],
				"name": "Mita Nasipuri"
			},
			"count": 4
		}
	]
}
```
