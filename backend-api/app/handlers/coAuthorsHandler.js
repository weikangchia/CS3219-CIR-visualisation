/**
 * Returns co-Authors Information
 *
 * @param {*, function} options, callback function
 */
function getCoAuthorsGraph(options, callback) {
	const nodes = [];
	const links = [];
	const set = new Set();
	const setPapers = new Set();

	function minimizeAuthor(author, paper, level) {
		const authorObj = paper.authors.find(authorObject => authorObject.ids[0] === author);
		return {
			id: author,
			level,
			author: authorObj ? authorObj.name : "undefined",
			title: paper.title ? paper.title : "undefined"
		};
	}

	function dig(paper, level, maxLevel, source) {
		if (!set.has(source)) {
			nodes.push(minimizeAuthor(source, paper, level));
		}
		set.add(source);
		if (level < maxLevel && paper != undefined && !setPapers.has(paper._id)) {
			setPapers.add(paper._id);
			const authors = paper.authors;
			authors.forEach(author => {
			  const authorId = author.ids[0] ? author.ids[0] : "undefined";
				if (authorId !== source) {
					nodes.push(minimizeAuthor(authorId, paper, level + 1));
					set.add(authorId);
					links.push({
						source: authorId,
						target: source
					});
					Paper.find( { "authors.name": author.name }, function(err, papers) {
					if (err) throw error;
						papers.forEach(paper => {
						dig(paper, level + 1, maxLevel, authorId)
						});
					});
				};
			});
		}
	}

	options = options || {};
	options.levels = options.levels || 3;
	options.author = options.author || "";
	curLevel = 1;

Paper.find({ "authors.name": options.author }, function(err, papers){
		if(err) throw error;
		papers.forEach(paper => {
			const authors = paper.authors;
			var authorId = undefined;
			authors.forEach(author => {
				if (author.name === options.author) {
						authorId = author.ids[0] ? author.ids[0] : "undefined";
				}
			})

			if (authorId === undefined) {
					nodes.push(minimizeAuthor(authorId, paper, curlevel));
			};

			dig(paper, curLevel, options.levels, authorId);
			if (typeof callback === "function") {
					callback(nodes, links);
			}
		});
	});
}

module.exports = function(options) {
	logger = options.logger;
	return (req, res) => {
		const params = req.query;
		const options = {};
		options.author = params.author;
		options.levels = params.levels;
		getCoAuthorsGraph(options, function(nodes, links) {
			res.send(JSON.stringify({nodes, links}));
		})
	};
}
